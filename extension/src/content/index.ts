/**
 * File: content/index.ts
 * Purpose: Content script entry point — injected into job application pages.
 *
 * This is the main orchestrator that runs on every matched job site URL.
 * It initializes the appropriate platform adapter, detects forms, and
 * listens for fill/undo commands from the background service worker.
 *
 * Lifecycle:
 * 1. Script injected at document_idle (DOM is ready)
 * 2. Resolve the correct platform adapter for this URL
 * 3. Run form detection
 * 4. Report results to the background script
 * 5. Listen for FILL_FORM / UNDO_FILL commands
 *
 * The content script does NOT store any data itself — all state lives in
 * the background service worker or chrome.storage.
 */

import type { ExtensionMessage, FillResult, FormDetectionResult, UserProfile } from '@/types';
import { AdapterRegistry } from '@/adapters';
import { fillForm, undoFill } from './formFiller';
import { injectSmartAnswerButtons } from './smartAnswerUI';
import { initShortcutExpander } from './shortcutExpander';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/** The latest form detection result for this page */
let currentDetection: FormDetectionResult | null = null;

/** Fill results from the last auto-fill (used for undo) */
let lastFillResults: FillResult[] = [];

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Detect forms on the current page and report to the background script.
 * Called on page load and when requested via message.
 */
function detectAndReport(): void {
  const adapter = AdapterRegistry.resolve(window.location.href);
  console.log(`[JobHunter] Using adapter: ${adapter.name} for ${window.location.href}`);

  currentDetection = adapter.detectForm(document);

  // Notify background of the detection result
  // We strip the HTMLElement references since they can't be serialized
  const serializableResult = {
    isApplicationForm: currentDetection.isApplicationForm,
    platform: currentDetection.platform,
    // Send as "fields" so popup can access .fields.length without mapping issues
    fields: currentDetection.fields.map((f) => ({
      fieldType: f.fieldType,
      label: f.label,
      inputType: f.inputType,
      required: f.required,
      confidence: f.confidence,
    })),
    formElement: null,
    jobDetails: currentDetection.jobDetails,
  };

  chrome.runtime.sendMessage({
    type: 'FORM_DETECTED',
    data: serializableResult,
  }).catch(() => {
    // Background service worker may not be ready yet — safe to ignore.
    // The popup will re-request detection when opened.
  });

  if (currentDetection.isApplicationForm) {
    console.log(
      `[JobHunter] ✓ Application form detected (${currentDetection.platform}): ${currentDetection.fields.length} fields`,
      currentDetection.fields.map((f) => `${f.fieldType} (${f.label})`),
    );

    // Inject "✨ Generate Answer" buttons next to question textareas
    try {
      const injected = injectSmartAnswerButtons();
      if (injected > 0) {
        console.log(`[JobHunter] ✓ Smart Answer buttons injected: ${injected}`);
      }
    } catch (err) {
      console.warn('[JobHunter] Failed to inject Smart Answer buttons:', err);
    }
  } else {
    console.log('[JobHunter] ✗ No application form found on this page');
  }
}

// ---------------------------------------------------------------------------
// Message Handler
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    handleContentMessage(message, sendResponse);
    return true; // Keep channel open for async responses
  },
);

async function handleContentMessage(
  message: ExtensionMessage,
  sendResponse: (response: unknown) => void,
): Promise<void> {
  try {
    switch (message.type) {
      case 'DETECT_FORM':
        detectAndReport();
        sendResponse({ success: true });
        break;

      case 'FILL_FORM': {
        const profile = message.data as UserProfile;
        if (!currentDetection || !currentDetection.isApplicationForm) {
          sendResponse({ error: 'No application form detected' });
          return;
        }

        const result = await fillForm(currentDetection.fields, profile);
        lastFillResults = result.results;

        // Notify background / popup of the fill result
        chrome.runtime.sendMessage({ type: 'FILL_RESULT', data: result }).catch(() => {});
        sendResponse({ success: true, result });
        break;
      }

      case 'UNDO_FILL': {
        const restoredCount = undoFill(lastFillResults);
        lastFillResults = [];
        chrome.runtime.sendMessage({ type: 'UNDO_RESULT', data: { restored: restoredCount } }).catch(() => {});
        sendResponse({ success: true, restored: restoredCount });
        break;
      }

      case 'PING':
        sendResponse({ type: 'PONG' });
        break;

      default:
        sendResponse({ error: `Unknown message type: ${message.type}` });
    }
  } catch (error) {
    console.error('[JobHunter Content] Error handling message:', error);
    sendResponse({ error: (error as Error).message });
  }
}

// ---------------------------------------------------------------------------
// Page Lifecycle
// ---------------------------------------------------------------------------

/**
 * Observe DOM mutations to re-detect forms when the page dynamically loads
 * new content (common in SPAs and multi-step application forms).
 */
function observePageChanges(): void {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const observer = new MutationObserver(() => {
    // Debounce to avoid excessive re-scans on rapid DOM changes
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      detectAndReport();
    }, 1000);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

console.log('[JobHunter] Content script loaded on:', window.location.href);

// Initialize shortcut expander on every matched page (works even without form detection)
initShortcutExpander();

// Run initial detection
detectAndReport();

// Many ATS platforms (especially Greenhouse) load forms dynamically.
// Retry detection a few times with increasing delays if the initial scan misses.
function retryDetectionIfNeeded(attempts: number, delay: number): void {
  if (attempts <= 0) return;
  setTimeout(() => {
    if (!currentDetection?.isApplicationForm) {
      console.log(`[JobHunter] Retrying form detection (${attempts} attempts left)...`);
      detectAndReport();
      retryDetectionIfNeeded(attempts - 1, delay * 1.5);
    }
  }, delay);
}

retryDetectionIfNeeded(4, 1000); // retry at 1s, 1.5s, 2.25s, 3.375s

// Start observing for SPA navigation / dynamic form loading
observePageChanges();

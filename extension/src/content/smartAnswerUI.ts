/**
 * File: content/smartAnswerUI.ts
 * Purpose: Injects "✨ Generate" buttons next to question textareas
 *          on job application pages, and handles the AI answer flow.
 *
 * When clicked, the button:
 * 1. Scrapes the current page for company/job context
 * 2. Sends a message to the background script with the question + context
 * 3. The background forwards it to the backend /ai/smart-answer endpoint
 * 4. The generated answer is inserted into the textarea
 */

import { scrapePageContext, findQuestionFields, type QuestionContext } from './pageScraper';
import { isContextValid } from '@/utils/messaging';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BUTTON_CLASS = 'jh-smart-answer-btn';
const CONTAINER_CLASS = 'jh-smart-answer-container';
const SPINNER_CLASS = 'jh-smart-answer-spinner';
const INJECTED_ATTR = 'data-jh-smart-answer';

// ---------------------------------------------------------------------------
// Styles (injected once)
// ---------------------------------------------------------------------------

let stylesInjected = false;

function injectStyles(): void {
  if (stylesInjected) return;
  stylesInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    .${CONTAINER_CLASS} {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 6px 0 2px;
      padding: 0;
      position: relative;
      z-index: 10;
      clear: both;
      width: 100%;
      box-sizing: border-box;
      float: none;
    }

    .${BUTTON_CLASS} {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #fff;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(99, 102, 241, 0.3);
      white-space: nowrap;
      line-height: 1;
      flex-shrink: 0;
    }

    .${BUTTON_CLASS}:hover {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
      transform: translateY(-1px);
    }

    .${BUTTON_CLASS}:active {
      transform: translateY(0);
    }

    .${BUTTON_CLASS}:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .${BUTTON_CLASS} .${SPINNER_CLASS} {
      display: none;
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: jh-spin 0.6s linear infinite;
    }

    .${BUTTON_CLASS}.loading .${SPINNER_CLASS} {
      display: inline-block;
    }

    .${BUTTON_CLASS}.loading .jh-btn-icon {
      display: none;
    }

    @keyframes jh-spin {
      to { transform: rotate(360deg); }
    }

    .jh-smart-answer-status {
      font-size: 11px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #6b7280;
      margin-left: 4px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .jh-smart-answer-status.visible {
      opacity: 1;
    }

    .jh-smart-answer-status.error {
      color: #ef4444;
    }

    .jh-smart-answer-status.success {
      color: #10b981;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Button Creation & Injection
// ---------------------------------------------------------------------------

/**
 * Scan the page for question fields and inject "✨ Generate" buttons
 * next to each one. Safe to call multiple times — already-injected
 * fields are skipped.
 */
export function injectSmartAnswerButtons(): number {
  injectStyles();

  const questions = findQuestionFields();
  let injectedCount = 0;

  for (const q of questions) {
    if (q.element.getAttribute(INJECTED_ATTR)) continue; // Already injected
    q.element.setAttribute(INJECTED_ATTR, 'true');

    const container = createButtonContainer(q);
    insertAfterElement(q.element, container);
    injectedCount++;
  }

  if (injectedCount > 0) {
    console.log(`[JobHunter] Injected ${injectedCount} Smart Answer button(s)`);
  }

  return injectedCount;
}

function createButtonContainer(q: QuestionContext): HTMLDivElement {
  const container = document.createElement('div');
  container.className = CONTAINER_CLASS;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = BUTTON_CLASS;
  btn.innerHTML = `
    <span class="jh-btn-icon">✨</span>
    <span class="${SPINNER_CLASS}"></span>
    <span class="jh-btn-text">Generate Answer</span>
  `;

  const status = document.createElement('span');
  status.className = 'jh-smart-answer-status';

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleGenerateClick(q, btn, status);
  });

  container.appendChild(btn);
  container.appendChild(status);
  return container;
}

/**
 * Insert the button container OUTSIDE the input's parent wrapper, not as a
 * sibling of the input itself.  Many ATS platforms wrap inputs in tightly
 * styled containers (overflow:hidden, fixed height, flex layouts) that cause
 * the button to render *inside* the input visually.  We walk up the DOM to
 * find the outermost single-child wrapper (the "field row") and place the
 * button after that.
 */
function insertAfterElement(referenceEl: HTMLElement, newEl: HTMLElement): void {
  // Walk up from the input until we reach the field-level container.
  // Stop climbing when the parent has multiple visible children (meaning
  // it's likely the form-level container, not the input wrapper).
  let target: HTMLElement = referenceEl;

  // Selectors that typically represent the field-row / question wrapper.
  const fieldContainerSelectors = [
    '.field', '.form-group', '.form-field',
    '[class*="question"]', '[class*="field-wrapper"]',
    '[class*="FieldWrapper"]', '[class*="field_wrapper"]',
    '[class*="fieldWrapper"]', '[class*="FormField"]',
    '[class*="form-field"]', '[class*="input-wrapper"]',
    '[class*="inputWrapper"]',  '[class*="TextareaWrapper"]',
    '[data-automation-id]',     'fieldset',
    // Lever-specific wrappers
    '.custom-question',         '.application-field',
    '.application-additional',  '.application-question',
  ];

  // First, try to find a known field container via closest()
  const knownContainer = referenceEl.closest(fieldContainerSelectors.join(', '));
  if (knownContainer && knownContainer !== document.body) {
    target = knownContainer as HTMLElement;
  } else {
    // Heuristic: climb up while the parent has only 1–2 children and is not
    // a <form>, <body>, or very large container.
    let parent = referenceEl.parentElement;
    const maxClimb = 4; // Don't climb more than 4 levels
    let climbed = 0;

    while (
      parent &&
      parent !== document.body &&
      parent.tagName !== 'FORM' &&
      climbed < maxClimb
    ) {
      const visibleChildren = Array.from(parent.children).filter((ch) => {
        const style = window.getComputedStyle(ch);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      // If parent only wraps the input (or input + label), keep climbing
      if (visibleChildren.length <= 2) {
        target = parent;
        parent = parent.parentElement;
        climbed++;
      } else {
        break;
      }
    }
  }

  // Insert the button container AFTER the resolved target element
  if (target.nextSibling) {
    target.parentNode?.insertBefore(newEl, target.nextSibling);
  } else {
    target.parentNode?.appendChild(newEl);
  }
}

// ---------------------------------------------------------------------------
// Generate Handler
// ---------------------------------------------------------------------------

async function handleGenerateClick(
  q: QuestionContext,
  btn: HTMLButtonElement,
  statusEl: HTMLSpanElement,
): Promise<void> {
  // Prevent double-click
  if (btn.disabled) return;

  btn.disabled = true;
  btn.classList.add('loading');
  showStatus(statusEl, 'Generating...', '');

  try {
    // Scrape page context
    const pageContext = scrapePageContext();

    // Detect character limit — check the element at click-time too (may have been set dynamically)
    const maxLength = q.maxLength || detectCharLimit(q.element);

    // Send to background -> backend
    const response = await sendSmartAnswerMessage({
      question: q.question,
      companyName: pageContext.companyName,
      companyInfo: pageContext.companyInfo,
      jobDescription: pageContext.jobDescription,
      jobUrl: pageContext.jobUrl,
      jobTitle: pageContext.jobTitle,
      maxLength: maxLength || undefined,
    });

    if (response.error) {
      showStatus(statusEl, response.error, 'error');
      return;
    }

    // Clean up the generated text: strip markdown formatting & citation refs
    let text = response.text || '';
    text = stripMarkdownAndCitations(text);

    // Enforce character limit on the client side as a safety net
    if (maxLength && text.length > maxLength) {
      text = truncateToLimit(text, maxLength);
    }

    if (text) {
      setFieldValue(q.element, text);
      const limitInfo = maxLength ? ` (${text.length}/${maxLength} chars)` : '';
      showStatus(statusEl, `\u2713 Answer generated${limitInfo}`, 'success');

      // Clear success message after 3 seconds
      setTimeout(() => {
        statusEl.classList.remove('visible');
      }, 3000);
    } else {
      showStatus(statusEl, 'No answer generated', 'error');
    }
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.includes('context invalidated') || msg.includes('Extension context') || !isContextValid()) {
      console.warn('[JobHunter] Extension context invalidated — user should refresh the page.');
      showStatus(statusEl, 'Extension was reloaded. Please refresh the page.', 'error');
    } else {
      console.error('[JobHunter] Smart answer error:', err);
      showStatus(statusEl, msg || 'Generation failed', 'error');
    }
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}

// ---------------------------------------------------------------------------
// Messaging
// ---------------------------------------------------------------------------

interface SmartAnswerRequest {
  question: string;
  companyName?: string;
  companyInfo?: string;
  jobDescription?: string;
  jobUrl?: string;
  jobTitle?: string;
  maxLength?: number;
}

function sendSmartAnswerMessage(data: SmartAnswerRequest): Promise<any> {
  if (!isContextValid()) {
    return Promise.resolve({ error: 'Extension was updated or reloaded. Please refresh the page.' });
  }

  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(
        { type: 'AI_SMART_ANSWER', data },
        (response) => {
          if (chrome.runtime.lastError) {
            const msg = chrome.runtime.lastError.message || 'Extension communication error';
            // Provide a friendlier message for context invalidation
            if (msg.includes('context invalidated') || msg.includes('Extension context') || !isContextValid()) {
              resolve({ error: 'Extension was updated or reloaded. Please refresh the page.' });
              return;
            }
            resolve({ error: msg });
            return;
          }
          resolve(response || { error: 'No response from background' });
        },
      );
    } catch (err: any) {
      // chrome.runtime.sendMessage throws synchronously when the context is
      // invalidated (extension reloaded/updated while page is still open)
      const msg = err?.message || '';
      if (msg.includes('context invalidated') || msg.includes('Extension context') || !isContextValid()) {
        resolve({ error: 'Extension was updated or reloaded. Please refresh the page.' });
      } else {
        resolve({ error: msg || 'Extension communication error' });
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function showStatus(el: HTMLSpanElement, text: string, type: '' | 'error' | 'success'): void {
  el.textContent = text;
  el.className = 'jh-smart-answer-status visible';
  if (type) el.classList.add(type);
}

/**
 * Strip markdown formatting characters and citation references from AI output.
 * Converts the text to clean plain text suitable for form textareas.
 */
function stripMarkdownAndCitations(text: string): string {
  let cleaned = text;

  // Remove citation references like [1], [2][5], [^1], etc.
  cleaned = cleaned.replace(/\[\^?\d+\]/g, '');
  // Remove consecutive citation clusters
  cleaned = cleaned.replace(/(\s*\[\d+\])+/g, '');

  // Remove bold: **text** or __text__
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.+?)__/g, '$1');

  // Remove italic: *text* or _text_ (not underscores in words)
  cleaned = cleaned.replace(/(?<![\w])\*(.+?)\*(?![\w])/g, '$1');
  cleaned = cleaned.replace(/(?<![\w])_(.+?)_(?![\w])/g, '$1');

  // Remove strikethrough: ~~text~~
  cleaned = cleaned.replace(/~~(.+?)~~/g, '$1');

  // Remove inline code: `text`
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Remove headers: ### Header -> Header
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // Remove bullet points: - item or * item -> item
  cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '');

  // Remove numbered list markers: 1. item -> item
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove blockquotes: > text -> text
  cleaned = cleaned.replace(/^>\s?/gm, '');

  // Remove horizontal rules
  cleaned = cleaned.replace(/^[-*_]{3,}$/gm, '');

  // Remove link syntax: [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove image syntax: ![alt](url)
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Collapse multiple blank lines into one
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Trim
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Truncate text to fit within a character limit.
 * Tries to break at sentence or word boundaries for clean output.
 */
function truncateToLimit(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('! '),
    truncated.lastIndexOf('? '),
  );

  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.slice(0, lastSentenceEnd + 1).trim();
  }

  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace).trim();
  }

  return truncated.trim();
}

/**
 * Detect character limit on an element at click-time.
 */
function detectCharLimit(element: HTMLElement): number | null {
  const maxLengthAttr = element.getAttribute('maxlength');
  if (maxLengthAttr) {
    const val = parseInt(maxLengthAttr, 10);
    if (!isNaN(val) && val > 0) return val;
  }

  const container = element.closest('.field, .form-group, .form-field, [class*="question"], [class*="field"]') || element.parentElement;
  if (container) {
    const nodes = container.querySelectorAll('span, div, p, small');
    for (const node of nodes) {
      if (node === element) continue;
      const text = node.textContent?.trim() || '';
      if (text.length > 80) continue;
      const match = text.match(/\/\s*(\d+)/) || text.match(/(\d+)\s*character/i) || text.match(/max(?:imum)?[:\s]*(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > 0 && num < 100000) return num;
      }
    }
  }

  return null;
}

/**
 * Set the value of a form field, dispatching the appropriate events
 * so that React / Angular / Vue form state picks up the change.
 */
function setFieldValue(element: HTMLTextAreaElement | HTMLInputElement, value: string): void {
  // Store previous value for potential undo
  const prevValue = element.value;

  // For React-controlled inputs, we need to use the native setter
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    element instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype,
    'value',
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
  } else {
    element.value = value;
  }

  // Dispatch events to notify frameworks
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));

  // Store undo info as a data attribute
  element.setAttribute('data-jh-prev-value', prevValue);
}

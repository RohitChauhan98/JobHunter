/**
 * File: background/index.ts
 * Purpose: Background service worker — the "brain" of the extension.
 *
 * The background script runs persistently (Manifest V3 service worker)
 * and coordinates communication between content scripts, the popup,
 * and the options page. It owns data persistence and serves as the
 * single source of truth for profile data and application tracking.
 *
 * Key functionality:
 * - Handle messages from content scripts (form detection results, fill requests)
 * - Handle messages from popup (trigger fill, get status)
 * - Manage profile data in chrome.storage.local
 * - Track applications
 * - Check platform login status via cookies
 *
 * Message flow:
 *   Content Script ←→ Background ←→ Popup / Options
 */

import type {
  ExtensionMessage,
  TrackedApplication,
  UserProfile,
} from '@/types';
import { storage } from '@/utils/storage';
import { DEFAULT_SETTINGS, MAX_TRACKED_APPLICATIONS } from '@/utils/constants';
import { api } from '@/utils/api';

// ---------------------------------------------------------------------------
// Message Handler
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    // All handlers are async, so we return true to keep the message channel open
    handleMessage(message, sendResponse);
    return true;
  },
);

/**
 * Route incoming messages to the appropriate handler.
 *
 * Each message type has a dedicated handler function for clarity.
 * The sendResponse callback is used to reply to the sender.
 */
async function handleMessage(
  message: ExtensionMessage,
  sendResponse: (response: unknown) => void,
): Promise<void> {
  try {
    switch (message.type) {
      case 'PING':
        sendResponse({ type: 'PONG' });
        break;

      case 'FORM_DETECTED':
        // Content script detected a form — just acknowledge.
        // The popup also listens for this message directly via runtime.onMessage.
        sendResponse({ success: true });
        break;

      case 'FILL_RESULT':
        // Content script finished filling — just acknowledge.
        // The popup also listens for this message directly.
        sendResponse({ success: true });
        break;

      case 'GET_PROFILE':
        sendResponse(await handleGetProfile());
        break;

      case 'SAVE_PROFILE':
        await handleSaveProfile(message.data as UserProfile);
        sendResponse({ success: true });
        break;

      case 'GET_PLATFORM_STATUS':
        sendResponse(await handleGetPlatformStatus());
        break;

      case 'TRACK_APPLICATION':
        await handleTrackApplication(message.data as TrackedApplication);
        sendResponse({ success: true });
        break;

      case 'DETECT_FORM':
        // Forward detect request to the active tab's content script
        await handleDetectFormRequest();
        sendResponse({ success: true });
        break;

      case 'FILL_FORM':
        // Forward fill request to the active tab's content script
        await handleFillFormRequest();
        sendResponse({ success: true });
        break;

      case 'UNDO_FILL':
        // Forward undo request to the active tab's content script
        await handleUndoRequest();
        sendResponse({ success: true });
        break;

      // ─── Backend Integration ────────────────────────────────────────
      case 'BACKEND_LOGIN': {
        const { email, password } = message.data as { email: string; password: string };
        const loginResult = await api.login(email, password);
        sendResponse({ success: true, user: loginResult.user });
        break;
      }

      case 'BACKEND_REGISTER': {
        const { email, password } = message.data as { email: string; password: string };
        const regResult = await api.register(email, password);
        sendResponse({ success: true, user: regResult.user });
        break;
      }

      case 'BACKEND_LOGOUT':
        await api.logout();
        sendResponse({ success: true });
        break;

      case 'BACKEND_STATUS': {
        const token = await chrome.storage.local.get('authToken');
        if (!token.authToken) {
          sendResponse({ loggedIn: false, user: null });
          break;
        }
        try {
          const user = await api.getMe();
          sendResponse({ loggedIn: true, user });
        } catch {
          // Token expired or backend unreachable — clear stale token
          await api.logout();
          sendResponse({ loggedIn: false, user: null });
        }
        break;
      }

      case 'BACKEND_SYNC_PROFILE': {
        const profile = await storage.get('profile');
        if (profile) {
          await api.syncProfileToBackend(profile);
        }
        sendResponse({ success: true });
        break;
      }

      case 'BACKEND_TRACK_APPLICATION': {
        const appData = message.data as {
          jobTitle: string; company: string; platform: string; jobUrl: string;
        };
        const tracked = await api.trackApplication(appData);
        sendResponse({ success: true, application: tracked });
        break;
      }

      case 'AI_GENERATE_COVER_LETTER': {
        const { jobDescription } = message.data as { jobDescription: string };
        const coverResult = await api.generateCoverLetter(jobDescription);
        sendResponse({ success: true, ...coverResult });
        break;
      }

      case 'AI_GENERATE_ANSWER': {
        const { question, context: ctx } = message.data as { question: string; context?: string };
        const answerResult = await api.generateAnswer(question, ctx);
        sendResponse({ success: true, ...answerResult });
        break;
      }

      case 'AI_SMART_ANSWER': {
        const smartData = message.data as {
          question: string;
          companyName?: string;
          companyInfo?: string;
          jobDescription?: string;
          jobUrl?: string;
          jobTitle?: string;
        };
        const smartResult = await api.smartAnswer(smartData);
        sendResponse({ success: true, ...smartResult });
        break;
      }

      case 'TRY_IMPORT_WEB_TOKEN': {
        const imported = await tryImportWebToken();
        sendResponse({ success: imported });
        break;
      }

      default:
        sendResponse({ error: `Unknown message type: ${message.type}` });
    }
  } catch (error) {
    console.error('[JobHunter BG] Message handler error:', error);
    sendResponse({ error: (error as Error).message });
  }
}

// ---------------------------------------------------------------------------
// Handler Implementations
// ---------------------------------------------------------------------------

/**
 * Try to auto-import the auth token from the web dashboard (localhost:3000).
 * If the user is already logged in on the web, we grab the JWT from the web
 * page's localStorage and store it in the extension's chrome.storage so the
 * user doesn't have to sign in separately.
 */
async function tryImportWebToken(): Promise<boolean> {
  // Skip if we already have a token
  const existing = await chrome.storage.local.get('authToken');
  if (existing.authToken) return true;

  try {
    // Find any open web dashboard tab
    const tabs = await chrome.tabs.query({ url: 'http://localhost:3000/*' });
    if (tabs.length === 0) return false;

    const tab = tabs[0];
    if (!tab.id) return false;

    // Read the JWT token from the web dashboard's localStorage
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => localStorage.getItem('jh_token'),
    });

    const token = results?.[0]?.result;
    if (token && typeof token === 'string') {
      await chrome.storage.local.set({ authToken: token });
      console.log('[JobHunter] Auto-imported auth token from web dashboard');
      return true;
    }
  } catch (err) {
    // Web tab might not be accessible — that's fine
    console.debug('[JobHunter] Could not import web token:', err);
  }
  return false;
}

/**
 * Transform a backend profile response into the extension's UserProfile shape.
 * The backend returns a flat profile with nested relations, while the extension
 * expects { personalInfo: {...}, experience: [...], ... }.
 */
function transformBackendProfile(bp: any): UserProfile {
  return {
    personalInfo: {
      firstName: bp.firstName || '',
      lastName: bp.lastName || '',
      email: bp.email || '',
      phone: bp.phone || '',
      city: bp.city || '',
      state: bp.state || '',
      country: bp.country || '',
      linkedinUrl: bp.linkedinUrl || '',
      githubUrl: bp.githubUrl || '',
      portfolioUrl: bp.portfolioUrl || '',
      website: bp.website || '',
    },
    experience: (bp.experience || []).map((e: any) => ({
      id: e.id,
      company: e.company,
      title: e.title,
      startDate: e.startDate,
      endDate: e.endDate,
      isCurrent: e.isCurrent ?? false,
      description: e.description || '',
      achievements: e.achievements || [],
      technologies: e.technologies || [],
    })),
    education: (bp.education || []).map((e: any) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      field: e.field,
      startDate: e.startDate,
      endDate: e.endDate,
      gpa: e.gpa || '',
    })),
    skills: (bp.skills || []).map((s: any) => ({
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
    })),
    customAnswers: (bp.customAnswers || []).map((a: any) => ({
      id: a.id,
      question: a.question,
      answer: a.answer,
    })),
    preferences: bp.preferences
      ? {
          roles: bp.preferences.roles || [],
          locations: bp.preferences.locations || [],
          remoteOnly: bp.preferences.remoteOnly ?? false,
          salaryMin: bp.preferences.salaryMin ?? null,
          salaryMax: bp.preferences.salaryMax ?? null,
          salaryCurrency: bp.preferences.salaryCurrency || 'USD',
        }
      : { roles: [], locations: [], remoteOnly: false, salaryMin: null, salaryMax: null, salaryCurrency: 'USD' },
  };
}

/**
 * Fetch the user profile. Tries the backend first (if logged in),
 * falls back to local chrome.storage.
 */
async function handleGetProfile(): Promise<{ profile: UserProfile | null }> {
  // Try backend first
  try {
    const loggedIn = await api.isLoggedIn();
    if (loggedIn) {
      const backendProfile = await api.getProfile();
      if (backendProfile) {
        const profile = transformBackendProfile(backendProfile);
        // Cache locally for offline use
        await storage.set('profile', profile);
        return { profile };
      }
    }
  } catch (err) {
    console.warn('[JobHunter BG] Backend profile fetch failed, using local:', err);
  }

  // Fall back to local storage
  const profile = await storage.get('profile');
  return { profile };
}

async function handleSaveProfile(profile: UserProfile): Promise<void> {
  await storage.set('profile', profile);
}

/**
 * Check login status across supported platforms by inspecting cookies.
 * Instead of storing cookies (security risk), we do live checks.
 */
async function handleGetPlatformStatus(): Promise<Record<string, boolean>> {
  const platforms: Record<string, string> = {
    greenhouse: '.greenhouse.io',
    lever: '.lever.co',
    wellfound: '.wellfound.com',
    workday: '.myworkdayjobs.com',
  };

  const status: Record<string, boolean> = {};

  for (const [name, domain] of Object.entries(platforms)) {
    try {
      const cookies = await chrome.cookies.getAll({ domain });
      // A platform is considered "logged in" if it has session-like cookies
      status[name] = cookies.some(
        (c) =>
          c.name.toLowerCase().includes('session') ||
          c.name.toLowerCase().includes('token') ||
          c.name.toLowerCase().includes('auth') ||
          c.name.toLowerCase().includes('_at'), // LinkedIn-style: li_at
      );
    } catch {
      status[name] = false;
    }
  }

  return status;
}

async function handleTrackApplication(app: TrackedApplication): Promise<void> {
  const apps = await storage.get('applications');
  const updated = [app, ...apps].slice(0, MAX_TRACKED_APPLICATIONS);
  await storage.set('applications', updated);
}

/**
 * Send a DETECT_FORM message to the content script in the currently active tab.
 * If the content script isn't injected yet (e.g. page was open before extension install),
 * attempt to inject it programmatically — the content script auto-runs detection on boot.
 */
async function handleDetectFormRequest(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'DETECT_FORM' });
  } catch {
    // Content script not loaded on this tab — try to inject it.
    // The content script auto-detects forms when it boots.
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/index.js'],
      });
    } catch {
      // Page URL doesn't match host_permissions — not a job site, that's OK
    }
  }
}

/**
 * Send a FILL_FORM message (with the user's profile) to the active tab's content script.
 * Fetches profile from backend (or local cache) and sends it to the content script.
 */
async function handleFillFormRequest(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const { profile } = await handleGetProfile();
  if (tab?.id && profile) {
    chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORM', data: profile });
  }
}

/**
 * Send an UNDO_FILL message to the active tab's content script.
 */
async function handleUndoRequest(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'UNDO_FILL' });
  }
}

// ---------------------------------------------------------------------------
// Extension Lifecycle
// ---------------------------------------------------------------------------

/** Log when the service worker starts up */
console.log('[JobHunter] Background service worker started');

/**
 * On extension install or update, set default storage values if they don't exist.
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('[JobHunter] Extension installed — initializing storage');
    const existing = await storage.getAll();
    if (!existing.settings) {
      await storage.set('settings', DEFAULT_SETTINGS);
    }
  }
});



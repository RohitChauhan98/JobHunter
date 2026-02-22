/**
 * File: utils/messaging.ts
 * Purpose: Typed helpers for message passing between extension components.
 *
 * Chrome extension communication happens via chrome.runtime.sendMessage
 * (content ↔ background) and chrome.tabs.sendMessage (background → content).
 * These wrappers add type safety and consistent error handling.
 *
 * Usage:
 *   // From content script or popup → background
 *   const response = await sendMessage({ type: 'GET_PROFILE' });
 *
 *   // From background → specific tab's content script
 *   await sendTabMessage(tabId, { type: 'FILL_FORM', data: profileData });
 */

import type { ExtensionMessage } from '@/types';

/**
 * Check whether the extension context is still valid.
 *
 * After an extension reload / update / disable, content scripts that are still
 * running on the page lose access to the chrome.runtime APIs.  The most
 * reliable detection is checking `chrome.runtime.id` — it becomes `undefined`
 * when the context has been invalidated.
 */
export function isContextValid(): boolean {
  try {
    return !!(chrome?.runtime?.id);
  } catch {
    return false;
  }
}

/**
 * Error thrown when the extension context has been invalidated.
 * Callers can check for this to avoid noisy error logging.
 */
export class ContextInvalidatedError extends Error {
  constructor() {
    super('Extension context invalidated');
    this.name = 'ContextInvalidatedError';
  }
}

/**
 * Send a message to the background service worker (from content script or popup).
 *
 * @param message  The typed message to send.
 * @returns The response from the background handler.
 */
export async function sendMessage<R = unknown>(message: ExtensionMessage): Promise<R> {
  if (!isContextValid()) {
    throw new ContextInvalidatedError();
  }

  try {
    const response = await chrome.runtime.sendMessage(message);
    return response as R;
  } catch (error) {
    // Re-check validity — the context may have been invalidated mid-call
    if (!isContextValid()) {
      throw new ContextInvalidatedError();
    }
    console.error(`[JobHunter] Failed to send message (${message.type}):`, error);
    throw error;
  }
}

/**
 * Send a message from the background service worker to a specific tab's content script.
 *
 * @param tabId    The tab to send the message to.
 * @param message  The typed message to send.
 * @returns The response from the content script handler.
 */
export async function sendTabMessage<R = unknown>(
  tabId: number,
  message: ExtensionMessage,
): Promise<R> {
  if (!isContextValid()) {
    throw new ContextInvalidatedError();
  }

  try {
    const response = await chrome.tabs.sendMessage(tabId, message);
    return response as R;
  } catch (error) {
    if (!isContextValid()) {
      throw new ContextInvalidatedError();
    }
    console.error(`[JobHunter] Failed to send tab message (${message.type}) to tab ${tabId}:`, error);
    throw error;
  }
}

/**
 * File: content/authBridge.ts
 * Purpose: Copy the web dashboard JWT into the extension.
 *
 * The dashboard stores `jh_token` in localStorage. Generate-answer requests
 * run in the extension service worker, which cannot read that localStorage
 * unless we sync it. This script runs on the dashboard origin and forwards
 * the token to the background worker.
 */

const WEB_MESSAGE_SOURCE = 'jobhunter-web';

function forwardToken(token: string | null): void {
  if (!token) return;
  try {
    chrome.runtime.sendMessage({ type: 'SYNC_WEB_TOKEN', data: { token } }, () => {
      void chrome.runtime.lastError;
    });
  } catch {
    // Extension was reloaded while the dashboard tab was open.
  }
}

function syncFromStorage(): void {
  try {
    forwardToken(localStorage.getItem('jh_token'));
  } catch {
    // localStorage can throw in locked-down browser contexts.
  }
}

syncFromStorage();

window.addEventListener('message', (event: MessageEvent) => {
  if (event.origin !== window.location.origin) return;
  const data = event.data as { source?: string; type?: string; token?: unknown };
  if (!data || data.source !== WEB_MESSAGE_SOURCE || data.type !== 'TOKEN_CHANGED') return;
  if (typeof data.token === 'string') {
    forwardToken(data.token);
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') syncFromStorage();
});

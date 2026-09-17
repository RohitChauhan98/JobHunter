/**
 * File: utils/authSync.ts
 * Purpose: Shared auth-token resolution rules for the extension.
 *
 * The web dashboard stores a JWT in localStorage (`jh_token`). The extension
 * stores its own copy in chrome.storage (`authToken`). Generate/smart-answer
 * requests fail with "Missing or malformed token" when the extension copy is
 * missing even though the user is already signed in on the dashboard.
 */

export const MISSING_AUTH_MESSAGE =
  'Sign in to JobHunter first. Open the extension popup and sign in, or log in at the dashboard.';

export const DASHBOARD_TAB_URL_PATTERNS = [
  'http://localhost:3000/*',
  'http://127.0.0.1:3000/*',
] as const;

export const WEB_TOKEN_STORAGE_KEY = 'jh_token';

export async function resolveAuthToken(deps: {
  getStoredToken: () => Promise<string | null>;
  importFromWeb: () => Promise<boolean>;
}): Promise<string | null> {
  const existing = await deps.getStoredToken();
  if (existing) return existing;
  await deps.importFromWeb();
  return deps.getStoredToken();
}

/**
 * Never clear an extension login just because a dashboard page has no token
 * (the marketing site shares the origin). Only write when the dashboard
 * actually has a different JWT.
 */
export function shouldReplaceStoredToken(
  stored: string | null,
  incoming: string | null,
): boolean {
  if (!incoming) return false;
  return stored !== incoming;
}

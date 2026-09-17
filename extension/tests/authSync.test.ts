import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DASHBOARD_TAB_URL_PATTERNS,
  MISSING_AUTH_MESSAGE,
  resolveAuthToken,
  shouldReplaceStoredToken,
} from '../src/utils/authSync.ts';

describe('resolveAuthToken', () => {
  it('returns the stored token without importing from the web dashboard', async () => {
    let imported = false;
    const token = await resolveAuthToken({
      getStoredToken: async () => 'existing-jwt',
      importFromWeb: async () => {
        imported = true;
        return true;
      },
    });
    assert.equal(token, 'existing-jwt');
    assert.equal(imported, false);
  });

  it('imports from the web dashboard when the extension has no token', async () => {
    let stored: string | null = null;
    const token = await resolveAuthToken({
      getStoredToken: async () => stored,
      importFromWeb: async () => {
        stored = 'imported-jwt';
        return true;
      },
    });
    assert.equal(token, 'imported-jwt');
  });

  it('returns null when no stored token exists and web import fails', async () => {
    const token = await resolveAuthToken({
      getStoredToken: async () => null,
      importFromWeb: async () => false,
    });
    assert.equal(token, null);
  });
});

describe('shouldReplaceStoredToken', () => {
  it('does not wipe an extension login when the dashboard has no token', () => {
    assert.equal(shouldReplaceStoredToken('popup-jwt', null), false);
  });

  it('imports a new dashboard token when the extension has none', () => {
    assert.equal(shouldReplaceStoredToken(null, 'web-jwt'), true);
  });

  it('updates when the dashboard token differs from the stored one', () => {
    assert.equal(shouldReplaceStoredToken('old-jwt', 'new-jwt'), true);
  });

  it('skips a no-op sync of the same token', () => {
    assert.equal(shouldReplaceStoredToken('same-jwt', 'same-jwt'), false);
  });
});

describe('dashboard import targets', () => {
  it('includes both localhost and 127.0.0.1 dashboard origins', () => {
    assert.ok(DASHBOARD_TAB_URL_PATTERNS.includes('http://localhost:3000/*'));
    assert.ok(DASHBOARD_TAB_URL_PATTERNS.includes('http://127.0.0.1:3000/*'));
  });

  it('explains missing auth without the raw backend error', () => {
    assert.match(MISSING_AUTH_MESSAGE, /sign in/i);
    assert.doesNotMatch(MISSING_AUTH_MESSAGE, /malformed token/i);
  });
});

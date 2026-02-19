/**
 * File: popup/Popup.tsx
 * Purpose: Main entry point for the extension popup UI.
 *
 * Renders the popup that appears when the user clicks the extension icon.
 * Shows:
 * - Profile status (configured or not)
 * - Whether the current page has a detected application form
 * - Auto-fill / undo buttons
 * - Quick stats (applications today)
 * - Link to the full options page / dashboard
 *
 * Communication:
 * - Sends messages to background service worker for data
 * - Receives form detection status from the content script (via background)
 */

import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { FormDetectionResult, UserProfile } from '@/types';
import { sendMessage } from '@/utils/messaging';
import '@/styles/global.css';

const WEB_DASHBOARD_URL = 'http://localhost:3000';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PopupState {
  loading: boolean;
  profile: UserProfile | null;
  detection: FormDetectionResult | null;
  platformStatus: Record<string, boolean>;
  fillInProgress: boolean;
  lastFillMessage: string | null;
  backendLoggedIn: boolean;
  backendUser: { id: string; email: string } | null;
  loginMode: boolean;
  loginEmail: string;
  loginPassword: string;
  loginError: string;
  loginLoading: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function Popup() {
  const [state, setState] = useState<PopupState>({
    loading: true,
    profile: null,
    detection: null,
    platformStatus: {},
    fillInProgress: false,
    lastFillMessage: null,
    backendLoggedIn: false,
    backendUser: null,
    loginMode: false,
    loginEmail: '',
    loginPassword: '',
    loginError: '',
    loginLoading: false,
  });

  // Load profile and platform status on mount
  useEffect(() => {
    async function init() {
      try {
        // 1. Fire form detection IMMEDIATELY — don't wait for backend
        sendMessage({ type: 'DETECT_FORM' }).catch(() => {});

        // 2. Try to auto-import auth token from web dashboard (if open)
        await sendMessage({ type: 'TRY_IMPORT_WEB_TOKEN' }).catch(() => {});

        // 3. Check backend status, profile, and platform status in parallel
        const [backendStatus, profileRes, statusRes] = await Promise.all([
          sendMessage<{ loggedIn: boolean; user: any }>({ type: 'BACKEND_STATUS' }).catch(() => ({ loggedIn: false, user: null })),
          sendMessage<{ profile: UserProfile | null }>({ type: 'GET_PROFILE' }).catch(() => ({ profile: null })),
          sendMessage<Record<string, boolean>>({ type: 'GET_PLATFORM_STATUS' }).catch(() => ({})),
        ]);

        setState((prev) => ({
          ...prev,
          loading: false,
          profile: profileRes.profile ?? null,
          platformStatus: statusRes ?? {},
          backendLoggedIn: backendStatus.loggedIn ?? false,
          backendUser: backendStatus.user ?? null,
        }));
      } catch (error) {
        console.error('[JobHunter Popup] Init failed:', error);
        setState((prev) => ({ ...prev, loading: false }));
      }
    }
    init();
  }, []);

  // Listen for form detection results from the content script
  useEffect(() => {
    function handleMessage(message: { type: string; data?: unknown }) {
      if (message.type === 'FORM_DETECTED') {
        setState((prev) => ({
          ...prev,
          detection: message.data as FormDetectionResult,
        }));
      }
      if (message.type === 'FILL_RESULT') {
        const result = message.data as { filledFields: number; totalFields: number };
        setState((prev) => ({
          ...prev,
          fillInProgress: false,
          lastFillMessage: `Filled ${result.filledFields} of ${result.totalFields} fields`,
        }));
      }
      if (message.type === 'UNDO_RESULT') {
        setState((prev) => ({
          ...prev,
          lastFillMessage: 'Undo complete',
        }));
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // Handlers
  const handleFill = async () => {
    if (!state.profile) {
      setState((prev) => ({ ...prev, lastFillMessage: 'Please set up your profile first.' }));
      return;
    }
    setState((prev) => ({ ...prev, fillInProgress: true, lastFillMessage: null }));
    await sendMessage({ type: 'FILL_FORM' });
  };

  const handleUndo = async () => {
    setState((prev) => ({ ...prev, lastFillMessage: null }));
    await sendMessage({ type: 'UNDO_FILL' });
  };

  const openDashboard = (path = '') => {
    chrome.tabs.create({ url: `${WEB_DASHBOARD_URL}/dashboard${path}` });
  };

  const handleLogin = async () => {
    setState((prev) => ({ ...prev, loginLoading: true, loginError: '' }));
    try {
      const result = await sendMessage<{ success: boolean; user: any; error?: string }>({
        type: 'BACKEND_LOGIN',
        data: { email: state.loginEmail, password: state.loginPassword },
      });
      if (result.error) throw new Error(result.error);

      // Re-fetch profile after login
      const profileRes = await sendMessage<{ profile: UserProfile | null }>({ type: 'GET_PROFILE' }).catch(() => ({ profile: null }));

      setState((prev) => ({
        ...prev,
        backendLoggedIn: true,
        backendUser: result.user,
        profile: profileRes.profile ?? null,
        loginMode: false,
        loginLoading: false,
        loginEmail: '',
        loginPassword: '',
        loginError: '',
      }));
    } catch (err: any) {
      setState((prev) => ({ ...prev, loginLoading: false, loginError: err.message || 'Login failed' }));
    }
  };

  const handleLogout = async () => {
    await sendMessage({ type: 'BACKEND_LOGOUT' });
    setState((prev) => ({
      ...prev,
      backendLoggedIn: false,
      backendUser: null,
      profile: null,
    }));
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (state.loading) {
    return (
      <div className="w-80 bg-slate-950 p-6 flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-950 text-slate-200">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15">
            <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
          </div>
          <span className="font-bold text-white">JobHunter</span>
        </div>
        <button
          onClick={() => openDashboard('/settings')}
          className="text-slate-500 hover:text-slate-300 transition-colors"
          title="Settings"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Backend Auth Status */}
        {!state.backendLoggedIn && !state.loginMode && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-sm text-amber-300 mb-2">Sign in to sync your profile and auto-fill forms.</p>
            <button
              onClick={() => setState((prev) => ({ ...prev, loginMode: true }))}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Login Form */}
        {state.loginMode && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
            <input
              type="email"
              placeholder="Email"
              value={state.loginEmail}
              onChange={(e) => setState((prev) => ({ ...prev, loginEmail: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={state.loginPassword}
              onChange={(e) => setState((prev) => ({ ...prev, loginPassword: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {state.loginError && <p className="text-xs text-red-400">{state.loginError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleLogin}
                disabled={state.loginLoading || !state.loginEmail || !state.loginPassword}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
              >
                {state.loginLoading ? 'Signing in…' : 'Sign In'}
              </button>
              <button
                onClick={() => setState((prev) => ({ ...prev, loginMode: false, loginError: '' }))}
                className="text-slate-400 text-sm py-1.5 hover:text-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Logged-in user info */}
        {state.backendLoggedIn && state.backendUser && (
          <div className="flex items-center justify-between text-sm bg-slate-900/50 rounded-lg px-3 py-2">
            <span className="text-green-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              {state.backendUser.email}
            </span>
            <button onClick={handleLogout} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
              Sign out
            </button>
          </div>
        )}

        {/* Profile Status */}
        <div className="flex items-center gap-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${state.profile ? 'bg-green-400' : 'bg-amber-400'}`} />
          <span className="text-slate-300">
            {state.profile
              ? `Profile: ${state.profile.personalInfo.firstName} ${state.profile.personalInfo.lastName}`
              : 'Profile not configured'}
          </span>
          {!state.profile && (
            <button onClick={() => openDashboard('/profile')} className="text-blue-400 hover:text-blue-300 text-xs ml-auto transition-colors">
              Set up →
            </button>
          )}
        </div>

        {/* Platform Status */}
        <div className="border-t border-slate-800/60 pt-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Platform Status</p>
          <div className="space-y-1">
            {Object.entries(state.platformStatus).map(([platform, active]) => (
              <div key={platform} className="flex items-center gap-2 text-sm">
                <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="capitalize text-slate-300">{platform}</span>
                <span className="text-slate-600 text-xs ml-auto">
                  {active ? 'Active' : 'Not logged in'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Detection Status */}
        <div className="border-t border-slate-800/60 pt-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Current Page</p>
          {state.detection?.isApplicationForm ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 p-2.5 rounded-lg">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <span>
                  Application form detected
                  {state.detection.platform !== 'generic' && (
                    <span className="text-green-300 capitalize"> ({state.detection.platform})</span>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {state.detection.fields.length} fields found
                {state.detection.jobDetails?.title && (
                  <> · {state.detection.jobDetails.title}</>
                )}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No application form detected on this page.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-800/60 pt-3 space-y-2">
          <button
            onClick={handleFill}
            disabled={!state.detection?.isApplicationForm || !state.profile || state.fillInProgress}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed
                       text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {state.fillInProgress ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Filling...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>
                Auto-Fill Form
              </>
            )}
          </button>

          <button
            onClick={handleUndo}
            className="w-full text-slate-400 hover:text-slate-200 text-sm py-1.5 transition-colors"
          >
            ↩ Undo Last Fill
          </button>
        </div>

        {/* Fill Result Message */}
        {state.lastFillMessage && (
          <div className="text-sm text-center text-slate-300 bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
            {state.lastFillMessage}
          </div>
        )}

        {/* Quick Fill Shortcuts Help */}
        <div className="border-t border-slate-800/60 pt-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">⚡ Quick Fill Shortcuts</p>
          <p className="text-xs text-slate-500 mb-2">
            Type <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono text-[11px]">@</code> in any input field to access your profile data:
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
            {[
              { k: '@linkedin', v: 'LinkedIn URL' },
              { k: '@github', v: 'GitHub URL' },
              { k: '@email', v: 'Email Address' },
              { k: '@phone', v: 'Phone Number' },
              { k: '@fullname', v: 'Full Name' },
              { k: '@portfolio', v: 'Portfolio URL' },
              { k: '@city', v: 'City' },
              { k: '@company', v: 'Current Company' },
              { k: '@title', v: 'Job Title' },
              { k: '@skills', v: 'Top Skills' },
            ].map(({ k, v }) => (
              <div key={k} className="flex items-center gap-1 py-0.5">
                <span className="font-mono text-blue-400 font-semibold">{k}</span>
                <span className="text-slate-600">→ {v}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-1.5">
            Arrow keys to navigate, Enter/Tab to select, Esc to dismiss.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/60 pt-3 flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={() => openDashboard('/profile')}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Profile
            </button>
            <button
              onClick={() => openDashboard('')}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Dashboard
            </button>
          </div>
          <span className="text-xs text-slate-700">v0.1.0</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<Popup />);
}

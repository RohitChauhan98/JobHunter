/**
 * File: utils/api.ts
 * Purpose: API client for the JobHunter backend.
 *
 * The extension communicates with the backend to:
 *   - Authenticate users (login/register)
 *   - Sync profile data
 *   - Track applications
 *   - Request AI-generated content (cover letters, answers)
 */

const DEFAULT_API_URL = 'http://localhost:4000/api';

/** Allowed API base URLs — prevents sending the Bearer token to arbitrary hosts. */
const ALLOWED_API_ORIGINS = new Set([
  'http://localhost:4000',
  'http://127.0.0.1:4000',
]);

function isAllowedApiBase(baseUrl: string): boolean {
  try {
    const url = new URL(baseUrl.endsWith('/api') ? baseUrl : `${baseUrl.replace(/\/+$/, '')}/api`);
    const origin = url.origin;
    if (ALLOWED_API_ORIGINS.has(origin)) return true;
    // Allow https production hosts if explicitly configured later via env-like storage
    if (url.protocol === 'https:' && url.pathname.replace(/\/+$/, '') === '/api') return true;
    return false;
  } catch {
    return false;
  }
}

// ─── Token / Config ─────────────────────────────────────────────────────────

async function getApiUrl(): Promise<string> {
  const result = await chrome.storage.local.get('backendUrl');
  const configured = result.backendUrl as string | undefined;
  if (configured && isAllowedApiBase(configured)) {
    return configured.replace(/\/+$/, '');
  }
  if (configured && !isAllowedApiBase(configured)) {
    console.warn('[JobHunter] Ignoring disallowed backendUrl:', configured);
  }
  return DEFAULT_API_URL;
}

async function getAuthToken(): Promise<string | null> {
  const result = await chrome.storage.local.get('authToken');
  return result.authToken || null;
}

async function setAuthToken(token: string | null): Promise<void> {
  if (token) {
    await chrome.storage.local.set({ authToken: token });
  } else {
    await chrome.storage.local.remove('authToken');
  }
}

// ─── Fetch Wrapper ──────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T = any>(path: string, options: RequestInit & { params?: Record<string, string> } = {}): Promise<T> {
  const { params, ...init } = options;
  const baseUrl = await getApiUrl();

  let url = `${baseUrl}${path}`;
  if (params) {
    const sp = new URLSearchParams(params);
    const qs = sp.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Unable to reach the server. Check your connection.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { message: res.statusText, code: 'UNKNOWN' } }));
    throw new ApiError(res.status, body.error?.code || 'UNKNOWN', body.error?.message || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export const api = {
  // Auth
  async login(email: string, password: string) {
    const result = await apiFetch<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await setAuthToken(result.token);
    await chrome.storage.local.set({ backendUser: result.user });
    return result;
  },

  async register(email: string, password: string) {
    const result = await apiFetch<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await setAuthToken(result.token);
    await chrome.storage.local.set({ backendUser: result.user });
    return result;
  },

  async logout() {
    await setAuthToken(null);
    await chrome.storage.local.remove(['backendUser']);
  },

  async getMe() {
    return apiFetch<{ id: string; email: string }>('/auth/me');
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await getAuthToken();
    return !!token;
  },

  /** Persist a token only after verifying it with /auth/me. */
  async importAndVerifyToken(token: string): Promise<boolean> {
    await setAuthToken(token);
    try {
      const user = await this.getMe();
      await chrome.storage.local.set({ backendUser: user });
      return true;
    } catch (err) {
      await this.logout();
      if (err instanceof ApiError && err.status === 0) {
        // Network error during verify — don't keep an unverified token
        console.warn('[JobHunter] Could not verify imported token (network)');
      }
      return false;
    }
  },

  // Profile
  async getProfile() {
    return apiFetch('/profile');
  },

  async updateProfile(data: Record<string, any>) {
    return apiFetch('/profile', { method: 'PUT', body: JSON.stringify(data) });
  },

  async syncProfileToBackend(profile: any) {
    const personal = profile.personalInfo || {};
    await this.updateProfile({
      firstName: personal.firstName,
      lastName: personal.lastName,
      email: personal.email,
      phone: personal.phone,
      city: personal.city,
      state: personal.state,
      country: personal.country,
      linkedinUrl: personal.linkedinUrl,
      githubUrl: personal.githubUrl,
      portfolioUrl: personal.portfolioUrl,
      website: personal.website,
    });
  },

  // Applications
  async trackApplication(data: {
    jobTitle: string;
    company: string;
    platform: string;
    jobUrl: string;
    status?: string;
    notes?: string;
  }) {
    return apiFetch('/applications', { method: 'POST', body: JSON.stringify(data) });
  },

  // AI
  async generateCoverLetter(jobDescription: string) {
    return apiFetch<{ text: string; provider: string; model: string }>('/ai/cover-letter', {
      method: 'POST',
      body: JSON.stringify({ jobDescription }),
    });
  },

  async generateAnswer(question: string, context?: string) {
    return apiFetch<{ text: string; provider: string; model: string }>('/ai/answer', {
      method: 'POST',
      body: JSON.stringify({ question, context }),
    });
  },

  async smartAnswer(data: {
    question: string;
    companyName?: string;
    companyInfo?: string;
    jobDescription?: string;
    jobUrl?: string;
    jobTitle?: string;
    maxLength?: number;
  }) {
    return apiFetch<{ text: string; provider: string; model: string }>('/ai/smart-answer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

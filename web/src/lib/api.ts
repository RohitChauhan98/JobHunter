const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// ─── Token Management ───────────────────────────────────────────────────────

let token: string | null = null;

export function setToken(t: string | null) {
  token = t;
  if (t) {
    localStorage.setItem('jh_token', t);
  } else {
    localStorage.removeItem('jh_token');
  }
}

export function getToken(): string | null {
  if (token) return token;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('jh_token');
  }
  return token;
}

// ─── Fetch Wrapper ──────────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

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

async function apiFetch<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;

  // Build URL with query params
  let url = `${API_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined) searchParams.set(key, String(val));
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  const tok = getToken();
  if (tok) {
    headers['Authorization'] = `Bearer ${tok}`;
  }

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { message: res.statusText, code: 'UNKNOWN' } }));
    throw new ApiError(res.status, body.error?.code || 'UNKNOWN', body.error?.message || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export const auth = {
  register: (email: string, password: string) =>
    apiFetch<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch<{ id: string; email: string; createdAt: string }>('/auth/me'),
};

// ─── Profile ────────────────────────────────────────────────────────────────

export const profile = {
  get: () => apiFetch('/profile'),
  update: (data: Record<string, any>) =>
    apiFetch('/profile', { method: 'PUT', body: JSON.stringify(data) }),

  addExperience: (data: any) =>
    apiFetch('/profile/experience', { method: 'POST', body: JSON.stringify(data) }),
  updateExperience: (id: string, data: any) =>
    apiFetch(`/profile/experience/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExperience: (id: string) =>
    apiFetch(`/profile/experience/${id}`, { method: 'DELETE' }),

  addEducation: (data: any) =>
    apiFetch('/profile/education', { method: 'POST', body: JSON.stringify(data) }),
  updateEducation: (id: string, data: any) =>
    apiFetch(`/profile/education/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEducation: (id: string) =>
    apiFetch(`/profile/education/${id}`, { method: 'DELETE' }),

  setSkills: (skills: any[]) =>
    apiFetch('/profile/skills', { method: 'PUT', body: JSON.stringify({ skills }) }),

  addCustomAnswer: (question: string, answer: string) =>
    apiFetch('/profile/custom-answers', { method: 'POST', body: JSON.stringify({ question, answer }) }),
  updateCustomAnswer: (id: string, data: any) =>
    apiFetch(`/profile/custom-answers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomAnswer: (id: string) =>
    apiFetch(`/profile/custom-answers/${id}`, { method: 'DELETE' }),

  updatePreferences: (data: any) =>
    apiFetch('/profile/preferences', { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── Applications ───────────────────────────────────────────────────────────

export const applications = {
  list: (params?: { status?: string; platform?: string; page?: number; limit?: number; search?: string }) =>
    apiFetch('/applications', { params: params as any }),
  create: (data: any) =>
    apiFetch('/applications', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/applications/${id}`, { method: 'DELETE' }),
  stats: () => apiFetch('/applications/stats'),
};

// ─── AI ─────────────────────────────────────────────────────────────────────

export const ai = {
  generate: (data: { prompt: string; systemPrompt?: string }) =>
    apiFetch('/ai/generate', { method: 'POST', body: JSON.stringify(data) }),
  coverLetter: (jobDescription: string) =>
    apiFetch('/ai/cover-letter', { method: 'POST', body: JSON.stringify({ jobDescription }) }),
  answer: (question: string, context?: string) =>
    apiFetch('/ai/answer', { method: 'POST', body: JSON.stringify({ question, context }) }),
  resumeOptimize: (jobDescription: string) =>
    apiFetch('/ai/resume-optimize', { method: 'POST', body: JSON.stringify({ jobDescription }) }),
  getConfig: () => apiFetch('/ai/config'),
  updateConfig: (data: any) =>
    apiFetch('/ai/config', { method: 'PUT', body: JSON.stringify(data) }),
  testConnection: (provider?: string) =>
    apiFetch('/ai/test-connection', { method: 'POST', body: JSON.stringify({ provider }) }),
};

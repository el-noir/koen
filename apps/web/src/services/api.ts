import { AUTH_TOKEN_KEY } from '@/utils/constants';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  || 'http://localhost:4000/api';

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      // Optional: window.location.href = '/login';
    }
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || `API Error: ${response.statusText}`);
  }

  return payload?.data ?? payload;
}

export const api = {
  async fetch<T = unknown>(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    return parseResponse<T>(response);
  },

  async post<T = unknown>(endpoint: string, body: unknown) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });

    return parseResponse<T>(response);
  },

  async patch<T = unknown>(endpoint: string, body: unknown) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });

    return parseResponse<T>(response);
  },

  async uploadAudio<T = unknown>(projectId: string, blob: Blob, language: string = 'en') {
    const formData = new FormData();
    formData.append('audio', blob, 'record.webm');
    formData.append('projectId', projectId);
    formData.append('language', language);

    const response = await fetch(`${API_BASE}/records/upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    return parseResponse<T>(response);
  },

  async confirmExtractedItem<T = unknown>(itemId: string, payload: { confirmed?: boolean; content?: unknown }) {
    return this.patch<T>(`/confirm/${itemId}`, payload);
  },
};

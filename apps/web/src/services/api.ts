// apps/web/src/services/api.ts
// Typed API client for the Next.js frontend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return payload?.data ?? payload;
}

export const api = {
  async fetch<T = unknown>(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return parseResponse<T>(response);
  },

  async patch<T = unknown>(endpoint: string, body: unknown) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
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
      body: formData,
    });

    return parseResponse<T>(response);
  },

  async confirmExtractedItem<T = unknown>(itemId: string, payload: { confirmed?: boolean; content?: unknown }) {
    return this.patch<T>(`/confirm/${itemId}`, payload);
  },
};

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

  async getUploadUrl(projectId: string, filename: string) {
    return this.fetch<{ url: string; key: string }>(
      `/records/upload-url?projectId=${projectId}&filename=${filename}`,
    );
  },

  async uploadToCloud(url: string, blob: Blob) {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'audio/webm',
      },
      body: blob,
    });

    if (!response.ok) {
      throw new Error(`Cloud upload failed: ${response.statusText}`);
    }
    return true;
  },

  async uploadAudio<T = unknown>(projectId: string, blob: Blob, language: string = 'en') {
    // Phase 3.6: Direct-to-Cloud Upload Flow
    // 1. Get a secure presigned URL
    const { url, key } = await this.getUploadUrl(projectId, 'record.webm');

    // 2. Upload directly to DigitalOcean
    await this.uploadToCloud(url, blob);

    // 3. Register the record in the database for AI processing
    const response = await fetch(`${API_BASE}/records/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        projectId,
        language,
        cloudKey: key,
      }),
    });

    return parseResponse<T>(response);
  },

  async confirmExtractedItem<T = unknown>(itemId: string, payload: { confirmed?: boolean; content?: unknown }) {
    return this.patch<T>(`/confirm/${itemId}`, payload);
  },

  async fetchInvitations(projectId?: string) {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.fetch<Invitation[]>(`/invitations${query}`);
  },

  async revokeInvitation(invitationId: string) {
    return this.patch<Invitation>(`/invitations/${invitationId}/revoke`, {});
  },
};

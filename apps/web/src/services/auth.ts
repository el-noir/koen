import { api } from './api';
import { AuthResponse, User } from '@/types';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/utils/constants';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    }
    
    return response.user;
  },

  async signup(token: string, name: string, password: string): Promise<User> {
    const response = await api.post<AuthResponse>('/auth/signup', { token, name, password });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    }
    
    return response.user;
  },

  async getMe(): Promise<User | null> {
    try {
      return await api.fetch<User>('/auth/me');
    } catch (err) {
      this.logout();
      return null;
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
};

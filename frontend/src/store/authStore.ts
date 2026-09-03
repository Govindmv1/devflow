import { create } from 'zustand';
import api from '../lib/api';
import type { User, LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';

/**
 * Authentication store using Zustand.
 * 
 * Manages:
 * - Current user state
 * - Login/Register/Logout flows
 * - Token persistence in localStorage
 * - Loading and error states
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const response = await api.get<ApiResponse<User>>('/users/me');
      if (response.data.success && response.data.data) {
        set({ user: response.data.data, isAuthenticated: true, isLoading: false });
      }
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (data: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);

      if (response.data.success && response.data.data) {
        const { user, accessToken, refreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, isAuthenticated: true, isLoading: false });
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);

      if (response.data.success && response.data.data) {
        const { user, accessToken, refreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, isAuthenticated: true, isLoading: false });
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if the server request fails, clear local state
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  fetchCurrentUser: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get<ApiResponse<User>>('/users/me');
      if (response.data.success && response.data.data) {
        set({ user: response.data.data, isAuthenticated: true, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

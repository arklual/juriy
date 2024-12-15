import { create } from 'zustand';
import { auth } from '../services/api';
import type { UserSignin, UserConfirm } from '../types/api';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (credentials: UserSignin) => Promise<void>;
  register: (data: UserSignin) => Promise<void>;
  confirmEmail: (data: UserConfirm) => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  signIn: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await auth.signIn(credentials);
      localStorage.setItem('token', data.token);
      set({ token: data.token, isAuthenticated: true });
    } catch (error) {
      set({ error: 'Failed to sign in' });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await auth.register(data);
      await auth.sendCode(data);
    } catch (error) {
      set({ error: 'Failed to register' });
    } finally {
      set({ isLoading: false });
    }
  },

  confirmEmail: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await auth.confirmEmail(data);
      const { data: tokenData } = await auth.signIn({
        login: data.login,
        password: data.password,
      });
      localStorage.setItem('token', tokenData.token);
      set({ token: tokenData.token, isAuthenticated: true });
    } catch (error) {
      set({ error: 'Failed to confirm email' });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: () => {
    localStorage.removeItem('token');
    set({ token: null, isAuthenticated: false });
  },
}));
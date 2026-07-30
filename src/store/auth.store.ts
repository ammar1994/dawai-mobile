import { create } from 'zustand';
import { authService } from '../services/auth.service';
import type { AuthState, LoginRequest, RegisterRequest } from '../types';

interface AuthStore extends AuthState {
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => void;
  clearError: () => void;
  error: string | null;
}

export const useAuthStore = create<AuthStore>((set) => ({
  customer: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  loadSession: () => {
    const session = authService.loadSession();
    if (session) {
      set({
        customer: session.customer,
        tokens: session.tokens,
        isAuthenticated: true,
      });
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const session = await authService.login(payload);
      set({
        customer: session.customer,
        tokens: session.tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? 'فشل تسجيل الدخول، تحقق من بياناتك';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const session = await authService.register(payload);
      set({
        customer: session.customer,
        tokens: session.tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? 'فشل إنشاء الحساب، حاول مجدداً';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await authService.logout();
    set({
      customer: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

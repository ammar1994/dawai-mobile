import { create } from 'zustand';
import { MobileCustomer, LoginPayload, RegisterPayload } from '../types';
import { StorageKeys, StorageService } from '../services/storage.service';
import api from '../api/client';

interface AuthState {
  isAuthenticated : boolean;
  isLoading       : boolean;
  user            : MobileCustomer | null;
  error           : string | null;
}

interface AuthActions {
  login         : (payload: LoginPayload)    => Promise<void>;
  register      : (payload: RegisterPayload) => Promise<void>;
  logout        : ()                         => Promise<void>;
  forceLogout   : ()                         => void;
  loadSession   : ()                         => Promise<void>;
  updateProfile : (data: Partial<Pick<MobileCustomer, 'firstName' | 'lastName' | 'phone'>>) => Promise<void>;
  clearError    : ()                         => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // ─── State ────────────────────────────────────────────────────────────
  isAuthenticated : false,
  isLoading       : false,
  user            : null,
  error           : null,

  // ─── Actions ──────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),

  loadSession: async () => {
    set({ isLoading: true });
    try {
      const token    = StorageService.getString(StorageKeys.ACCESS_TOKEN);
      const customer = StorageService.getObject<MobileCustomer>(StorageKeys.CUSTOMER);

      if (!token || !customer) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      // تحقق من صلاحية الجلسة مع الـ Backend
      const { data } = await api.get('/auth/me');
      const me: MobileCustomer = data.data ?? data;

      StorageService.setObject(StorageKeys.CUSTOMER, me);
      set({ isAuthenticated: true, user: me, isLoading: false });
    } catch {
      StorageService.clearAuth();
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', payload);
      const result   = data.data ?? data;

      StorageService.setString(StorageKeys.ACCESS_TOKEN,  result.accessToken);
      StorageService.setString(StorageKeys.REFRESH_TOKEN, result.refreshToken);
      StorageService.setObject(StorageKeys.CUSTOMER, result.customer);

      set({ isAuthenticated: true, user: result.customer, isLoading: false });

      // ─── تسجيل FCM Token بعد الدخول مباشرة ──────────────
      try {
        const { getFCMToken } =
          require('../services/notifications.service') as typeof import('../services/notifications.service');
        const fcmToken = await getFCMToken();
        if (fcmToken) {
          await api.post('/push-token', { token: fcmToken, platform: 'android' });
        }
      } catch {
        // لا نوقف الـ login بسبب فشل FCM
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل تسجيل الدخول';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', payload);
      const result   = data.data ?? data;

      StorageService.setString(StorageKeys.ACCESS_TOKEN,  result.accessToken);
      StorageService.setString(StorageKeys.REFRESH_TOKEN, result.refreshToken);
      StorageService.setObject(StorageKeys.CUSTOMER, result.customer);

      set({ isAuthenticated: true, user: result.customer, isLoading: false });

      // ─── تسجيل FCM Token بعد التسجيل مباشرة ─────────────
      try {
        const { getFCMToken } =
          require('../services/notifications.service') as typeof import('../services/notifications.service');
        const fcmToken = await getFCMToken();
        if (fcmToken) {
          await api.post('/push-token', { token: fcmToken, platform: 'android' });
        }
      } catch {
        // لا نوقف الـ register بسبب فشل FCM
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل إنشاء الحساب';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // نتجاهل الخطأ ونكمل تسجيل الخروج
    } finally {
      StorageService.clearAuth();
      set({ isAuthenticated: false, user: null, error: null });
    }
  },

  forceLogout: () => {
    StorageService.clearAuth();
    set({ isAuthenticated: false, user: null, error: null });
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: res } = await api.patch('/auth/profile', data);
      const updated: MobileCustomer = res.data ?? res;

      StorageService.setObject(StorageKeys.CUSTOMER, updated);
      set({ user: updated, isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل تحديث الملف الشخصي';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },
}));

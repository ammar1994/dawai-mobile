import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '@api/client';
import { MOBILE_PREFIX } from '@constants/config';
import axios from 'axios';

interface User {
  id:        string;
  firstName: string;
  lastName:  string;
  email:     string;
  phone?:    string;
}

interface AuthState {
  user:        User | null;
  token:       string | null;
  isLoading:   boolean;
  isLoggedIn:  boolean;

  login:    (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string; lastName: string;
    email: string; phone?: string; password: string;
  }) => Promise<void>;
  logout:   () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const persist = async (token: string, refresh: string, user: User) => {
  await SecureStore.setItemAsync('dawai_token',   token);
  await SecureStore.setItemAsync('dawai_refresh', refresh);
  await SecureStore.setItemAsync('dawai_user',    JSON.stringify(user));
};

const clear = async () => {
  await SecureStore.deleteItemAsync('dawai_token');
  await SecureStore.deleteItemAsync('dawai_refresh');
  await SecureStore.deleteItemAsync('dawai_user');
};

export const useAuthStore = create<AuthState>((set) => ({
  user:       null,
  token:      null,
  isLoading:  false,
  isLoggedIn: false,

  loadUser: async () => {
    const token   = await SecureStore.getItemAsync('dawai_token');
    const userStr = await SecureStore.getItemAsync('dawai_user');
    if (token && userStr) {
      set({ token, user: JSON.parse(userStr), isLoggedIn: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await axios.post(`${MOBILE_PREFIX}/auth/login`, { email, password });
      const { customer, tokens } = res.data.data;
      const token = tokens?.accessToken ?? tokens?.token;
      const refresh = tokens?.refreshToken ?? '';
      await persist(token, refresh, customer);
      set({ token, user: customer, isLoggedIn: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axios.post(`${MOBILE_PREFIX}/auth/register`, data);
      const { customer, tokens } = res.data.data;
      const token = tokens?.accessToken ?? tokens?.token;
      const refresh = tokens?.refreshToken ?? '';
      await persist(token, refresh, customer);
      set({ token, user: customer, isLoggedIn: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await clear();
    set({ user: null, token: null, isLoggedIn: false });
  },

  updateUser: (data) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...data };
      SecureStore.setItemAsync('dawai_user', JSON.stringify(updated));
      return { user: updated };
    });
  },
}));

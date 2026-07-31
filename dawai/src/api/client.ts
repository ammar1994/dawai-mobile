import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { MOBILE_PREFIX } from '@constants/config';

export const api = axios.create({
  baseURL: MOBILE_PREFIX,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach token ────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('dawai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      // Try refresh token
      const refresh = await SecureStore.getItemAsync('dawai_refresh');
      if (refresh && !err.config._retry) {
        err.config._retry = true;
        try {
          const { data } = await axios.post(`${MOBILE_PREFIX}/auth/refresh`, { refreshToken: refresh });
          const newToken = data.data.tokens?.accessToken ?? data.data.token;
          await SecureStore.setItemAsync('dawai_token', newToken);
          err.config.headers.Authorization = `Bearer ${newToken}`;
          return axios(err.config);
        } catch {
          await SecureStore.deleteItemAsync('dawai_token');
          await SecureStore.deleteItemAsync('dawai_refresh');
          await SecureStore.deleteItemAsync('dawai_user');
        }
      }
    }
    return Promise.reject(err);
  },
);

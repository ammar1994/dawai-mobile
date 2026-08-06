import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Storage wrapper (sync-compatible interface) ─────────────────────────────
// AsyncStorage is async, so we cache tokens in memory for sync interceptors
let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export const storage = {
  async init() {
    _accessToken = await AsyncStorage.getItem('accessToken');
    _refreshToken = await AsyncStorage.getItem('refreshToken');
  },
  getString(key: string): string | undefined {
    if (key === 'accessToken') return _accessToken ?? undefined;
    if (key === 'refreshToken') return _refreshToken ?? undefined;
    return undefined;
  },
  set(key: string, value: string) {
    if (key === 'accessToken') { _accessToken = value; AsyncStorage.setItem(key, value); }
    else if (key === 'refreshToken') { _refreshToken = value; AsyncStorage.setItem(key, value); }
    else AsyncStorage.setItem(key, value);
  },
  delete(key: string) {
    if (key === 'accessToken') _accessToken = null;
    if (key === 'refreshToken') _refreshToken = null;
    AsyncStorage.removeItem(key);
  },
};

// Init on load
storage.init();

// ─── Config ───────────────────────────────────────────────────────────────────
export const API_BASE_URL = 'https://pharmacy-saas-backend.onrender.com/api';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getString('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = storage.getString('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/mobile/auth/refresh`, { refreshToken });
        const newToken: string = data.data.accessToken;
        storage.set('accessToken', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        storage.delete('accessToken');
        storage.delete('refreshToken');
        storage.delete('customer');
      }
    }

    return Promise.reject(error);
  },
);

export default api;

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { MMKV } from 'react-native-mmkv';

// ─── Storage ──────────────────────────────────────────────────────────────────
export const storage = new MMKV({ id: 'dawai-storage' });

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

// ─── Request Interceptor — attach token ───────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getString('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// ─── Response Interceptor — handle 401 / token refresh ───────────────────────
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = storage.getString('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/customer/auth/refresh`, {
          refreshToken,
        });

        const newToken: string = data.data.accessToken;
        storage.set('accessToken', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        // Refresh failed — clear session
        storage.delete('accessToken');
        storage.delete('refreshToken');
        storage.delete('customer');
        // Navigation handled by auth store
      }
    }

    return Promise.reject(error);
  },
);

export default api;

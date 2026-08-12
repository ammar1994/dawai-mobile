import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { StorageKeys, StorageService } from '../services/storage.service';

// ─── Config ───────────────────────────────────────────────────────────────────
export const BASE_URL   = 'https://pharmacy-saas-backend.onrender.com';
export const MOBILE_URL = `${BASE_URL}/mobile`;

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL : MOBILE_URL,
  timeout : 15000,
  headers : {
    'Content-Type' : 'application/json',
    'Accept'       : 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// يضيف Authorization: Bearer {token} لكل طلب
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = StorageService.getString(StorageKeys.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// عند 401 → يستدعي refresh → يعيد الطلب (مرة واحدة فقط)
let _isRefreshing   = false;
let _refreshQueue   : Array<(token: string) => void> = [];

function processQueue(token: string): void {
  _refreshQueue.forEach(resolve => resolve(token));
  _refreshQueue = [];
}

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (_isRefreshing) {
        // طلبات متزامنة — ننتظر حتى يكتمل الـ refresh
        return new Promise(resolve => {
          _refreshQueue.push((token: string) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      _isRefreshing = true;

      try {
        const refreshToken = StorageService.getString(StorageKeys.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${MOBILE_URL}/auth/refresh`, { refreshToken });
        const newToken: string = data.data?.accessToken ?? data.accessToken;

        StorageService.setString(StorageKeys.ACCESS_TOKEN, newToken);
        processQueue(newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        // Refresh فشل — تسجيل خروج تلقائي
        StorageService.clearAuth();
        _refreshQueue = [];

        // Lazy import لتجنب circular dependency
        try {
          const { useAuthStore } =
            require('../store/auth.store') as typeof import('../store/auth.store');
          useAuthStore.getState().forceLogout();
        } catch {
          // المستخدم سيُطرد عند navigation guard القادم
        }
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Named export for services that import { mobileClient }
export { api as mobileClient };
export default api;

import api, { storage } from './api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthTokens,
  Customer,
  ApiResponse,
} from '../types';

interface AuthResponseData {
  customer: Customer;
  tokens: AuthTokens;
}

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponseData> {
    const { data } = await api.post<ApiResponse<AuthResponseData>>(
      '/mobile/auth/login',
      payload,
    );
    _persistSession(data.data);
    return data.data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponseData> {
    const { data } = await api.post<ApiResponse<AuthResponseData>>(
      '/mobile/auth/register',
      payload,
    );
    _persistSession(data.data);
    return data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/mobile/auth/logout');
    } catch {
      // fail silently — clear local anyway
    } finally {
      _clearSession();
    }
  },

  async getMe(): Promise<Customer> {
    const { data } = await api.get<ApiResponse<Customer>>('/mobile/auth/me');
    return data.data;
  },

  loadSession(): AuthResponseData | null {
    const customerRaw = storage.getString('customer');
    const accessToken  = storage.getString('accessToken');
    const refreshToken = storage.getString('refreshToken');

    if (!customerRaw || !accessToken) return null;

    return {
      customer: JSON.parse(customerRaw) as Customer,
      tokens: { accessToken, refreshToken: refreshToken ?? '' },
    };
  },
};

function _persistSession(session: AuthResponseData) {
  storage.set('accessToken',  session.tokens.accessToken);
  storage.set('refreshToken', session.tokens.refreshToken);
  storage.set('customer',     JSON.stringify(session.customer));
}

function _clearSession() {
  storage.delete('accessToken');
  storage.delete('refreshToken');
  storage.delete('customer');
}

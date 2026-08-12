import { mobileClient } from '../api/client';
import type {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  MobileCustomer,
} from '../types';

export const AuthService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const res = await mobileClient.post<AuthTokens>('/auth/login', payload);
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const res = await mobileClient.post<AuthTokens>('/auth/register', payload);
    return res.data;
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await mobileClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken },
    );
    return res.data;
  },

  async getMe(): Promise<MobileCustomer> {
    const res = await mobileClient.get<MobileCustomer>('/auth/me');
    return res.data;
  },

  async updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<MobileCustomer> {
    const res = await mobileClient.patch<MobileCustomer>('/auth/profile', payload);
    return res.data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    const res = await mobileClient.post<{ success: boolean }>('/auth/forgot-password', { email });
    return res.data;
  },

  async logout(): Promise<void> {
    await mobileClient.post('/auth/logout');
  },

  async registerPushToken(token: string, platform: 'android' | 'ios'): Promise<void> {
    await mobileClient.post('/push-token', { token, platform });
  },
};

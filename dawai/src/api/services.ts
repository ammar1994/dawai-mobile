import { api } from './client';
import axios from 'axios';
import { API_BASE_URL } from '@constants/config';

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════
export const authApi = {
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  me: () => api.get('/auth/me'),

  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    api.patch('/auth/profile', data),

  savePushToken: (token: string, platform: string) =>
    api.post('/push-token', { token, platform }),
};

// ══════════════════════════════════════════════════════════════════════════════
// PHARMACIES
// ══════════════════════════════════════════════════════════════════════════════
export const pharmaciesApi = {
  nearby: (lat: number, lng: number, radiusKm = 5) =>
    api.get('/pharmacies/nearby', { params: { lat, lng, radiusKm } }),
};

// ══════════════════════════════════════════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════════════════════════════════════════
export const ordersApi = {
  create: (data: {
    branchId: string;
    tenantId: string;
    notes?: string;
    deliveryAddress?: string;
    items: { medicineName: string; quantity: number; notes?: string }[];
  }) => api.post('/orders', data),

  list: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/orders', { params }),

  get: (id: string) => api.get(`/orders/${id}`),

  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
};

// ══════════════════════════════════════════════════════════════════════════════
// REMINDERS
// ══════════════════════════════════════════════════════════════════════════════
export const remindersApi = {
  create: (data: {
    medicineName: string;
    dosage?: string;
    times: string[];       // ["08:00", "20:00"]
    daysOfWeek?: number[]; // [1,2,3,4,5] — 0=Sun
    startDate?: string;
    endDate?: string;
    notes?: string;
  }) => api.post('/reminders', data),

  list: () => api.get('/reminders'),

  get: (id: string) => api.get(`/reminders/${id}`),

  update: (id: string, data: Partial<{
    medicineName: string;
    dosage: string;
    times: string[];
    isActive: boolean;
  }>) => api.patch(`/reminders/${id}`, data),

  delete: (id: string) => api.delete(`/reminders/${id}`),
};

// ══════════════════════════════════════════════════════════════════════════════
// PRESCRIPTIONS
// ══════════════════════════════════════════════════════════════════════════════
export const prescriptionsApi = {
  upload: (data: {
    imageUrl: string;
    notes?: string;
    branchId?: string;
    tenantId?: string;
  }) => api.post('/prescriptions', data),

  list: () => api.get('/prescriptions'),

  delete: (id: string) => api.delete(`/prescriptions/${id}`),
};

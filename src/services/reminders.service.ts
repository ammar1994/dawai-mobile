import api from './api';
import type { Reminder, CreateReminderRequest, ApiResponse } from '../types';

export const remindersService = {
  async list(): Promise<Reminder[]> {
    const { data } = await api.get<ApiResponse<Reminder[]>>('/mobile/reminders');
    return data.data;
  },
  async create(payload: CreateReminderRequest): Promise<Reminder> {
    const { data } = await api.post<ApiResponse<Reminder>>('/mobile/reminders', payload);
    return data.data;
  },
  async update(id: string, payload: Partial<CreateReminderRequest & { isActive: boolean }>): Promise<Reminder> {
    const { data } = await api.patch<ApiResponse<Reminder>>(`/mobile/reminders/${id}`, payload);
    return data.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/mobile/reminders/${id}`);
  },
  async registerPushToken(token: string, platform: 'ios' | 'android'): Promise<void> {
    await api.post('/mobile/push-token', { token, platform });
  },
};

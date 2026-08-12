import { mobileClient } from '../api/client';
import type { Reminder, CreateReminderPayload } from '../types';

export const RemindersService = {
  async getAll(): Promise<Reminder[]> {
    const res = await mobileClient.get<Reminder[]>('/reminders');
    return res.data;
  },

  async create(payload: CreateReminderPayload): Promise<Reminder> {
    const res = await mobileClient.post<Reminder>('/reminders', payload);
    return res.data;
  },

  async update(
    id: string,
    payload: Partial<CreateReminderPayload> & { isActive?: boolean },
  ): Promise<Reminder> {
    const res = await mobileClient.patch<Reminder>(`/reminders/${id}`, payload);
    return res.data;
  },

  async delete(id: string): Promise<{ deleted: boolean }> {
    const res = await mobileClient.delete<{ deleted: boolean }>(`/reminders/${id}`);
    return res.data;
  },
};

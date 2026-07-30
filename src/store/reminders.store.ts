import { create } from 'zustand';
import { remindersService } from '../services/reminders.service';
import type { Reminder, CreateReminderRequest } from '../types';

interface RemindersStore {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;

  fetchReminders: () => Promise<void>;
  createReminder: (payload: CreateReminderRequest) => Promise<Reminder>;
  toggleReminder: (id: string, isActive: boolean) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useRemindersStore = create<RemindersStore>((set, get) => ({
  reminders: [],
  isLoading: false,
  error:     null,

  fetchReminders: async () => {
    set({ isLoading: true, error: null });
    try {
      const reminders = await remindersService.list();
      set({ reminders, isLoading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'فشل تحميل التذكيرات', isLoading: false });
    }
  },

  createReminder: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const r = await remindersService.create(payload);
      set(s => ({ reminders: [r, ...s.reminders], isLoading: false }));
      return r;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل إضافة التذكير';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  toggleReminder: async (id, isActive) => {
    try {
      const updated = await remindersService.update(id, { isActive });
      set(s => ({ reminders: s.reminders.map(r => r.id === id ? updated : r) }));
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'فشل تحديث التذكير' });
    }
  },

  deleteReminder: async (id) => {
    try {
      await remindersService.delete(id);
      set(s => ({ reminders: s.reminders.filter(r => r.id !== id) }));
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'فشل حذف التذكير' });
    }
  },

  clearError: () => set({ error: null }),
}));

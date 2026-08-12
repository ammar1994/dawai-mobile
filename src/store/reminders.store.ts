import { create } from 'zustand';
import { Reminder, CreateReminderPayload } from '../types';
import api from '../api/client';

interface RemindersState {
  reminders : Reminder[];
  isLoading : boolean;
  error     : string | null;
}

interface RemindersActions {
  fetchReminders : ()                                                   => Promise<void>;
  createReminder : (payload: CreateReminderPayload)                     => Promise<void>;
  updateReminder : (id: string, data: Partial<CreateReminderPayload & { isActive: boolean }>) => Promise<void>;
  deleteReminder : (id: string)                                         => Promise<void>;
  toggleActive   : (id: string, isActive: boolean)                     => Promise<void>;
  clearError     : ()                                                   => void;
}

export const useRemindersStore = create<RemindersState & RemindersActions>((set, get) => ({
  reminders : [],
  isLoading : false,
  error     : null,

  clearError: () => set({ error: null }),

  fetchReminders: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/reminders');
      const list: Reminder[] = data.data ?? data;
      set({ reminders: list, isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل تحميل التذكيرات';
      set({ isLoading: false, error: msg });
    }
  },

  createReminder: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/reminders', payload);
      const reminder: Reminder = data.data ?? data;
      set({ reminders: [reminder, ...get().reminders], isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل إضافة التذكير';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  updateReminder: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: res } = await api.patch(`/reminders/${id}`, data);
      const updated: Reminder = res.data ?? res;
      set({
        reminders: get().reminders.map(r => r.id === id ? updated : r),
        isLoading: false,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل تعديل التذكير';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  deleteReminder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/reminders/${id}`);
      set({ reminders: get().reminders.filter(r => r.id !== id), isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل حذف التذكير';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  toggleActive: async (id, isActive) => {
    // Optimistic update
    set({
      reminders: get().reminders.map(r => r.id === id ? { ...r, isActive } : r),
    });
    try {
      await api.patch(`/reminders/${id}`, { isActive });
    } catch {
      // Rollback on failure
      set({
        reminders: get().reminders.map(r => r.id === id ? { ...r, isActive: !isActive } : r),
      });
    }
  },
}));

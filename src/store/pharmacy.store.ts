import { create } from 'zustand';
import api from '../services/api';
import type { Pharmacy } from '../types';

interface PharmacyStore {
  pharmacies:      Pharmacy[];
  activePharmacy:  Pharmacy | null;
  isLoading:       boolean;
  error:           string | null;
  lastFetchCoords: { lat: number; lng: number; radius: number } | null;

  fetchNearby: (lat: number, lng: number, radiusKm?: number) => Promise<void>;
  fetchById:   (id: string) => Promise<void>;
  clearError:  () => void;
}

export const usePharmacyStore = create<PharmacyStore>((set, get) => ({
  pharmacies:      [],
  activePharmacy:  null,
  isLoading:       false,
  error:           null,
  lastFetchCoords: null,

  fetchNearby: async (lat, lng, radiusKm = 5) => {
    // تجنب إعادة الجلب إذا كانت الإحداثيات نفسها والمشعاع نفسه
    const last = get().lastFetchCoords;
    if (
      last &&
      Math.abs(last.lat - lat) < 0.001 &&
      Math.abs(last.lng - lng) < 0.001 &&
      last.radius === radiusKm
    ) return;

    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/mobile/pharmacies/nearby', {
        params: { lat, lng, radius: radiusKm * 1000 },
      });
      set({
        pharmacies:      res.data?.data ?? [],
        isLoading:       false,
        lastFetchCoords: { lat, lng, radius: radiusKm },
      });
    } catch (err: any) {
      set({
        error:     err?.response?.data?.message ?? 'فشل تحميل الصيدليات',
        isLoading: false,
      });
    }
  },

  fetchById: async (id) => {
    // تحقق من الـ cache أولاً
    const cached = get().pharmacies.find(p => p.id === id);
    if (cached) {
      set({ activePharmacy: cached });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/mobile/pharmacies/${id}`);
      const pharmacy: Pharmacy = res.data?.data;
      set(s => ({
        activePharmacy: pharmacy,
        pharmacies:     s.pharmacies.some(p => p.id === id)
          ? s.pharmacies
          : [...s.pharmacies, pharmacy],
        isLoading: false,
      }));
    } catch (err: any) {
      set({
        error:     err?.response?.data?.message ?? 'فشل تحميل الصيدلية',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

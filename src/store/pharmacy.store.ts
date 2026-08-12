import { create } from 'zustand';
import { Pharmacy } from '../types';
import api from '../api/client';

interface PharmacyState {
  pharmacies    : Pharmacy[];
  selected      : Pharmacy | null;
  isLoading     : boolean;
  error         : string | null;
}

interface PharmacyActions {
  fetchNearby   : (lat: number, lng: number, radius?: number) => Promise<void>;
  fetchById     : (id: string)                                => Promise<void>;
  setSelected   : (pharmacy: Pharmacy | null)                 => void;
  clearError    : ()                                          => void;
}

export const usePharmacyStore = create<PharmacyState & PharmacyActions>((set) => ({
  pharmacies : [],
  selected   : null,
  isLoading  : false,
  error      : null,

  clearError: () => set({ error: null }),

  setSelected: (pharmacy) => set({ selected: pharmacy }),

  fetchNearby: async (lat, lng, radius = 5) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/pharmacies/nearby', {
        params: { lat, lng, radius },
      });
      const list: Pharmacy[] = data.data ?? data;
      set({ pharmacies: list, isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل تحميل الصيدليات';
      set({ isLoading: false, error: msg });
    }
  },

  fetchById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/pharmacies/${id}`);
      const pharmacy: Pharmacy = data.data ?? data;
      set({ selected: pharmacy, isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل تحميل الصيدلية';
      set({ isLoading: false, error: msg });
    }
  },
}));

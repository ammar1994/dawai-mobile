import { mobileClient } from '../api/client';
import type { Pharmacy } from '../types';

export const PharmacyService = {
  async getNearby(lat: number, lng: number, radius = 5): Promise<Pharmacy[]> {
    const res = await mobileClient.get<Pharmacy[]>('/pharmacies/nearby', {
      params: { lat, lng, radius },
    });
    return res.data;
  },

  async getById(id: string): Promise<Pharmacy> {
    const res = await mobileClient.get<Pharmacy>(`/pharmacies/${id}`);
    return res.data;
  },
};

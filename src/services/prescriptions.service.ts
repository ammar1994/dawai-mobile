import api from './api';
import type { ApiResponse } from '../types';

export interface PrescriptionImage {
  id:         string;
  customerId: string;
  imageUrl:   string;
  notes?:     string;
  uploadedAt: string;
}

export const prescriptionsService = {
  async list(): Promise<PrescriptionImage[]> {
    const { data } = await api.get<ApiResponse<PrescriptionImage[]>>('/mobile/prescriptions');
    return data.data;
  },

  async upload(imageUrl: string, notes?: string): Promise<PrescriptionImage> {
    const { data } = await api.post<ApiResponse<PrescriptionImage>>('/mobile/prescriptions', {
      imageUrl,
      notes,
    });
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/mobile/prescriptions/${id}`);
  },
};

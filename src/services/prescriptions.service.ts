import { mobileClient } from '../api/client';
import type { Prescription } from '../types';

export const PrescriptionsService = {
  async upload(fileUri: string, mimeType = 'image/jpeg'): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: mimeType,
      name: `prescription_${Date.now()}.jpg`,
    } as any);

    const res = await mobileClient.post<{ url: string }>(
      '/prescriptions/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data;
  },

  async getAll(): Promise<Prescription[]> {
    const res = await mobileClient.get<Prescription[]>('/prescriptions');
    return res.data;
  },

  async delete(id: string): Promise<{ deleted: boolean }> {
    const res = await mobileClient.delete<{ deleted: boolean }>(`/prescriptions/${id}`);
    return res.data;
  },
};

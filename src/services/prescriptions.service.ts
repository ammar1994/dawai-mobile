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

  /**
   * رفع وصفة طبية.
   * - إذا كان imageUriOrUrl يبدأ بـ file:// أو content:// → multipart/form-data (صورة حقيقية من الجهاز)
   * - إذا كان http/https URL عادي → JSON body كما كان
   */
  async upload(imageUriOrUrl: string, notes?: string): Promise<PrescriptionImage> {
    const isLocalFile =
      imageUriOrUrl.startsWith('file://') ||
      imageUriOrUrl.startsWith('content://') ||
      imageUriOrUrl.startsWith('/');

    if (isLocalFile) {
      // multipart/form-data لرفع الصورة من الجهاز
      const formData = new FormData();
      const filename = imageUriOrUrl.split('/').pop() ?? 'prescription.jpg';
      const ext      = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      formData.append('image', {
        uri:  imageUriOrUrl,
        name: filename,
        type: mimeType,
      } as any);

      if (notes) formData.append('notes', notes);

      const { data } = await api.post<ApiResponse<PrescriptionImage>>(
        '/mobile/prescriptions',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return data.data;
    }

    // URL عادي → JSON
    const { data } = await api.post<ApiResponse<PrescriptionImage>>(
      '/mobile/prescriptions',
      { imageUrl: imageUriOrUrl, notes },
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/mobile/prescriptions/${id}`);
  },
};

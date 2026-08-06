import api from './api';
import type { Order, ApiResponse } from '../types';

export interface CreateOrderPayload {
  pharmacyId: string;
  notes?: string;
  deliveryAddress?: string;
  prescriptionImageUrl?: string;
  items: {
    medicineName: string;
    quantity: number;
    requiresPrescription: boolean;
  }[];
}

export const ordersService = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await api.post<ApiResponse<Order>>('/mobile/orders', {
      branchId:             payload.pharmacyId,
      notes:                payload.notes,
      deliveryAddress:      payload.deliveryAddress,
      prescriptionImageUrl: payload.prescriptionImageUrl,
      items:                payload.items,
    });
    return data.data;
  },

  async getOrders(): Promise<Order[]> {
    const { data } = await api.get<ApiResponse<Order[]>>('/mobile/orders');
    return data.data;
  },

  async getOrder(orderId: string): Promise<Order> {
    const { data } = await api.get<ApiResponse<Order>>(`/mobile/orders/${orderId}`);
    return data.data;
  },

  async cancelOrder(orderId: string): Promise<Order> {
    const { data } = await api.patch<ApiResponse<Order>>(`/mobile/orders/${orderId}/cancel`);
    return data.data;
  },
};

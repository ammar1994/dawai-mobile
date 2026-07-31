import api from './api';
import type { Order, CreateOrderRequest, ApiResponse } from '../types';

export const ordersService = {
  async createOrder(payload: CreateOrderRequest): Promise<Order> {
    const { data } = await api.post<ApiResponse<Order>>('/mobile/orders', {
      branchId:             payload.pharmacyId,
      notes:                payload.notes,
      deliveryAddress:      payload.deliveryAddress,
      prescriptionImageUrl: payload.prescriptionImageUrl,
      items: payload.items.map(i => ({
        medicineName:         i.medicineName ?? '',
        quantity:             i.quantity,
        requiresPrescription: i.requiresPrescription ?? false,
      })),
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

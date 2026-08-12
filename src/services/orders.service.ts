import { mobileClient } from '../api/client';
import type { Order, CreateOrderPayload } from '../types';

export const OrdersService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    const res = await mobileClient.post<Order>('/orders', payload);
    return res.data;
  },

  async getAll(): Promise<Order[]> {
    const res = await mobileClient.get<Order[]>('/orders');
    return res.data;
  },

  async getById(id: string): Promise<Order> {
    const res = await mobileClient.get<Order>(`/orders/${id}`);
    return res.data;
  },

  async cancel(id: string): Promise<Order> {
    const res = await mobileClient.patch<Order>(`/orders/${id}/cancel`);
    return res.data;
  },
};

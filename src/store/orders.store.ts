import { create } from 'zustand';
import { ordersService, CreateOrderPayload } from '../services/orders.service';
import type { Order } from '../types';

interface OrdersStore {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  createOrder: (payload: CreateOrderPayload) => Promise<Order>;
  cancelOrder: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  orders:      [],
  activeOrder: null,
  isLoading:   false,
  error:       null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await ordersService.getOrders();
      set({ orders, isLoading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'فشل تحميل الطلبات', isLoading: false });
    }
  },

  fetchOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const order = await ordersService.getOrder(id);
      set({ activeOrder: order, isLoading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'فشل تحميل الطلب', isLoading: false });
    }
  },

  createOrder: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const order = await ordersService.createOrder(payload);
      set(s => ({ orders: [order, ...s.orders], isLoading: false }));
      return order;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل إرسال الطلب';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  cancelOrder: async (id) => {
    try {
      const updated = await ordersService.cancelOrder(id);
      set(s => ({
        orders:      s.orders.map(o => (o.id === id ? updated : o)),
        activeOrder: s.activeOrder?.id === id ? updated : s.activeOrder,
      }));
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'فشل إلغاء الطلب' });
    }
  },

  clearError: () => set({ error: null }),
}));

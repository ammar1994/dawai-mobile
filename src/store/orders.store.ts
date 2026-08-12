import { create } from 'zustand';
import { Order, CreateOrderPayload, CartItem } from '../types';
import api from '../api/client';

interface OrdersState {
  orders                 : Order[];
  selected               : Order | null;
  cart                   : CartItem[];
  isLoading              : boolean;
  error                  : string | null;
  pendingPrescriptionUrl : string | null;  // ← تُضبط من PrescriptionsScreen ثم تُقرأ في NewOrderScreen
}

interface OrdersActions {
  fetchOrders   : ()                           => Promise<void>;
  fetchById     : (id: string)                 => Promise<void>;
  createOrder   : (payload: CreateOrderPayload) => Promise<Order>;
  cancelOrder   : (id: string)                 => Promise<void>;
  addToCart     : (item: CartItem)             => void;
  removeFromCart: (medicineName: string)       => void;
  updateCartItem: (medicineName: string, quantity: number) => void;
  clearCart     : ()                           => void;
  clearError    : ()                           => void;
}

export const useOrdersStore = create<OrdersState & OrdersActions>((set, get) => ({
  orders                 : [],
  selected               : null,
  cart                   : [],
  isLoading              : false,
  error                  : null,
  pendingPrescriptionUrl : null,

  clearError: () => set({ error: null }),

  clearCart: () => set({ cart: [] }),

  addToCart: (item) => {
    const existing = get().cart.find(c => c.medicineName === item.medicineName);
    if (existing) {
      set({
        cart: get().cart.map(c =>
          c.medicineName === item.medicineName
            ? { ...c, quantity: c.quantity + item.quantity }
            : c,
        ),
      });
    } else {
      set({ cart: [...get().cart, item] });
    }
  },

  removeFromCart: (medicineName) => {
    set({ cart: get().cart.filter(c => c.medicineName !== medicineName) });
  },

  updateCartItem: (medicineName, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(medicineName);
      return;
    }
    set({
      cart: get().cart.map(c =>
        c.medicineName === medicineName ? { ...c, quantity } : c,
      ),
    });
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/orders');
      const list: Order[] = data.data ?? data;
      set({ orders: list, isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل تحميل الطلبات';
      set({ isLoading: false, error: msg });
    }
  },

  fetchById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/orders/${id}`);
      const order: Order = data.data ?? data;
      set({ selected: order, isLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل تحميل الطلب';
      set({ isLoading: false, error: msg });
    }
  },

  createOrder: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/orders', payload);
      const order: Order = data.data ?? data;
      set({ orders: [order, ...get().orders], selected: order, isLoading: false });
      return order;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل إرسال الطلب';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  cancelOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.patch(`/orders/${id}/cancel`);
      const updated: Order = data.data ?? data;
      set({
        orders: get().orders.map(o => o.id === id ? updated : o),
        selected: get().selected?.id === id ? updated : get().selected,
        isLoading: false,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'فشل إلغاء الطلب';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },
}));

import { OrderStatus } from '../types';

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('ar-SA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatDistance(km?: number): string {
  if (km == null) return '';
  if (km < 1) return `${Math.round(km * 1000)} م`;
  return `${km.toFixed(1)} كم`;
}

export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} ر.س`;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING          : 'في الانتظار',
  RECEIVED         : 'تم الاستلام',
  PREPARING        : 'قيد التحضير',
  READY            : 'جاهز',
  OUT_FOR_DELIVERY : 'في الطريق',
  DELIVERED        : 'تم التسليم',
  CANCELLED        : 'ملغي',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING          : '#F59E0B',
  RECEIVED         : '#3B82F6',
  PREPARING        : '#8B5CF6',
  READY            : '#10B981',
  OUT_FOR_DELIVERY : '#06B6D4',
  DELIVERED        : '#10B981',
  CANCELLED        : '#EF4444',
};

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

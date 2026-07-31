export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://pharmacy-saas-backend.onrender.com/api/v1';

// All mobile endpoints live under /mobile
export const MOBILE_PREFIX = `${API_BASE_URL}/mobile`;

export const COLORS = {
  // Brand — DAWAI Deep Rose + Magenta
  primary:      '#E91E8C',
  primaryDark:  '#C2185B',
  primaryLight: '#FF4081',
  // Backgrounds — dark theme
  bg:           '#0D0114',
  bgCard:       '#1A0520',
  bgInput:      '#220828',
  // Text
  textPrimary:  '#FFFFFF',
  textSecond:   '#FF80AB',
  textMuted:    'rgba(255,255,255,0.45)',
  // Status
  success:      '#4CAF50',
  warning:      '#FF9800',
  error:        '#F44336',
  info:         '#2196F3',
  // Borders
  border:       'rgba(233,30,140,0.2)',
  borderLight:  'rgba(255,255,255,0.08)',
} as const;

export const FONTS = {
  regular: 'System',
  medium:  'System',
  bold:    'System',
  size: {
    xs:   11,
    sm:   13,
    md:   15,
    lg:   17,
    xl:   20,
    xxl:  24,
    xxxl: 30,
  },
} as const;

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING:          'في الانتظار',
  RECEIVED:         'تم الاستلام',
  PREPARING:        'جاري التحضير',
  READY:            'جاهز',
  OUT_FOR_DELIVERY: 'في الطريق',
  DELIVERED:        'تم التسليم',
  CANCELLED:        'ملغي',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING:          '#FF9800',
  RECEIVED:         '#2196F3',
  PREPARING:        '#9C27B0',
  READY:            '#4CAF50',
  OUT_FOR_DELIVERY: '#00BCD4',
  DELIVERED:        '#4CAF50',
  CANCELLED:        '#F44336',
};

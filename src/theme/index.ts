export const Colors = {
  // Brand — DAWAI palette
  primary: '#E91E8C',       // Deep Rose / Magenta
  primaryDark: '#C2156F',
  primaryLight: '#FF4DB8',
  primaryGlow: 'rgba(233, 30, 140, 0.15)',

  // Secondary
  secondary: '#1A1A2E',     // Deep Dark (matches icon background)
  secondaryLight: '#2D2D4E',

  // Accent
  accent: '#FF6FBF',        // Light pink

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#F8F4F9',    // Soft lavender-white
  surface: '#FFFFFF',
  surfaceAlt: '#FFF0F8',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#666688',
  textHint: '#AAAACC',
  textOnPrimary: '#FFFFFF',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Borders
  border: '#EDE0F0',
  borderLight: '#F5EEF8',

  // Overlay
  overlay: 'rgba(26, 26, 46, 0.6)',
} as const;

export const Typography = {
  // Font families (to be linked)
  fontRegular: 'System',
  fontMedium: 'System',
  fontBold: 'System',

  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 38,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

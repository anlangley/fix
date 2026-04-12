/**
 * Premium Hotel Booking App - Design System
 * Inspired by Booking.com, Agoda, Airbnb
 */

import { Platform } from 'react-native';

// ═══════════════════════════════════════
// COLOR PALETTE
// ═══════════════════════════════════════
export const AppColors = {
  // Primary - Deep Navy
  primary: '#1B1F3B',
  primaryLight: '#2D325A',
  primaryDark: '#0F1229',

  // Accent - Warm Gold
  accent: '#D4A853',
  accentLight: '#E8C97D',
  accentDark: '#B8892F',

  // Secondary - Teal
  secondary: '#0EA5E9',
  secondaryLight: '#38BDF8',
  secondaryDark: '#0284C7',

  // Backgrounds
  background: '#F8F9FD',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  // Text
  textPrimary: '#1A1D2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textWhite: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Borders & Dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#F0F0F0',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Stars
  star: '#FBBF24',
  starEmpty: '#D1D5DB',
};

// ═══════════════════════════════════════
// GRADIENTS
// ═══════════════════════════════════════
export const Gradients = {
  primary: ['#1B1F3B', '#2D325A'],
  accent: ['#D4A853', '#E8C97D'],
  hero: ['rgba(27, 31, 59, 0.8)', 'rgba(27, 31, 59, 0.4)', 'transparent'],
  heroReverse: ['transparent', 'rgba(27, 31, 59, 0.4)', 'rgba(27, 31, 59, 0.9)'],
  card: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)'],
  button: ['#D4A853', '#B8892F'],
  buttonBlue: ['#0EA5E9', '#0284C7'],
  warm: ['#FF6B35', '#D4A853'],
  sunset: ['#F97316', '#EC4899'],
  dark: ['#1B1F3B', '#0F1229'],
};

// ═══════════════════════════════════════
// SPACING
// ═══════════════════════════════════════
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

// ═══════════════════════════════════════
// BORDER RADIUS
// ═══════════════════════════════════════
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};

// ═══════════════════════════════════════
// SHADOWS
// ═══════════════════════════════════════
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ═══════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════
export const Typography = {
  h1: { fontSize: 28, fontWeight: 'bold' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: 'bold' as const, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '700' as const },
  h4: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.5 },
  price: { fontSize: 22, fontWeight: 'bold' as const },
  priceSmall: { fontSize: 16, fontWeight: '700' as const },
};

// ═══════════════════════════════════════
// LEGACY (keep backward compat)
// ═══════════════════════════════════════
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

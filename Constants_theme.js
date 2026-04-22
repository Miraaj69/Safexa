// ─── STRICT COLOR SYSTEM ─────────────────────────────────────────────────────
// Primary  : #4F7CFF  — blue accent ONLY
// Success  : #22C55E  — green (done)
// Warning  : #F59E0B  — amber (pending)
// Danger   : #EF4444  — red (overdue)
// NO rainbow borders. NO random gradients. Glow only on FAB / active tab.

export const THEMES = {
  dark: {
    bg:           '#0B0F1A',
    bgDeep:       '#070A12',
    bgCard:       'rgba(255,255,255,0.04)',
    bgCardHover:  'rgba(255,255,255,0.07)',
    bgSection:    'rgba(255,255,255,0.04)',
    border:       'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.14)',
    text:         '#F0F4FF',
    textSub:      'rgba(240,244,255,0.60)',
    textMuted:    'rgba(240,244,255,0.28)',
    tabBar:       '#0F1525',
    sheet:        '#131928',
    overlay:      'rgba(0,0,0,0.70)',
    isDark:       true,
  },
  light: {
    bg:           '#F8FAFC',
    bgDeep:       '#EEF2F8',
    bgCard:       '#FFFFFF',
    bgCardHover:  '#F1F5FB',
    bgSection:    '#FFFFFF',
    border:       '#E2E8F0',
    borderStrong: '#CBD5E1',
    text:         '#0F172A',
    textSub:      'rgba(15,23,42,0.60)',
    textMuted:    'rgba(15,23,42,0.35)',
    tabBar:       '#FFFFFF',
    sheet:        '#FFFFFF',
    overlay:      'rgba(0,0,0,0.50)',
    isDark:       false,
  },
  amoled: {
    bg:           '#000000',
    bgDeep:       '#000000',
    bgCard:       '#0A0A0A',
    bgCardHover:  '#111111',
    bgSection:    '#0A0A0A',
    border:       'rgba(255,255,255,0.06)',
    borderStrong: 'rgba(255,255,255,0.12)',
    text:         '#F0F4FF',
    textSub:      'rgba(240,244,255,0.60)',
    textMuted:    'rgba(240,244,255,0.28)',
    tabBar:       '#000000',
    sheet:        '#0D0D0D',
    overlay:      'rgba(0,0,0,0.85)',
    isDark:       true,
  },
};

export const SEMANTIC = {
  primary:     '#4F7CFF',
  primaryDim:  'rgba(79,124,255,0.15)',
  primaryGlow: 'rgba(79,124,255,0.35)',
  success:     '#22C55E',
  successDim:  'rgba(34,197,94,0.15)',
  warning:     '#F59E0B',
  warningDim:  'rgba(245,158,11,0.15)',
  danger:      '#EF4444',
  dangerDim:   'rgba(239,68,68,0.15)',
};

// Default (dark) — backward compat
export const COLORS = {
  ...THEMES.dark,
  ...SEMANTIC,
  card:      THEMES.dark.bgCard,
  cardHover: THEMES.dark.bgCardHover,
};

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
};

export const RADIUS = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 999,
};

export const FONT = {
  light:     '300',
  regular:   '400',
  medium:    '500',
  semibold:  '600',
  bold:      '700',
  extrabold: '800',
};

export const SHADOW = {
  card: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius:  8,
    elevation:     4,
  },
  glow: {
    shadowColor:   '#4F7CFF',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.40,
    shadowRadius:  16,
    elevation:     12,
  },
};

import { CheckCategory } from './types';

// ==========================================
// 1. JODOCO OFFICIAL BRAND DESIGN SYSTEM
// ==========================================
export const JODOCO_BRAND_RULES = {
  colors: {
    primary: '#1A2B48', // Deep Navy / Slate
    accent: '#FF8C73', // Coral
    secondaryMint: '#8FE3C0', // Mint Green
    secondaryLavender: '#B8A7EA', // Soft Lavender
    backgroundCream: '#FAF7F2', // Warm Cream
    backgroundWhite: '#FFFFFF',
    textDark: '#1A2B48',
    textLight: '#FFFFFF',
    mutedSlate: '#64748B',
    borderLight: '#EAE6DF',
  },
  approvedPalette: [
    '#1A2B48',
    '#FF8C73',
    '#8FE3C0',
    '#B8A7EA',
    '#FAF7F2',
    '#FFFFFF',
    // Canonical Logo Artwork Colors
    '#FFC2B4', // Segment J / Antennae
    '#FED3BA', // Segment O1
    '#D6CDF7', // Segment D
    '#C8B8F3', // Segment O2
    '#A1E9D5', // Segment C
    '#C0EDE5', // Segment O3
    '#111827', // Official Letter Black
    '#717697', // Official Tagline Slate
    '#0F172A',
    '#334155',
    '#475569',
    '#64748B',
    '#94A3B8',
    '#CBD5E1',
    '#E2E8F0',
    '#F1F5F9',
    '#F8FAFC',
    '#FAF8F5',
    '#F4EFE6',
    '#EAE6DF',
    '#E0D9CB',
    '#D1D5DB',
  ],
  fonts: {
    heading: 'Plus Jakarta Sans',
    body: 'Inter',
    display: 'Plus Jakarta Sans',
  },
  voiceAndTone: [
    'direct',
    'punchy',
    'conversational',
    'action-oriented',
    'no generic fluff',
  ],
};

// ==========================================
// 2. CATEGORY WEIGHTS (Deterministic 0-100)
// ==========================================
export const QUALITY_CATEGORY_WEIGHTS: Record<CheckCategory, { weight: number; name: string }> = {
  editorial: { weight: 25, name: 'Editorial Quality' },
  brand: { weight: 20, name: 'Brand Consistency' },
  visual: { weight: 15, name: 'Visual Hierarchy' },
  accessibility: { weight: 15, name: 'Accessibility & Readability' },
  assets: { weight: 15, name: 'Asset Integrity' },
  technical: { weight: 10, name: 'Technical Compliance' },
  export: { weight: 0, name: 'Export Readiness' },
};

// ==========================================
// 3. EDITORIAL & TECHNICAL CONSTRAINTS
// ==========================================
export const QUALITY_THRESHOLDS = {
  reel: {
    minDuration: 12, // seconds
    maxDuration: 60, // seconds
    recommendedDuration: 25,
    minScenes: 3,
    maxScenes: 9,
    minSceneDuration: 1.5,
    maxSceneDuration: 10.0,
    maxHookChars: 85,
    maxHeadlineChars: 65,
    maxVoiceoverWordsPerSecond: 3.8, // ~230 wpm max
    expectedAspectRatio: '9:16' as const,
    expectedWidth: 1080,
    expectedHeight: 1920,
    targetFps: [30, 60],
  },
  carousel: {
    minSlides: 3,
    maxSlides: 10,
    recommendedSlides: 6,
    maxHeadlineChars: 75,
    maxSubHeadlineChars: 110,
    maxBodyChars: 280,
    maxBulletsCount: 5,
    maxBulletChars: 90,
    expectedAspectRatio: '4:5' as const,
    expectedWidth: 1080,
    expectedHeight: 1350,
  },
  accessibility: {
    minNormalContrastRatio: 4.5, // WCAG AA
    minLargeContrastRatio: 3.0, // WCAG AA Large text (18pt+ / 24px+)
    maxTextDensityCharsPerSlide: 450,
  },
};

// ==========================================
// 4. WCAG CONTRAST UTILITIES
// ==========================================
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== 'string') return null;
  let cleanHex = hex.trim().replace(/^#/, '');

  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (cleanHex.length !== 6) return null;

  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return 4.5; // Fallback default safe

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (brighter + 0.05) / (darker + 0.05);
}

export function isHexApprovedBrandColor(hex: string): boolean {
  if (!hex) return false;
  const upper = hex.trim().toUpperCase();
  return JODOCO_BRAND_RULES.approvedPalette.some(
    (approved) => approved.toUpperCase() === upper
  );
}

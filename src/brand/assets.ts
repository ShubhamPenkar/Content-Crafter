/**
 * CANONICAL JODOCO BRAND ASSETS - SINGLE SOURCE OF TRUTH
 * 
 * Official JodoCo brand configuration derived directly from the canonical brand artwork:
 * - 6-segment pastel caterpillar (J-o-d-o-c-o)
 * - Circle 1 ('J'): Peach / Coral Pink (#FFC2B4) with dual curved antennae stalks & round bulb tips
 * - Circle 2 ('o'): Soft Apricot / Peach (#FED3BA)
 * - Circle 3 ('d'): Pastel Lavender (#D6CDF7)
 * - Circle 4 ('o'): Pastel Lilac (#C8B8F3)
 * - Circle 5 ('c'): Aqua Mint (#A1E9D5)
 * - Circle 6 ('o'): Pale Mint / Cyan (#C0EDE5)
 * - Centered linear pastel gradient underline pill capsule
 * - Tracked uppercase tagline: "CONNECT · CREATE · GROW" (#717697)
 * 
 * ALL production surfaces (App Header, ReelPlayer, CarouselViewer, Brand Guide, Exporters)
 * consume this canonical asset definition.
 */

/** Canonical transparent PNG asset */
export const JODOCO_LOGO = '/brand/jodoco_logo_canonical.png';

/** Canonical scalable vector SVG asset */
export const JODOCO_LOGO_SVG = '/brand/jodoco_logo_canonical.svg';

/** Brand configuration object */
export const JODOCO_CANONICAL_BRAND = {
  name: 'JodoCo',
  tagline: 'CONNECT · CREATE · GROW',
  slogan: 'The Creator Marketing Bridge',
  assets: {
    logoPng: '/brand/jodoco_logo_canonical.png',
    logoSvg: '/brand/jodoco_logo_canonical.svg',
    markPng: '/brand/jodoco_logo_canonical.png',
    markSvg: '/brand/jodoco_logo_canonical.svg',
  },
  palette: {
    // Exact segment colors from the canonical artwork:
    segmentJ: '#FFC2B4', // Circle 1: Peach / Coral Pink with Antennae
    segmentO1: '#FED3BA', // Circle 2: Soft Apricot / Peach
    segmentD: '#D6CDF7', // Circle 3: Pastel Lavender
    segmentO2: '#C8B8F3', // Circle 4: Pastel Lilac
    segmentC: '#A1E9D5', // Circle 5: Aqua Mint
    segmentO3: '#C0EDE5', // Circle 6: Pale Mint / Cyan
    antennae: '#FFC2B4', // Antenna stalks and bulbs
    letterBlack: '#111827', // Bold sans-serif letterforms
    taglineSlate: '#717697', // Tagline text
    // Canonical underline gradient stops:
    gradientPillStops: ['#FF9B85', '#FFAE9C', '#CBBBF5', '#9EE0DD', '#6EE2CB'],
    // Corporate workspace anchors:
    primaryNavy: '#1A2B48',
    coralAccent: '#FF8C73',
    creamBase: '#FAF7F2',
  },
} as const;

export type JodoCoBrandAsset = typeof JODOCO_CANONICAL_BRAND;

import { CarouselDimensions, CarouselBrandConfig } from './types';
import { BRANDING_SPEC } from '../data/defaultReelSpec';

export const CAROUSEL_SPEC: {
  dimensions: CarouselDimensions;
  branding: CarouselBrandConfig;
  colors: {
    bgCanvas: string;
    bgCard: string;
    textPrimary: string;
    textMuted: string;
    coral: string;
    lavender: string;
    mint: string;
    border: string;
    tagBg: string;
  };
} = {
  dimensions: {
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
  },
  branding: {
    ...BRANDING_SPEC,
    handle: '@jodoco.agency',
  },
  colors: {
    bgCanvas: '#FAF7F2',
    bgCard: '#FFFFFF',
    textPrimary: '#1A2B48',
    textMuted: '#64748B',
    coral: '#FF8C73',
    lavender: '#B8A7EA',
    mint: '#8FE3C0',
    border: '#EAE6DF',
    tagBg: 'rgba(255, 140, 115, 0.12)',
  },
};

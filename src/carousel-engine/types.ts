import { ReelBranding } from '../types';

export type CarouselSlideTemplate =
  | 'hook'
  | 'problem_tension'
  | 'insight'
  | 'example_evidence'
  | 'framework_takeaway'
  | 'outcome_shift'
  | 'cta';

export type CarouselVisualDecision =
  | 'ai_image'
  | 'ai_video'
  | 'static_graphic'
  | 'diagram'
  | 'ui_mockup'
  | 'text_only'
  | 'none';

export type CarouselVisualPriority = 'high' | 'medium' | 'low';

export interface CarouselSlide {
  id: string;
  slideNumber: number;
  template: CarouselSlideTemplate;
  categoryBadge?: string;
  headline: string;
  subHeadline?: string;
  body?: string;
  supportingBullets?: string[];
  takeaway?: string;
  ctaText?: string;
  ctaSubtext?: string;
  ctaUrl?: string;
  visualHighlight?: {
    icon?: string;
    metricNumber?: string;
    metricLabel?: string;
    badgeText?: string;
    accentColor?: string;
    secondaryColor?: string;
  };
  footerNote?: string;

  // Phase 11 Visual Intelligence
  visualDecision?: CarouselVisualDecision;
  visualPriority?: CarouselVisualPriority;
  visualReason?: string;
  visualPrompt?: string;
  visualContinuity?: string;
  visualAssetId?: string;
  visualUrl?: string;
  visualAssetType?: 'image' | 'video' | 'logo' | 'other';
  visualVersion?: number;
}

export interface CarouselBrandConfig extends ReelBranding {
  handle?: string;
}

export interface CarouselDimensions {
  width: number;
  height: number;
  aspectRatio: '4:5' | '1:1';
}

export interface CarouselProject {
  id: string;
  title: string;
  topic: string;
  hookAngle: string;
  dimensions: CarouselDimensions;
  slides: CarouselSlide[];
  branding: CarouselBrandConfig;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

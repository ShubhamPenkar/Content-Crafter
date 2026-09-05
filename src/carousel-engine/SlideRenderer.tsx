import React from 'react';
import { CarouselSlide, CarouselBrandConfig } from './types';
import { TemplateHook } from './templates/TemplateHook';
import { TemplateProblemTension } from './templates/TemplateProblemTension';
import { TemplateInsight } from './templates/TemplateInsight';
import { TemplateExampleEvidence } from './templates/TemplateExampleEvidence';
import { TemplateFrameworkTakeaway } from './templates/TemplateFrameworkTakeaway';
import { TemplateOutcomeShift } from './templates/TemplateOutcomeShift';
import { TemplateCTA } from './templates/TemplateCTA';

interface SlideRendererProps {
  slide: CarouselSlide;
  branding: CarouselBrandConfig;
  totalSlides: number;
}

/**
 * Deterministic Carousel Slide Renderer
 * Selects the exact visual template component based on slide.template
 */
export function SlideRenderer({ slide, branding, totalSlides }: SlideRendererProps) {
  switch (slide.template) {
    case 'hook':
      return <TemplateHook slide={slide} branding={branding} totalSlides={totalSlides} />;
    case 'problem_tension':
      return <TemplateProblemTension slide={slide} branding={branding} totalSlides={totalSlides} />;
    case 'insight':
      return <TemplateInsight slide={slide} branding={branding} totalSlides={totalSlides} />;
    case 'example_evidence':
      return <TemplateExampleEvidence slide={slide} branding={branding} totalSlides={totalSlides} />;
    case 'framework_takeaway':
      return <TemplateFrameworkTakeaway slide={slide} branding={branding} totalSlides={totalSlides} />;
    case 'outcome_shift':
      return <TemplateOutcomeShift slide={slide} branding={branding} totalSlides={totalSlides} />;
    case 'cta':
      return <TemplateCTA slide={slide} branding={branding} totalSlides={totalSlides} />;
    default:
      return <TemplateInsight slide={slide} branding={branding} totalSlides={totalSlides} />;
  }
}

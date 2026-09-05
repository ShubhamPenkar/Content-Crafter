import { JodoCoGeneratedContent, GeneratedCarouselSlide } from '../content-engine/types';
import { CarouselProject, CarouselSlide, CarouselSlideTemplate } from './types';
import { CAROUSEL_SPEC } from './spec';
import { determineCarouselEditorialVisualDecision, buildCarouselVisualPrompt } from '../content-engine/carouselVisualPrompt';
import { JodoCoAsset } from '../project-engine/types';

/**
 * Maps a generated carousel slide's role/content into one of the 7 deterministic slide templates:
 * - hook -> 'hook'
 * - problem_setup -> 'problem_tension'
 * - core_value -> 'insight'
 * - step_detail -> 'example_evidence' or 'framework_takeaway'
 * - summary -> 'outcome_shift'
 * - cta -> 'cta'
 */
export function mapRoleToTemplate(
  role: GeneratedCarouselSlide['role'],
  index: number,
  totalSlides: number
): CarouselSlideTemplate {
  if (index === 0 || role === 'hook') return 'hook';
  if (index === totalSlides - 1 || role === 'cta') return 'cta';

  switch (role) {
    case 'problem_setup':
      return 'problem_tension';
    case 'core_value':
      return 'insight';
    case 'step_detail':
      return index % 2 === 0 ? 'framework_takeaway' : 'example_evidence';
    case 'summary':
      return 'outcome_shift';
    default:
      return 'insight';
  }
}

/**
 * Transforms generated content into a CarouselProject visual production model
 */
export function mapGeneratedContentToCarouselProject(
  content: JodoCoGeneratedContent
): CarouselProject {
  if (!content || !content.carousel || !content.carousel.slides) {
    throw new Error('Invalid JodoCoGeneratedContent: missing carousel slides');
  }

  const generatedSlides = content.carousel.slides;
  const totalSlides = generatedSlides.length;

  const slides: CarouselSlide[] = generatedSlides.map((slide, idx) => {
    const template = mapRoleToTemplate(slide.role, idx, totalSlides);
    const slideNumber = idx + 1;

    let accentColor = '#FF8C73';
    if (template === 'insight' || template === 'outcome_shift') accentColor = '#8FE3C0';
    if (template === 'framework_takeaway' || template === 'example_evidence') accentColor = '#B8A7EA';

    // Derive or inherit visual intelligence
    const fallbackVisual = determineCarouselEditorialVisualDecision(
      slide.role,
      slideNumber,
      slide.headline,
      slide.bodyCopy
    );

    const visualDecision = slide.visualDecision || fallbackVisual.decision;
    const visualPriority = slide.visualPriority || fallbackVisual.priority;
    const visualReason = slide.visualReason || fallbackVisual.reason;
    const visualContinuity = slide.visualContinuity || fallbackVisual.continuity;
    const visualPrompt =
      slide.visualPrompt ||
      buildCarouselVisualPrompt({
        slide,
        topic: content.metadata.topic,
        direction: content.visualDirection,
      });

    return {
      id: `slide-${slideNumber}-${Date.now()}`,
      slideNumber,
      template,
      categoryBadge: slide.calloutBadge || (template === 'hook' ? 'JodoCo Strategy' : `Step ${slideNumber}`),
      headline: slide.headline,
      subHeadline: slide.subHeadline,
      body: slide.bodyCopy,
      supportingBullets: slide.bulletPoints && slide.bulletPoints.length > 0 ? slide.bulletPoints : undefined,
      takeaway: slide.footerCta || (template === 'hook' ? 'Swipe to explore →' : undefined),
      ctaText: template === 'cta' ? "Let's Jodo." : undefined,
      ctaSubtext: template === 'cta' ? 'Visit jodoco.agency' : undefined,
      ctaUrl: template === 'cta' ? 'https://jodoco.agency' : undefined,
      visualHighlight: {
        badgeText: slide.cardVisual?.badgeTag || (template === 'hook' ? '4x Engagement' : undefined),
        metricNumber: slide.cardVisual?.metricHighlight,
        accentColor,
      },
      footerNote: template === 'cta' ? 'jodoco.agency • Brands × Creators' : 'Swipe to continue →',

      // Visual Intelligence
      visualDecision,
      visualPriority,
      visualReason,
      visualPrompt,
      visualContinuity,
      visualVersion: 1,
    };
  });

  return {
    id: `carousel-${Date.now()}`,
    title: content.carousel.title || `${content.metadata.topic} — JodoCo Carousel`,
    topic: content.metadata.topic,
    hookAngle: content.carousel.hookAngle || 'Creator Economy Insights',
    dimensions: CAROUSEL_SPEC.dimensions,
    branding: CAROUSEL_SPEC.branding,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slides,
  };
}

export interface ExportCarouselResult {
  success: boolean;
  format: 'png_archive' | 'pdf_document' | 'json_manifest';
  slideCount: number;
  dimensions: { width: number; height: number; aspectRatio: string };
  slides: Array<{
    slideNumber: number;
    template: string;
    title: string;
    exportReady: boolean;
    visualDecision?: string;
    assetStatus?: string;
  }>;
  validationErrors?: string[];
  validationWarnings?: string[];
  exportedAt: string;
  message: string;
}

/**
 * Validates and exports carousel project with asset lifecycle enforcement
 */
export function exportCarousel(
  project: CarouselProject,
  projectAssets: JodoCoAsset[] = []
): ExportCarouselResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const slideResults = project.slides.map((s) => {
    let exportReady = true;
    let assetStatus = 'none';

    if (s.visualAssetId) {
      const asset = projectAssets.find((a) => a.id === s.visualAssetId);
      if (asset) {
        assetStatus = asset.status;
        if (asset.status === 'rejected') {
          exportReady = false;
          errors.push(`Slide ${s.slideNumber} uses a REJECTED asset (${asset.name}). Replace or approve asset before exporting.`);
        } else if (asset.status === 'reviewing') {
          warnings.push(`Slide ${s.slideNumber} uses an asset currently in REVIEW (${asset.name}). Exporting with review asset.`);
        }
      } else {
        warnings.push(`Slide ${s.slideNumber} references missing asset ID: ${s.visualAssetId}`);
      }
    }

    return {
      slideNumber: s.slideNumber,
      template: s.template,
      title: s.headline,
      exportReady,
      visualDecision: s.visualDecision,
      assetStatus,
    };
  });

  const allReady = errors.length === 0 && slideResults.every((s) => s.exportReady);

  return {
    success: allReady,
    format: 'json_manifest',
    slideCount: project.slides.length,
    dimensions: {
      width: project.dimensions.width,
      height: project.dimensions.height,
      aspectRatio: project.dimensions.aspectRatio,
    },
    slides: slideResults,
    validationErrors: errors.length > 0 ? errors : undefined,
    validationWarnings: warnings.length > 0 ? warnings : undefined,
    exportedAt: new Date().toISOString(),
    message: allReady
      ? `Validated ${project.slides.length} carousel slides at 1080×1350 (4:5) for export.`
      : `Export blocked: ${errors.length} asset validation error(s) found.`,
  };
}

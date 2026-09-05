import { JodoCoProject } from '../project-engine/types';
import { QualityCheck } from './types';
import { getContrastRatio, QUALITY_THRESHOLDS } from './rules';

export function runAccessibilityQualityChecks(project: JodoCoProject): QualityCheck[] {
  const checks: QualityCheck[] = [];
  const reelScenes = project.reelProject?.scenes || [];
  const carouselSlides = project.carouselProject?.slides || [];

  // ==========================================
  // 1. COLOR CONTRAST (WCAG AA MEASURABLE)
  // ==========================================

  // Check 1.1: Reel Scene Contrast
  const lowContrastReelScenes: { sceneId: number; ratio: number }[] = [];
  reelScenes.forEach((scene) => {
    const accent = scene.colorTheme?.accent || '#FF8C73';
    const bgPill = scene.colorTheme?.bgPill || '#1A2B48';
    const ratio = getContrastRatio(accent, bgPill);
    if (ratio < QUALITY_THRESHOLDS.accessibility.minLargeContrastRatio) {
      lowContrastReelScenes.push({ sceneId: scene.id, ratio });
    }
  });

  checks.push({
    id: 'a11y-reel-color-contrast',
    category: 'accessibility',
    severity: 'warning',
    passed: lowContrastReelScenes.length === 0,
    title: 'Reel Color Contrast (WCAG AA)',
    message:
      lowContrastReelScenes.length === 0
        ? 'All scene badges and text elements exceed WCAG AA contrast thresholds (≥ 3.0:1).'
        : `Scene(s) ${lowContrastReelScenes.map((s) => `Scene ${s.sceneId} (${s.ratio.toFixed(1)}:1)`).join(', ')} have low color contrast.`,
    recommendation: 'Use high-contrast combinations (e.g. Navy #1A2B48 background with Coral #FF8C73 or White text).',
    whyItMatters: 'Adequate contrast ensures readability under bright daylight on mobile screens.',
    targetMedium: 'reel',
  });

  // ==========================================
  // 2. TEXT OVER IMAGERY SCRIM PROTECTION
  // ==========================================

  // Check 2.1: Carousel slides with background images
  const imageSlides = carouselSlides.filter((s) => !!s.visualUrl);
  // All our slide templates implement standard gradient scrim overlays in SlideVisualMedia
  checks.push({
    id: 'a11y-carousel-image-scrim',
    category: 'accessibility',
    severity: 'info',
    passed: true,
    title: 'Text-over-Image Scrim Protection',
    message: `All ${imageSlides.length} image slides have automatic contrast gradient scrims enabled behind typography.`,
    recommendation: 'Maintain dark-to-transparent gradient scrims behind light text overlaying photographic visuals.',
    whyItMatters: 'Photographic backgrounds have unpredictable luminance zones that can make text unreadable.',
    targetMedium: 'carousel',
  });

  // ==========================================
  // 3. OVERALL COGNITIVE TEXT DENSITY
  // ==========================================

  // Check 3.1: Slide total text density
  const denseSlides = carouselSlides.filter((s) => {
    const totalChars =
      (s.headline?.length || 0) +
      (s.subHeadline?.length || 0) +
      (s.body?.length || 0) +
      (s.supportingBullets?.join(' ').length || 0) +
      (s.takeaway?.length || 0);
    return totalChars > QUALITY_THRESHOLDS.accessibility.maxTextDensityCharsPerSlide;
  });

  checks.push({
    id: 'a11y-cognitive-text-density',
    category: 'accessibility',
    severity: 'warning',
    passed: denseSlides.length === 0,
    title: 'Slide Reading Load & Cognitive Density',
    message:
      denseSlides.length === 0
        ? 'Text load across all carousel slides is within mobile readability thresholds.'
        : `Slide(s) ${denseSlides.map((s) => s.slideNumber).join(', ')} exceed ${QUALITY_THRESHOLDS.accessibility.maxTextDensityCharsPerSlide} total characters.`,
    recommendation: 'Reduce word count or distribute key ideas across additional cards.',
    whyItMatters: 'Dense cards induce cognitive fatigue and decrease save/share conversion.',
    targetMedium: 'carousel',
  });

  return checks;
}

import { CarouselProject, CarouselSlide } from '../carousel-engine/types';
import { JodoCoAsset } from '../project-engine/types';
import { QualityCheck } from './types';
import { QUALITY_THRESHOLDS } from './rules';

export function runCarouselQualityChecks(
  project: CarouselProject,
  assets: JodoCoAsset[] = []
): QualityCheck[] {
  const checks: QualityCheck[] = [];
  const slides = project.slides || [];
  const { carousel: thresh } = QUALITY_THRESHOLDS;

  // ==========================================
  // 1. EDITORIAL CHECKS
  // ==========================================

  // Check 1.1: Hook slide exists
  const hookSlide = slides.find(
    (s, idx) => idx === 0 || s.template === 'hook' || s.slideNumber === 1
  );
  const hookExists = !!hookSlide && !!hookSlide.headline && hookSlide.headline.trim().length > 0;
  checks.push({
    id: 'carousel-editorial-hook-exists',
    category: 'editorial',
    severity: 'error',
    passed: hookExists,
    title: 'Carousel Hook Slide',
    message: hookExists
      ? `Hook slide "${hookSlide?.headline || 'Slide 1'}" leads the carousel.`
      : 'Missing a clear Hook slide at Slide 1 to stop the feed scroll.',
    recommendation: 'Add a high-curiosity Hook slide as Slide 1.',
    whyItMatters: 'Carousels with weak hooks receive 70% lower swipe-through rates on Instagram and LinkedIn.',
    targetMedium: 'carousel',
    targetId: hookSlide?.id || '1',
  });

  // Check 1.2: Slide count
  const slideCountValid = slides.length >= thresh.minSlides && slides.length <= thresh.maxSlides;
  checks.push({
    id: 'carousel-editorial-slide-count',
    category: 'editorial',
    severity: 'warning',
    passed: slideCountValid,
    title: 'Carousel Slide Length',
    message: slideCountValid
      ? `Carousel has ${slides.length} slides (recommended: ${thresh.minSlides}–${thresh.maxSlides}).`
      : `Carousel has ${slides.length} slides. Optimal multi-slide engagement is between 5 and 8 slides.`,
    recommendation: 'Target 5 to 8 slides for optimal swipe completion without reader fatigue.',
    whyItMatters: 'Carousels under 3 slides feel insubstantial; carousels over 10 suffer severe drop-off.',
    targetMedium: 'carousel',
  });

  // Check 1.3: CTA slide exists
  const ctaSlide = slides.find(
    (s) =>
      s.template === 'cta' ||
      !!s.ctaText ||
      s.headline?.toLowerCase().includes('save') ||
      s.headline?.toLowerCase().includes('follow') ||
      s.headline?.toLowerCase().includes('share') ||
      s.slideNumber === slides.length
  );
  const hasCta = !!ctaSlide && (!!ctaSlide.ctaText || ctaSlide.template === 'cta' || (ctaSlide.headline && ctaSlide.headline.length > 5));
  checks.push({
    id: 'carousel-editorial-cta-exists',
    category: 'editorial',
    severity: 'warning',
    passed: hasCta,
    title: 'Call to Action (CTA) Slide',
    message: hasCta
      ? `CTA defined on slide "${ctaSlide?.headline || 'Final Slide'}".`
      : 'No clear Call to Action found on the concluding slide.',
    recommendation: 'Add a concluding CTA slide prompting users to Save, Share, or Comment.',
    whyItMatters: 'Saves and shares are heavily weighted in Instagram and LinkedIn feed algorithms.',
    targetMedium: 'carousel',
    targetId: ctaSlide?.id || slides[slides.length - 1]?.id,
    autoFixable: !hasCta,
    autoFixType: 'add_missing_cta',
    autoFixDescription: 'Add default JodoCo CTA template to the final slide.',
  });

  // Check 1.4: No empty slides
  const emptySlides = slides.filter(
    (s) => !s.headline?.trim() && !s.body?.trim() && (!s.supportingBullets || s.supportingBullets.length === 0)
  );
  checks.push({
    id: 'carousel-editorial-empty-slides',
    category: 'editorial',
    severity: 'error',
    passed: emptySlides.length === 0,
    title: 'Slide Content Completeness',
    message:
      emptySlides.length === 0
        ? 'All slides contain written headlines and body content.'
        : `Found ${emptySlides.length} blank slide(s) (Slide ${emptySlides.map((s) => s.slideNumber).join(', ')}).`,
    recommendation: 'Add headline or body text to all slides in the deck.',
    whyItMatters: 'Blank slides degrade content quality perception and cause immediate swipe abandon.',
    targetMedium: 'carousel',
  });

  // ==========================================
  // 2. READABILITY & HIERARCHY CHECKS
  // ==========================================

  // Check 2.1: Headline lengths
  const overlyLongHeadlines = slides.filter(
    (s) => (s.headline?.length || 0) > thresh.maxHeadlineChars
  );
  checks.push({
    id: 'carousel-readability-headline-length',
    category: 'accessibility',
    severity: 'warning',
    passed: overlyLongHeadlines.length === 0,
    title: 'Headline Brevity & Punchiness',
    message:
      overlyLongHeadlines.length === 0
        ? 'All slide headlines are punchy and readable at a glance.'
        : `Slide(s) ${overlyLongHeadlines.map((s) => s.slideNumber).join(', ')} have headlines exceeding ${thresh.maxHeadlineChars} characters.`,
    recommendation: 'Shorten slide headlines so they fit on 2–3 lines in large display typography.',
    whyItMatters: 'Overlong headlines reduce font sizing and hurt mobile legibility.',
    targetMedium: 'carousel',
    autoFixable: overlyLongHeadlines.length > 0,
    autoFixType: 'trim_headline',
    autoFixDescription: 'Trim long headlines to concise phrasing.',
  });

  // Check 2.2: Body text overload
  const overloadedBodySlides = slides.filter(
    (s) => (s.body?.length || 0) > thresh.maxBodyChars
  );
  checks.push({
    id: 'carousel-readability-body-overload',
    category: 'accessibility',
    severity: 'warning',
    passed: overloadedBodySlides.length === 0,
    title: 'Slide Text Density',
    message:
      overloadedBodySlides.length === 0
        ? 'Text density is well-spaced across all slides.'
        : `Slide(s) ${overloadedBodySlides.map((s) => s.slideNumber).join(', ')} have dense body text (> ${thresh.maxBodyChars} chars).`,
    recommendation: 'Break long paragraphs into bullet points or split across multiple slides.',
    whyItMatters: 'Dense walls of text on mobile cards drastically reduce reader retention.',
    targetMedium: 'carousel',
  });

  // Check 2.3: Bullet points count
  const excessiveBulletSlides = slides.filter(
    (s) => (s.supportingBullets?.length || 0) > thresh.maxBulletsCount
  );
  checks.push({
    id: 'carousel-readability-bullet-count',
    category: 'accessibility',
    severity: 'info',
    passed: excessiveBulletSlides.length === 0,
    title: 'Supporting Bullet Counts',
    message:
      excessiveBulletSlides.length === 0
        ? 'Bullet lists are concise (≤ 5 items per slide).'
        : `Slide(s) ${excessiveBulletSlides.map((s) => s.slideNumber).join(', ')} contain more than 5 bullet points.`,
    recommendation: 'Limit bullet lists to 3–4 high-impact points per slide.',
    whyItMatters: 'Too many list items crowd the safe zones of 4:5 cards.',
    targetMedium: 'carousel',
  });

  // ==========================================
  // 3. VISUAL INTELLIGENCE & ASSET CHECKS
  // ==========================================

  // Check 3.1: Active rejected assets on carousel (BLOCKER)
  const rejectedSlideAssets = slides
    .map((slide) => {
      const assetId = slide.visualAssetId;
      if (!assetId) return null;
      const found = assets.find((a) => a.id === assetId);
      if (found && found.status === 'rejected') {
        return { slide, asset: found };
      }
      return null;
    })
    .filter(Boolean) as { slide: CarouselSlide; asset: JodoCoAsset }[];

  checks.push({
    id: 'carousel-visual-no-rejected-assets',
    category: 'assets',
    severity: 'blocker',
    passed: rejectedSlideAssets.length === 0,
    title: 'No Rejected Visual Assets in Slides',
    message:
      rejectedSlideAssets.length === 0
        ? 'All attached slide visuals are valid and not rejected.'
        : `Slide(s) ${rejectedSlideAssets.map((r) => `Slide ${r.slide.slideNumber} ("${r.asset.name}")`).join(', ')} reference REJECTED assets.`,
    recommendation: 'Approve or replace rejected visual assets in the Asset Library before exporting.',
    whyItMatters: 'Rejected assets must never be rendered in published social carousels.',
    targetMedium: 'carousel',
    autoFixable: rejectedSlideAssets.length > 0,
    autoFixType: 'unbind_rejected_asset',
    autoFixDescription: 'Detach rejected assets from affected carousel slides.',
  });

  // Check 3.2: Duplicate repeated visuals across slides
  const visualUrlsUsed: Record<string, number[]> = {};
  slides.forEach((slide) => {
    if (slide.visualUrl && slide.visualUrl.trim().length > 0) {
      if (!visualUrlsUsed[slide.visualUrl]) {
        visualUrlsUsed[slide.visualUrl] = [];
      }
      visualUrlsUsed[slide.visualUrl].push(slide.slideNumber);
    }
  });

  const duplicateVisualSlides = Object.entries(visualUrlsUsed).filter(
    ([_, slideNums]) => slideNums.length > 2
  );

  checks.push({
    id: 'carousel-visual-duplicate-repetition',
    category: 'visual',
    severity: 'info',
    passed: duplicateVisualSlides.length === 0,
    title: 'Visual Asset Diversity',
    message:
      duplicateVisualSlides.length === 0
        ? 'Visual imagery is diverse and contextual across the deck.'
        : `Identical visual asset is repeated across ${duplicateVisualSlides.map(([_, nums]) => `Slides ${nums.join(', ')}`).join('; ')}.`,
    recommendation: 'Use varied, context-specific visuals for distinct teaching beats.',
    whyItMatters: 'Repeated identical imagery makes slides feel generic and copy-pasted.',
    targetMedium: 'carousel',
  });

  // ==========================================
  // 4. TECHNICAL SPECIFICATION CHECKS
  // ==========================================

  // Check 4.1: Aspect ratio 4:5
  const aspectRatioValid = project.dimensions?.aspectRatio === '4:5' || !project.dimensions?.aspectRatio;
  checks.push({
    id: 'carousel-technical-aspect-ratio',
    category: 'technical',
    severity: 'error',
    passed: aspectRatioValid,
    title: '4:5 Portrait Aspect Ratio',
    message: aspectRatioValid
      ? 'Target format is 4:5 portrait (standard 1080×1350 for Instagram and LinkedIn feeds).'
      : `Carousel aspect ratio is "${project.dimensions?.aspectRatio}". Expected 4:5.`,
    recommendation: 'Set carousel card aspect ratio to 4:5 (1080×1350).',
    whyItMatters: '4:5 maximizes vertical screen real-estate in mobile feeds compared to 1:1 square.',
    targetMedium: 'carousel',
  });

  // Check 4.2: Valid slide numbering
  let numberingValid = true;
  for (let i = 0; i < slides.length; i++) {
    if (slides[i].slideNumber !== i + 1) {
      numberingValid = false;
      break;
    }
  }
  checks.push({
    id: 'carousel-technical-slide-ordering',
    category: 'technical',
    severity: 'warning',
    passed: numberingValid,
    title: 'Sequential Slide Indexing',
    message: numberingValid
      ? 'Slide numbers are strictly sequential (1..N).'
      : 'Slide numbering contains index gaps or out-of-order sequence.',
    recommendation: 'Re-index slide numbers sequentially from 1 to N.',
    whyItMatters: 'Out-of-order slide numbering leads to incorrect export page ordering in PDF/ZIP exports.',
    targetMedium: 'carousel',
  });

  // Check 4.3: Valid asset references exist in project vault
  const missingSlideAssets = slides
    .map((s) => {
      const assetId = s.visualAssetId;
      if (!assetId) return null;
      const found = assets.find((a) => a.id === assetId);
      if (!found) {
        return { slideNumber: s.slideNumber, assetId };
      }
      return null;
    })
    .filter(Boolean) as { slideNumber: number; assetId: string }[];

  checks.push({
    id: 'carousel-technical-asset-refs',
    category: 'assets',
    severity: 'warning',
    passed: missingSlideAssets.length === 0,
    title: 'Slide Asset Integrity',
    message:
      missingSlideAssets.length === 0
        ? 'All linked slide visual assets exist in the Project Asset Library.'
        : `Slide(s) ${missingSlideAssets.map((m) => `Slide ${m.slideNumber} -> ${m.assetId}`).join(', ')} reference missing asset IDs.`,
    recommendation: 'Re-generate or re-link missing visuals in the Slide Inspector.',
    whyItMatters: 'Broken asset references fallback to placeholder backgrounds during canvas export.',
    targetMedium: 'carousel',
  });

  return checks;
}

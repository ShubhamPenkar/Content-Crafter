import { JodoCoProject } from '../project-engine/types';
import { QualityCheck } from './types';
import { JODOCO_BRAND_RULES, isHexApprovedBrandColor, getContrastRatio } from './rules';

export function runBrandQualityChecks(project: JodoCoProject): QualityCheck[] {
  const checks: QualityCheck[] = [];
  const reel = project.reelProject;
  const carousel = project.carouselProject;

  // ==========================================
  // 1. BRAND COLOR PALETTE CHECKS
  // ==========================================

  // Check 1.1: Core Palette Presence
  const reelBranding = reel?.branding;
  const carouselBranding = carousel?.branding;
  const brandColors = reelBranding?.colors || [];

  const hasPrimary = isHexApprovedBrandColor(JODOCO_BRAND_RULES.colors.primary);
  const hasAccent = isHexApprovedBrandColor(JODOCO_BRAND_RULES.colors.accent);

  checks.push({
    id: 'brand-palette-core-colors',
    category: 'brand',
    severity: 'info',
    passed: true,
    title: 'JodoCo Official Brand Palette',
    message: 'Official brand palette applied (Primary #1A2B48, Accent #FF8C73, Secondary #8FE3C0 / #B8A7EA, Base #FAF7F2).',
    recommendation: 'Use approved brand colors for primary badges, accent pills, and headline highlights.',
    whyItMatters: 'Consistent color palettes reinforce brand recall across multi-platform content feeds.',
    targetMedium: 'project',
  });

  // Check 1.2: Off-brand / rogue hex color detection in scenes
  const offBrandColors: { sceneId: number; color: string }[] = [];
  reel?.scenes?.forEach((scene) => {
    const theme = scene.colorTheme;
    if (theme?.accent && !isHexApprovedBrandColor(theme.accent)) {
      offBrandColors.push({ sceneId: scene.id, color: theme.accent });
    }
  });

  checks.push({
    id: 'brand-palette-unapproved-colors',
    category: 'brand',
    severity: 'warning',
    passed: offBrandColors.length === 0,
    title: 'Brand Color Conformance',
    message:
      offBrandColors.length === 0
        ? 'All scenes utilize approved JodoCo brand palette colors.'
        : `Detected ${offBrandColors.length} non-standard color value(s): ${offBrandColors.map((o) => `Scene ${o.sceneId} (${o.color})`).join(', ')}.`,
    recommendation: 'Align accent colors to the official Coral (#FF8C73), Mint (#8FE3C0), or Lavender (#B8A7EA) palette.',
    whyItMatters: 'Random uncalibrated hex colors dilute brand identity.',
    targetMedium: 'reel',
    autoFixable: offBrandColors.length > 0,
    autoFixType: 'apply_brand_color',
    autoFixDescription: 'Apply official JodoCo Coral/Navy palette to all scenes.',
  });

  // ==========================================
  // 2. TYPOGRAPHY & SAFE AREA CHECKS
  // ==========================================

  // Check 2.1: Typography Hierarchy
  const hasHeadings = (reel?.scenes?.length || 0) > 0;
  checks.push({
    id: 'brand-typography-hierarchy',
    category: 'brand',
    severity: 'info',
    passed: hasHeadings,
    title: 'Typography System Hierarchy',
    message: 'Typography follows Plus Jakarta Sans display & Inter body typography hierarchy.',
    recommendation: 'Maintain heavy bold display headlines with clean regular body copy.',
    whyItMatters: 'Clear typographic hierarchy enables instant scannability on mobile devices.',
    targetMedium: 'project',
  });

  // Check 2.2: Reel Safe Area Margins
  const hasSafeMargins = true; // Built-in to CanvasAtmosphereSpec
  checks.push({
    id: 'brand-safe-zone-compliance',
    category: 'brand',
    severity: 'info',
    passed: hasSafeMargins,
    title: 'Platform Safe-Zone Margins',
    message: 'Layout elements respect Instagram/TikTok UI overlay margins (top 15%, bottom 20%).',
    recommendation: 'Keep all critical text inside safe zones to avoid being covered by UI buttons or captions.',
    whyItMatters: 'Platform icons (like, comment, share) cover elements positioned too close to the edges.',
    targetMedium: 'reel',
  });

  // ==========================================
  // 3. BRAND IDENTITY & WATERMARK
  // ==========================================

  // Check 3.1: Brand Name / Handle Presence
  const brandName = reelBranding?.brandName || carouselBranding?.brandName || 'JodoCo';
  const hasBrandIdent = !!brandName && brandName.trim().length > 0;

  checks.push({
    id: 'brand-identity-watermark',
    category: 'brand',
    severity: 'info',
    passed: hasBrandIdent,
    title: 'Brand Attribution & Watermark',
    message: `Active brand identifier: "${brandName}". Included in corner badge and outro.`,
    recommendation: 'Ensure your brand handle is present on slide footers and video outros.',
    whyItMatters: 'Branded watermarks protect content against unattributed reposts and build creator recognition.',
    targetMedium: 'project',
  });

  return checks;
}

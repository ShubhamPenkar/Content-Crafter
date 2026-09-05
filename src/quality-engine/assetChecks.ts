import { JodoCoProject, JodoCoAsset } from '../project-engine/types';
import { QualityCheck, QualityAssetSummary } from './types';

export function runAssetQualityChecks(project: JodoCoProject): {
  checks: QualityCheck[];
  summary: QualityAssetSummary;
} {
  const checks: QualityCheck[] = [];
  const assets = project.assets || [];
  const reelScenes = project.reelProject?.scenes || [];
  const carouselSlides = project.carouselProject?.slides || [];

  // 1. Gather asset lifecycle stats
  const approvedAssets = assets.filter((a) => a.status === 'approved');
  const reviewingAssets = assets.filter((a) => a.status === 'reviewing');
  const rejectedAssets = assets.filter((a) => a.status === 'rejected');
  const archivedAssets = assets.filter((a) => a.status === 'archived');

  // Identify active asset IDs in reel and carousel
  const activeReelAssetIds = new Set<string>();
  reelScenes.forEach((s) => {
    if (s.videoAssetId) activeReelAssetIds.add(s.videoAssetId);
    if (s.visualAssetId) activeReelAssetIds.add(s.visualAssetId);
  });

  const activeCarouselAssetIds = new Set<string>();
  carouselSlides.forEach((s) => {
    if (s.visualAssetId) activeCarouselAssetIds.add(s.visualAssetId);
  });

  const allActiveAssetIds = new Set<string>([
    ...Array.from(activeReelAssetIds),
    ...Array.from(activeCarouselAssetIds),
  ]);

  // Orphaned assets (in library but unattached to active storyboard or slide)
  const orphanedAssets = assets.filter((a) => !allActiveAssetIds.has(a.id));

  const summary: QualityAssetSummary = {
    total: assets.length,
    approved: approvedAssets.length,
    reviewing: reviewingAssets.length,
    rejected: rejectedAssets.length,
    archived: archivedAssets.length,
    orphaned: orphanedAssets.length,
  };

  // ==========================================
  // ASSET CHECKS
  // ==========================================

  // Check 1: Active Rejected Assets (BLOCKER)
  const activeRejected = assets.filter(
    (a) => a.status === 'rejected' && allActiveAssetIds.has(a.id)
  );

  checks.push({
    id: 'assets-no-active-rejected',
    category: 'assets',
    severity: 'blocker',
    passed: activeRejected.length === 0,
    title: 'Active Rejected Assets Check',
    message:
      activeRejected.length === 0
        ? 'No rejected assets are linked to any active Reel scene or Carousel slide.'
        : `Found ${activeRejected.length} rejected asset(s) currently linked to active storyboard/deck: ${activeRejected.map((a) => a.name).join(', ')}.`,
    recommendation: 'Replace or approve rejected assets in the Asset Library before attempting export.',
    whyItMatters: 'Exporting rejected assets compromises brand standards and visual quality.',
    targetMedium: 'asset',
    autoFixable: activeRejected.length > 0,
    autoFixType: 'unbind_rejected_asset',
    autoFixDescription: 'Detach all rejected assets from active scenes/slides.',
  });

  // Check 2: Active Archived Assets (ERROR)
  const activeArchived = assets.filter(
    (a) => a.status === 'archived' && allActiveAssetIds.has(a.id)
  );

  checks.push({
    id: 'assets-no-active-archived',
    category: 'assets',
    severity: 'error',
    passed: activeArchived.length === 0,
    title: 'Active Archived Assets Check',
    message:
      activeArchived.length === 0
        ? 'No archived assets are linked to active compositions.'
        : `Found ${activeArchived.length} archived asset(s) currently referenced: ${activeArchived.map((a) => a.name).join(', ')}.`,
    recommendation: 'Unarchive the asset or link an approved current version.',
    whyItMatters: 'Archived assets may contain deprecated information or obsolete brand assets.',
    targetMedium: 'asset',
  });

  // Check 3: Broken asset paths / empty URLs
  const brokenAssets = assets.filter((a) => !a.url || a.url.trim() === '');
  checks.push({
    id: 'assets-valid-media-urls',
    category: 'assets',
    severity: 'error',
    passed: brokenAssets.length === 0,
    title: 'Asset URL & Data Integrity',
    message:
      brokenAssets.length === 0
        ? 'All library assets have valid, accessible media data URLs.'
        : `Found ${brokenAssets.length} asset(s) with missing media URLs: ${brokenAssets.map((a) => a.name).join(', ')}.`,
    recommendation: 'Re-upload or re-generate media for assets with missing URLs.',
    whyItMatters: 'Empty URLs will fail to load in the browser canvas and video render pipelines.',
    targetMedium: 'asset',
  });

  // Check 4: Asset Project Isolation
  const crossProjectAssets = assets.filter(
    (a) => a.projectId && project.id && a.projectId !== project.id
  );
  checks.push({
    id: 'assets-project-isolation',
    category: 'assets',
    severity: 'warning',
    passed: crossProjectAssets.length === 0,
    title: 'Project Asset Vault Isolation',
    message:
      crossProjectAssets.length === 0
        ? 'All assets are strictly scoped to the current project vault.'
        : `Found ${crossProjectAssets.length} asset(s) linked across other project IDs.`,
    recommendation: 'Re-import assets directly into this project workspace.',
    whyItMatters: 'Cross-project contamination can lead to unexpected asset deletion or permission errors.',
    targetMedium: 'asset',
  });

  // Check 5: Orphaned assets (INFO/WARNING - not blockers)
  checks.push({
    id: 'assets-orphaned-library-items',
    category: 'assets',
    severity: 'info',
    passed: true,
    title: 'Asset Vault Utilization',
    message:
      orphanedAssets.length === 0
        ? 'All library assets are actively utilized in the Reel or Carousel.'
        : `${orphanedAssets.length} asset(s) in the library are currently unattached (available for future beats).`,
    recommendation: 'Unattached assets can be kept as alternatives or archived in the Asset Library.',
    whyItMatters: 'Keeping unused generation alternatives allows creators to easily swap visuals later.',
    targetMedium: 'asset',
  });

  return { checks, summary };
}

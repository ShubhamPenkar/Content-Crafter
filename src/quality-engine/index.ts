import { JodoCoProject } from '../project-engine/types';
import {
  QualityReport,
  QualityCheck,
  CheckCategory,
  CategoryScore,
  QualityStatus,
  QualityReportSummary,
} from './types';
import { QUALITY_CATEGORY_WEIGHTS, JODOCO_BRAND_RULES } from './rules';
import { runReelQualityChecks } from './reelChecks';
import { runCarouselQualityChecks } from './carouselChecks';
import { runBrandQualityChecks } from './brandChecks';
import { runAssetQualityChecks } from './assetChecks';
import { runAccessibilityQualityChecks } from './accessibilityChecks';

export * from './types';
export * from './rules';
export * from './reelChecks';
export * from './carouselChecks';
export * from './brandChecks';
export * from './assetChecks';
export * from './accessibilityChecks';

/**
 * Executes the complete deterministic Quality, Brand Consistency, and Production Readiness evaluation.
 * Returns a transparent, reproducible QualityReport with a 0-100 score and explicit status.
 */
export function runProductionReadinessCheck(project: JodoCoProject): QualityReport {
  const assets = project.assets || [];

  // Run all check suites
  const reelChecks = runReelQualityChecks(project.reelProject, assets);
  const carouselChecks = runCarouselQualityChecks(project.carouselProject, assets);
  const brandChecks = runBrandQualityChecks(project);
  const { checks: assetChecksList, summary: assetsSummary } = runAssetQualityChecks(project);
  const accessibilityChecks = runAccessibilityQualityChecks(project);

  const allChecks: QualityCheck[] = [
    ...reelChecks,
    ...carouselChecks,
    ...brandChecks,
    ...assetChecksList,
    ...accessibilityChecks,
  ];

  // Group checks by category and calculate deterministic scores
  const categories: CheckCategory[] = [
    'editorial',
    'brand',
    'visual',
    'accessibility',
    'assets',
    'technical',
  ];

  const categoryScores: Record<CheckCategory, CategoryScore> = {} as any;
  let weightedScoreSum = 0;
  let totalWeight = 0;

  categories.forEach((cat) => {
    const catChecks = allChecks.filter((c) => c.category === cat);
    const weightInfo = QUALITY_CATEGORY_WEIGHTS[cat] || { weight: 10, name: cat };
    const totalCount = catChecks.length;
    const passedCount = catChecks.filter((c) => c.passed).length;
    const blockersCount = catChecks.filter((c) => !c.passed && c.severity === 'blocker').length;
    const errorsCount = catChecks.filter((c) => !c.passed && c.severity === 'error').length;
    const warningsCount = catChecks.filter((c) => !c.passed && c.severity === 'warning').length;

    // Deterministic category scoring calculation:
    // Base 100, deducted by severity of unpassed issues
    let rawScore = 100;
    if (totalCount > 0) {
      const deduction = blockersCount * 40 + errorsCount * 20 + warningsCount * 8;
      rawScore = Math.max(0, 100 - deduction);
    }

    categoryScores[cat] = {
      category: cat,
      name: weightInfo.name,
      score: rawScore,
      weight: weightInfo.weight,
      passedCount,
      totalCount,
      blockersCount,
      errorsCount,
      warningsCount,
    };

    weightedScoreSum += rawScore * (weightInfo.weight / 100);
    totalWeight += weightInfo.weight;
  });

  // Calculate overall normalized score (0-100)
  const overallScore = totalWeight > 0 ? Math.round((weightedScoreSum / totalWeight) * 100) : 100;

  // Aggregate counts
  const totalBlockers = allChecks.filter((c) => !c.passed && c.severity === 'blocker').length;
  const totalErrors = allChecks.filter((c) => !c.passed && c.severity === 'error').length;
  const totalWarnings = allChecks.filter((c) => !c.passed && c.severity === 'warning').length;
  const totalInfo = allChecks.filter((c) => c.severity === 'info').length;
  const totalPassed = allChecks.filter((c) => c.passed).length;

  // Medium-specific scores & statuses
  const reelChecksList = allChecks.filter((c) => c.targetMedium === 'reel');
  const reelPassed = reelChecksList.filter((c) => c.passed).length;
  const reelBlockers = reelChecksList.filter((c) => !c.passed && c.severity === 'blocker').length;
  const reelScore =
    reelChecksList.length > 0 ? Math.round((reelPassed / reelChecksList.length) * 100) : 100;
  const reelStatus: QualityStatus =
    reelBlockers > 0 ? 'blocked' : reelScore < 75 ? 'needs_review' : 'ready';

  const carouselChecksList = allChecks.filter((c) => c.targetMedium === 'carousel');
  const carouselPassed = carouselChecksList.filter((c) => c.passed).length;
  const carouselBlockers = carouselChecksList.filter(
    (c) => !c.passed && c.severity === 'blocker'
  ).length;
  const carouselScore =
    carouselChecksList.length > 0
      ? Math.round((carouselPassed / carouselChecksList.length) * 100)
      : 100;
  const carouselStatus: QualityStatus =
    carouselBlockers > 0 ? 'blocked' : carouselScore < 75 ? 'needs_review' : 'ready';

  // Overall status evaluation:
  // - "blocked" if ANY blocker exists
  // - "needs_review" if ANY error exists or overallScore < 75
  // - "ready" otherwise
  let status: QualityStatus = 'ready';
  if (totalBlockers > 0) {
    status = 'blocked';
  } else if (totalErrors > 0 || overallScore < 75) {
    status = 'needs_review';
  }

  const summary: QualityReportSummary = {
    reelScore,
    reelStatus,
    carouselScore,
    carouselStatus,
    blockersCount: totalBlockers,
    errorsCount: totalErrors,
    warningsCount: totalWarnings,
    infoCount: totalInfo,
    passedCount: totalPassed,
    totalChecks: allChecks.length,
    assetsSummary,
  };

  return {
    overallScore,
    status,
    summary,
    categoryScores,
    checks: allChecks,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Applies deterministic, safe auto-fixes to resolve flagged issues without altering core user copy.
 */
export function applyQuickFix(project: JodoCoProject, checkId: string): JodoCoProject {
  const report = runProductionReadinessCheck(project);
  const targetCheck = report.checks.find((c) => c.id === checkId);

  if (!targetCheck || !targetCheck.autoFixable) return project;

  let updated = { ...project };

  switch (targetCheck.autoFixType) {
    case 'trim_headline': {
      if (targetCheck.targetMedium === 'reel') {
        const scenes = updated.reelProject.scenes.map((s) => {
          if (s.id === targetCheck.targetId || targetCheck.targetId === undefined) {
            const trimmed = s.voiceover ? s.voiceover.slice(0, 80).trim() : s.voiceover;
            return {
              ...s,
              voiceover: trimmed,
              visuals: s.visuals
                ? {
                    ...s.visuals,
                    headline: s.visuals.headline
                      ? {
                          ...s.visuals.headline,
                          fullText: s.visuals.headline.fullText?.slice(0, 65).trim(),
                        }
                      : undefined,
                  }
                : undefined,
            };
          }
          return s;
        });
        updated = {
          ...updated,
          reelProject: { ...updated.reelProject, scenes },
        };
      } else if (targetCheck.targetMedium === 'carousel') {
        const slides = updated.carouselProject.slides.map((s) => {
          if (s.id === String(targetCheck.targetId) || s.slideNumber === Number(targetCheck.targetId)) {
            return {
              ...s,
              headline: s.headline.slice(0, 70).trim(),
            };
          }
          return s;
        });
        updated = {
          ...updated,
          carouselProject: { ...updated.carouselProject, slides },
        };
      }
      break;
    }

    case 'apply_brand_color': {
      const scenes = updated.reelProject.scenes.map((s) => ({
        ...s,
        colorTheme: {
          accent: JODOCO_BRAND_RULES.colors.accent,
          secondary: JODOCO_BRAND_RULES.colors.secondaryMint,
          bgPill: JODOCO_BRAND_RULES.colors.primary,
        },
      }));
      updated = {
        ...updated,
        reelProject: { ...updated.reelProject, scenes },
      };
      break;
    }

    case 'fix_duration': {
      let currentOffset = 0;
      const scenes = updated.reelProject.scenes.map((s) => {
        const dur = Math.min(Math.max(s.endTime - s.startTime, 2.5), 8.0);
        const start = currentOffset;
        const end = currentOffset + dur;
        currentOffset = end;
        return {
          ...s,
          startTime: start,
          endTime: end,
        };
      });
      updated = {
        ...updated,
        reelProject: {
          ...updated.reelProject,
          duration: currentOffset,
          scenes,
        },
      };
      break;
    }

    case 'unbind_rejected_asset': {
      const rejectedIds = new Set(
        updated.assets.filter((a) => a.status === 'rejected').map((a) => a.id)
      );

      const scenes = updated.reelProject.scenes.map((s) => {
        const vidId = s.videoAssetId;
        const visId = s.visualAssetId;
        return {
          ...s,
          videoAssetId: vidId && rejectedIds.has(vidId) ? undefined : vidId,
          visualAssetId: visId && rejectedIds.has(visId) ? undefined : visId,
          videoUrl: vidId && rejectedIds.has(vidId) ? undefined : s.videoUrl,
        };
      });

      const slides = updated.carouselProject.slides.map((s) => {
        const visId = s.visualAssetId;
        return {
          ...s,
          visualAssetId: visId && rejectedIds.has(visId) ? undefined : visId,
          visualUrl: visId && rejectedIds.has(visId) ? undefined : s.visualUrl,
        };
      });

      updated = {
        ...updated,
        reelProject: { ...updated.reelProject, scenes },
        carouselProject: { ...updated.carouselProject, slides },
      };
      break;
    }

    case 'add_missing_cta': {
      if (targetCheck.targetMedium === 'reel') {
        const lastScene = updated.reelProject.scenes[updated.reelProject.scenes.length - 1];
        if (lastScene) {
          const scenes = updated.reelProject.scenes.map((s, idx) => {
            if (idx === updated.reelProject.scenes.length - 1) {
              return {
                ...s,
                visuals: {
                  ...s.visuals,
                  ctaButton: {
                    text: 'Save for Later • Follow @JodoCo',
                    subtext: 'Tap link in bio for full playbook',
                  },
                },
              };
            }
            return s;
          });
          updated = {
            ...updated,
            reelProject: { ...updated.reelProject, scenes },
          };
        }
      } else if (targetCheck.targetMedium === 'carousel') {
        const lastSlide = updated.carouselProject.slides[updated.carouselProject.slides.length - 1];
        if (lastSlide) {
          const slides = updated.carouselProject.slides.map((s, idx) => {
            if (idx === updated.carouselProject.slides.length - 1) {
              return {
                ...s,
                ctaText: 'Save this carousel & follow @JodoCo for daily frameworks',
                ctaSubtext: 'Drop a comment if you want the PDF summary',
              };
            }
            return s;
          });
          updated = {
            ...updated,
            carouselProject: { ...updated.carouselProject, slides },
          };
        }
      }
      break;
    }

    default:
      break;
  }

  updated.updatedAt = new Date().toISOString();
  return updated;
}

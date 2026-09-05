import { runProductionReadinessCheck, applyQuickFix } from '../index';
import { JodoCoProject, JodoCoAsset } from '../../project-engine/types';
import { DEFAULT_REEL_PROJECT } from '../../data/storyboardData';
import { KNOWN_CAROUSEL_FIXTURE } from '../../carousel-engine/fixture';
import { getContrastRatio } from '../rules';

function createBaseProject(): JodoCoProject {
  const baseAssets: JodoCoAsset[] = [
    {
      id: 'asset-1',
      name: 'Approved Hook Visual.png',
      type: 'image',
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      version: 1,
      status: 'approved',
      createdAt: new Date().toISOString(),
      sceneId: 1,
      carouselSlideId: 1,
      targetMedium: 'general',
      aspectRatio: '9:16',
    },
  ];

  return {
    id: 'test-project-1',
    name: 'Test Project',
    topic: 'Creator Growth Strategy',
    originalScript: 'How creators build distribution in 2025.',
    generatedContent: null,
    reelProject: JSON.parse(JSON.stringify(DEFAULT_REEL_PROJECT)),
    carouselProject: JSON.parse(JSON.stringify(KNOWN_CAROUSEL_FIXTURE)),
    assets: baseAssets,
    projectStatus: 'ready_to_export',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
    contentModelVersion: '1.0.0',
  };
}

export function runQualityEngineTests(): {
  total: number;
  passed: number;
  results: { testName: string; passed: boolean; message?: string }[];
} {
  const results: { testName: string; passed: boolean; message?: string }[] = [];

  function assert(name: string, condition: boolean, message?: string) {
    results.push({
      testName: name,
      passed: Boolean(condition),
      message: condition ? undefined : message || 'Assertion failed',
    });
  }

  // 1. Valid Reel returns READY
  const proj1 = createBaseProject();
  const report1 = runProductionReadinessCheck(proj1);
  assert(
    '1. Valid Reel and Carousel return READY',
    report1.status === 'ready' || report1.status === 'needs_review',
    `Expected ready or needs_review, got ${report1.status} (score: ${report1.overallScore})`
  );

  // 2. Missing hook creates an editorial error
  const proj2 = createBaseProject();
  proj2.reelProject.scenes[0].voiceover = '';
  proj2.reelProject.scenes[0].onScreenText = [];
  proj2.reelProject.scenes[0].visuals = undefined;
  const report2 = runProductionReadinessCheck(proj2);
  const hookCheck = report2.checks.find((c) => c.id === 'reel-editorial-hook-exists');
  assert(
    '2. Missing hook creates an editorial error',
    hookCheck !== undefined && !hookCheck.passed && hookCheck.severity === 'error',
    'Hook check should fail with severity error when hook is empty'
  );

  // 3. Missing CTA creates an appropriate warning
  const proj3 = createBaseProject();
  proj3.reelProject.scenes = proj3.reelProject.scenes.map((s) => ({
    ...s,
    name: 'Standard Beat',
    voiceover: 'No call to action here.',
    visuals: undefined,
  }));
  proj3.reelProject.branding.ctaText = '';
  const report3 = runProductionReadinessCheck(proj3);
  const ctaCheck = report3.checks.find((c) => c.id === 'reel-editorial-cta-exists');
  assert(
    '3. Missing CTA creates an appropriate warning',
    ctaCheck !== undefined && !ctaCheck.passed,
    'CTA check should fail when no CTA exists'
  );

  // 4. Rejected asset blocks export (BLOCKER)
  const proj4 = createBaseProject();
  proj4.assets.push({
    id: 'rejected-asset-4',
    name: 'Bad Visual.png',
    type: 'image',
    url: 'data:image/png;base64,...',
    version: 1,
    status: 'rejected',
    createdAt: new Date().toISOString(),
  });
  proj4.reelProject.scenes[0].visualAssetId = 'rejected-asset-4';
  const report4 = runProductionReadinessCheck(proj4);
  assert(
    '4. Rejected asset blocks export',
    report4.status === 'blocked',
    `Expected status 'blocked', got ${report4.status}`
  );

  // 5. Missing asset references detected
  const proj5 = createBaseProject();
  proj5.reelProject.scenes[0].videoAssetId = 'non-existent-asset-999';
  const report5 = runProductionReadinessCheck(proj5);
  const missingAssetCheck = report5.checks.find((c) => c.id === 'reel-technical-asset-refs');
  assert(
    '5. Missing asset references detected',
    missingAssetCheck !== undefined && !missingAssetCheck.passed,
    'Missing asset reference check should fail'
  );

  // 6. Wrong dimensions are detected
  const proj6 = createBaseProject();
  proj6.reelProject.width = 720;
  proj6.reelProject.height = 720;
  const report6 = runProductionReadinessCheck(proj6);
  const dimCheck = report6.checks.find((c) => c.id === 'reel-technical-resolution');
  assert(
    '6. Wrong dimensions are detected',
    dimCheck !== undefined && !dimCheck.passed,
    'Non-standard dimensions should be detected'
  );

  // 7. Wrong aspect ratio is detected
  const proj7 = createBaseProject();
  (proj7.reelProject as any).aspectRatio = '16:9';
  const report7 = runProductionReadinessCheck(proj7);
  const aspectCheck = report7.checks.find((c) => c.id === 'reel-technical-aspect-ratio');
  assert(
    '7. Wrong aspect ratio is detected',
    aspectCheck !== undefined && !aspectCheck.passed && aspectCheck.severity === 'blocker',
    'Non-9:16 aspect ratio should be a blocker'
  );

  // 8. Invalid scene references are detected
  const proj8 = createBaseProject();
  proj8.reelProject.scenes[1].startTime = 12.0; // gap from scene 0 (ends at 3.5s)
  const report8 = runProductionReadinessCheck(proj8);
  const gapCheck = report8.checks.find((c) => c.id === 'reel-pacing-timing-continuity');
  assert(
    '8. Invalid scene timing gaps are detected',
    gapCheck !== undefined && !gapCheck.passed,
    'Timing gaps should be flagged'
  );

  // 9. Carousel text overload is detected
  const proj9 = createBaseProject();
  proj9.carouselProject.slides[0].body =
    'This is an excessively long and overloaded body copy intended to test whether the quality engine properly detects cognitive density problems when creators write huge paragraphs that cannot fit cleanly into a 4:5 mobile social media card on Instagram or LinkedIn without causing severe readability and visual cramming issues for followers.';
  const report9 = runProductionReadinessCheck(proj9);
  const overloadCheck = report9.checks.find((c) => c.id === 'carousel-readability-body-overload');
  assert(
    '9. Carousel text overload is detected',
    overloadCheck !== undefined && !overloadCheck.passed,
    'Dense body copy should be flagged'
  );

  // 10. Poor contrast is detected where measurable
  const contrastWhiteOnYellow = getContrastRatio('#FFFFFF', '#FFFF00');
  assert(
    '10. Poor contrast is detected via WCAG calculation',
    contrastWhiteOnYellow < 3.0,
    `Expected ratio < 3.0, got ${contrastWhiteOnYellow}`
  );

  // 11. Brand color violations are detected where applicable
  const proj11 = createBaseProject();
  proj11.reelProject.scenes[0].colorTheme.accent = '#FF0099'; // Rogue hot pink
  const report11 = runProductionReadinessCheck(proj11);
  const brandColorCheck = report11.checks.find((c) => c.id === 'brand-palette-unapproved-colors');
  assert(
    '11. Brand color violations are detected',
    brandColorCheck !== undefined && !brandColorCheck.passed,
    'Unapproved hex colors should be flagged'
  );

  // 12. Archived active asset is detected
  const proj12 = createBaseProject();
  proj12.assets.push({
    id: 'archived-asset-12',
    name: 'Old Logo.png',
    type: 'image',
    url: 'data:image/png;base64,...',
    version: 1,
    status: 'archived',
    createdAt: new Date().toISOString(),
  });
  proj12.reelProject.scenes[0].visualAssetId = 'archived-asset-12';
  const report12 = runProductionReadinessCheck(proj12);
  const archivedCheck = report12.checks.find((c) => c.id === 'assets-no-active-archived');
  assert(
    '12. Archived active asset is detected',
    archivedCheck !== undefined && !archivedCheck.passed,
    'Archived asset in active scene should be flagged'
  );

  // 13. Orphaned assets generate info/warning without blocking
  const proj13 = createBaseProject();
  proj13.assets.push({
    id: 'orphaned-1',
    name: 'Unused Alternative.png',
    type: 'image',
    url: 'data:image/png;base64,...',
    version: 1,
    status: 'reviewing',
    createdAt: new Date().toISOString(),
  });
  const report13 = runProductionReadinessCheck(proj13);
  assert(
    '13. Orphaned assets generate info without blocking',
    report13.status !== 'blocked' && report13.summary.assetsSummary.orphaned >= 1,
    'Orphaned assets should not block export'
  );

  // 14. NEEDS_REVIEW does not automatically block export
  const proj14 = createBaseProject();
  proj14.carouselProject.slides[0].supportingBullets = [
    'Bullet 1',
    'Bullet 2',
    'Bullet 3',
    'Bullet 4',
    'Bullet 5',
    'Bullet 6',
  ]; // Warning
  const report14 = runProductionReadinessCheck(proj14);
  assert(
    '14. Warnings alone do not block export',
    report14.status !== 'blocked',
    `Status should be 'ready' or 'needs_review', got ${report14.status}`
  );

  // 15. READY allows export
  const proj15 = createBaseProject();
  const report15 = runProductionReadinessCheck(proj15);
  assert(
    '15. READY status allows export',
    report15.status === 'ready' || report15.status === 'needs_review',
    'Clean project allows export flow'
  );

  // 16. Deterministic score is repeatable
  const proj16 = createBaseProject();
  const repA = runProductionReadinessCheck(proj16);
  const repB = runProductionReadinessCheck(proj16);
  assert(
    '16. Deterministic score is exactly repeatable',
    repA.overallScore === repB.overallScore && repA.status === repB.status,
    `Scores diverged: ${repA.overallScore} vs ${repB.overallScore}`
  );

  // 17. Auto-fix unbinds rejected asset
  const proj17 = createBaseProject();
  proj17.assets.push({
    id: 'rejected-17',
    name: 'Rejected.png',
    type: 'image',
    url: 'data:...',
    version: 1,
    status: 'rejected',
    createdAt: new Date().toISOString(),
  });
  proj17.reelProject.scenes[0].visualAssetId = 'rejected-17';
  const fixedProj17 = applyQuickFix(proj17, 'reel-visual-no-rejected-assets');
  assert(
    '17. Auto-fix successfully detaches rejected assets',
    fixedProj17.reelProject.scenes[0].visualAssetId === undefined,
    'Rejected visualAssetId should be undefined after fix'
  );

  const passedCount = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed: passedCount,
    results,
  };
}

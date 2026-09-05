import { ReelProject, SceneInfo } from '../types';
import { JodoCoAsset } from '../project-engine/types';
import { QualityCheck } from './types';
import { QUALITY_THRESHOLDS } from './rules';

export function runReelQualityChecks(
  project: ReelProject,
  assets: JodoCoAsset[] = []
): QualityCheck[] {
  const checks: QualityCheck[] = [];
  const scenes = project.scenes || [];
  const { reel: thresh } = QUALITY_THRESHOLDS;

  // ==========================================
  // 1. EDITORIAL CHECKS
  // ==========================================

  // Check 1.1: Hook scene exists
  const hookScene = scenes.find(
    (s, idx) => idx === 0 || s.name.toLowerCase().includes('hook') || s.id === 1
  );
  const hookExists = !!hookScene && (!!hookScene.voiceover || (hookScene.onScreenText && hookScene.onScreenText.length > 0) || !!hookScene.visuals?.headline?.fullText);
  checks.push({
    id: 'reel-editorial-hook-exists',
    category: 'editorial',
    severity: 'error',
    passed: hookExists,
    title: 'Reel Hook Scene',
    message: hookExists
      ? `Hook scene "${hookScene?.name || 'Scene 1'}" starts the video strongly.`
      : 'No clear Hook scene found in the first scene of the Reel storyboard.',
    recommendation: 'Add a high-impact Hook in Scene 1 to capture viewer attention in the first 3 seconds.',
    whyItMatters: 'Short-form videos lose over 60% of viewers in the first 3 seconds without a clear hook.',
    targetMedium: 'reel',
    targetId: hookScene?.id || 1,
  });

  // Check 1.2: Hook length
  if (hookScene) {
    const hookText =
      hookScene.visuals?.headline?.fullText ||
      hookScene.onScreenText?.join(' ') ||
      hookScene.voiceover ||
      '';
    const hookLengthValid = hookText.length <= thresh.maxHookChars;
    checks.push({
      id: 'reel-editorial-hook-length',
      category: 'editorial',
      severity: 'warning',
      passed: hookLengthValid,
      title: 'Hook Conciseness',
      message: hookLengthValid
        ? `Hook is concise (${hookText.length} characters).`
        : `Hook text is too lengthy (${hookText.length} characters, limit is ${thresh.maxHookChars}).`,
      recommendation: 'Trim the hook to under 12 words so it can be spoken and read within 3.5 seconds.',
      whyItMatters: 'Overly complex hooks dilute punchiness and overwhelm mobile viewers.',
      targetMedium: 'reel',
      targetId: hookScene.id,
      autoFixable: !hookLengthValid,
      autoFixType: 'trim_headline',
      autoFixDescription: 'Trim hook headline to under 80 characters.',
    });
  }

  // Check 1.3: CTA exists
  const ctaScene = scenes.find(
    (s) =>
      s.name.toLowerCase().includes('cta') ||
      !!s.visuals?.ctaButton?.text ||
      s.voiceover.toLowerCase().includes('follow') ||
      s.voiceover.toLowerCase().includes('check out') ||
      s.voiceover.toLowerCase().includes('save') ||
      s.voiceover.toLowerCase().includes('subscribe') ||
      s.voiceover.toLowerCase().includes('link in bio') ||
      s.voiceover.toLowerCase().includes('share')
  );
  const hasCta = !!ctaScene && (!!ctaScene.visuals?.ctaButton?.text || (!!project.branding?.ctaText && project.branding.ctaText.trim().length > 0) || /(follow|save|subscribe|link|share|comment|check out)/i.test(ctaScene.voiceover));
  checks.push({
    id: 'reel-editorial-cta-exists',
    category: 'editorial',
    severity: 'warning',
    passed: hasCta,
    title: 'Call to Action (CTA)',
    message: hasCta
      ? `Clear CTA present in scene "${ctaScene?.name || 'Final Scene'}".`
      : 'Missing a clear Call to Action in the final scene.',
    recommendation: 'Add an actionable CTA (e.g. "Save for later", "Follow for Part 2", or "Link in bio") in the outro scene.',
    whyItMatters: 'A defined CTA increases viewer conversion and comment engagement.',
    targetMedium: 'reel',
    targetId: ctaScene?.id || scenes[scenes.length - 1]?.id,
    autoFixable: !hasCta,
    autoFixType: 'add_missing_cta',
    autoFixDescription: 'Add default JodoCo CTA button to the final scene.',
  });

  // Check 1.4: Narrative progression & scene count
  const sceneCountValid = scenes.length >= thresh.minScenes && scenes.length <= thresh.maxScenes;
  checks.push({
    id: 'reel-editorial-scene-count',
    category: 'editorial',
    severity: 'warning',
    passed: sceneCountValid,
    title: 'Storyboard Beat Structure',
    message: sceneCountValid
      ? `Storyboard has ${scenes.length} structured beats (target: ${thresh.minScenes}–${thresh.maxScenes}).`
      : `Storyboard has ${scenes.length} scenes. Optimal short-form structure is 4–7 beats.`,
    recommendation: 'Maintain between 4 and 7 distinct visual beats to preserve narrative momentum.',
    whyItMatters: 'Too few beats feels static; too many causes cognitive fatigue.',
    targetMedium: 'reel',
  });

  // Check 1.5: No empty scene copy
  const emptyScenes = scenes.filter(
    (s) => !s.voiceover?.trim() && (!s.onScreenText || s.onScreenText.length === 0) && !s.visuals?.headline?.fullText
  );
  checks.push({
    id: 'reel-editorial-empty-scenes',
    category: 'editorial',
    severity: 'error',
    passed: emptyScenes.length === 0,
    title: 'Scene Copy Completeness',
    message:
      emptyScenes.length === 0
        ? 'All scenes contain valid narration and on-screen text copy.'
        : `Found ${emptyScenes.length} scene(s) with empty copy (Scene ${emptyScenes.map((s) => s.id).join(', ')}).`,
    recommendation: 'Add voiceover narration or on-screen text headlines to all storyboard scenes.',
    whyItMatters: 'Empty scenes result in visual dead-air and break viewer immersion.',
    targetMedium: 'reel',
  });

  // ==========================================
  // 2. PACING & TIMING CHECKS
  // ==========================================

  // Check 2.1: Total duration
  const totalDuration = project.duration || scenes.reduce((acc, s) => acc + (s.endTime - s.startTime), 0);
  const durationValid = totalDuration >= thresh.minDuration && totalDuration <= thresh.maxDuration;
  checks.push({
    id: 'reel-pacing-total-duration',
    category: 'technical',
    severity: 'warning',
    passed: durationValid,
    title: 'Total Reel Duration',
    message: durationValid
      ? `Total duration is ${totalDuration.toFixed(1)}s (within optimal ${thresh.minDuration}s–${thresh.maxDuration}s window).`
      : `Total duration is ${totalDuration.toFixed(1)}s. Recommended short-form duration is 15s–45s.`,
    recommendation: 'Keep short-form vertical reels between 15 and 45 seconds for peak algorithm distribution.',
    whyItMatters: 'Reels over 60s suffer severe completion rate drops on Instagram and TikTok.',
    targetMedium: 'reel',
  });

  // Check 2.2: Scene durations
  const invalidDurationScenes = scenes.filter((s) => {
    const dur = s.endTime - s.startTime;
    return dur < thresh.minSceneDuration || dur > thresh.maxSceneDuration;
  });
  checks.push({
    id: 'reel-pacing-scene-durations',
    category: 'technical',
    severity: 'error',
    passed: invalidDurationScenes.length === 0,
    title: 'Individual Scene Pacing',
    message:
      invalidDurationScenes.length === 0
        ? 'All scenes have balanced durations (1.5s–10.0s per beat).'
        : `Scene(s) ${invalidDurationScenes.map((s) => `Scene ${s.id} (${(s.endTime - s.startTime).toFixed(1)}s)`).join(', ')} have extreme durations.`,
    recommendation: 'Ensure each scene duration is between 2.0s and 8.0s to maintain visual rhythm.',
    whyItMatters: 'Scenes under 1.5s flash by unread; scenes over 10s feel frozen and cause viewers to swipe away.',
    targetMedium: 'reel',
    autoFixable: invalidDurationScenes.length > 0,
    autoFixType: 'fix_duration',
    autoFixDescription: 'Normalize scene start and end times sequentially.',
  });

  // Check 2.3: Continuous timing (no gaps or overlaps)
  let timingGaps = 0;
  for (let i = 1; i < scenes.length; i++) {
    const prev = scenes[i - 1];
    const curr = scenes[i];
    if (Math.abs(curr.startTime - prev.endTime) > 0.05) {
      timingGaps++;
    }
  }
  checks.push({
    id: 'reel-pacing-timing-continuity',
    category: 'technical',
    severity: 'error',
    passed: timingGaps === 0,
    title: 'Timeline Continuity',
    message:
      timingGaps === 0
        ? 'Timeline is seamless with continuous scene transitions.'
        : `Detected ${timingGaps} timing gap(s) or overlap(s) between adjacent scenes.`,
    recommendation: 'Align scene start timestamps directly to the previous scene end timestamps.',
    whyItMatters: 'Timing gaps cause black frame flashes or jump cuts during playback and FFmpeg export.',
    targetMedium: 'reel',
    autoFixable: timingGaps > 0,
    autoFixType: 'fix_duration',
    autoFixDescription: 'Re-sync all scene boundaries sequentially.',
  });

  // ==========================================
  // 3. VISUAL INTELLIGENCE & ASSETS CHECKS
  // ==========================================

  // Check 3.1: Active rejected assets (BLOCKER)
  const rejectedActiveAssets = scenes
    .map((scene) => {
      const assetId = scene.videoAssetId || scene.visualAssetId;
      if (!assetId) return null;
      const found = assets.find((a) => a.id === assetId);
      if (found && found.status === 'rejected') {
        return { scene, asset: found };
      }
      return null;
    })
    .filter(Boolean) as { scene: SceneInfo; asset: JodoCoAsset }[];

  checks.push({
    id: 'reel-visual-no-rejected-assets',
    category: 'assets',
    severity: 'blocker',
    passed: rejectedActiveAssets.length === 0,
    title: 'No Rejected Assets in Storyboard',
    message:
      rejectedActiveAssets.length === 0
        ? 'No rejected assets are linked to active storyboard scenes.'
        : `Scene(s) ${rejectedActiveAssets.map((r) => `Scene ${r.scene.id} ("${r.asset.name}")`).join(', ')} reference REJECTED assets.`,
    recommendation: 'Approve or replace rejected assets in the Asset Library before proceeding to export.',
    whyItMatters: 'Rejected assets are marked as unsuitable for production and must never be published.',
    targetMedium: 'reel',
    autoFixable: rejectedActiveAssets.length > 0,
    autoFixType: 'unbind_rejected_asset',
    autoFixDescription: 'Detach rejected assets from affected scenes.',
  });

  // Check 3.2: Visual decisions match attached media
  const unmatchedVisualDecisions = scenes.filter((s) => {
    if (s.visualDecision === 'ai_video') {
      const hasAsset = !!s.videoAssetId || !!s.visualAssetId || !!s.videoUrl;
      const hasPrompt = !!s.visualPrompt;
      return !hasAsset && !hasPrompt;
    }
    return false;
  });

  checks.push({
    id: 'reel-visual-decision-alignment',
    category: 'visual',
    severity: 'warning',
    passed: unmatchedVisualDecisions.length === 0,
    title: 'Visual Decision Fulfillment',
    message:
      unmatchedVisualDecisions.length === 0
        ? 'All AI visual decisions have corresponding prompts or attached video assets.'
        : `Scene(s) ${unmatchedVisualDecisions.map((s) => s.id).join(', ')} request AI video but have no prompt or asset configured.`,
    recommendation: 'Generate an AI video visual in the Veo Studio or specify a visual prompt.',
    whyItMatters: 'Scenes configured for AI video fallback to generic rendering if not specified.',
    targetMedium: 'reel',
  });

  // Check 3.3: Visual density / cognitive overload
  const overloadedScenes = scenes.filter((s) => {
    const cardsCount = s.visuals?.cards?.length || 0;
    const phasesCount = s.visuals?.phases?.length || 0;
    const textLines = (s.onScreenText?.length || 0) + (s.visuals?.kineticLines?.length || 0);
    return cardsCount > 4 || phasesCount > 4 || textLines > 6;
  });

  checks.push({
    id: 'reel-visual-cognitive-density',
    category: 'visual',
    severity: 'info',
    passed: overloadedScenes.length === 0,
    title: 'Scene Visual Density',
    message:
      overloadedScenes.length === 0
        ? 'Visual element density is balanced across all scenes.'
        : `Scene(s) ${overloadedScenes.map((s) => s.id).join(', ')} contain high element density for short-form mobile viewing.`,
    recommendation: 'Limit each scene to at most 3 visual cards or 4 bullet lines to avoid cluttering mobile screens.',
    whyItMatters: 'Mobile users have split-second processing windows; cleaner layouts retain higher attention.',
    targetMedium: 'reel',
  });

  // ==========================================
  // 4. TECHNICAL SPECIFICATION CHECKS
  // ==========================================

  // Check 4.1: Aspect ratio 9:16
  const aspectRatioValid = project.aspectRatio === '9:16';
  checks.push({
    id: 'reel-technical-aspect-ratio',
    category: 'technical',
    severity: 'blocker',
    passed: aspectRatioValid,
    title: '9:16 Vertical Aspect Ratio',
    message: aspectRatioValid
      ? 'Target format is 9:16 vertical video (standard for IG Reels, TikTok, YouTube Shorts).'
      : `Invalid aspect ratio "${project.aspectRatio}". Must be 9:16 vertical video.`,
    recommendation: 'Configure canvas to standard 9:16 vertical dimensions (1080×1920).',
    whyItMatters: 'Non-standard aspect ratios cause letterboxing, pillarboxing, or platform rejection.',
    targetMedium: 'reel',
  });

  // Check 4.2: Export dimensions (1080x1920)
  const dimensionsValid = (project.width === 1080 && project.height === 1920) || (!project.width && !project.height);
  checks.push({
    id: 'reel-technical-resolution',
    category: 'technical',
    severity: 'error',
    passed: dimensionsValid,
    title: '1080×1920 Full HD Master Resolution',
    message: dimensionsValid
      ? 'Canvas resolution is configured for 1080×1920 Full HD master export.'
      : `Canvas resolution is ${project.width}×${project.height}. Expected 1080×1920.`,
    recommendation: 'Set canvas resolution to 1080×1920 pixels.',
    whyItMatters: 'Full HD 1080×1920 delivers maximum sharpness across Retina mobile screens.',
    targetMedium: 'reel',
  });

  // Check 4.3: Valid asset references exist in project vault
  const missingAssetRefs = scenes
    .map((s) => {
      const assetId = s.videoAssetId || s.visualAssetId;
      if (!assetId) return null;
      const found = assets.find((a) => a.id === assetId);
      if (!found) {
        return { sceneId: s.id, assetId };
      }
      return null;
    })
    .filter(Boolean) as { sceneId: number; assetId: string }[];

  checks.push({
    id: 'reel-technical-asset-refs',
    category: 'assets',
    severity: 'error',
    passed: missingAssetRefs.length === 0,
    title: 'Asset Reference Integrity',
    message:
      missingAssetRefs.length === 0
        ? 'All linked video assets exist in the Project Asset Library.'
        : `Found ${missingAssetRefs.length} scene(s) referencing missing asset IDs: ${missingAssetRefs.map((m) => `Scene ${m.sceneId} -> ${m.assetId}`).join(', ')}.`,
    recommendation: 'Re-attach or regenerate the asset in the Veo Studio or Asset Library.',
    whyItMatters: 'Broken asset references cause render errors during video compilation.',
    targetMedium: 'reel',
  });

  return checks;
}

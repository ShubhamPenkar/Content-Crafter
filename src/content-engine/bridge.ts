import { JodoCoGeneratedContent, GeneratedReelScene } from './types';
import { ReelProject, SceneInfo } from '../types';
import { CANVAS_SPEC, BRANDING_SPEC, AUDIO_CONFIG_SPEC } from '../data/defaultReelSpec';
import { SCENES_DATA } from '../data/storyboardData';

/**
 * JODOCO CONTENT ENGINE BRIDGE
 * 
 * Bridges the structured AI Content Engine output (JodoCoGeneratedContent)
 * into:
 * 1. ReelProject (for ReelPlayer & Python FFmpeg MP4 Exporter)
 * 2. SceneInfo array (7-beat sequential narrative)
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates that a ReelProject contains the required structure for ReelPlayer and the exporter
 */
export function validateReelProject(project: ReelProject): ValidationResult {
  const errors: string[] = [];

  if (!project.title || !project.title.trim()) {
    errors.push('Reel project is missing a title.');
  }

  if (!project.scenes || project.scenes.length === 0) {
    errors.push('Reel project contains no scenes.');
    return { valid: false, errors };
  }

  let expectedStart = 0;
  project.scenes.forEach((scene, index) => {
    if (scene.id < 1 || scene.id > 7) {
      errors.push(`Scene index ${index} has invalid ID ${scene.id}. Must be 1 to 7.`);
    }

    if (typeof scene.startTime !== 'number' || typeof scene.endTime !== 'number') {
      errors.push(`Scene ${scene.id} has invalid timing values.`);
    } else if (scene.endTime <= scene.startTime) {
      errors.push(`Scene ${scene.id} has endTime (${scene.endTime}) <= startTime (${scene.startTime}).`);
    }

    if (!scene.voiceover || !scene.voiceover.trim()) {
      errors.push(`Scene ${scene.id} is missing a voiceover script.`);
    }

    if (!scene.onScreenText || scene.onScreenText.length === 0) {
      errors.push(`Scene ${scene.id} is missing on-screen text.`);
    }
  });

  if (project.duration <= 0) {
    errors.push('Reel project total duration must be greater than 0.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Deterministically normalizes an array of generated scenes into exactly 7 beats
 * for the JodoCo visual system:
 * Beat 1: Hook (Scene1Hook)
 * Beat 2: Brand Dilemma (Scene2Brand)
 * Beat 3: Creator Solution (Scene3Creator)
 * Beat 4: Content Flywheel (Scene4Content)
 * Beat 5: Both Sides Win (Scene5BothSidesWin)
 * Beat 6: JodoCo Matchmaking (Scene6JodoCo)
 * Beat 7: Final CTA Frame (Scene7FinalFrame)
 */
function normalizeToSevenBeats(rawScenes: GeneratedReelScene[]): GeneratedReelScene[] {
  if (rawScenes.length === 7) {
    return rawScenes.map((s, idx) => ({ ...s, sceneIndex: idx + 1 }));
  }

  // If fewer than 7 scenes, fill remaining beats from the default template
  if (rawScenes.length < 7) {
    const result: GeneratedReelScene[] = [];
    for (let i = 1; i <= 7; i++) {
      const existing = rawScenes.find((s) => s.sceneIndex === i) || rawScenes[i - 1];
      if (existing) {
        result.push({ ...existing, sceneIndex: i });
      } else {
        // Fallback to default storyboard scene
        const defaultScene = SCENES_DATA[i - 1];
        result.push({
          sceneIndex: i,
          sceneType: (defaultScene?.id === 1 ? 'hook' : defaultScene?.id === 7 ? 'final_cta' : 'problem') as any,
          templateMapping: `Scene${i}` as any,
          targetDuration: defaultScene ? defaultScene.endTime - defaultScene.startTime : 3.5,
          voiceoverScript: defaultScene?.voiceover || 'Let us Jodo.',
          voiceoverStartOffset: 0.1,
          recommendedSfx: [{ type: 'pop', timeOffset: 0.1 }],
          headline: {
            mainText: defaultScene?.onScreenText?.[0] || 'JodoCo Partnership',
            subText: defaultScene?.onScreenText?.[1] || '',
          },
          categoryBadge: defaultScene?.subtitle,
          contentPayload: {},
          visualMetadata: {
            sceneType: 'hook',
            templateMapping: 'Scene1Hook',
            visualConcept: defaultScene?.keyVisual || 'JodoCo branded scene',
            shotType: 'centered_hero',
            motionStyle: 'snappy_spring',
            transitionType: 'spring_wipe',
            accentColor: '#FF8C73',
          },
        });
      }
    }
    return result;
  }

  // If more than 7 scenes: keep Hook (1), CTA (last), and evenly sample intermediate beats
  const firstScene = { ...rawScenes[0], sceneIndex: 1 };
  const lastScene = { ...rawScenes[rawScenes.length - 1], sceneIndex: 7 };
  const middleRaw = rawScenes.slice(1, rawScenes.length - 1);

  const selectedMiddle: GeneratedReelScene[] = [];
  const step = middleRaw.length / 5;
  for (let i = 0; i < 5; i++) {
    const pickIndex = Math.min(Math.floor(i * step), middleRaw.length - 1);
    selectedMiddle.push({
      ...middleRaw[pickIndex],
      sceneIndex: i + 2,
    });
  }

  return [firstScene, ...selectedMiddle, lastScene];
}

/**
 * Transforms a GeneratedReelScene into a runtime SceneInfo consumable by
 * ReelPlayer.tsx, Scene1Hook..Scene7FinalFrame, and generate_mp4.py
 */
export function mapGeneratedSceneToRuntimeScene(
  genScene: GeneratedReelScene,
  calculatedStartTime: number,
  beatIndex: number
): SceneInfo {
  const endTime = Number((calculatedStartTime + genScene.targetDuration).toFixed(2));

  // Build onScreenText array from headline & subtext
  const onScreenText: string[] = [];
  if (genScene.headline.mainText) {
    onScreenText.push(genScene.headline.mainText);
  }
  if (genScene.headline.subText) {
    onScreenText.push(genScene.headline.subText);
  }
  if (genScene.explainerPill) {
    onScreenText.push(genScene.explainerPill);
  }

  // Kinetic phrases fallback for Scene 6
  if (beatIndex === 6 && genScene.contentPayload.kineticPhrases) {
    genScene.contentPayload.kineticPhrases.forEach((phrase) => {
      if (!onScreenText.includes(phrase)) {
        onScreenText.push(phrase);
      }
    });
  }

  return {
    id: beatIndex, // 1 to 7 matching the 7 visual scene renderers
    name: `Scene ${beatIndex}: ${genScene.headline.mainText}`,
    subtitle: `${calculatedStartTime.toFixed(1)}–${endTime.toFixed(1)}s`,
    startTime: calculatedStartTime,
    endTime: endTime,
    voiceover: genScene.voiceoverScript,
    onScreenText: onScreenText.length > 0 ? onScreenText : [genScene.headline.mainText],
    keyVisual: genScene.visualMetadata.visualConcept,
    colorTheme: {
      accent: genScene.visualMetadata.accentColor || '#FF8C73',
      secondary: genScene.visualMetadata.secondaryColor || '#B8A7EA',
      bgPill: '#FAF7F2',
    },
    // Phase 9 AI Visual Intelligence metadata
    visualDecision: genScene.visualMetadata.visualDecision || 'static_graphic',
    visualPriority: genScene.visualMetadata.visualPriority || 'medium',
    visualReason: genScene.visualMetadata.visualReason || genScene.visualMetadata.visualConcept,
    visualPrompt: genScene.visualMetadata.visualPrompt || genScene.visualMetadata.aiVideoPrompt,
    visualContinuity: genScene.visualMetadata.visualContinuity,

    visuals: {
      topBadge: genScene.categoryBadge
        ? {
            text: genScene.categoryBadge,
            icon: 'sparkles',
            color: '#0F172A',
            bgColor: 'rgba(255, 255, 255, 0.9)',
          }
        : undefined,
      headline: {
        fullText: genScene.headline.mainText,
        line1: genScene.headline.mainText,
        line2: genScene.headline.subText,
        highlightWord: genScene.headline.highlightWords?.[0],
        highlightColor: genScene.visualMetadata.accentColor || '#FF8C73',
      },
      explainerPill: genScene.explainerPill
        ? {
            text: genScene.explainerPill,
            icon: 'zap',
            accentColor: genScene.visualMetadata.accentColor || '#8FE3C0',
          }
        : undefined,
      cards: genScene.contentPayload.cards?.map((c) => ({
        id: c.id,
        title: c.title,
        subtitle: c.subtitle,
        badge: c.badge,
        icon: c.icon,
        price: c.price,
        metrics: c.metrics,
        bullets: c.bullets,
        accentColor: genScene.visualMetadata.accentColor || '#FF8C73',
      })),
      phases: genScene.contentPayload.phases?.map((p) => ({
        id: p.id,
        threshold: p.threshold,
        label: p.label,
        tag: p.tag,
        accentColor: genScene.visualMetadata.accentColor || '#B8A7EA',
      })),
      kineticLines: genScene.contentPayload.kineticPhrases,
      ctaButton: genScene.contentPayload.ctaAction
        ? {
            text: genScene.contentPayload.ctaAction.primaryText,
            subtext: genScene.contentPayload.ctaAction.subText,
            url: genScene.contentPayload.ctaAction.targetUrl || BRANDING_SPEC.websiteUrl,
          }
        : undefined,
    },
    audioSpec: {
      voiceoverText: genScene.voiceoverScript,
      voiceoverStartOffset: genScene.voiceoverStartOffset || 0.1,
      sfxCues: (genScene.recommendedSfx || []).map((s) => ({
        type: s.type,
        timeOffset: s.timeOffset,
      })),
    },
  };
}

/**
 * Transforms full JodoCoGeneratedContent into a complete, validated ReelProject
 * ready for instant preview in ReelPlayer and export via Python FFmpeg.
 */
export function mapGeneratedContentToReelProject(
  content: JodoCoGeneratedContent
): ReelProject {
  if (!content || !content.coreReel || !content.coreReel.scenes) {
    throw new Error('Invalid JodoCoGeneratedContent: missing coreReel.scenes');
  }

  // Normalize into exactly 7 sequential beats
  const normalizedScenes = normalizeToSevenBeats(content.coreReel.scenes);

  let currentTime = 0;
  const runtimeScenes: SceneInfo[] = [];

  normalizedScenes.forEach((scene, idx) => {
    const beatIndex = idx + 1;
    const runtimeScene = mapGeneratedSceneToRuntimeScene(scene, currentTime, beatIndex);
    runtimeScenes.push(runtimeScene);
    currentTime = runtimeScene.endTime;
  });

  const totalDuration = Number(currentTime.toFixed(2));

  // Determine updated branding from Scene 7 CTA if present
  const finalScene = normalizedScenes[normalizedScenes.length - 1];
  const ctaAction = finalScene?.contentPayload?.ctaAction;

  const project: ReelProject = {
    id: `jodoco-reel-${Date.now()}`,
    title: content.coreReel.title || `${content.metadata.topic} — JodoCo Core Reel`,
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    fps: 30,
    duration: totalDuration,
    canvas: {
      ...CANVAS_SPEC,
      duration: totalDuration,
    },
    scenes: runtimeScenes,
    branding: {
      ...BRANDING_SPEC,
      ctaText: ctaAction?.primaryText || BRANDING_SPEC.ctaText,
      websiteUrl: ctaAction?.targetUrl || BRANDING_SPEC.websiteUrl,
    },
    audio: {
      ...AUDIO_CONFIG_SPEC,
    },
    version: 1,
  };

  const validation = validateReelProject(project);
  if (!validation.valid) {
    console.warn('ReelProject validation warnings:', validation.errors);
  }

  return project;
}

import { z } from 'zod';

/**
 * JODOCO CONTENT ENGINE - TYPE DEFINITIONS & SCHEMAS
 * 
 * Separates structured intellectual content (Topic + Script -> Reel + Carousel)
 * from direct visual rendering engines.
 */

// ==========================================
// 1. BRAND VOICE & EDITORIAL RULES TYPES
// ==========================================

export interface BrandVoiceConfig {
  personality: string[];
  tone: string[];
  levelOfExpertise: string[];
  conversationalStyle: string;
  sentenceStyle: {
    maxWordsPerSentence: number;
    preferredVoice: 'active' | 'passive' | 'conversational';
    rhythmGuide: string;
  };
  vocabulary: {
    preferredWords: string[];
    powerPhrases: string[];
    phrasesToAvoid: string[];
    bannedWords: string[];
  };
  genericAILanguageToAvoid: string[];
  writingPrinciples: string[];
}

export interface HookCategoryRule {
  category:
    | 'curiosity'
    | 'contradiction'
    | 'unexpected_insight'
    | 'strong_opinion'
    | 'problem_recognition'
    | 'pattern_interrupt'
    | 'data_statistic'
    | 'story_led';
  displayName: string;
  whenToUse: string;
  whatMakesItEffective: string;
  examples: string[];
  antiExamples: string[];
}

export interface ReelBeatRule {
  beatIndex: number;
  beatName: string;
  sceneTemplate: SceneTemplate;
  purpose: string;
  editorialGoal: string;
  recommendedDuration: number;
  voiceoverStyle: string;
  onScreenFocus: string;
}

export interface ReelPacingRulesConfig {
  idealTotalDurationSeconds: number;
  minTotalDurationSeconds: number;
  maxTotalDurationSeconds: number;
  sceneCount: number;
  sceneDurationRange: { min: number; max: number };
  informationDensity: 'concise' | 'balanced' | 'dense';
  copyChangeTriggers: string[];
  voiceoverLengthGuidelines: {
    hookScene: string;
    bodyScenes: string;
    ctaScene: string;
  };
  visualInterruptionFrequency: string;
  whenNotToAddScene: string[];
}

export interface OnScreenCopyRulesConfig {
  headlines: {
    maxWords: number;
    guidelines: string[];
  };
  subheads: {
    maxWords: number;
    guidelines: string[];
  };
  kineticText: {
    maxWordsPerPhrase: number;
    guidelines: string[];
  };
  bullets: {
    maxItems: number;
    maxWordsPerItem: number;
    guidelines: string[];
  };
  statistics: {
    format: string;
    guidelines: string[];
  };
  ctaCopy: {
    primaryText: string;
    subText: string;
    guidelines: string[];
  };
  copyToAvoid: string[];
}

export interface CarouselSlideRule {
  slideIndex: number;
  role: 'hook' | 'problem_setup' | 'core_value' | 'step_detail' | 'summary' | 'cta';
  purpose: string;
  mustAccomplish: string;
  recommendedHeaderWords: number;
  recommendedBodyWords: number;
  recommendedBullets: number;
}

export interface CarouselRulesConfig {
  idealSlideCount: number;
  minSlideCount: number;
  maxSlideCount: number;
  slide1HookPrinciples: string[];
  informationStructure: string;
  slideHierarchy: CarouselSlideRule[];
  copyLength: {
    maxHeadlineWords: number;
    maxBodyWordsPerSlide: number;
    maxBulletPointsPerSlide: number;
  };
  ctaPrinciples: string[];
  visualPrinciples?: {
    corePhilosophy: string;
    aspectRatio: string;
    safeZoneRule: string;
    slideDecisions: Record<string, string>;
    decisionGuidelines: string[];
  };
}

export interface ContentQualityRulesConfig {
  fidelityRequirements: string[];
  antiAIFillerPrinciples: string[];
  hookUniquenessCriteria: string[];
  specificityEnforcement: string[];
  logicalProgressionChecks: string[];
  sourceFidelityRules: string[];
}

export interface ContentTransformationRulesConfig {
  corePhilosophy: string;
  reelPriorities: string[];
  carouselPriorities: string[];
  formatDistinction: string;
}

export interface VisualThinkingRulesConfig {
  principles: string[];
  shotTypes: string[];
  motionStyles: string[];
  transitionTypes: string[];
  aiFootageRecommendations: string[];
  editorialVisualPrinciples: {
    hook: string;
    problem: string;
    insight: string;
    example: string;
    framework: string;
    outcome: string;
    cta: string;
    whenToAvoidAIVideo: string[];
  };
}

export interface AntiGenericAIRulesConfig {
  bannedTropes: string[];
  prohibitedOpeningPhrases: string[];
  buzzwordsToAvoid: string[];
  exceptionCondition: string;
}

export interface QualityEvaluationRulesConfig {
  checklist: string[];
  internalMetrics: Array<{
    metric: string;
    scale: string;
    passThreshold: number;
    description: string;
  }>;
}

export interface JodoCoEditorialSystemV1 {
  version: string;
  brandVoice: BrandVoiceConfig;
  hookSystem: {
    categories: HookCategoryRule[];
    defaultPreferenceNote: string;
  };
  reelStorytellingSystem: {
    sevenBeatStructure: ReelBeatRule[];
  };
  reelPacing: ReelPacingRulesConfig;
  onScreenCopy: OnScreenCopyRulesConfig;
  carouselSystem: CarouselRulesConfig;
  contentQuality: ContentQualityRulesConfig;
  contentTransformation: ContentTransformationRulesConfig;
  visualThinking: VisualThinkingRulesConfig;
  antiGenericAI: AntiGenericAIRulesConfig;
  qualityEvaluation: QualityEvaluationRulesConfig;
  userPreferenceNotes: string[];
}

// Backward-compatibility alias
export type JodoCoContentRules = JodoCoEditorialSystemV1;

// ==========================================
// 2. STRUCTURED CONTENT OUTPUT SCHEMAS (ZOD)
// ==========================================

export const SceneTypeEnum = z.enum([
  'hook',
  'problem',
  'solution_creator',
  'content_flywheel',
  'both_sides_win',
  'problem_fit',
  'bridge_jodoco',
  'final_cta',
  'stat_callout',
  'comparison_split',
  'step_walkthrough',
  'quote_testimonial',
]);
export type SceneType = z.infer<typeof SceneTypeEnum>;

export const SceneTemplateEnum = z.enum([
  'Scene1Hook',
  'Scene2Brand',
  'Scene3Creator',
  'Scene4Content',
  'Scene5BothSidesWin',
  'Scene6JodoCo',
  'Scene7FinalFrame',
]);
export type SceneTemplate = z.infer<typeof SceneTemplateEnum>;

export const MotionStyleEnum = z.enum([
  'snappy_spring',
  'smooth_linear',
  'kinetic_pop',
  'pulsing_glow',
  'calm_float',
]);
export type MotionStyle = z.infer<typeof MotionStyleEnum>;

export const TransitionTypeEnum = z.enum([
  'cut',
  'spring_wipe',
  'fade',
  'card_slide_left',
  'card_slide_up',
  'zoom_in',
]);
export type TransitionType = z.infer<typeof TransitionTypeEnum>;

export const ShotTypeEnum = z.enum([
  'graphic_focus',
  'split_screen',
  'centered_hero',
  'card_stack',
  'kinetic_text',
  'logo_lockup',
]);
export type ShotType = z.infer<typeof ShotTypeEnum>;

// Visual Intelligence Enums and Schemas (Phase 9)
export const VisualDecisionEnum = z.enum([
  'ai_video',
  'static_graphic',
  'text_only',
  'b_roll',
  'none',
]);
export type VisualDecision = z.infer<typeof VisualDecisionEnum>;

export const VisualPriorityEnum = z.enum([
  'high',
  'medium',
  'low',
]);
export type VisualPriority = z.infer<typeof VisualPriorityEnum>;

export const VisualContinuitySchema = z.object({
  aesthetic: z.string().optional().describe('Consistent aesthetic style descriptor, e.g. cinematic D2C editorial'),
  colorMood: z.string().optional().describe('Color temperature and palette harmony description'),
  lighting: z.string().optional().describe('Lighting style continuity, e.g. soft diffuse daylight'),
  cameraLanguage: z.string().optional().describe('Camera angle, lens feel, and movement style'),
  continuityNotes: z.string().optional().describe('Specific continuity guidance across consecutive scenes'),
});
export type VisualContinuity = z.infer<typeof VisualContinuitySchema>;

export const VisualDirectionSchema = z.object({
  aesthetic: z.string().default('Modern Creator Editorial & D2C Studio').describe('Global project visual aesthetic'),
  colorMood: z.string().default('Warm peach (#FF8C73), lavender (#B8A7EA), mint (#8FE3C0) accents on clean off-white canvas').describe('Harmonized project color palette'),
  lighting: z.string().default('Soft diffuse daylight with subtle warm studio rim lights').describe('Global lighting language'),
  cameraLanguage: z.string().default('Vertical 9:16 framing, grounded cinematic lens, clean center-weighted composition').describe('Global camera framing guidelines'),
  realismLevel: z.string().default('Photorealistic high-fidelity commercial production').describe('Level of realism'),
  continuityNotes: z.string().default('Maintain consistent lighting and color temperature across all scenes; leave upper and lower safe areas clear for typography overlays').describe('General continuity guidance'),
});
export type VisualDirection = z.infer<typeof VisualDirectionSchema>;

// Visual Content Metadata recommended by Content Engine
export const VisualMetadataSchema = z.object({
  sceneType: SceneTypeEnum,
  templateMapping: SceneTemplateEnum,
  visualConcept: z.string().describe('Conceptual description of visual element/composition'),
  shotType: ShotTypeEnum,
  motionStyle: MotionStyleEnum,
  transitionType: TransitionTypeEnum,
  accentColor: z.string().regex(/^#([0-9a-fA-F]{6})$/).optional(),
  secondaryColor: z.string().regex(/^#([0-9a-fA-F]{6})$/).optional(),
  
  // Phase 9 AI Visual Intelligence:
  visualDecision: VisualDecisionEnum.default('static_graphic').optional().describe('Editorial decision on whether this scene needs AI video, static graphic, text, or b-roll'),
  visualPriority: VisualPriorityEnum.default('medium').optional().describe('Priority level for generating AI visual asset'),
  visualReason: z.string().optional().describe('Short explanation of why this visual format was chosen for the story beat'),
  visualPrompt: z.string().optional().describe('Production-ready prompt for Veo when visualDecision is ai_video or b_roll'),
  visualContinuity: VisualContinuitySchema.optional().describe('Continuity specifications to keep scene visuals consistent across the project'),
  
  // Backward compatibility alias
  aiVideoPrompt: z.string().optional().describe('Structured prompt for generative video or b-roll'),
});
export type VisualMetadata = z.infer<typeof VisualMetadataSchema>;

// Individual structured scene generated for Core Reel
export const GeneratedReelSceneSchema = z.object({
  sceneIndex: z.number().int().min(1).max(12),
  sceneType: SceneTypeEnum,
  templateMapping: SceneTemplateEnum,
  targetDuration: z.number().min(1.0).max(15.0),
  
  // Voiceover & Audio Copy
  voiceoverScript: z.string().min(1),
  voiceoverStartOffset: z.number().min(0).default(0.1),
  recommendedSfx: z.array(
    z.object({
      type: z.enum(['whoosh', 'chime', 'pop', 'rise', 'drop', 'tap']),
      timeOffset: z.number().min(0),
    })
  ).default([]),

  // Structured On-Screen Typography
  headline: z.object({
    mainText: z.string().min(1),
    subText: z.string().optional(),
    highlightWords: z.array(z.string()).optional(),
  }),
  categoryBadge: z.string().optional(),
  explainerPill: z.string().optional(),

  // Dynamic Content Payload (Flexible Cards / Lists / Metrics)
  contentPayload: z.object({
    cards: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        subtitle: z.string().optional(),
        badge: z.string().optional(),
        price: z.string().optional(),
        icon: z.string().optional(),
        metrics: z.array(z.string()).optional(),
        bullets: z.array(z.object({
          title: z.string(),
          subtitle: z.string().optional(),
          icon: z.string().optional(),
        })).optional(),
      })
    ).optional(),
    phases: z.array(
      z.object({
        id: z.number(),
        label: z.string(),
        tag: z.string().optional(),
        threshold: z.number().min(0).max(1),
      })
    ).optional(),
    kineticPhrases: z.array(z.string()).optional(),
    ctaAction: z.object({
      primaryText: z.string(),
      subText: z.string().optional(),
      targetUrl: z.string().optional(),
    }).optional(),
  }),

  // Visual Directives
  visualMetadata: VisualMetadataSchema,
});
export type GeneratedReelScene = z.infer<typeof GeneratedReelSceneSchema>;

// Carousel Visual Intelligence Enums and Schemas (Phase 11)
export const CarouselVisualDecisionEnum = z.enum([
  'ai_image',
  'ai_video',
  'static_graphic',
  'diagram',
  'ui_mockup',
  'text_only',
  'none',
]);
export type CarouselVisualDecision = z.infer<typeof CarouselVisualDecisionEnum>;

export const CarouselVisualPriorityEnum = z.enum([
  'high',
  'medium',
  'low',
]);
export type CarouselVisualPriority = z.infer<typeof CarouselVisualPriorityEnum>;

// Individual structured slide generated for Carousel
export const GeneratedCarouselSlideSchema = z.object({
  slideNumber: z.number().int().min(1).max(15),
  role: z.enum(['hook', 'problem_setup', 'core_value', 'step_detail', 'summary', 'cta']),
  headline: z.string().min(1),
  subHeadline: z.string().optional(),
  bodyCopy: z.string().optional(),
  bulletPoints: z.array(z.string()).optional(),
  calloutBadge: z.string().optional(),
  cardVisual: z.object({
    concept: z.string(),
    icon: z.string().optional(),
    badgeTag: z.string().optional(),
    metricHighlight: z.string().optional(),
  }).optional(),
  footerCta: z.string().optional(),

  // Phase 11 Carousel Visual Intelligence
  visualDecision: CarouselVisualDecisionEnum.default('text_only').optional().describe('Editorial decision on whether this slide needs AI image, AI video, static graphic, diagram, UI mockup, or text only'),
  visualPriority: CarouselVisualPriorityEnum.default('medium').optional().describe('Priority level for generating visual asset'),
  visualReason: z.string().optional().describe('Short explanation of why this visual treatment improves the slide'),
  visualPrompt: z.string().optional().describe('Production-ready 4:5 prompt when an AI visual is appropriate'),
  visualContinuity: z.string().optional().describe('Notes for maintaining aesthetic consistency across the carousel'),
});
export type GeneratedCarouselSlide = z.infer<typeof GeneratedCarouselSlideSchema>;

// Structured Quality Evaluation Schema
export const QualityEvaluationSchema = z.object({
  hookSpecificityScore: z.number().min(1).max(10).describe('Score 1-10 on hook specificity and tension'),
  informationProgressionScore: z.number().min(1).max(10).describe('Score 1-10 on sequential information novelty'),
  sourceFidelityScore: z.number().min(1).max(10).describe('Score 1-10 on faithfulness to input script'),
  humanVoiceScore: z.number().min(1).max(10).describe('Score 1-10 on natural human conversational rhythm'),
  earnedCtaScore: z.number().min(1).max(10).describe('Score 1-10 on CTA earned logic without forcing'),
  antiAiPassed: z.boolean().describe('Whether all generic AI tropes and buzzwords were avoided'),
  editorialNotes: z.string().optional().describe('Brief 1-2 sentence evaluation summary'),
});
export type QualityEvaluation = z.infer<typeof QualityEvaluationSchema>;

// Complete JodoCo Content Engine Output Schema
export const JodoCoGeneratedContentSchema = z.object({
  metadata: z.object({
    topic: z.string().min(1),
    originalScriptSummary: z.string(),
    targetAudience: z.string(),
    generatedAt: z.string().default(() => new Date().toISOString()),
    contentModelVersion: z.string().default('1.0.0'),
    editorialVersion: z.string().default('1.0'),
  }),

  // Deliverable 1: Core Reel Structure (maps directly to ReelSpec)
  coreReel: z.object({
    title: z.string().min(1),
    hookStrategy: z.string(),
    totalEstimatedDuration: z.number().min(5).max(60),
    scenes: z.array(GeneratedReelSceneSchema).min(3).max(10),
  }),

  // Deliverable 2: JodoCo Carousel Structure
  carousel: z.object({
    title: z.string().min(1),
    hookAngle: z.string(),
    totalSlides: z.number().min(3).max(10),
    slides: z.array(GeneratedCarouselSlideSchema).min(3).max(10),
  }),

  // Project-Level Visual Direction (Phase 9)
  visualDirection: VisualDirectionSchema.optional(),

  // Optional Structured Quality Audit
  qualityEvaluation: QualityEvaluationSchema.optional(),
});
export type JodoCoGeneratedContent = z.infer<typeof JodoCoGeneratedContentSchema>;

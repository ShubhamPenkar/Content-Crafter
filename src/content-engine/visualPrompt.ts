import { SceneInfo } from '../types';
import {
  GeneratedReelScene,
  VisualDecision,
  VisualPriority,
  VisualDirection,
  VisualContinuity,
} from './types';

/**
 * ============================================================================
 * JODOCO VISUAL PROMPT GENERATOR & VISUAL INTELLIGENCE UTILITY (Phase 9)
 * ============================================================================
 * 
 * Authoritative prompt crafting engine for Google Veo (9:16 vertical video).
 * Produces structured, photorealistic, cinematic prompt specifications
 * adhering strictly to the JodoCo editorial visual guidelines:
 * 
 * Structure:
 * - SUBJECT
 * - ENVIRONMENT
 * - ACTION
 * - CAMERA
 * - COMPOSITION (Vertical 9:16, safe overlay zones for text)
 * - LIGHTING
 * - MOOD & RHYTHM
 * - CONSTRAINTS (No text, no logos, no watermarks, no distorted artifacts)
 */

export interface PromptGenerationOptions {
  scene: GeneratedReelScene | SceneInfo;
  direction?: VisualDirection;
  topic?: string;
  customStyleModifier?: string;
}

export interface PromptValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedPrompt?: string;
}

/**
 * Default Project-Level Visual Direction
 */
export function getDefaultVisualDirection(topic?: string): VisualDirection {
  const isSaaSOrTech = topic && /tech|software|saas|ai|platform|data/i.test(topic);
  const isConsumerOrD2C = topic && /d2c|brand|skincare|fashion|product|commerce|wellness/i.test(topic);

  if (isSaaSOrTech) {
    return {
      aesthetic: 'Modern Tech & Digital Creator Ecosystem',
      colorMood: 'Deep navy (#1A2B48) and lavender (#B8A7EA) ambient glow with crisp mint (#8FE3C0) accents',
      lighting: 'Clean high-contrast tech studio lighting with soft specular highlights',
      cameraLanguage: 'Vertical 9:16 framing, slow cinematic tracking and smooth subtle zooms',
      realismLevel: 'High-end commercial cinematic realism',
      continuityNotes: 'Focus on sleek modern workspaces, high-res digital devices, and calm professional focus.',
    };
  }

  if (isConsumerOrD2C) {
    return {
      aesthetic: 'Clean D2C Product & Creator Studio Editorial',
      colorMood: 'Warm peach (#FF8C73), soft cream (#FAF7F2), and pastel lavender (#B8A7EA) harmony',
      lighting: 'Sun-drenched soft natural window light with subtle warm fill',
      cameraLanguage: 'Vertical 9:16 macro and medium portrait framing, authentic handheld motion',
      realismLevel: 'Warm documentary photorealism with premium commercial beauty grading',
      continuityNotes: 'Maintain warm color temperature and organic lifestyle textures across all scenes.',
    };
  }

  return {
    aesthetic: 'Modern Creator Editorial & D2C Studio',
    colorMood: 'Warm peach (#FF8C73), lavender (#B8A7EA), mint (#8FE3C0) accents on clean off-white canvas',
    lighting: 'Soft diffuse daylight with subtle warm studio rim lights',
    cameraLanguage: 'Vertical 9:16 framing, grounded cinematic lens, clean center-weighted composition',
    realismLevel: 'Photorealistic high-fidelity commercial production',
    continuityNotes: 'Maintain consistent lighting and color temperature; leave upper and lower safe areas clear for typography overlays.',
  };
}

/**
 * Editorial decision engine: determines whether a scene should use AI video,
 * static graphics, or typography based on the story beat and narrative goals.
 */
export function determineEditorialVisualDecision(
  sceneIndex: number,
  sceneType?: string,
  voiceover?: string,
  headline?: string
): {
  decision: VisualDecision;
  priority: VisualPriority;
  reason: string;
} {
  switch (sceneIndex) {
    case 1:
      // Hook: High visual disruption to break feed scroll
      return {
        decision: 'ai_video',
        priority: 'high',
        reason:
          'Hook requires immediate thumb-stopping visual interruption: relatable human creator in action to break passive feed scrolling within the first 2 seconds.',
      };

    case 2:
      // Problem: Real-world pain point or dilemma
      return {
        decision: 'ai_video',
        priority: 'medium',
        reason:
          'Real-world environment showing cold advertising fatigue and frustrated brand outreach grounds the emotional problem viscerally.',
      };

    case 3:
      // Solution / Creator: Charismatic human storyteller
      return {
        decision: 'ai_video',
        priority: 'high',
        reason:
          'Authentic creator storytelling creates instant human rapport and empathy, highlighting organic trust over transactional ads.',
      };

    case 4:
      // Content Flywheel: Step-by-step or behind-the-scenes
      return {
        decision: 'b_roll',
        priority: 'medium',
        reason:
          'Dynamic behind-the-scenes creator filming b-roll emphasizes authentic content production momentum.',
      };

    case 5:
      // Both Sides Win / Framework: Structured symmetry
      return {
        decision: 'static_graphic',
        priority: 'low',
        reason:
          'Split-screen graphic diagram and balanced card layout convey symmetric win-win mechanics clearer than AI video without visual clutter.',
      };

    case 6:
      // Matchmaking Bridge: Agency connection mechanism
      return {
        decision: 'static_graphic',
        priority: 'medium',
        reason:
          'Structured animated UI node graph cleanly communicates the matchmaking bridge mechanism between brand requirements and creator voice.',
      };

    case 7:
    default:
      // CTA / Final Frame: Signature brand mark & action
      return {
        decision: 'static_graphic',
        priority: 'low',
        reason:
          'Signature brand logo lockup and typography CTA take full prominence; background video avoided to maximize readability and conversion.',
      };
  }
}

/**
 * Generates a production-ready Veo prompt from scene metadata, project visual direction,
 * and campaign topic.
 */
export function buildProductionVeoPrompt(options: PromptGenerationOptions): string {
  const { scene, topic, direction = getDefaultVisualDirection(topic), customStyleModifier } = options;

  const sceneId = 'id' in scene ? scene.id : scene.sceneIndex;
  const headlineText = 'headline' in scene 
    ? (typeof scene.headline === 'string' ? scene.headline : scene.headline?.mainText)
    : (scene.onScreenText?.[0] || scene.name);
  const voiceoverText = 'voiceoverScript' in scene ? scene.voiceoverScript : scene.voiceover;
  const keyVisualText = 'keyVisual' in scene ? scene.keyVisual : scene.visualMetadata?.visualConcept;

  // Scene-specific beat narrative subject guidance
  let subjectAndAction = '';
  let compositionGuidance = 'Vertical 9:16 composition, central subject framing with clear top and bottom safe margins for on-screen typography';

  switch (sceneId) {
    case 1:
      subjectAndAction =
        'A charismatic young content creator standing in a modern sunlit studio, casually checking smartphone analytics while holding a sleek product prototype, authentic joyful expression';
      break;
    case 2:
      subjectAndAction =
        'A modern marketing team reviewing skipped banner advertisements and declining engagement charts in an open-concept creative loft, frustrated yet determined atmosphere';
      break;
    case 3:
      subjectAndAction =
        'A genuine digital creator filming an authentic vertical video recommendation on a smartphone tripod with soft ring light illumination, high-trust warm eye contact';
      break;
    case 4:
      subjectAndAction =
        'Dynamic over-the-shoulder view of high-energy content creation in a sunlit creator space, filming unboxing moments with natural organic gestures';
      break;
    case 5:
      subjectAndAction =
        'Warm collaborative studio setting where an innovative brand founder and an authentic digital creator review creative briefs together on a modern tablet, mutual respect and shared success';
      break;
    case 6:
      subjectAndAction =
        'A vibrant collaborative networking hub with creative directors and verified storytellers connecting in an architectural open atrium with soft ambient pastel lighting';
      break;
    case 7:
    default:
      subjectAndAction =
        'An elegant minimalist creative agency workspace at golden hour, warm glowing light across Scandinavian design desks, forward momentum and inspiring modern production aesthetic';
      break;
  }

  // Combine elements into cohesive, high-density Veo production prompt
  const parts: string[] = [];

  // 1. Framing & Subject
  parts.push(
    `Vertical 9:16 cinematic shot of ${subjectAndAction}`
  );

  // 2. Scene Concept Context
  if (keyVisualText && keyVisualText.length > 5) {
    parts.push(`Scene theme: ${keyVisualText}`);
  }

  // 3. Campaign & Narrative Theme
  if (topic && topic.trim()) {
    parts.push(`Campaign theme: ${topic.trim()}`);
  }

  // 4. Lighting & Environment
  parts.push(
    `Lighting: ${direction.lighting}`
  );

  // 5. Aesthetic & Palette
  parts.push(
    `Aesthetic: ${direction.aesthetic}, warm pastel tones including soft peach and lavender accents on clean neutral canvas`
  );

  // 6. Camera Language & Motion
  parts.push(
    `Camera: ${direction.cameraLanguage}, smooth subtle motion, shallow depth of field with soft bokeh background`
  );

  // 7. Composition & Safe Area Enforcement
  parts.push(
    `${compositionGuidance}`
  );

  // 8. Custom modifier if supplied
  if (customStyleModifier) {
    parts.push(customStyleModifier);
  }

  // 9. Negative Constraints (Crucial for clean editorial overlay rendering)
  parts.push(
    'No on-screen text, no logos, no watermarks, no artificial UI borders, photorealistic 4K cinematic clarity, seamless fluid motion'
  );

  return parts.join('. ') + '.';
}

/**
 * Validates a visual generation request before submitting to Veo or Mock generation.
 */
export function validateVisualGenerationRequest(request: {
  prompt?: string;
  sceneId?: number;
  startTime?: number;
  endTime?: number;
  visualDecision?: string;
  topic?: string;
}): PromptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const { prompt, sceneId, startTime, endTime, visualDecision, topic } = request;

  // 1. Prompt existence & length
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    errors.push('Generation prompt is missing or empty.');
  } else if (prompt.trim().length < 15) {
    errors.push('Generation prompt is too short (minimum 15 characters required for quality generation).');
  }

  // 2. Scene ID validation
  if (typeof sceneId !== 'number' || sceneId < 1 || sceneId > 12) {
    errors.push(`Invalid scene ID (${sceneId}). Must be between 1 and 12.`);
  }

  // 3. Timing validation (if provided)
  if (startTime !== undefined && endTime !== undefined) {
    if (endTime <= startTime) {
      errors.push(`Scene endTime (${endTime}s) must be greater than startTime (${startTime}s).`);
    }
  }

  // 4. Accidental text / logo instructions detection
  if (prompt) {
    const textLogoRegex = /\b(add text|write title|show words|display font|put logo|with text overlay|render text)\b/i;
    if (textLogoRegex.test(prompt)) {
      warnings.push(
        'Prompt requests text/logos inside video. Veo often generates garbled text; on-screen typography is already handled by the ReelPlayer graphics layer.'
      );
    }

    const missing916Regex = /\b(9:16|vertical)\b/i;
    if (!missing916Regex.test(prompt)) {
      warnings.push('Prompt does not explicitly specify 9:16 vertical aspect ratio.');
    }
  }

  // 5. Visual decision alignment check
  if (visualDecision && visualDecision === 'text_only') {
    warnings.push('This scene was marked as "text_only" by the Content Engine. Generating AI video may distract from core copy.');
  } else if (visualDecision && visualDecision === 'none') {
    warnings.push('This scene was marked with visualDecision="none".');
  }

  // 6. Topic presence
  if (!topic || !topic.trim()) {
    warnings.push('No project topic provided; generation will use general creator marketing styling.');
  }

  // Sanitize prompt
  let sanitizedPrompt = prompt?.trim() || '';
  if (sanitizedPrompt && !/\bno (distorted )?text\b/i.test(sanitizedPrompt)) {
    sanitizedPrompt += ' No on-screen text, no logos, photorealistic 9:16 vertical video.';
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitizedPrompt,
  };
}

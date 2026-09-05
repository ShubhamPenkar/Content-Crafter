import {
  CarouselSlide,
  CarouselVisualDecision,
  CarouselVisualPriority,
} from '../carousel-engine/types';
import {
  GeneratedCarouselSlide,
  VisualDirection,
} from './types';
import { getDefaultVisualDirection } from './visualPrompt';

/**
 * ============================================================================
 * JODOCO CAROUSEL VISUAL PROMPT GENERATOR (Phase 11)
 * ============================================================================
 *
 * Dedicated prompt crafting engine for 4:5 (1080x1350) Carousel Visuals.
 * Adheres strictly to the JodoCo editorial visual guidelines:
 *
 * Structure:
 * - SUBJECT & METAPHOR
 * - ENVIRONMENT
 * - COMPOSITION (Vertical 4:5, clean negative space for typography overlay)
 * - LIGHTING & PALETTE
 * - MOOD & REALISM
 * - CONSTRAINTS (NO on-screen text, NO logos, NO watermarks, NO cluttered typography zones)
 */

export interface CarouselPromptOptions {
  slide: GeneratedCarouselSlide | CarouselSlide;
  direction?: VisualDirection;
  topic?: string;
  customStyleModifier?: string;
}

export interface CarouselPromptValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedPrompt?: string;
}

/**
 * Editorial decision engine for Carousel Slides:
 * Assigns thoughtful visual intelligence to each slide role.
 */
export function determineCarouselEditorialVisualDecision(
  role: string,
  slideNumber: number,
  headline?: string,
  body?: string
): {
  decision: CarouselVisualDecision;
  priority: CarouselVisualPriority;
  reason: string;
  prompt: string;
  continuity: string;
} {
  const cleanRole = role.toLowerCase();

  switch (cleanRole) {
    case 'hook':
      return {
        decision: 'ai_image',
        priority: 'high',
        reason:
          'Hook slide requires strong thumb-stopping visual intrigue: relatable human creator or high-contrast editorial scene to draw LinkedIn/Instagram readers into swiping.',
        prompt:
          'Vertical 4:5 photographic editorial portrait of a charismatic digital creator in a sunlit modern creative studio, authentic confident expression, soft natural rim lighting, warm peach (#FF8C73) and cream background tones, generous top and bottom negative space for clean typography overlay. High-end commercial editorial realism. Strictly no text, no captions, no logos.',
        continuity:
          'Warm studio atmosphere, natural light from left, peach and neutral cream palette.',
      };

    case 'problem_setup':
    case 'problem_tension':
      return {
        decision: 'ai_image',
        priority: 'medium',
        reason:
          'Relatable real-world scene highlighting digital noise and ad fatigue grounds the reader in the shared marketing frustration.',
        prompt:
          'Vertical 4:5 cinematic documentary shot of an authentic marketing professional at a minimal wooden desk looking thoughtfully at a laptop screen in a modern architectural loft, soft diffuse window light, muted navy (#1A2B48) and lavender (#B8A7EA) ambient lighting, clean composition with lower half safe zone for text. Photorealistic realism, no on-screen text or logos.',
        continuity:
          'Maintain clean modern architectural aesthetic with muted tones and generous negative space.',
      };

    case 'core_value':
    case 'insight':
      return {
        decision: 'diagram',
        priority: 'low',
        reason:
          'Strategic insight is best communicated through a structured visual diagram or metric card rather than distracting photography, maximizing immediate comprehension.',
        prompt:
          'Minimalist editorial 4:5 visual card background with soft ambient pastel gradients (#B8A7EA and #8FE3C0), subtle geometric grid accents, ample open space in center and lower thirds for high-contrast bulleted copy. No text in background image.',
        continuity:
          'Soft lavender and mint pastel palette matching project theme.',
      };

    case 'step_detail':
    case 'example_evidence':
    case 'framework_takeaway':
      return {
        decision: 'ui_mockup',
        priority: 'medium',
        reason:
          'A structured framework or step-by-step flywheel benefits from a sleek editorial UI/card hierarchy that readers immediately bookmark as a tactical reference.',
        prompt:
          'Vertical 4:5 high-concept editorial still life of creator tools: sleek smartphone on a minimal marble block, soft pastel studio daylight, warm peach and mint ambient reflections, balanced composition with left-aligned open area for step-by-step reading. Photorealistic macro studio photography, no text.',
        continuity:
          'Keep studio textures crisp, matte, and consistent with the project palette.',
      };

    case 'summary':
    case 'outcome_shift':
      return {
        decision: 'static_graphic',
        priority: 'low',
        reason:
          'Symmetric growth payoff is clearest when presented as clean typography with balanced win-win comparison elements.',
        prompt:
          'Vertical 4:5 ambient abstract gradient canvas featuring smooth undulating waves of warm peach (#FF8C73) and fresh mint (#8FE3C0) blending softly into deep charcoal, high-contrast negative space for headline and summary cards. Minimalist, modern, no text.',
        continuity:
          'Harmonious blend of primary brand accents (#FF8C73, #8FE3C0).',
      };

    case 'cta':
      return {
        decision: 'text_only',
        priority: 'low',
        reason:
          'Final CTA requires zero visual distraction to focus 100% of reader attention on the agency next step and website URL.',
        prompt:
          'Vertical 4:5 clean minimalist brand canvas in deep navy (#1A2B48) with subtle warm glowing radial gradient at bottom, ample clear space for bold signature typography and website badge. No text in background.',
        continuity:
          'Dark navy brand anchor finish.',
      };

    default:
      return {
        decision: 'text_only',
        priority: 'low',
        reason:
          'Clear typography and structured card hierarchy communicate this slide with maximum readability.',
        prompt:
          'Vertical 4:5 clean editorial textured canvas with subtle warm ambient glow, designed specifically as an uncluttered background for high-contrast typography.',
        continuity: 'Matches project visual direction.',
      };
  }
}

/**
 * Builds a production-ready 4:5 vertical prompt for carousel visual generation
 */
export function buildCarouselVisualPrompt(options: CarouselPromptOptions): string {
  const { slide, topic, customStyleModifier } = options;
  const direction = options.direction || getDefaultVisualDirection(topic);

  const headline = 'headline' in slide ? slide.headline : '';
  const role = 'role' in slide ? slide.role : ('template' in slide ? slide.template : 'insight');
  const slideNum = 'slideNumber' in slide ? slide.slideNumber : 1;

  // If slide already has a verified visualPrompt, prioritize it unless regenerating
  if (slide.visualPrompt && slide.visualPrompt.trim().length > 30) {
    return slide.visualPrompt.trim();
  }

  // Derive intelligent defaults based on slide role and topic
  const defaults = determineCarouselEditorialVisualDecision(role, slideNum, headline);

  // Synthesize prompt components
  const promptParts: string[] = [
    `Vertical 4:5 ratio (1080x1350) editorial visual.`,
    `Aesthetic: ${direction.aesthetic}.`,
    `Color Palette & Mood: ${direction.colorMood}.`,
    `Lighting: ${direction.lighting}.`,
    `Realism: ${direction.realismLevel}.`,
  ];

  if (defaults.prompt) {
    promptParts.push(`Subject & Scene: ${defaults.prompt}`);
  }

  if (topic) {
    promptParts.push(`Context: Professional creator marketing and brand partnerships around "${topic}".`);
  }

  if (customStyleModifier) {
    promptParts.push(`Style Modifier: ${customStyleModifier}.`);
  }

  // Mandatory negative space and text constraint enforcement
  promptParts.push(
    `Composition: Vertical 4:5 aspect ratio, clean center/lower negative space reserved for typography overlays.`
  );
  promptParts.push(
    `Strict Constraints: NO on-screen text, NO letters, NO numbers, NO watermarks, NO UI text baked into the image, NO cluttered backgrounds, photorealistic high resolution.`
  );

  return promptParts.join(' ');
}

/**
 * Validates a Carousel visual prompt for production compliance
 */
export function validateCarouselVisualPrompt(prompt: string): CarouselPromptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!prompt || !prompt.trim()) {
    return {
      valid: false,
      errors: ['Prompt cannot be empty.'],
      warnings: [],
    };
  }

  const cleanPrompt = prompt.trim();

  if (cleanPrompt.length < 20) {
    warnings.push('Prompt is very short. Provide more scene and lighting details for optimal quality.');
  }

  // Check for forbidden text generation prompts
  if (/write|spell|render the words|display text|with text saying/i.test(cleanPrompt)) {
    warnings.push(
      'Prompt appears to request text inside the image. JodoCo guidelines require text to be rendered via HTML overlays, not baked into AI imagery.'
    );
  }

  // Ensure 4:5 or vertical framing is mentioned
  if (!/4:5|vertical|portrait|1080x1350/i.test(cleanPrompt)) {
    warnings.push('Explicit 4:5 vertical framing is recommended for carousel slide visuals.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitizedPrompt: cleanPrompt,
  };
}

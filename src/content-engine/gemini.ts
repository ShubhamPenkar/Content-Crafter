import { GoogleGenAI } from '@google/genai';
import {
  JODOCO_EDITORIAL_SYSTEM_V1,
  JODOCO_EDITORIAL_VERSION,
  JODOCO_HOOK_CATEGORIES,
  JODOCO_REEL_SEVEN_BEATS,
  JODOCO_CAROUSEL_SLIDE_RULES,
} from './rules';
import { JodoCoGeneratedContent, JodoCoGeneratedContentSchema } from './types';
import { getDefaultVisualDirection } from './visualPrompt';

/**
 * Server-side Gemini Content Generation Engine
 * Produces structured JodoCo Reel and Carousel content powered by JODOCO_EDITORIAL_SYSTEM_V1.
 */

export interface GenerateContentOptions {
  topic: string;
  rawScript: string;
  isTestMode?: boolean;
}

export interface GenerateContentResult {
  success: boolean;
  data?: JodoCoGeneratedContent;
  error?: string;
  details?: any;
  source?: 'gemini' | 'mock_test_mode';
}

/**
 * Generates structured mock data aligned with JODOCO_EDITORIAL_SYSTEM_V1
 */
export function generateMockJodoCoContent(topic: string, rawScript: string): JodoCoGeneratedContent {
  const cleanTopic = topic.trim() || 'Creator Marketing vs Traditional Ads';
  const cleanScript =
    rawScript.trim() ||
    'Brands spend millions on cold ads that get skipped. By partnering with creators who have real trust, both the brand gets noticed and the creator gets funded.';
  const visualDirection = getDefaultVisualDirection(cleanTopic);

  const mockPayload: JodoCoGeneratedContent = {
    metadata: {
      topic: cleanTopic,
      originalScriptSummary: cleanScript.length > 120 ? cleanScript.slice(0, 117) + '...' : cleanScript,
      targetAudience: 'Brand Marketing Directors & Independent Creators',
      generatedAt: new Date().toISOString(),
      contentModelVersion: '1.0.0',
      editorialVersion: JODOCO_EDITORIAL_VERSION,
    },
    visualDirection,
    qualityEvaluation: {
      hookSpecificityScore: 10,
      informationProgressionScore: 9,
      sourceFidelityScore: 10,
      humanVoiceScore: 9,
      earnedCtaScore: 10,
      antiAiPassed: true,
      editorialNotes:
        'Hook leverages high-curiosity contrast. Visual intelligence selectively designates Scene 1, 2, and 3 for AI video while reserving Scene 5, 6, and 7 for high-clarity structured graphics.',
    },
    coreReel: {
      title: `${cleanTopic} — JodoCo Core Reel`,
      hookStrategy: 'Immediate curiosity-driven contrast between ad fatigue and creator trust',
      totalEstimatedDuration: 25.0,
      scenes: [
        {
          sceneIndex: 1,
          sceneType: 'hook',
          templateMapping: 'Scene1Hook',
          targetDuration: 3.2,
          voiceoverScript: `Why do traditional ads get skipped, while creator recommendations go viral? Let's break it down.`,
          voiceoverStartOffset: 0.1,
          recommendedSfx: [
            { type: 'whoosh', timeOffset: 0.05 },
            { type: 'pop', timeOffset: 0.8 },
          ],
          headline: {
            mainText: 'How Creator Marketing Actually Works',
            subText: 'Explained in 20 seconds',
            highlightWords: ['Creator', 'Marketing'],
          },
          categoryBadge: 'JodoCo Breakdown',
          explainerPill: 'Brand Strategy • 20s Payoff',
          contentPayload: {
            cards: [
              {
                id: 'hook_tag',
                title: 'Traditional Ads vs. Creator Trust',
                subtitle: 'The fundamental marketing shift',
                badge: '100% Authentic',
              },
            ],
          },
          visualMetadata: {
            sceneType: 'hook',
            templateMapping: 'Scene1Hook',
            visualConcept: 'Dynamic split-card graphic showing cold banners vs authentic creator portrait with floating engagement hearts',
            shotType: 'centered_hero',
            motionStyle: 'snappy_spring',
            transitionType: 'spring_wipe',
            accentColor: '#FF8C73',
            secondaryColor: '#B8A7EA',
            visualDecision: 'ai_video',
            visualPriority: 'high',
            visualReason: 'Hook requires immediate thumb-stopping visual interruption: relatable human creator in action to break passive feed scrolling within the first 2 seconds.',
            visualPrompt: 'Vertical 9:16 cinematic shot of a charismatic young creator standing in a modern sunlit studio, casually checking smartphone analytics with an authentic joyful expression. Lighting: Soft diffuse daylight with subtle warm studio rim lights. Aesthetic: Modern Creator Editorial & D2C Studio. Camera: Vertical 9:16 framing, grounded cinematic lens, shallow depth of field. Vertical 9:16 composition, central subject framing with clear top and bottom safe margins for on-screen typography. No on-screen text, no logos, no watermarks, photorealistic 4K cinematic clarity.',
            visualContinuity: {
              aesthetic: 'Modern Creator Editorial & D2C Studio',
              colorMood: 'Warm peach (#FF8C73), lavender (#B8A7EA), mint (#8FE3C0) accents on clean off-white canvas',
              lighting: 'Soft diffuse daylight with subtle warm studio rim lights',
              cameraLanguage: 'Vertical 9:16 framing, grounded cinematic lens',
            },
            aiVideoPrompt: 'Cinematic studio lighting, modern creator holding smartphone reviewing campaign analytics, warm peach and navy accents',
          },
        },
        {
          sceneIndex: 2,
          sceneType: 'problem',
          templateMapping: 'Scene2Brand',
          targetDuration: 3.0,
          voiceoverScript: 'A brand wants people to notice its product. But cold advertising feels impersonal and gets ignored.',
          voiceoverStartOffset: 0.1,
          recommendedSfx: [
            { type: 'chime', timeOffset: 0.1 },
            { type: 'pop', timeOffset: 0.6 },
          ],
          headline: {
            mainText: 'The Brand Dilemma',
            subText: 'Cutting through digital noise',
            highlightWords: ['Brand'],
          },
          categoryBadge: 'Phase 01',
          explainerPill: 'The Challenge',
          contentPayload: {
            cards: [
              {
                id: 'brand_goal',
                title: 'Brand Needs Awareness',
                subtitle: 'High ad spend with declining engagement',
                badge: 'High Intent',
                price: 'Growth Goal',
              },
            ],
          },
          visualMetadata: {
            sceneType: 'problem',
            templateMapping: 'Scene2Brand',
            visualConcept: 'Floating brand product showcase card surrounded by attention metrics',
            shotType: 'graphic_focus',
            motionStyle: 'smooth_linear',
            transitionType: 'card_slide_left',
            accentColor: '#FF8C73',
            visualDecision: 'ai_video',
            visualPriority: 'medium',
            visualReason: 'Real-world environment showing cold advertising fatigue and frustrated brand outreach grounds the emotional problem viscerally.',
            visualPrompt: 'Vertical 9:16 cinematic shot of a modern marketing team reviewing skipped banner advertisements and declining engagement charts in an open-concept creative loft, frustrated yet determined atmosphere. Lighting: Clean high-contrast studio daylight. Camera: Vertical 9:16 framing, smooth slow push-in. Safe overlay zones top and bottom for text. No on-screen text, no logos.',
            visualContinuity: {
              aesthetic: 'Modern Creator Editorial & D2C Studio',
              colorMood: 'Warm peach and navy tones with soft cream canvas',
              lighting: 'Soft daylight with warm side fill',
            },
          },
        },
        {
          sceneIndex: 3,
          sceneType: 'solution_creator',
          templateMapping: 'Scene3Creator',
          targetDuration: 4.0,
          voiceoverScript: 'So they partner with the right creator. Someone their audience already trusts and listens to every day.',
          voiceoverStartOffset: 0.1,
          recommendedSfx: [
            { type: 'pop', timeOffset: 0.2 },
            { type: 'chime', timeOffset: 1.2 },
          ],
          headline: {
            mainText: 'The Trusted Partner',
            subText: 'Built-in community and organic credibility',
            highlightWords: ['Creator', 'Trust'],
          },
          categoryBadge: 'Phase 02',
          explainerPill: 'Organic Connection',
          contentPayload: {
            cards: [
              {
                id: 'creator_card',
                title: 'High-Trust Creator',
                subtitle: 'Engaged niche audience with genuine rapport',
                badge: 'Verified Reach',
              },
            ],
          },
          visualMetadata: {
            sceneType: 'solution_creator',
            templateMapping: 'Scene3Creator',
            visualConcept: 'Creator avatar card glowing with authentic community interaction stats',
            shotType: 'card_stack',
            motionStyle: 'snappy_spring',
            transitionType: 'card_slide_up',
            accentColor: '#8FE3C0',
            visualDecision: 'ai_video',
            visualPriority: 'high',
            visualReason: 'Authentic creator storytelling creates instant human rapport and empathy, highlighting organic trust over transactional ads.',
            visualPrompt: 'Vertical 9:16 cinematic shot of a genuine digital creator filming an authentic vertical video recommendation on a smartphone tripod with soft ring light illumination, high-trust warm eye contact. Lighting: Warm natural studio lighting. Camera: Vertical 9:16 portrait framing. No on-screen text, no logos.',
            visualContinuity: {
              aesthetic: 'Modern Creator Editorial & D2C Studio',
              colorMood: 'Warm peach (#FF8C73) and mint (#8FE3C0) accents',
              lighting: 'Soft diffuse daylight',
            },
          },
        },
        {
          sceneIndex: 4,
          sceneType: 'content_flywheel',
          templateMapping: 'Scene4Content',
          targetDuration: 4.0,
          voiceoverScript: 'The creator makes authentic content. People see it and engage. The brand gets genuine notice.',
          voiceoverStartOffset: 0.1,
          recommendedSfx: [
            { type: 'chime', timeOffset: 0.1 },
            { type: 'pop', timeOffset: 1.2 },
            { type: 'rise', timeOffset: 2.5 },
          ],
          headline: {
            mainText: 'The 3-Step Flywheel',
            subText: 'How content converts',
            highlightWords: ['Flywheel'],
          },
          categoryBadge: 'The Mechanism',
          contentPayload: {
            phases: [
              { id: 1, label: 'Creator Makes Content', tag: 'Step 1', threshold: 0.33 },
              { id: 2, label: 'Audience Engages', tag: 'Step 2', threshold: 0.66 },
              { id: 3, label: 'Brand Gets Noticed', tag: 'Step 3', threshold: 1.0 },
            ],
          },
          visualMetadata: {
            sceneType: 'content_flywheel',
            templateMapping: 'Scene4Content',
            visualConcept: 'Progressive 3-step vertical flywheel card animating in sync with voiceover beats',
            shotType: 'kinetic_text',
            motionStyle: 'kinetic_pop',
            transitionType: 'spring_wipe',
            accentColor: '#B8A7EA',
            visualDecision: 'b_roll',
            visualPriority: 'medium',
            visualReason: 'Dynamic behind-the-scenes creator filming b-roll emphasizes authentic content production momentum.',
            visualPrompt: 'Vertical 9:16 cinematic shot of dynamic over-the-shoulder view of high-energy content creation in a sunlit creator space, filming unboxing moments with natural organic gestures. Lighting: Soft ambient studio light. Camera: Vertical 9:16 framing. No on-screen text, no logos.',
          },
        },
        {
          sceneIndex: 5,
          sceneType: 'both_sides_win',
          templateMapping: 'Scene5BothSidesWin',
          targetDuration: 4.0,
          voiceoverScript: 'The creator gets funded. The brand gets real reach. Both sides win together.',
          voiceoverStartOffset: 0.1,
          recommendedSfx: [
            { type: 'pop', timeOffset: 0.1 },
            { type: 'chime', timeOffset: 1.5 },
          ],
          headline: {
            mainText: 'Both Sides Win',
            subText: 'Symmetric value creation',
            highlightWords: ['Win'],
          },
          categoryBadge: 'Mutual Growth',
          contentPayload: {
            cards: [
              {
                id: 'brand_win',
                title: 'Brand Wins',
                subtitle: 'Authentic Reach & Customer Trust',
                badge: 'ROI Positive',
                bullets: [
                  { title: 'Organic credibility over cold ads', icon: 'check' },
                  { title: 'Measurable direct-response attribution', icon: 'zap' },
                ],
              },
              {
                id: 'creator_win',
                title: 'Creator Wins',
                subtitle: 'Fair Sponsorship & Creative Freedom',
                badge: 'Monetization',
                bullets: [
                  { title: 'Partnerships that respect audience trust', icon: 'star' },
                  { title: 'Sustainable income for continuous creation', icon: 'heart' },
                ],
              },
            ],
          },
          visualMetadata: {
            sceneType: 'both_sides_win',
            templateMapping: 'Scene5BothSidesWin',
            visualConcept: 'Side-by-side balanced dual comparison cards illustrating symbiotic win-win dynamics',
            shotType: 'split_screen',
            motionStyle: 'snappy_spring',
            transitionType: 'card_slide_left',
            accentColor: '#FF8C73',
            secondaryColor: '#8FE3C0',
            visualDecision: 'static_graphic',
            visualPriority: 'low',
            visualReason: 'Split-screen graphic diagram and balanced card layout convey symmetric win-win mechanics clearer than AI video without visual clutter.',
          },
        },
        {
          sceneIndex: 6,
          sceneType: 'bridge_jodoco',
          templateMapping: 'Scene6JodoCo',
          targetDuration: 3.8,
          voiceoverScript: 'And that is where JodoCo comes in: the bridge that makes matchmaking effortless.',
          voiceoverStartOffset: 0.1,
          recommendedSfx: [
            { type: 'rise', timeOffset: 0.1 },
            { type: 'chime', timeOffset: 1.8 },
          ],
          headline: {
            mainText: 'The Matchmaking Bridge',
            subText: 'Connecting vision with authentic voice',
            highlightWords: ['Bridge', 'JodoCo'],
          },
          categoryBadge: 'Why JodoCo',
          contentPayload: {
            cards: [
              {
                id: 'bridge_card',
                title: 'The Creator Marketing Agency',
                subtitle: 'Strategic alignment, contract management, and performance tracking',
                badge: 'Verified Network',
              },
            ],
          },
          visualMetadata: {
            sceneType: 'bridge_jodoco',
            templateMapping: 'Scene6JodoCo',
            visualConcept: 'Pulsing geometric bridge linking Brand and Creator nodes into central JodoCo core',
            shotType: 'centered_hero',
            motionStyle: 'pulsing_glow',
            transitionType: 'zoom_in',
            accentColor: '#B8A7EA',
            visualDecision: 'static_graphic',
            visualPriority: 'medium',
            visualReason: 'Structured animated UI node graph cleanly communicates the matchmaking bridge mechanism between brand requirements and creator voice.',
          },
        },
        {
          sceneIndex: 7,
          sceneType: 'final_cta',
          templateMapping: 'Scene7FinalFrame',
          targetDuration: 3.0,
          voiceoverScript: "Let's Jodo. Visit jodoco.agency to build your next high-impact partnership.",
          voiceoverStartOffset: 0.1,
          recommendedSfx: [
            { type: 'pop', timeOffset: 0.2 },
            { type: 'chime', timeOffset: 1.0 },
          ],
          headline: {
            mainText: 'Connect • Create • Grow',
            subText: "Let's Jodo",
            highlightWords: ['Jodo'],
          },
          categoryBadge: 'Get Started',
          contentPayload: {
            ctaAction: {
              primaryText: "Let's Jodo.",
              subText: 'jodoco.agency',
              targetUrl: 'https://jodoco.agency',
            },
          },
          visualMetadata: {
            sceneType: 'final_cta',
            templateMapping: 'Scene7FinalFrame',
            visualConcept: 'High-contrast JodoCo signature mark with celebratory particles and interactive CTA lockup',
            shotType: 'logo_lockup',
            motionStyle: 'snappy_spring',
            transitionType: 'cut',
            accentColor: '#FF8C73',
            visualDecision: 'static_graphic',
            visualPriority: 'low',
            visualReason: 'Signature brand logo lockup and typography CTA take full prominence; background video avoided to maximize readability and conversion.',
          },
        },
      ],
    },
    carousel: {
      title: `${cleanTopic} — 6-Slide Strategic Carousel`,
      hookAngle: 'Why organic creator partnerships outperform traditional advertising spend',
      totalSlides: 6,
      slides: [
        {
          slideNumber: 1,
          role: 'hook',
          headline: 'Cold Ads are Dying. Here is What Works.',
          subHeadline: 'Why the highest-performing brands partner with authentic creators in 2026.',
          bodyCopy: 'Swipe through to see the exact 3-step flywheel turning creators into high-converting brand advocates.',
          calloutBadge: 'Creator Strategy',
          footerCta: 'Swipe →',
          visualDecision: 'ai_image',
          visualPriority: 'high',
          visualReason: 'Hook slide requires thumb-stopping editorial intrigue: charismatic creator in natural studio light to draw immediate engagement in social feeds.',
          visualPrompt: 'Vertical 4:5 photographic editorial portrait of a confident young creator holding a smartphone in a bright sunlit studio with warm peach (#FF8C73) accents, generous top and bottom negative space for clean typography overlay. High-end commercial realism, strictly no text.',
          visualContinuity: 'Warm peach and cream tones, soft natural studio lighting from left, clear typography safe zones.',
        },
        {
          slideNumber: 2,
          role: 'problem_setup',
          headline: 'The Problem with Direct Banner Ads',
          subHeadline: 'Ad fatigue is at an all-time high.',
          bodyCopy: 'Audiences have developed banner blindness. When a brand interrupts their feed, they scroll right past.',
          bulletPoints: [
            'High CPMs with diminishing conversion rates',
            'Zero organic trust or community goodwill',
            'No ongoing relationship beyond the single impression',
          ],
          calloutBadge: 'The Challenge',
          visualDecision: 'ai_image',
          visualPriority: 'medium',
          visualReason: 'A relatable real-world scene of marketing frustration highlights digital ad fatigue and grounds the core problem.',
          visualPrompt: 'Vertical 4:5 cinematic documentary shot of a modern marketing strategist looking thoughtfully at a laptop at a minimal desk, soft navy and lavender ambient lighting, clear lower area for text overlay. Photorealistic, no text.',
          visualContinuity: 'Maintain modern architectural aesthetic and generous safe zones.',
        },
        {
          slideNumber: 3,
          role: 'core_value',
          headline: 'Enter: The High-Trust Creator',
          subHeadline: 'Audiences buy from people they respect.',
          bodyCopy: 'A trusted creator spent years cultivating genuine rapport with their audience. When they endorse a product, it carries organic weight.',
          bulletPoints: [
            'Instant social proof and authentic storytelling',
            'Tailored narrative crafted specifically for their niche',
            'Higher engagement and warm audience resonance',
          ],
          calloutBadge: 'The Solution',
          visualDecision: 'diagram',
          visualPriority: 'low',
          visualReason: 'Strategic insight is best communicated through a structured visual card with clear bullets rather than busy photography.',
          visualPrompt: 'Minimalist editorial 4:5 visual card background with soft ambient pastel gradients (#B8A7EA and #8FE3C0), subtle geometric grid accents, ample open space for high-contrast bulleted copy. No text in image.',
          visualContinuity: 'Soft lavender and mint pastel palette matching project theme.',
        },
        {
          slideNumber: 4,
          role: 'step_detail',
          headline: 'The 3-Step Content Flywheel',
          subHeadline: 'How the partnership creates compounding value.',
          bodyCopy: '1. Creator Crafts Narrative -> 2. Audience Responds With Real Engagement -> 3. Brand Earns Sustainable Equity.',
          bulletPoints: [
            'Step 1: Authentic creative angle agreed with brand',
            'Step 2: Transparent, community-first content delivery',
            'Step 3: Trackable brand awareness and conversion',
          ],
          calloutBadge: 'The Engine',
          visualDecision: 'ui_mockup',
          visualPriority: 'medium',
          visualReason: 'Step-by-step flywheel benefits from a structured editorial UI/card hierarchy that readers immediately bookmark as a tactical reference.',
          visualPrompt: 'Vertical 4:5 high-concept editorial still life of creator tools: sleek smartphone on a minimal marble block, soft studio daylight, warm peach and mint ambient reflections, balanced composition. Photorealistic studio photography, no text.',
          visualContinuity: 'Clean studio texture consistent with overall project aesthetic.',
        },
        {
          slideNumber: 5,
          role: 'summary',
          headline: 'Symmetric Growth: Both Sides Win',
          subHeadline: 'Creators get funded. Brands get real reach.',
          bodyCopy: 'Sustainable marketing is never extractive. When creator incentives align with brand objectives, long-term brand equity multiplies.',
          calloutBadge: 'The Outcome',
          visualDecision: 'static_graphic',
          visualPriority: 'low',
          visualReason: 'Symmetric growth payoff is clearest when presented as clean typography with balanced win-win comparison elements.',
          visualPrompt: 'Vertical 4:5 ambient abstract gradient canvas with smooth undulating waves of warm peach (#FF8C73) and fresh mint (#8FE3C0) blending softly into deep charcoal, high-contrast negative space for headline and summary cards. Minimalist, no text.',
          visualContinuity: 'Harmonious blend of primary brand accents (#FF8C73, #8FE3C0).',
        },
        {
          slideNumber: 6,
          role: 'cta',
          headline: "Ready to Bridge the Gap? Let's Jodo.",
          subHeadline: 'The Creator Marketing Agency.',
          bodyCopy: 'Visit jodoco.agency to match your brand with top-tier verified creators.',
          calloutBadge: 'Next Steps',
          footerCta: 'Connect at jodoco.agency',
          visualDecision: 'text_only',
          visualPriority: 'low',
          visualReason: 'Final CTA requires zero visual distraction to focus 100% of reader attention on the agency next step and website URL.',
          visualPrompt: 'Vertical 4:5 clean minimalist brand canvas in deep navy (#1A2B48) with subtle warm glowing radial gradient at bottom, ample clear space for bold signature typography. No text in background.',
          visualContinuity: 'Dark navy brand anchor finish.',
        },
      ],
    },
  };

  return JodoCoGeneratedContentSchema.parse(mockPayload);
}

/**
 * Builds the comprehensive system instruction enforcing JODOCO_EDITORIAL_SYSTEM_V1
 */
function buildSystemInstruction(): string {
  const v1 = JODOCO_EDITORIAL_SYSTEM_V1;

  return `You are the specialized JodoCo AI Content Engine, operating under JODOCO_EDITORIAL_SYSTEM_V1 (Version ${v1.version}).
Your mission is to transform a provided Topic and Source Script/Information into TWO synchronized, high-impact deliverables:
1. Core Reel (A structured 20-30s vertical 9:16 short-form video breakdown with exactly 7 editorial beats)
2. Carousel (A structured 5-7 slide carousel deck for LinkedIn/Instagram)

Follow these authoritative editorial pillars strictly:

=======================================================
PILLAR 1: BRAND VOICE & PERSONALITY
=======================================================
- Personality: ${v1.brandVoice.personality.join(' ')}
- Tone: ${v1.brandVoice.tone.join(' ')}
- Expertise Level: ${v1.brandVoice.levelOfExpertise.join(' ')}
- Conversational Cadence: ${v1.brandVoice.conversationalStyle}
- Sentence Constraints: Maximum ${v1.brandVoice.sentenceStyle.maxWordsPerSentence} words per sentence. Write for the ear. Punchy tripartite structure: Statement. Resonance. Actionable outcome.
- Preferred Vocabulary: ${v1.brandVoice.vocabulary.preferredWords.join(', ')}
- Power Phrases: ${v1.brandVoice.vocabulary.powerPhrases.join(' | ')}
- Strictly Banned Words (NEVER use): ${v1.brandVoice.vocabulary.bannedWords.join(', ')}
- Phrases to Avoid: ${v1.brandVoice.vocabulary.phrasesToAvoid.join(', ')}

=======================================================
PILLAR 2: HOOK SYSTEM
=======================================================
Select the most compelling hook category for the given topic:
${JODOCO_HOOK_CATEGORIES.map(
  (h) => `* [${h.displayName}]: Use when ${h.whenToUse}. E.g.: "${h.examples[0]}". Anti-pattern: "${h.antiExamples[0]}"`
).join('\n')}
The hook MUST frame the tension or core question within 2.5–3.2 seconds. Never waste time on introductions.

=======================================================
PILLAR 3: REEL 7-BEAT EDITORIAL STORYTELLING
=======================================================
Every Reel MUST follow these 7 sequential editorial beats:
${JODOCO_REEL_SEVEN_BEATS.map(
  (b) => `* Beat ${b.beatIndex} (${b.beatName}, Template: ${b.sceneTemplate}): Purpose: ${b.purpose}. Goal: ${b.editorialGoal} [Target Duration: ~${b.recommendedDuration}s]`
).join('\n')}

=======================================================
PILLAR 4: REEL PACING & INFORMATION DENSITY
=======================================================
- Total Duration: ${v1.reelPacing.minTotalDurationSeconds}s – ${v1.reelPacing.maxTotalDurationSeconds}s (Ideal: ~${v1.reelPacing.idealTotalDurationSeconds}s).
- Scene 1 Voiceover: ${v1.reelPacing.voiceoverLengthGuidelines.hookScene}
- Scenes 2-6 Voiceover: ${v1.reelPacing.voiceoverLengthGuidelines.bodyScenes}
- Scene 7 Voiceover: ${v1.reelPacing.voiceoverLengthGuidelines.ctaScene}
- Do NOT add filler scenes. Every beat must add fresh, progressive information.

=======================================================
PILLAR 5: ON-SCREEN COPY & TYPOGRAPHY
=======================================================
- Headlines: Maximum ${v1.onScreenCopy.headlines.maxWords} words. Active verbs. Highlight 1-2 key conceptual words with brand accent color.
- Subheads: Maximum ${v1.onScreenCopy.subheads.maxWords} words. Clarify context without repeating headline words.
- Bullets: Maximum ${v1.onScreenCopy.bullets.maxItems} items per card, max ${v1.onScreenCopy.bullets.maxWordsPerItem} words each.
- Statistics: Bold number + short noun tag (e.g., "4x Engagement", "84% Skip Rate").
- Prohibited Copy: Dense paragraphs, repetitive verbatim statements, unnecessary ALL-CAPS screaming.

=======================================================
PILLAR 6: CAROUSEL SYSTEM & SLIDE OBJECTIVES
=======================================================
${JODOCO_CAROUSEL_SLIDE_RULES.map(
  (s) => `* Slide ${s.slideIndex} [Role: ${s.role}]: ${s.purpose} Must accomplish: ${s.mustAccomplish}`
).join('\n')}

=======================================================
PILLAR 7: CONTENT QUALITY & SOURCE FIDELITY
=======================================================
- Faithfully preserve key concepts, proprietary terms, and arguments from the provided topic/script.
- Do NOT hallucinate fake case studies, fabricated metrics, or false claims.
- Prioritize the strongest 1-2 insights over a laundry list of minor points.
- Remove throat-clearing preambles and conversational boilerplate.

=======================================================
PILLAR 8: CONTENT TRANSFORMATION (Reel vs Carousel)
=======================================================
- Do NOT simply copy the same text into both formats.
- Reel = Cinematic spoken flow, rhythm, progressive reveals, and video retention.
- Carousel = Information hierarchy, bulleted clarity, standalone slide comprehension, and bookmarking saveability.

=======================================================
PILLAR 9: AI VISUAL INTELLIGENCE & EDITORIAL DECISION RULES
=======================================================
You must act as an expert Creative Director and decide visual strategy based on STORY, not generating AI video indiscriminately.
For the overall project:
- Provide "visualDirection" conforming to VisualDirectionSchema (aesthetic, palette, mood, cameraGuidelines, safeZones, avoid).
For every Reel scene, determine structured visual intelligence:
- visualDecision: 'ai_video' | 'static_graphic' | 'text_only' | 'b_roll' | 'none'
  * 'ai_video': ONLY for high-impact human emotion, relatable hook, or authentic creator storytelling.
  * 'static_graphic': For complex frameworks, symmetric win-win balance, or final logo lockup.
  * 'text_only': When concise spoken typography provides superior clarity without visual distraction.
  * 'b_roll': For dynamic atmospheric footage (unboxing, editing setup).
  * 'none': Background is purely minimalist brand color canvas.
- visualPriority: 'high' | 'medium' | 'low'
- visualReason: Concise explanation (1-2 sentences) of why this visual decision serves the editorial narrative.
- visualPrompt: Production-ready 9:16 vertical prompt optimized for Veo (specifying cinematic style, lighting, camera framing, safe zones, negative constraints like "no on-screen text").
- visualContinuity: Project-level aesthetic continuity specs (aesthetic, colorMood, lighting, cameraLanguage).
- visualConcept: Physical/graphical metaphor (floating cards, flywheel nodes, split comparisons).
- shotType: centered_hero | graphic_focus | split_screen | card_stack | kinetic_text | logo_lockup.
- motionStyle: snappy_spring | smooth_linear | kinetic_pop | pulsing_glow | calm_float.
- transitionType: spring_wipe | card_slide_left | card_slide_up | zoom_in | cut.
- aiVideoPrompt: Concise fallback prompt for B-roll footage.

For every Carousel slide, determine carousel-specific visual intelligence:
- visualDecision: 'ai_image' | 'ai_video' | 'static_graphic' | 'diagram' | 'ui_mockup' | 'text_only' | 'none'
  * 'ai_image': When a high-intrigue creator portrait or relatable problem situation materially elevates the hook or problem.
  * 'diagram' / 'static_graphic': When frameworks, statistics, or symmetric comparisons are best shown as structured visual graphics.
  * 'ui_mockup': When creator workflows or digital toolsets benefit from an editorial UI presentation.
  * 'text_only': When clean typography and clear cards communicate the message without decorative visual clutter (especially CTA slides).
- visualPriority: 'high' | 'medium' | 'low'
- visualReason: Short explanation (1-2 sentences) of why this visual treatment improves the slide.
- visualPrompt: Production-ready 4:5 vertical prompt (specifying subject, environment, lighting, warm tones, generous negative space for text, strictly NO baked-in text or logos).
- visualContinuity: Notes for maintaining aesthetic consistency across the carousel.

=======================================================
PILLAR 10: ANTI-GENERIC-AI RULE
=======================================================
NEVER use generic AI clichés:
${v1.brandVoice.genericAILanguageToAvoid.map((t) => `- "${t}"`).join('\n')}
${v1.antiGenericAI.bannedTropes.map((t) => `- ${t}`).join('\n')}

=======================================================
PILLAR 11: QUALITY EVALUATION AUDIT
=======================================================
Internally evaluate your generated deliverables against:
- hookSpecificityScore (1-10)
- informationProgressionScore (1-10)
- sourceFidelityScore (1-10)
- humanVoiceScore (1-10)
- earnedCtaScore (1-10)
- antiAiPassed (true/false)
Include these scores in the "qualityEvaluation" object in the JSON response.

OUTPUT FORMAT:
- Valid, parseable JSON conforming to JodoCoGeneratedContentSchema.
- Do NOT include markdown formatting or backticks outside of the JSON block.`;
}

/**
 * Executes server-side generation using Gemini 3.7 Flash with strict JSON schema validation
 */
export async function generateJodoCoContent(
  options: GenerateContentOptions
): Promise<GenerateContentResult> {
  const { topic, rawScript, isTestMode } = options;

  if (!topic || !topic.trim()) {
    return {
      success: false,
      error: 'Topic is required to generate content.',
    };
  }

  // If in test mode or API key is not set, use verified mock generator
  const apiKey = process.env.GEMINI_API_KEY;
  if (isTestMode || !apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.log('[ContentEngine] Generating in test/mock mode using JODOCO_EDITORIAL_SYSTEM_V1...');
    try {
      const mockData = generateMockJodoCoContent(topic, rawScript);
      return {
        success: true,
        data: mockData,
        source: 'mock_test_mode',
      };
    } catch (e: any) {
      return {
        success: false,
        error: `Mock generation failed: ${e.message}`,
      };
    }
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = buildSystemInstruction();

    const userPrompt = `TOPIC:
${topic.trim()}

SOURCE SCRIPT / RAW INFORMATION:
${rawScript && rawScript.trim() ? rawScript.trim() : '(No detailed script provided; generate an authoritative breakdown based strictly on the topic and JodoCo creator-marketing principles)'}

Generate the complete JodoCo content structure containing:
- metadata (topic, originalScriptSummary, targetAudience, generatedAt, contentModelVersion: "1.0.0", editorialVersion: "${JODOCO_EDITORIAL_VERSION}")
- qualityEvaluation (hookSpecificityScore, informationProgressionScore, sourceFidelityScore, humanVoiceScore, earnedCtaScore, antiAiPassed, editorialNotes)
- coreReel (title, hookStrategy, totalEstimatedDuration, exactly 7 scenes with structured visual intelligence, voiceover, and headlines)
- carousel (title, hookAngle, totalSlides, slides with roles, headlines, copy, bullets, and structured visual intelligence: visualDecision, visualPriority, visualReason, visualPrompt, visualContinuity)`;

    console.log(`[ContentEngine] Calling Gemini 3.7 Flash with JODOCO_EDITORIAL_SYSTEM_V1 for topic: "${topic.trim()}"...`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim() || '';
    if (!responseText) {
      throw new Error('Gemini returned an empty response.');
    }

    // Clean potential markdown wrapper if present
    let jsonStr = responseText;
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsedJson: any;
    try {
      parsedJson = JSON.parse(jsonStr);
    } catch (parseError: any) {
      console.error('[ContentEngine] JSON parse error:', parseError, jsonStr.slice(0, 300));
      return {
        success: false,
        error: `Model output could not be parsed as JSON: ${parseError.message}`,
        details: jsonStr.slice(0, 500),
      };
    }

    // Validate strictly against Zod Schema
    const validation = JodoCoGeneratedContentSchema.safeParse(parsedJson);
    if (!validation.success) {
      console.error('[ContentEngine] Zod validation failed:', validation.error.format());
      return {
        success: false,
        error: 'Generated content failed JodoCo schema validation.',
        details: validation.error.format(),
      };
    }

    console.log('[ContentEngine] Successfully generated and validated JodoCo content with Gemini using Editorial System V1.');
    return {
      success: true,
      data: validation.data,
      source: 'gemini',
    };
  } catch (error: any) {
    console.error('[ContentEngine] Gemini execution error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred while calling the Gemini API.',
    };
  }
}


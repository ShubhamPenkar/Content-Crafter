import {
  JodoCoEditorialSystemV1,
  HookCategoryRule,
  ReelBeatRule,
  CarouselSlideRule,
} from './types';

/**
 * ============================================================================
 * JODOCO EDITORIAL SYSTEM V1 (Production-Ready Framework)
 * ============================================================================
 * 
 * Version: 1.0
 * 
 * This file contains the complete authoritative editorial guidelines, voice
 * definitions, storytelling beats, pacing laws, and quality constraints
 * powering the JodoCo AI Content Engine.
 * 
 * Rules that genuinely depend on user creative customization are explicitly
 * marked with: TODO_USER_PREFERENCE
 */

export const JODOCO_EDITORIAL_VERSION = '1.0';

export const JODOCO_HOOK_CATEGORIES: HookCategoryRule[] = [
  {
    category: 'curiosity',
    displayName: 'High-Curiosity Contrast',
    whenToUse:
      'Use when opening general topics, contrarian industry shifts, or comparing old vs. new marketing models.',
    whatMakesItEffective:
      'Creates an immediate psychological information gap by juxtaposing an absurd waste of money with an organic high-converting alternative.',
    examples: [
      'Why do $50,000 banner ads get skipped, while a 15-second creator recommendation sells out inventory in minutes?',
      'The single biggest reason 90% of influencer campaigns fail—and it is not the follower count.',
    ],
    antiExamples: [
      'Have you ever wondered what influencer marketing is?',
      'In today’s fast-paced digital world, social media is important.',
    ],
  },
  {
    category: 'contradiction',
    displayName: 'Belief Contradiction',
    whenToUse:
      'Use when disproving a persistent industry myth or challenging a standard marketing budget allocation.',
    whatMakesItEffective:
      'Directly attacks a flawed assumption held by the target viewer, forcing them to re-evaluate their intuition.',
    examples: [
      'More ad budget will not fix declining conversions if nobody trusts the messenger.',
      'Stop hiring creators to read corporate scripts. That is why your sponsored reels look like ads.',
    ],
    antiExamples: [
      'Advertising can be good, but sometimes it is also bad.',
      'Here are both the pros and cons of marketing.',
    ],
  },
  {
    category: 'unexpected_insight',
    displayName: 'Unexpected Insight / Mechanism Reframe',
    whenToUse:
      'Use when introducing a specific tactical concept, attribution model, or conversion mechanism.',
    whatMakesItEffective:
      'Delivers an immediate "aha" realization within the first 2 seconds before the viewer can scroll away.',
    examples: [
      'The highest-converting creator campaigns do not look like ads at all—they look like peer recommendations.',
      'Audiences do not buy because of the discount code; they buy because they already trust the creator’s taste.',
    ],
    antiExamples: [
      'Influencers have many followers who like their photos.',
      'Did you know videos are popular on mobile phones?',
    ],
  },
  {
    category: 'strong_opinion',
    displayName: 'Authoritative Point-of-View',
    whenToUse:
      'Use for executive thought leadership, brand strategy manifestos, and agency positioning.',
    whatMakesItEffective:
      'Commands instant respect through crisp conviction, intellectual clarity, and zero hedging.',
    examples: [
      'Cold interruption ads are dying. Creator-led distribution is the only sustainable moat in 2026.',
      'If you cannot explain why both the brand and the creator win, your campaign is extractive and doomed.',
    ],
    antiExamples: [
      'Some marketing experts think creators are useful, while others disagree.',
      'Maybe you should consider trying social media.',
    ],
  },
  {
    category: 'problem_recognition',
    displayName: 'Acute Pain Recognition',
    whenToUse:
      'Use when targeting brand founders, marketing directors, or creators experiencing acute burnout or rising CAC.',
    whatMakesItEffective:
      'Names the exact visceral daily frustration the viewer is suffering from right now.',
    examples: [
      'Your paid ad CAC doubled this quarter, but your conversion rates are dropping. Here is what happened.',
      'You are spending 40 hours a week sending cold outreach DMs to creators with a 2% reply rate.',
    ],
    antiExamples: [
      'Running a business can sometimes be stressful.',
      'Do you want to make more money with less effort?',
    ],
  },
  {
    category: 'pattern_interrupt',
    displayName: 'Visual & Conceptual Pattern Interrupt',
    whenToUse:
      'Use in high-velocity algorithmic feeds where viewers are aggressively thumb-scrolling.',
    whatMakesItEffective:
      'Jarring, blunt opening statement or imperative command that breaks the trance of passive consumption.',
    examples: [
      'Stop buying fake impressions. Start funding authentic storytellers.',
      'Delete your banner ad budget for 30 days and do this instead.',
    ],
    antiExamples: [
      'Hey guys, what is up, welcome back to our channel!',
      'Today I want to share a few thoughts with you.',
    ],
  },
  {
    category: 'data_statistic',
    displayName: 'Concrete Data Anchor',
    whenToUse:
      'Use for performance case studies, ROI comparisons, and enterprise agency pitches.',
    whatMakesItEffective:
      'Grounds the premise in objective numerical reality rather than subjective opinion.',
    examples: [
      '84% of Gen Z consumers skip paid social ads in the first two seconds—unless a creator they follow is on screen.',
      'Micro-creators with under 50k followers generate 3.8x higher engagement per dollar than celebrity endorsements.',
    ],
    antiExamples: [
      'A huge percentage of people love watching videos online.',
      'Studies show that marketing is growing every year.',
    ],
  },
  {
    category: 'story_led',
    displayName: 'Narrative Case Hook',
    whenToUse:
      'Use for agency breakdown reels, founder spotlights, and real-world transformation stories.',
    whatMakesItEffective:
      'Draws the viewer in with narrative momentum, curiosity about the resolution, and human empathy.',
    examples: [
      'How an indie skincare brand turned a $5,000 creator partnership into $140,000 in direct sales.',
      'What happened when a SaaS company replaced their entire paid media team with 8 creator ambassadors.',
    ],
    antiExamples: [
      'Once upon a time there was a company that wanted to sell products.',
      'Let me tell you a long story about our agency.',
    ],
  },
];

export const JODOCO_REEL_SEVEN_BEATS: ReelBeatRule[] = [
  {
    beatIndex: 1,
    beatName: 'The Hook',
    sceneTemplate: 'Scene1Hook',
    purpose: 'Interrupt the feed, trigger an open information loop, and deliver a promise of payoff in under 20-30s.',
    editorialGoal: 'Frame the tension or core question within 2.5–3.2 seconds. Never waste time on introductions.',
    recommendedDuration: 3.0,
    voiceoverStyle: 'Snappy, high-energy question or provocative contrarian contrast.',
    onScreenFocus: 'High-contrast headline with 1-2 brand accent highlighted words + category badge.',
  },
  {
    beatIndex: 2,
    beatName: 'The Problem / Tension',
    sceneTemplate: 'Scene2Brand',
    purpose: 'Expose the underlying friction, cost of inaction, or failure of traditional marketing.',
    editorialGoal: 'Make the pain point concrete (e.g., ad fatigue, rising CAC, impersonal corporate messaging).',
    recommendedDuration: 3.2,
    voiceoverStyle: 'Empathetic, clear, naming the exact dilemma faced by brands or creators.',
    onScreenFocus: 'Graphic focus card detailing the specific friction point with visual metric or status tag.',
  },
  {
    beatIndex: 3,
    beatName: 'The Insight / Turning Point',
    sceneTemplate: 'Scene3Creator',
    purpose: 'Introduce the trusted creator mechanism as the natural turning point of the narrative.',
    editorialGoal: 'Reframe the solution around human rapport, authentic storytelling, and pre-existing audience trust.',
    recommendedDuration: 4.0,
    voiceoverStyle: 'Reassuring, authoritative reframe shifting from problem to mechanism.',
    onScreenFocus: 'Creator avatar card or trust metric badge emphasizing organic community connection.',
  },
  {
    beatIndex: 4,
    beatName: 'The 3-Step Flywheel',
    sceneTemplate: 'Scene4Content',
    purpose: 'Demystify the exact mechanism step-by-step with kinetic tempo.',
    editorialGoal: 'Prove how the ecosystem functions in three progressive steps: Creator Creates -> Audience Engages -> Brand Gets Noticed.',
    recommendedDuration: 4.0,
    voiceoverStyle: 'Rhythmic, tripartite cadence timed precisely to progressive phase reveals.',
    onScreenFocus: 'Progressive 3-step vertical card stack animating in sync with voiceover timestamps.',
  },
  {
    beatIndex: 5,
    beatName: 'Symmetric Payoff / Both Sides Win',
    sceneTemplate: 'Scene5BothSidesWin',
    purpose: 'Prove symmetric ROI, showing why authentic creator marketing is a positive-sum game.',
    editorialGoal: 'Demonstrate tangible upside for both sides: authentic reach & customer trust for brands; fair funding & creative freedom for creators.',
    recommendedDuration: 4.0,
    voiceoverStyle: 'Balanced, triumphant tone highlighting mutual growth and partnership sustainability.',
    onScreenFocus: 'Side-by-side dual win cards with checkmarks and metric badges.',
  },
  {
    beatIndex: 6,
    beatName: 'The Matchmaking Bridge',
    sceneTemplate: 'Scene6JodoCo',
    purpose: 'Position JodoCo as the essential strategic catalyst and bridge.',
    editorialGoal: 'Clarify why strategic alignment, vetting, and frictionless matchmaking make the difference between wasted budget and viral success.',
    recommendedDuration: 3.8,
    voiceoverStyle: 'Authoritative agency perspective introducing the bridge concept.',
    onScreenFocus: 'Pulsing geometric core card linking Brand and Creator nodes into JodoCo ecosystem.',
  },
  {
    beatIndex: 7,
    beatName: 'Climax & Signature CTA',
    sceneTemplate: 'Scene7FinalFrame',
    purpose: 'Deliver an iconic closing lockup that earns action without aggressive sales pleading.',
    editorialGoal: 'Anchor the JodoCo identity ("Connect • Create • Grow", "Let\'s Jodo.") with clear URL destination.',
    recommendedDuration: 3.0,
    voiceoverStyle: 'Decisive, memorable closing punchline with destination URL.',
    onScreenFocus: 'Clean signature logo lockup with interactive primary CTA button.',
  },
];

export const JODOCO_CAROUSEL_SLIDE_RULES: CarouselSlideRule[] = [
  {
    slideIndex: 1,
    role: 'hook',
    purpose: 'Stop the swipe on Instagram & LinkedIn with an irresistible value promise.',
    mustAccomplish:
      'State the exact transformation, playbook, or contrarian framework in 6-8 words. Include category badge and swipe cue.',
    recommendedHeaderWords: 7,
    recommendedBodyWords: 16,
    recommendedBullets: 0,
  },
  {
    slideIndex: 2,
    role: 'problem_setup',
    purpose: 'Break down why the status quo / traditional approach fails with concrete evidence.',
    mustAccomplish:
      'Name 2-3 specific symptoms of failure (e.g., banner blindness, zero organic rapport, rising CPA).',
    recommendedHeaderWords: 6,
    recommendedBodyWords: 22,
    recommendedBullets: 3,
  },
  {
    slideIndex: 3,
    role: 'core_value',
    purpose: 'Introduce the core strategic principle or trusted creator solution.',
    mustAccomplish:
      'Explain the psychology of creator trust and why peer recommendation converts higher than direct ads.',
    recommendedHeaderWords: 6,
    recommendedBodyWords: 24,
    recommendedBullets: 3,
  },
  {
    slideIndex: 4,
    role: 'step_detail',
    purpose: 'Provide the actionable step-by-step framework or execution blueprint.',
    mustAccomplish:
      'Outline actionable execution phases so the reader saves the carousel as a practical reference guide.',
    recommendedHeaderWords: 6,
    recommendedBodyWords: 24,
    recommendedBullets: 3,
  },
  {
    slideIndex: 5,
    role: 'summary',
    purpose: 'Synthesize the strategic payoff and long-term compounding outcome.',
    mustAccomplish:
      'Summarize why both sides win (symmetric ROI, sustainable community equity, compounding distribution).',
    recommendedHeaderWords: 6,
    recommendedBodyWords: 20,
    recommendedBullets: 2,
  },
  {
    slideIndex: 6,
    role: 'cta',
    purpose: 'Convert the informed reader into an engaged connection or agency partner.',
    mustAccomplish:
      'Invite saves/shares and direct the reader to JodoCo (jodoco.agency) with a clear next step.',
    recommendedHeaderWords: 5,
    recommendedBodyWords: 12,
    recommendedBullets: 0,
  },
];

export const JODOCO_EDITORIAL_SYSTEM_V1: JodoCoEditorialSystemV1 = {
  version: JODOCO_EDITORIAL_VERSION,

  // ==========================================
  // 1. BRAND VOICE
  // ==========================================
  brandVoice: {
    personality: [
      'The modern matchmaker and strategic bridge between visionary brands and authentic creators.',
      'Grounded, discerning, and high-empathy strategist who respects both creative independence and business ROI.',
      'Unapologetically optimistic about human-centric storytelling; fiercely skeptical of impersonal cold spam and intrusive banner ads.',
      'Transparent, practical, and committed to symmetric win-win outcomes.',
    ],
    tone: [
      'Conversational yet authoritative (speaks like an industry insider chatting with a respected peer).',
      'Crisp, rhythmic, and high-clarity—zero corporate fluff or empty jargon.',
      'Direct and intellectually honest—names problems plainly without sugarcoating.',
      'Encouraging and forward-thinking without resorting to hyperbolic sales hype.',
    ],
    levelOfExpertise: [
      'Deep practitioner literacy across creator economics, algorithmic distribution, and performance marketing.',
      'Understands customer acquisition costs (CAC), retention, return on ad spend (ROAS), and audience fatigue.',
      'Understands creator burnout, contract equity, creative autonomy, and audience trust capital.',
    ],
    conversationalStyle:
      'Spoken-first cadence designed for the ear. Punchy tripartite structure: Statement. Resonance. Actionable outcome.',
    sentenceStyle: {
      maxWordsPerSentence: 14,
      preferredVoice: 'active',
      rhythmGuide:
        'Alternate between short 4-6 word punchy statements and 10-12 word explanatory clauses. Never use semicolons in spoken scripts.',
    },
    vocabulary: {
      preferredWords: [
        'bridge',
        'creator',
        'authentic',
        'matchmaker',
        'win-win',
        'ecosystem',
        'flywheel',
        'trust',
        'resonance',
        'rapport',
        'storyteller',
        'distribution',
        'symmetric ROI',
        'community equity',
      ],
      powerPhrases: [
        'Connect • Create • Grow',
        'The Creator Marketing Bridge',
        "Let's Jodo.",
        'Both sides win.',
        'Trust converts where cold ads get skipped.',
        'Creators build the trust. Brands build the scale.',
      ],
      phrasesToAvoid: [
        'growth hacking',
        'secret sauce',
        'crushing it',
        'viral blueprint',
        'guru',
        'drop-shipping',
        '10x your brand overnight',
        'cash cow',
        'influencer blast',
      ],
      bannedWords: [
        'supercharge',
        'synergy',
        'game-changer',
        'revolutionary',
        'skyrocket',
        'hustle',
        'paradigm shift',
        'ninja',
        'rockstar',
      ],
    },
    genericAILanguageToAvoid: [
      "In today's fast-paced digital world...",
      "In the ever-evolving landscape...",
      "Here are 5 ways to...",
      "Let's dive in...",
      "Whether you're a beginner or an expert...",
      "Look no further...",
      "Delve into the nuances...",
      "Unlock your true potential...",
      "Revolutionize your strategy...",
      "Tapestry of content...",
    ],
    writingPrinciples: [
      'Write for the ear first: Every voiceover line must roll off the tongue naturally when spoken aloud.',
      'Front-load the core tension: The viewer must understand the stakes in the first 3 seconds.',
      'Symmetric empathy: Address both the brand’s business pressure and the creator’s artistic integrity.',
      'Clarity over cleverness: A simple truth clearly stated beats a convoluted pun.',
    ],
  },

  // ==========================================
  // 2. HOOK SYSTEM
  // ==========================================
  hookSystem: {
    categories: JODOCO_HOOK_CATEGORIES,
    defaultPreferenceNote:
      'TODO_USER_PREFERENCE: Specify default rank priority among hook styles (e.g. curiosity vs data vs contradiction) based on upcoming campaign focus.',
  },

  // ==========================================
  // 3. REEL STORYTELLING SYSTEM
  // ==========================================
  reelStorytellingSystem: {
    sevenBeatStructure: JODOCO_REEL_SEVEN_BEATS,
  },

  // ==========================================
  // 4. REEL PACING
  // ==========================================
  reelPacing: {
    idealTotalDurationSeconds: 24.5,
    minTotalDurationSeconds: 20.0,
    maxTotalDurationSeconds: 30.0,
    sceneCount: 7,
    sceneDurationRange: { min: 2.5, max: 4.2 },
    informationDensity: 'balanced',
    copyChangeTriggers: [
      'Trigger on-screen text animations on key audio phonemes or SFX cues (every 0.8s to 1.5s).',
      'Never leave static text on screen for more than 3.5 seconds without a visual pulse or card transition.',
    ],
    voiceoverLengthGuidelines: {
      hookScene: '10–14 spoken words (fast, crisp, intriguing).',
      bodyScenes: '14–22 spoken words per scene (rhythmic, unhurried, clean articulation).',
      ctaScene: '6–10 spoken words (decisive, confident, memorable).',
    },
    visualInterruptionFrequency:
      'Introduce a motion pulse, kinetic highlight, or card transition every 2.5 to 3.0 seconds to maintain high viewer retention.',
    whenNotToAddScene: [
      'Do NOT add an 8th or 9th scene if it merely rephrases an existing insight without introducing new evidence.',
      'Do NOT insert generic filler scenes (e.g. "So what does this mean?")—move directly into the payoff.',
    ],
  },

  // ==========================================
  // 5. ON-SCREEN COPY
  // ==========================================
  onScreenCopy: {
    headlines: {
      maxWords: 7,
      guidelines: [
        'Use active, high-impact verbs.',
        'Highlight 1-2 key conceptual words with brand accent color (#FF8C73, #8FE3C0, #B8A7EA).',
        'Ensure title or sentence case—never all caps for full sentences.',
      ],
    },
    subheads: {
      maxWords: 6,
      guidelines: [
        'Clarify the concrete mechanism or context without repeating headline words.',
        'Keep typography light and readable against the dark container background.',
      ],
    },
    kineticText: {
      maxWordsPerPhrase: 4,
      guidelines: [
        'Short rhythmic bursts (e.g. "Creator Creates • Audience Engages • Brand Grows").',
        'Synchronized directly to auditory chime or pop triggers.',
      ],
    },
    bullets: {
      maxItems: 3,
      maxWordsPerItem: 6,
      guidelines: [
        'Each bullet point must start with a distinct active concept.',
        'Keep items parallel in grammatical structure.',
      ],
    },
    statistics: {
      format: 'Bold Number + Short Noun Tag (e.g., "4x Engagement", "84% Skip Rate", "$0 Ad Waste")',
      guidelines: [
        'Always contextualize numbers with a brief metric subtitle.',
        'Use verified industry benchmarks or script-provided figures.',
      ],
    },
    ctaCopy: {
      primaryText: "Let's Jodo.",
      subText: 'jodoco.agency',
      guidelines: [
        'Keep the final CTA minimal, confident, and clutter-free.',
        'Display the clean website URL prominently.',
      ],
    },
    copyToAvoid: [
      'Paragraphs of dense text that cannot be read in 2 seconds.',
      'Redundant statements that mirror the voiceover verbatim.',
      'Unnecessary capitalization on every single word.',
      'Generic social media filler (e.g. "Click the link in bio right now!").',
    ],
  },

  // ==========================================
  // 6. CAROUSEL SYSTEM
  // ==========================================
  carouselSystem: {
    idealSlideCount: 6,
    minSlideCount: 5,
    maxSlideCount: 8,
    slide1HookPrinciples: [
      'Bold headline stating the transformation or contrarian framework in under 8 words.',
      'Category badge highlighting topic lane ("Creator Strategy" / "Brand Playbook").',
      'Clear swipe indicator ("Swipe →") to trigger LinkedIn/Instagram carousel interaction.',
    ],
    informationStructure:
      'Hook (Slide 1) -> Problem Breakdown (Slide 2) -> Strategic Insight (Slide 3) -> Actionable Framework (Slide 4) -> Compounding Payoff (Slide 5) -> Agency CTA (Slide 6)',
    slideHierarchy: JODOCO_CAROUSEL_SLIDE_RULES,
    copyLength: {
      maxHeadlineWords: 8,
      maxBodyWordsPerSlide: 26,
      maxBulletPointsPerSlide: 3,
    },
    ctaPrinciples: [
      'Encourage saves and bookmarking as a tactical reference guide.',
      'Invite brand and creator leaders to connect with JodoCo for matchmaking.',
      'Display official website link (jodoco.agency) cleanly in slide footer.',
    ],
    visualPrinciples: {
      corePhilosophy:
        'The carousel must have its own editorial visual strategy distinct from reels. Do not generate AI visuals simply because a slide exists. Use AI imagery only when it materially improves comprehension, emotion, or attention.',
      aspectRatio: '4:5 (1080x1350 vertical carousel card)',
      safeZoneRule:
        'Always preserve generous negative space for typography overlay. Never bake critical text, subtitles, or UI labels into generated AI images.',
      slideDecisions: {
        hook: 'Prefer strong visual interruption or striking composition when it amplifies the contrarian tension or creator perspective.',
        problem: 'Use relatable real-world imagery, environments, or situations when it deepens emotional/contextual understanding of the pain point.',
        insight: 'Prefer conceptual visuals, diagrams, metaphors, or clean editorial graphics over decorative video.',
        example: 'Concrete imagery or UI/product-style representations when useful to anchor the real-world case.',
        framework: 'Prefer structured diagrams, flowcharts, matrices, numbered visual systems, or editorial graphics rather than unnecessary AI visuals to maximize saveability.',
        outcome: 'Transformation, comparison, or payoff visuals where useful to highlight the compounding growth.',
        cta: 'Prioritize clean typography, brand logo lockup, and official link treatment over distracting visuals.',
      },
      decisionGuidelines: [
        'If typography communicates the idea better -> Choose "text_only".',
        'If a concept is better represented through structure/matrices -> Choose "diagram" or "static_graphic".',
        'If an interface or product concept is being explained -> Choose "ui_mockup".',
        'If human emotion, relatable hook, or authentic creator storytelling elevates the message -> Choose "ai_image" or "ai_video".',
      ],
    },
  },

  // ==========================================
  // 7. CONTENT QUALITY
  // ==========================================
  contentQuality: {
    fidelityRequirements: [
      'Faithfully preserve proprietary names, core concepts, and key arguments from the provided topic/script.',
      'Do NOT hallucinate fictitious case studies, fabricated statistics, or false regulatory claims.',
      'Prioritize the 1-2 strongest intellectual breakthroughs over laundry lists of minor tips.',
    ],
    antiAIFillerPrinciples: [
      'Ban throat-clearing preambles and rhetorical fluff.',
      'Ban conversational boilerplate ("I hope you found this helpful").',
      'Start directly in media res with tension or insight.',
    ],
    hookUniquenessCriteria: [
      'Derive hook angles directly from the raw script nuances rather than generic templates.',
      'Ensure each generation tests a distinct psychological angle (curiosity, contradiction, pain, or data).',
    ],
    specificityEnforcement: [
      'Replace vague generalizations ("good marketing") with concrete mechanisms ("creator-led trust distribution").',
      'Use real-world metrics, units, and scenarios whenever supported by source input.',
    ],
    logicalProgressionChecks: [
      'Every scene/slide must build on the premise of the previous one.',
      'The resolution must directly answer the tension established in the opening hook.',
    ],
    sourceFidelityRules: [
      'Condense without stripping essential author nuance.',
      'When source information is sparse, build out logically from JodoCo core creator-marketing principles.',
    ],
  },

  // ==========================================
  // 8. CONTENT TRANSFORMATION (Reel vs Carousel)
  // ==========================================
  contentTransformation: {
    corePhilosophy:
      'Do NOT simply duplicate identical text between Reel and Carousel. Transform the source script into two specialized media formats.',
    reelPriorities: [
      'Prioritizes spoken phonetics and natural conversational flow.',
      'Pacing optimized for continuous vertical video retention and 100% completion rate.',
      'Visual choreography with animated card reveals, kinetic typography, and synchronized sound cues.',
    ],
    carouselPriorities: [
      'Prioritizes information hierarchy, typography contrast, and skimmability.',
      'High saveability value: Designed as a reference asset users want to bookmark on LinkedIn or Instagram.',
      'Standalone comprehension: Each individual slide provides standalone clarity if screenshot or shared.',
    ],
    formatDistinction:
      'Reel = Cinematic auditory flow and progressive temporal revelations. Carousel = Structured visual knowledge architecture with persistent skimmability.',
  },

  // ==========================================
  // 9. VISUAL THINKING & AI VISUAL INTELLIGENCE (Phase 9)
  // ==========================================
  visualThinking: {
    principles: [
      'Every scene must include a deliberate visual decision (ai_video, static_graphic, text_only, b_roll, none).',
      'The AI must decide visuals based on the STORY and narrative tension, not simply generate video because a scene exists.',
      'Coordinate warm peach (#FF8C73), lavender (#B8A7EA), and mint (#8FE3C0) accents intentionally.',
      'Think in terms of physical layers: background video mood layer, floating cards, animated flywheel nodes, and side-by-side comparison splits.',
    ],
    shotTypes: [
      'centered_hero: Dominant central headline or statement card.',
      'graphic_focus: Highlight on a single core metric or dilemma card.',
      'split_screen: Side-by-side dual win comparisons (Brand vs Creator).',
      'card_stack: Multi-layer depth with animated card transitions.',
      'kinetic_text: Dynamic phrase-by-phrase text reveals.',
      'logo_lockup: Signature brand mark with interactive CTA.',
    ],
    motionStyles: ['snappy_spring', 'smooth_linear', 'kinetic_pop', 'pulsing_glow', 'calm_float'],
    transitionTypes: ['spring_wipe', 'card_slide_left', 'card_slide_up', 'zoom_in', 'cut', 'fade'],
    aiFootageRecommendations: [
      'Suggest specific cinematic generative video prompts when real-world human presence adds emotional weight (e.g. authentic creator reviewing mobile analytics in natural studio lighting).',
      'Keep AI footage prompts grounded in warm tones, 9:16 vertical composition, and modern editorial aesthetics.',
    ],
    editorialVisualPrinciples: {
      hook: 'Prefer strong visual interruption when useful to halt passive scrolling immediately (e.g. high-contrast creator action shot, product unboxing energy).',
      problem: 'Use relatable real-world imagery, environments, people, objects, or situations when they strengthen the problem and ground the frustration.',
      insight: 'Prefer clean conceptual, human, or explanatory visuals that give an instant "aha" realization.',
      example: 'Use concrete visual storytelling and authentic behind-the-scenes creator footage.',
      framework: 'Prefer graphics, diagrams, structured typography, or UI-style visualizations rather than unnecessary AI video to maximize clarity.',
      outcome: 'Use aspirational or transformation-oriented visuals when appropriate to highlight compounding payoffs.',
      cta: 'Usually prioritize typography and brand graphics instead of unnecessary AI video so the next step is unmistakable.',
      whenToAvoidAIVideo: [
        'When text alone communicates the punchline or contrarian point with greater tension.',
        'When a busy video background would distract from complex voiceover explanations.',
        'When the concept is abstract and a structured comparison diagram or metric card is clearer.',
        'When AI generation would add no meaningful storytelling value or narrative grounding.',
      ],
    },
  },

  // ==========================================
  // 10. ANTI-GENERIC-AI RULE
  // ==========================================
  antiGenericAI: {
    bannedTropes: [
      'The "In today\'s fast-paced world" opening cliché.',
      'The "5 game-changing tips to skyrocket your growth" listicle format.',
      'The "Let\'s dive in!" transitional trope.',
      'The "Whether you are X or Y..." generic audience qualifier.',
      'The "Unlock your potential" vague self-help slogan.',
    ],
    prohibitedOpeningPhrases: [
      "In today's fast-paced digital world",
      'In this fast-paced era',
      'Have you ever wondered',
      'Are you tired of',
      'Look no further',
      'Let’s face it',
      'When it comes to marketing',
    ],
    buzzwordsToAvoid: [
      'game-changer',
      'revolutionary',
      'skyrocket',
      'supercharge',
      'synergy',
      'unleash',
      'seamless',
      'tapestry',
      'delve',
    ],
    exceptionCondition:
      'Only use a standard phrase if it is an exact proper noun or literal quotation from the user’s supplied script.',
  },

  // ==========================================
  // 11. QUALITY CHECK & EVALUATION
  // ==========================================
  qualityEvaluation: {
    checklist: [
      'Is the hook specific, high-tension, and free of throat-clearing?',
      'Does every subsequent scene introduce genuine new information rather than circular restatement?',
      'Is the voiceover cadence natural, rhythmic, and pleasant to hear when spoken aloud?',
      'Is the content 100% faithful to the source material without fabricated claims?',
      'Are on-screen headlines constrained to under 8 words and free of wall-of-text paragraphs?',
      'Is the final CTA earned through logical payoff rather than aggressive selling?',
      'Did the output completely eliminate banned AI buzzwords and generic clichés?',
    ],
    internalMetrics: [
      {
        metric: 'hookSpecificityScore',
        scale: '1-10',
        passThreshold: 8,
        description: 'Tension, curiosity, and lack of generic opening tropes.',
      },
      {
        metric: 'informationProgressionScore',
        scale: '1-10',
        passThreshold: 8,
        description: 'Novelty added per beat; zero circular repetition.',
      },
      {
        metric: 'sourceFidelityScore',
        scale: '1-10',
        passThreshold: 9,
        description: 'Faithfulness to supplied topic and script arguments.',
      },
      {
        metric: 'humanVoiceScore',
        scale: '1-10',
        passThreshold: 8,
        description: 'Natural spoken cadence and human conversational tone.',
      },
      {
        metric: 'earnedCtaScore',
        scale: '1-10',
        passThreshold: 8,
        description: 'Climactic alignment with narrative without forced pushiness.',
      },
    ],
  },

  // ==========================================
  // 12. USER PREFERENCE EXTENSIONS (TODO Markers)
  // ==========================================
  userPreferenceNotes: [
    'TODO_USER_PREFERENCE: Specify custom agency sub-slogans and proprietary service trademarks for Scene 7 / Slide 6 lockups.',
    'TODO_USER_PREFERENCE: Set preferred default hook category ranking (e.g. curiosity vs data-led) for automated runs.',
    'TODO_USER_PREFERENCE: Define specific corporate sound cue libraries or synthesized voice persona IDs if desired.',
    'TODO_USER_PREFERENCE: Add client-specific banned competitor names or proprietary client brand guidelines.',
  ],
};

/**
 * Backward-compatible export alias for any legacy imports.
 */
export const JODOCO_CONTENT_RULES = JODOCO_EDITORIAL_SYSTEM_V1;

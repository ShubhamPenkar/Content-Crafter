import { ReelProject, SceneInfo, CanvasAtmosphereSpec, ReelBranding, ReelAudioConfig } from '../types';

export const CANVAS_SPEC: CanvasAtmosphereSpec = {
  width: 1080,
  height: 1920,
  fps: 30,
  duration: 25.0,
  bgGradient: {
    startColor: '#FAF7F2',
    endColor: '#F4EFE6',
  },
  ambientBlobs: [
    { color: '#FF8C73', opacity: 0.14, blur: 24, initialX: 180, initialY: 320, radius: 340 },
    { color: '#B8A7EA', opacity: 0.15, blur: 24, initialX: 880, initialY: 780, radius: 360 },
    { color: '#8FE3C0', opacity: 0.16, blur: 24, initialX: 540, initialY: 1480, radius: 380 },
  ],
  dotGrid: {
    enabled: true,
    size: 48,
    radius: 1.8,
    opacity: 0.06,
  },
  progressTrack: {
    topOffset: 60,
    marginHorizontal: 60,
    height: 8,
    gap: 8,
    trackColor: 'rgba(26, 43, 72, 0.15)',
    fillColor: '#FFB3A7',
  },
};

export const BRANDING_SPEC: ReelBranding = {
  brandName: 'JodoCo',
  companyName: 'JodoCo',
  slogan: 'CONNECT • CREATE • GROW',
  subSlogan: 'Brands × Creators',
  ctaText: "Let's Jodo.",
  ctaSubtext: 'The Creator Marketing Bridge',
  websiteUrl: 'jodoco.agency',
  colors: ['#FF8C73', '#FFD0BF', '#B8A7EA', '#DDD4FC', '#8FE3C0', '#B8F3E5'],
  colorPalette: {
    coral: '#FF8C73',
    lavender: '#B8A7EA',
    mint: '#8FE3C0',
    navy: '#1A2B48',
    cream: '#FAF7F2',
  },
};

export const AUDIO_CONFIG_SPEC: ReelAudioConfig = {
  voiceoverEnabled: true,
  voiceoverLanguage: 'en-US',
  voiceoverStyle: 'friendly_confident',
  bgmEnabled: true,
  bgmBpm: 105,
  bgmStyle: 'lofi_electric_piano',
  sfxEnabled: true,
};

export const CENTRAL_SCENES_SPEC: SceneInfo[] = [
  {
    id: 1,
    name: 'Scene 1: The Hook',
    subtitle: 'Creator Economy 101',
    startTime: 0.0,
    endTime: 3.0,
    voiceover: "Okay, so… what's influencer marketing?",
    onScreenText: ['INFLUENCER', 'MARKETING?', 'explained in 20 seconds'],
    keyVisual: 'Pastel circles, animated connector lines & minimal product peek',
    colorTheme: {
      accent: '#FF8C73',
      secondary: '#B8A7EA',
      bgPill: '#F2EDE4',
    },
    visuals: {
      topBadge: {
        text: 'Creator Economy 101',
        icon: 'sparkles',
        color: '#0F172A',
        bgColor: 'rgba(255, 255, 255, 0.8)',
      },
      headline: {
        line1: 'INFLUENCER',
        line2: 'MARKETING?',
        fullText: 'WHAT IS INFLUENCER MARKETING?',
        highlightColor: '#FF8C73',
      },
      explainerPill: {
        text: 'explained in 20 seconds',
        icon: 'zap',
        accentColor: '#8FE3C0',
      },
      cards: [
        { id: 'brand-peek', title: 'Brand', icon: '📦', accentColor: '#FF8C73' },
        { id: 'creator-peek', title: 'Creator', icon: '✨', accentColor: '#8FE3C0' },
      ],
    },
    audioSpec: {
      voiceoverText: "Okay, so… what's influencer marketing?",
      voiceoverStartOffset: 0.2,
      sfxCues: [
        { type: 'whoosh', timeOffset: 0.1 },
        { type: 'chime', timeOffset: 1.2 },
      ],
    },
  },
  {
    id: 2,
    name: 'Scene 2: The Brand',
    subtitle: 'Step 1: The Brand Challenge',
    startTime: 3.0,
    endTime: 6.0,
    voiceover: 'A brand wants people to notice its product.',
    onScreenText: ['A brand wants people to notice its product.'],
    keyVisual: 'Minimal D2C product card with animated coral dotted connector extending right',
    colorTheme: {
      accent: '#FF8C73',
      secondary: '#9FE8D4',
      bgPill: '#FFE8E2',
    },
    visuals: {
      topBadge: {
        text: 'Step 1: The Brand Challenge',
        color: '#0F172A',
        bgColor: 'rgba(255, 255, 255, 0.9)',
      },
      headline: {
        fullText: 'A brand wants people to notice its product.',
        highlightWord: 'notice',
        highlightColor: '#FF8C73',
      },
      cards: [
        {
          id: 'product-aura',
          title: 'Aura Botanical Serum',
          subtitle: 'Modern D2C Brand',
          badge: '4.9 D2C',
          price: '$38',
          accentColor: '#FF8C73',
        },
      ],
      kineticLines: ['How does a brand cut through traditional ad fatigue?'],
    },
    audioSpec: {
      voiceoverText: 'A brand wants people to notice its product.',
      voiceoverStartOffset: 0.1,
      sfxCues: [
        { type: 'pop', timeOffset: 0.2 },
        { type: 'rise', timeOffset: 1.8 },
      ],
    },
  },
  {
    id: 3,
    name: 'Scene 3: The Creator',
    subtitle: 'Step 2: The Solution',
    startTime: 6.0,
    endTime: 10.0,
    voiceover: 'So they partner with the right creator. Someone their audience already trusts.',
    onScreenText: ['Instead of traditional cold ads:', 'Partner with a creator who already has the right audience.'],
    keyVisual: 'Friendly creator profile with engagement stats connected by dynamic bridge',
    colorTheme: {
      accent: '#8FE3C0',
      secondary: '#B8A7EA',
      bgPill: '#E5FAF2',
    },
    visuals: {
      topBadge: {
        text: 'Step 2: The Solution',
        color: '#0F172A',
        bgColor: 'rgba(255, 255, 255, 0.9)',
      },
      headline: {
        line1: 'Instead of traditional cold ads:',
        line2: 'Partner with a creator who already has the right audience.',
        highlightWord: 'right audience.',
        highlightColor: '#8FE3C0',
      },
      cards: [
        {
          id: 'creator-alexa',
          title: 'Alexa • Lifestyle & D2C',
          subtitle: '240K engaged followers',
          badge: 'Matched by JodoCo',
          metrics: ['8.4% Eng. Rate', 'High Trust'],
          bullets: [{ title: 'Authentic Storytelling', icon: 'video' }],
          accentColor: '#8FE3C0',
        },
      ],
    },
    audioSpec: {
      voiceoverText: 'So they partner with the right creator. Someone their audience already trusts.',
      voiceoverStartOffset: 0.1,
      sfxCues: [
        { type: 'whoosh', timeOffset: 0.2 },
        { type: 'chime', timeOffset: 1.5 },
      ],
    },
  },
  {
    id: 4,
    name: 'Scene 4: The Content',
    subtitle: 'Step 3: The Flywheel',
    startTime: 10.0,
    endTime: 14.0,
    voiceover: 'The creator makes content. People see it. The brand gets noticed.',
    onScreenText: ['Creator creates.', 'Audience watches.', 'Brand gets noticed.'],
    keyVisual: 'Active short-form Reel UI with popping likes, comments & views counter',
    colorTheme: {
      accent: '#B8A7EA',
      secondary: '#FF8C73',
      bgPill: '#F0ECFA',
    },
    visuals: {
      topBadge: {
        text: 'Step 3: The Flywheel',
        color: '#0F172A',
        bgColor: 'rgba(255, 255, 255, 0.9)',
      },
      phases: [
        { id: 1, threshold: 0.33, label: 'Creator creates.', tag: '🎬 Filming Reel', accentColor: '#B8A7EA' },
        { id: 2, threshold: 0.66, label: 'Audience watches.', tag: '👀 18.5k Views', accentColor: '#8FE3C0' },
        { id: 3, threshold: 1.0, label: 'Brand gets noticed.', tag: 'Orders +340%', accentColor: '#FF8C73' },
      ],
      cards: [
        {
          id: 'reel-mock',
          title: 'Morning Routine with Aura Serum ✨',
          subtitle: '@alexa_creates • 24.8k likes • 842 comments',
          accentColor: '#FF8C73',
        },
      ],
    },
    audioSpec: {
      voiceoverText: 'The creator makes content. People see it. The brand gets noticed.',
      voiceoverStartOffset: 0.1,
      sfxCues: [
        { type: 'pop', timeOffset: 0.3 },
        { type: 'pop', timeOffset: 1.6 },
        { type: 'chime', timeOffset: 2.8 },
      ],
    },
  },
  {
    id: 5,
    name: 'Scene 5: Both Sides Win',
    subtitle: 'Win-Win Ecosystem',
    startTime: 14.0,
    endTime: 18.0,
    voiceover: 'The brand gets reach. The creator gets paid.',
    onScreenText: ['Reach & Trust for Brands', 'Paid Collabs for Creators', 'Both sides benefit when the partnership is right.'],
    keyVisual: 'Clean split-screen with glowing handshake connection bridge',
    colorTheme: {
      accent: '#8FE3C0',
      secondary: '#FF8C73',
      bgPill: '#FAF0E6',
    },
    visuals: {
      topBadge: {
        text: 'Win-Win Ecosystem',
        color: '#0F172A',
        bgColor: 'rgba(255, 255, 255, 0.9)',
      },
      headline: {
        fullText: 'Both sides benefit when the partnership is right.',
        highlightWord: 'partnership is right.',
        highlightColor: '#FF8C73',
      },
      cards: [
        {
          id: 'brand-benefits',
          title: 'BRAND',
          icon: '🏢',
          bullets: [
            { title: 'Reach', subtitle: 'Targeted eyes' },
            { title: 'Trust', subtitle: 'Creator credibility' },
            { title: 'Customers', subtitle: 'High conversion' },
          ],
          accentColor: '#FF8C73',
        },
        {
          id: 'creator-benefits',
          title: 'CREATOR',
          icon: '✨',
          bullets: [
            { title: 'Paid Collabs', subtitle: 'Monetize content' },
            { title: 'Creative Free', subtitle: 'Original format' },
            { title: 'Fair Split', subtitle: 'Timely payouts' },
          ],
          accentColor: '#8FE3C0',
        },
      ],
    },
    audioSpec: {
      voiceoverText: 'The brand gets reach. The creator gets paid.',
      voiceoverStartOffset: 0.1,
      sfxCues: [
        { type: 'whoosh', timeOffset: 0.1 },
        { type: 'chime', timeOffset: 1.5 },
      ],
    },
  },
  {
    id: 6,
    name: 'Scene 6: JodoCo',
    subtitle: 'The Ultimate Matchmaker',
    startTime: 18.0,
    endTime: 22.0,
    voiceover: "But it works best when they're the right fit.",
    onScreenText: ['RIGHT CREATOR.', 'RIGHT AUDIENCE.', 'RIGHT PARTNERSHIP.', "That's where JodoCo comes in."],
    keyVisual: 'Dynamic convergence of brand and creator into the JodoCo bridge mark',
    colorTheme: {
      accent: '#FF8C73',
      secondary: '#B8A7EA',
      bgPill: '#FFE9E4',
    },
    visuals: {
      topBadge: {
        text: 'The Ultimate Matchmaker',
        icon: 'sparkles',
        color: '#0F172A',
        bgColor: 'rgba(255, 255, 255, 0.95)',
      },
      phases: [
        { id: 1, threshold: 0.25, label: 'RIGHT CREATOR.', tag: 'Vetted & Authentic', accentColor: '#B8A7EA' },
        { id: 2, threshold: 0.5, label: 'RIGHT AUDIENCE.', tag: 'High Intent', accentColor: '#8FE3C0' },
        { id: 3, threshold: 0.75, label: 'RIGHT PARTNERSHIP.', tag: 'Win-Win ROI', accentColor: '#FF8C73' },
        { id: 4, threshold: 1.0, label: "That's where JodoCo comes in.", accentColor: '#1A2B48' },
      ],
    },
    audioSpec: {
      voiceoverText: "But it works best when they're the right fit.",
      voiceoverStartOffset: 0.1,
      sfxCues: [
        { type: 'pop', timeOffset: 0.2 },
        { type: 'pop', timeOffset: 1.0 },
        { type: 'pop', timeOffset: 1.8 },
        { type: 'rise', timeOffset: 2.6 },
      ],
    },
  },
  {
    id: 7,
    name: 'Final Frame: Climax & CTA',
    subtitle: 'The Creator Marketing Bridge',
    startTime: 22.0,
    endTime: 25.0,
    voiceover: "And that's JodoCo.",
    onScreenText: ['JodoCo', 'CONNECT • CREATE • GROW', 'Brands × Creators', "Let's Jodo."],
    keyVisual: "Large centered official canonical JodoCo logo & pulsing Let's Jodo CTA",
    colorTheme: {
      accent: '#FF8C73',
      secondary: '#8FE3C0',
      bgPill: '#FAF7F2',
    },
    visuals: {
      topBadge: {
        text: 'The Creator Marketing Bridge',
        icon: 'sparkles',
        color: '#1A2B48',
        bgColor: 'rgba(255, 255, 255, 0.9)',
      },
      headline: {
        fullText: 'CONNECT • CREATE • GROW',
        highlightColor: '#FF8C73',
      },
      ctaButton: {
        text: "Let's Jodo.",
        subtext: 'Brands × Creators',
        url: 'jodoco.agency',
      },
    },
    audioSpec: {
      voiceoverText: "And that's JodoCo.",
      voiceoverStartOffset: 0.1,
      sfxCues: [
        { type: 'chime', timeOffset: 0.2 },
        { type: 'drop', timeOffset: 1.5 },
      ],
    },
  },
];

export const COMPLETE_REEL_PROJECT: ReelProject = {
  id: 'jodoco-master-reel-v1',
  title: 'What is Influencer Marketing? | JodoCo Master Reel',
  aspectRatio: '9:16',
  width: 1080,
  height: 1920,
  fps: 30,
  duration: 25.0,
  canvas: CANVAS_SPEC,
  scenes: CENTRAL_SCENES_SPEC,
  branding: BRANDING_SPEC,
  audio: AUDIO_CONFIG_SPEC,
};

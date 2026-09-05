export interface SceneVisualConfig {
  topBadge?: {
    text: string;
    icon?: string;
    color?: string;
    bgColor?: string;
  };
  headline?: {
    line1?: string;
    line2?: string;
    fullText?: string;
    highlightWord?: string;
    highlightColor?: string;
  };
  explainerPill?: {
    text: string;
    icon?: string;
    accentColor?: string;
  };
  cards?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    badge?: string;
    icon?: string;
    price?: string;
    metrics?: string[];
    bullets?: Array<{ title: string; subtitle?: string; icon?: string }>;
    accentColor?: string;
  }>;
  phases?: Array<{
    id: number;
    threshold: number;
    label: string;
    tag?: string;
    accentColor?: string;
  }>;
  kineticLines?: string[];
  ctaButton?: {
    text: string;
    subtext?: string;
    url?: string;
  };
}

export interface SceneAudioSpec {
  voiceoverText: string;
  voiceoverStartOffset: number; // in seconds from scene start
  sfxCues: Array<{
    type: 'whoosh' | 'chime' | 'pop' | 'rise' | 'drop' | 'tap';
    timeOffset: number; // in seconds from scene start
  }>;
}

export interface SceneInfo {
  id: number;
  name: string;
  subtitle: string;
  startTime: number;
  endTime: number;
  voiceover: string;
  onScreenText: string[];
  keyVisual: string;
  colorTheme: {
    accent: string;
    secondary: string;
    bgPill: string;
  };
  visuals?: SceneVisualConfig;
  audioSpec?: SceneAudioSpec;
  // Veo AI Visual fields & Visual Intelligence (Phase 9 & 10)
  videoAssetId?: string;
  visualAssetId?: string;
  videoUrl?: string;
  visualDecision?: 'ai_video' | 'static_graphic' | 'text_only' | 'b_roll' | 'none';
  visualPriority?: 'high' | 'medium' | 'low';
  visualReason?: string;
  visualPrompt?: string;
  visualStatus?: 'idle' | 'generating' | 'ready' | 'error';
  visualStyle?: string;
  visualContinuity?: {
    aesthetic?: string;
    colorMood?: string;
    lighting?: string;
    cameraLanguage?: string;
    continuityNotes?: string;
  };
}

export interface CanvasAtmosphereSpec {
  width: number;
  height: number;
  fps: number;
  duration: number;
  bgGradient: {
    startColor: string;
    endColor: string;
  };
  ambientBlobs: Array<{
    color: string;
    opacity: number;
    blur: number;
    initialX: number;
    initialY: number;
    radius: number;
  }>;
  dotGrid: {
    enabled: boolean;
    size: number;
    radius: number;
    opacity: number;
  };
  progressTrack: {
    topOffset: number;
    marginHorizontal: number;
    height: number;
    gap: number;
    trackColor: string;
    fillColor: string;
  };
}

export interface ReelBranding {
  brandName: string;
  companyName?: string;
  slogan: string;
  subSlogan: string;
  ctaText: string;
  ctaSubtext: string;
  websiteUrl: string;
  colors: string[];
  colorPalette?: {
    coral: string;
    lavender: string;
    mint: string;
    navy: string;
    cream: string;
  };
}

export interface ReelAudioConfig {
  voiceoverEnabled: boolean;
  voiceoverLanguage: string;
  voiceoverStyle: string;
  bgmEnabled: boolean;
  bgmBpm: number;
  bgmStyle: string;
  sfxEnabled: boolean;
}

export interface ReelProject {
  id: string;
  title: string;
  aspectRatio: '9:16';
  width: number;
  height: number;
  fps: number;
  duration: number;
  canvas?: CanvasAtmosphereSpec;
  scenes: SceneInfo[];
  branding: ReelBranding;
  audio: ReelAudioConfig;
  version?: number;
}

export interface PlaybackState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  isLooping: boolean;
  bgmVolume: number;
  bgmEnabled: boolean;
  voiceVolume: number;
  voiceEnabled: boolean;
  sfxEnabled: boolean;
  showInstagramOverlay: boolean;
  showSafeArea: boolean;
  showCaptions: boolean;
}

export type ActiveTab =
  | 'content'
  | 'reel'
  | 'carousel'
  | 'assets'
  | 'export'
  | 'player'
  | 'content-engine'
  | 'storyboard'
  | 'brand';


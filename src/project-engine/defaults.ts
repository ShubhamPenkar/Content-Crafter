import { JodoCoProject, JodoCoAsset, PROJECT_SCHEMA_VERSION, CONTENT_MODEL_VERSION } from './types';
import { DEFAULT_REEL_PROJECT } from '../data/storyboardData';
import { KNOWN_CAROUSEL_FIXTURE } from '../carousel-engine/fixture';
import { KNOWN_JODOCO_FIXTURE } from '../content-engine/fixture';
import { generateMockJodoCoContent } from '../content-engine/gemini';

export const STARTER_ASSETS: JodoCoAsset[] = [
  {
    id: 'asset-jodoco-logo-coral',
    name: 'JodoCo_BrandMark_Coral.svg',
    type: 'logo',
    mimeType: 'image/svg+xml',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23FF8C73"/><path d="M35 50 L45 60 L65 40" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    fileSize: 1420,
    dimensions: { width: 512, height: 512 },
    version: 1,
    status: 'approved',
    source: 'upload',
    createdAt: new Date().toISOString(),
    tags: ['brand', 'logo', 'coral'],
    notes: 'Official JodoCo circular brand badge',
  },
  {
    id: 'asset-jodoco-logo-lavender',
    name: 'JodoCo_Wordmark_Lavender.svg',
    type: 'logo',
    mimeType: 'image/svg+xml',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60"><rect width="240" height="60" rx="12" fill="%23B8A7EA"/><text x="120" y="38" font-family="sans-serif" font-weight="900" font-size="24" fill="%231A2B48" text-anchor="middle">JODOCO</text></svg>',
    fileSize: 1840,
    dimensions: { width: 960, height: 240 },
    version: 1,
    status: 'approved',
    source: 'upload',
    createdAt: new Date().toISOString(),
    tags: ['brand', 'header', 'lavender'],
    notes: 'Primary JodoCo header banner lockup',
  },
  {
    id: 'asset-sfx-whoosh-cue',
    name: 'SFX_Whoosh_Transition_Fast.wav',
    type: 'audio',
    mimeType: 'audio/wav',
    url: '#audio-sfx-whoosh',
    duration: 0.8,
    fileSize: 45200,
    version: 1,
    status: 'approved',
    source: 'upload',
    createdAt: new Date().toISOString(),
    tags: ['audio', 'sfx', 'transition'],
    notes: 'Synthesized dynamic whoosh cue for scene cuts',
  },
  {
    id: 'asset-sfx-chime-pop',
    name: 'SFX_Chime_Success_Melodic.wav',
    type: 'audio',
    mimeType: 'audio/wav',
    url: '#audio-sfx-chime',
    duration: 1.2,
    fileSize: 68100,
    version: 1,
    status: 'approved',
    source: 'upload',
    createdAt: new Date().toISOString(),
    tags: ['audio', 'sfx', 'takeaway'],
    notes: 'Harmonic chime for key metric reveals',
  },
];

export function createDefaultProject(
  name: string = 'Cold Ads vs Creator Trust Campaign',
  topic: string = 'Why Modern Brands Are Shifting From Banner Ads to Creator Partnerships',
  originalScript: string = 'Direct banner ads suffer from extreme audience fatigue and rising CPMs. When brands partner with high-trust niche creators who already have organic rapport, audience engagement jumps 4x. Creator gets funded, brand gets noticed, audience gets authentic recommendations without spam.'
): JodoCoProject {
  const timestamp = new Date().toISOString();
  const generated = KNOWN_JODOCO_FIXTURE;

  return {
    id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    topic,
    originalScript,
    generatedContent: generated,
    reelProject: {
      ...DEFAULT_REEL_PROJECT,
      id: `reel-${Date.now()}`,
    },
    carouselProject: {
      ...KNOWN_CAROUSEL_FIXTURE,
      id: `carousel-${Date.now()}`,
    },
    assets: [...STARTER_ASSETS],
    projectStatus: 'in_production',
    createdAt: timestamp,
    updatedAt: timestamp,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    contentModelVersion: CONTENT_MODEL_VERSION,
  };
}

export function createBlankProject(name: string = 'Untitled JodoCo Project'): JodoCoProject {
  const timestamp = new Date().toISOString();
  const topic = 'New Campaign Strategy';
  const originalScript = 'Enter your core script or raw messaging ideas here...';
  const generated = generateMockJodoCoContent(topic, originalScript);

  return {
    id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    topic,
    originalScript,
    generatedContent: generated,
    reelProject: {
      ...DEFAULT_REEL_PROJECT,
      id: `reel-${Date.now()}`,
      title: name,
    },
    carouselProject: {
      ...KNOWN_CAROUSEL_FIXTURE,
      id: `carousel-${Date.now()}`,
      title: name,
      topic,
    },
    assets: [...STARTER_ASSETS],
    projectStatus: 'draft',
    createdAt: timestamp,
    updatedAt: timestamp,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    contentModelVersion: CONTENT_MODEL_VERSION,
  };
}

import { SceneInfo } from '../types';
import { VisualStylePreset } from './types';

export const STYLE_PRESET_DESCRIPTIONS: Record<VisualStylePreset, { label: string; modifier: string }> = {
  cinematic_d2c: {
    label: 'Clean D2C Product & Brand',
    modifier: '9:16 vertical video, high-end commercial aesthetic, soft daylight, warm neutral tones, sleek minimalist design, 4k quality, subtle smooth camera motion',
  },
  creator_studio: {
    label: 'Creator Studio & Content Production',
    modifier: '9:16 vertical video, modern creator home studio, soft ring light, bokeh background, cinematic depth of field, natural motion, authentic vibe',
  },
  authentic_lifestyle: {
    label: 'Authentic Lifestyle & Social Flow',
    modifier: '9:16 vertical video, natural ambient lighting, candid handheld feel, crisp clarity, clean modern lifestyle aesthetic, organic movement',
  },
  tech_modern: {
    label: 'Modern Tech & Ecosystem',
    modifier: '9:16 vertical video, sleek typography, clean gradient accents, polished motion graphics aesthetic, high-contrast crisp lighting',
  },
  pastel_aesthetic: {
    label: 'JodoCo Pastel Brand Aura',
    modifier: '9:16 vertical video, coral, lavender, and mint pastel accents, clean cream background, smooth fluid dynamics, elegant art direction',
  },
};

/**
 * Builds a prompt tailored for Veo (9:16 vertical) from scene metadata.
 */
export function buildSceneVeoPrompt(
  scene: SceneInfo,
  topic?: string,
  style: VisualStylePreset = 'cinematic_d2c'
): string {
  const styleConfig = STYLE_PRESET_DESCRIPTIONS[style] || STYLE_PRESET_DESCRIPTIONS.cinematic_d2c;
  
  // Specific visual directions per scene type
  let sceneSubject = '';
  switch (scene.id) {
    case 1:
      sceneSubject = 'Dynamic hook visual: A modern smartphone displaying a vibrant social media feed, smooth zoom-in on an engaging creator video, warm daylight studio lighting.';
      break;
    case 2:
      sceneSubject = 'Modern D2C product showcase: An elegant skincare or wellness product bottle with warm soft lighting, subtle revolving pedestal, crisp commercial beauty lighting.';
      break;
    case 3:
      sceneSubject = 'Authentic creator storytelling: A charismatic content creator speaking warmly towards the camera in a stylish sunlit studio, high-trust organic rapport.';
      break;
    case 4:
      sceneSubject = 'Engaging short-form video creation: Behind the scenes view of filming an aesthetic Instagram Reel with ring light and smartphone on tripod.';
      break;
    case 5:
      sceneSubject = 'Brand and creator collaboration: A sleek modern split workspace showing a creative marketing team and an authentic digital creator shaking hands, win-win energy.';
      break;
    case 6:
      sceneSubject = 'Curated matchmaking: Abstract vibrant connection network connecting brand products with authentic digital creators, soft glowing pastel nodes.';
      break;
    case 7:
    default:
      sceneSubject = 'Inspiring agency closing frame: Elegant minimalist modern office backdrop with warm glowing ambient light, forward momentum, premium agency feel.';
      break;
  }

  const promptParts: string[] = [
    sceneSubject,
    `Scene theme: ${scene.name} - ${scene.keyVisual || scene.subtitle}`,
  ];

  if (topic) {
    promptParts.push(`Campaign Context: ${topic}`);
  }

  promptParts.push(styleConfig.modifier);
  promptParts.push('No distorted text, no watermarks, photorealistic, seamless loop motion.');

  return promptParts.join('. ');
}

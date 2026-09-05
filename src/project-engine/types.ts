import { ReelProject } from '../types';
import { CarouselProject } from '../carousel-engine/types';
import { JodoCoGeneratedContent, VisualDirection } from '../content-engine/types';

export const PROJECT_SCHEMA_VERSION = 1;
export const CONTENT_MODEL_VERSION = '1.0.0';

export type ProjectStatus = 'draft' | 'in_production' | 'ready_to_export' | 'exported';

export type AssetType = 'image' | 'video' | 'audio' | 'logo' | 'other';

export type AssetLifecycleStatus = 'reviewing' | 'approved' | 'rejected' | 'archived';

export interface JodoCoAsset {
  id: string; // assetId
  assetId?: string; // alias for id
  name: string;
  type: AssetType;
  mimeType?: string;
  url: string; // Object URL, base64 data URL, or asset path
  fileSize?: number; // In bytes
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // In seconds (for audio/video)
  version: number; // version integer: 1, 2, 3...
  status: AssetLifecycleStatus; // 'reviewing' | 'approved' | 'rejected' | 'archived'
  createdAt: string;
  updatedAt?: string;
  source?: 'veo-ai' | 'upload' | 'mock' | 'user' | string;
  generationModel?: string; // 'veo-3.1-generate-preview' etc.
  prompt?: string;
  sourcePrompt?: string; // backwards compatibility alias
  thumbnail?: string; // base64 or thumbnail URL
  tags?: string[];
  notes?: string;
  sceneId?: number;
  carouselSlideId?: number;
  projectId?: string;
  targetMedium?: 'reel' | 'carousel' | 'general';
  aspectRatio?: '9:16' | '4:5' | '1:1' | '16:9';
  visualDecision?: 'ai_image' | 'ai_video' | 'static_graphic' | 'diagram' | 'ui_mockup' | 'text_only' | 'b_roll' | 'none';
  visualPriority?: 'high' | 'medium' | 'low';
  visualPrompt?: string;
  visualReason?: string;
  generationTimestamp?: string;
  model?: string;
  replacesAssetId?: string;
}

export interface JodoCoProject {
  id: string;
  name: string;
  topic: string;
  originalScript: string;
  generatedContent: JodoCoGeneratedContent | null;
  visualDirection?: VisualDirection;
  reelProject: ReelProject;
  carouselProject: CarouselProject;
  assets: JodoCoAsset[];
  projectStatus: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
  contentModelVersion: string;
}

export type ProjectSaveStatus = 'saved' | 'saving' | 'unsaved';

export type WorkspaceTab = 'content' | 'reel' | 'carousel' | 'assets' | 'quality' | 'export';

import { JodoCoAsset } from '../project-engine/types';

export type VisualGenerationStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

export type VisualStylePreset = 
  | 'cinematic_d2c'
  | 'creator_studio'
  | 'authentic_lifestyle'
  | 'tech_modern'
  | 'pastel_aesthetic';

export interface VisualGenerationRequest {
  sceneId?: number;
  carouselSlideId?: number;
  targetMedium?: 'reel' | 'carousel';
  visualType?: 'image' | 'video';
  prompt: string;
  topic?: string;
  keyVisual?: string;
  style?: VisualStylePreset;
  isTestMode?: boolean;
  projectId?: string;
}

export interface VisualJobRecord {
  jobId: string;
  sceneId?: number;
  carouselSlideId?: number;
  targetMedium?: 'reel' | 'carousel';
  visualType?: 'image' | 'video';
  prompt: string;
  style?: VisualStylePreset;
  status: VisualGenerationStatus;
  progress: number;
  operationName?: string;
  videoUrl?: string;
  imageUrl?: string;
  localFilePath?: string;
  asset?: JodoCoAsset;
  error?: string;
  createdAt: number;
  updatedAt: number;
  isMock: boolean;
  projectId?: string;
}

export interface VisualGenerationResponse {
  success: boolean;
  jobId: string;
  sceneId?: number;
  carouselSlideId?: number;
  targetMedium?: 'reel' | 'carousel';
  message: string;
  isTestMode?: boolean;
}

export interface VisualStatusResponse {
  jobId: string;
  sceneId?: number;
  carouselSlideId?: number;
  targetMedium?: 'reel' | 'carousel';
  status: VisualGenerationStatus;
  progress: number;
  videoUrl?: string;
  imageUrl?: string;
  asset?: JodoCoAsset;
  error?: string;
}

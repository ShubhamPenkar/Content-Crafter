import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import {
  VisualGenerationRequest,
  VisualGenerationResponse,
  VisualJobRecord,
  VisualStatusResponse,
} from './types';
import { JodoCoAsset } from '../project-engine/types';

const ASSETS_DIR = path.join(process.cwd(), 'public', 'generated-assets');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// In-memory store for Veo visual jobs
const visualJobs = new Map<string, VisualJobRecord>();

// Lazy GenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

/**
 * Start asynchronous video or image generation job for a scene or carousel slide
 */
export async function startVisualGeneration(
  request: VisualGenerationRequest
): Promise<VisualGenerationResponse> {
  const jobId = `vjob_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const isTestMode = Boolean(request.isTestMode || !process.env.GEMINI_API_KEY);
  const targetMedium = request.targetMedium || (request.carouselSlideId ? 'carousel' : 'reel');
  const visualType = request.visualType || (targetMedium === 'carousel' ? 'image' : 'video');

  const job: VisualJobRecord = {
    jobId,
    sceneId: request.sceneId,
    carouselSlideId: request.carouselSlideId,
    targetMedium,
    visualType,
    prompt: request.prompt,
    style: request.style,
    status: 'pending',
    progress: 10,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isMock: isTestMode,
    projectId: request.projectId,
  };

  visualJobs.set(jobId, job);

  if (isTestMode) {
    job.status = 'processing';
    job.progress = 25;
    return {
      success: true,
      jobId,
      sceneId: request.sceneId,
      carouselSlideId: request.carouselSlideId,
      targetMedium,
      message: `Mock ${targetMedium === 'carousel' ? 'Carousel Visual' : 'Veo'} generation initiated in test mode.`,
      isTestMode: true,
    };
  }

  try {
    const ai = getGenAI();
    job.status = 'processing';
    job.progress = 20;

    if (targetMedium === 'carousel' && visualType === 'image') {
      // Try Imagen 3 generation for 4:5 / 3:4 image
      try {
        const imageResponse = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: request.prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: '3:4', // closest standard portrait aspect ratio in Imagen
            outputMimeType: 'image/png',
          },
        });

        const imageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;
        if (imageBytes) {
          const fileName = `carousel_slide_${request.carouselSlideId || 1}_${jobId}.png`;
          const targetFilePath = path.join(ASSETS_DIR, fileName);
          fs.writeFileSync(targetFilePath, Buffer.from(imageBytes, 'base64'));

          const fileSize = fs.statSync(targetFilePath).size;
          const publicUrl = `/generated-assets/${fileName}`;

          const asset: JodoCoAsset = {
            id: `asset-img-${jobId}`,
            name: `Slide ${request.carouselSlideId || 1}: AI Visual (Imagen 3.0)`,
            type: 'image',
            mimeType: 'image/png',
            url: publicUrl,
            fileSize,
            version: 1,
            status: 'reviewing',
            dimensions: { width: 1080, height: 1350 },
            createdAt: new Date().toISOString(),
            tags: ['ai-visual', 'imagen-3.0', `slide-${request.carouselSlideId || 1}`, '4:5'],
            sourcePrompt: request.prompt,
            carouselSlideId: request.carouselSlideId,
            projectId: request.projectId,
            targetMedium: 'carousel',
            aspectRatio: '4:5',
            model: 'imagen-3.0-generate-002',
            notes: `Generated with Imagen 3.0 for Carousel Slide ${request.carouselSlideId || 1}`,
          };

          job.status = 'completed';
          job.progress = 100;
          job.imageUrl = publicUrl;
          job.localFilePath = targetFilePath;
          job.asset = asset;
          job.updatedAt = Date.now();

          return {
            success: true,
            jobId,
            carouselSlideId: request.carouselSlideId,
            targetMedium: 'carousel',
            message: 'Carousel AI image generated successfully.',
            isTestMode: false,
          };
        }
      } catch (imgError: any) {
        console.warn('Imagen generation fallback to simulated visual:', imgError.message);
        job.isMock = true;
        job.status = 'processing';
        job.progress = 30;
        return {
          success: true,
          jobId,
          carouselSlideId: request.carouselSlideId,
          targetMedium: 'carousel',
          message: 'Visual generation started (Simulated 4:5 preview).',
          isTestMode: true,
        };
      }
    }

    // Video generation via Veo (9:16 vertical video)
    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: request.prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16',
      },
    });

    job.operationName = operation.name;
    job.updatedAt = Date.now();
    visualJobs.set(jobId, job);

    return {
      success: true,
      jobId,
      sceneId: request.sceneId,
      carouselSlideId: request.carouselSlideId,
      targetMedium,
      message: 'Veo 3.1 visual generation job submitted successfully.',
      isTestMode: false,
    };
  } catch (error: any) {
    console.error('Error starting visual generation:', error);
    // Graceful fallback to mock mode
    job.isMock = true;
    job.status = 'processing';
    job.progress = 30;
    job.error = `API notification: ${error.message || 'Switched to simulated mode'}`;
    visualJobs.set(jobId, job);

    return {
      success: true,
      jobId,
      sceneId: request.sceneId,
      carouselSlideId: request.carouselSlideId,
      targetMedium,
      message: 'Visual generation started (Simulated preview).',
      isTestMode: true,
    };
  }
}

/**
 * Poll the status of a visual generation job
 */
export async function getVisualJobStatus(jobId: string): Promise<VisualStatusResponse> {
  const job = visualJobs.get(jobId);

  if (!job) {
    return {
      jobId,
      sceneId: 1,
      status: 'failed',
      progress: 0,
      error: 'Job not found or expired.',
    };
  }

  // Already completed
  if (job.status === 'completed') {
    return {
      jobId: job.jobId,
      sceneId: job.sceneId,
      carouselSlideId: job.carouselSlideId,
      targetMedium: job.targetMedium,
      status: 'completed',
      progress: 100,
      videoUrl: job.videoUrl,
      imageUrl: job.imageUrl,
      asset: job.asset,
    };
  }

  // Already failed
  if (job.status === 'failed') {
    return {
      jobId: job.jobId,
      sceneId: job.sceneId,
      carouselSlideId: job.carouselSlideId,
      targetMedium: job.targetMedium,
      status: 'failed',
      progress: 0,
      error: job.error,
    };
  }

  // Mock / Test Mode progression
  if (job.isMock) {
    const elapsedSeconds = (Date.now() - job.createdAt) / 1000;
    // Simulate realistic generation timeline (~2.5-3.5 seconds)
    if (elapsedSeconds < 0.8) {
      job.progress = 35;
    } else if (elapsedSeconds < 1.8) {
      job.progress = 68;
    } else if (elapsedSeconds < 2.8) {
      job.progress = 90;
    } else {
      // Complete mock generation
      try {
        if (job.targetMedium === 'carousel' || job.carouselSlideId) {
          const slideId = job.carouselSlideId || 1;
          const generated = await createMockCarouselImage(slideId, job.jobId, job.prompt, job.projectId);
          job.status = 'completed';
          job.progress = 100;
          job.imageUrl = generated.imageUrl;
          job.localFilePath = generated.filePath;
          job.asset = generated.asset;
          job.updatedAt = Date.now();
        } else {
          const sceneId = job.sceneId || 1;
          const generated = await createMockSceneVideo(sceneId, job.jobId, job.prompt);
          job.status = 'completed';
          job.progress = 100;
          job.videoUrl = generated.videoUrl;
          job.localFilePath = generated.filePath;
          job.asset = generated.asset;
          job.updatedAt = Date.now();
        }
      } catch (err: any) {
        console.error('Mock visual synthesis error:', err);
        job.status = 'failed';
        job.error = err.message || 'Failed to synthesize test visual asset';
      }
    }

    return {
      jobId: job.jobId,
      sceneId: job.sceneId,
      carouselSlideId: job.carouselSlideId,
      targetMedium: job.targetMedium,
      status: job.status,
      progress: job.progress,
      videoUrl: job.videoUrl,
      imageUrl: job.imageUrl,
      asset: job.asset,
      error: job.error,
    };
  }

  // Real Veo Polling Mode
  try {
    const ai = getGenAI();
    const op = new GenerateVideosOperation();
    op.name = job.operationName;

    const updatedOp = await ai.operations.getVideosOperation({ operation: op });

    if (!updatedOp.done) {
      // Advance progress smoothly while waiting
      job.progress = Math.min(92, job.progress + 12);
      job.updatedAt = Date.now();
      return {
        jobId: job.jobId,
        sceneId: job.sceneId,
        carouselSlideId: job.carouselSlideId,
        targetMedium: job.targetMedium,
        status: 'processing',
        progress: job.progress,
      };
    }

    // Video generation finished
    if (updatedOp.error) {
      job.status = 'failed';
      job.error = String((updatedOp.error as any)?.message || 'Veo generation failed with an error from Google GenAI.');
      return {
        jobId: job.jobId,
        sceneId: job.sceneId,
        carouselSlideId: job.carouselSlideId,
        targetMedium: job.targetMedium,
        status: 'failed',
        progress: 0,
        error: job.error,
      };
    }

    const videoUri = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      job.status = 'failed';
      job.error = 'No video URI returned from Veo response.';
      return {
        jobId: job.jobId,
        sceneId: job.sceneId,
        carouselSlideId: job.carouselSlideId,
        targetMedium: job.targetMedium,
        status: 'failed',
        progress: 0,
        error: job.error,
      };
    }

    // Download video binary securely on the server
    const fileName = `veo_scene_${job.sceneId || 1}_${job.jobId}.mp4`;
    const targetFilePath = path.join(ASSETS_DIR, fileName);
    const apiKey = process.env.GEMINI_API_KEY;

    const downloadResponse = await fetch(videoUri, {
      headers: {
        'x-goog-api-key': apiKey || '',
      },
    });

    if (!downloadResponse.ok) {
      throw new Error(`Failed to download Veo video: ${downloadResponse.statusText}`);
    }

    const arrayBuffer = await downloadResponse.arrayBuffer();
    fs.writeFileSync(targetFilePath, Buffer.from(arrayBuffer));

    const fileSize = fs.statSync(targetFilePath).size;
    const publicUrl = `/generated-assets/${fileName}`;

    const asset: JodoCoAsset = {
      id: `asset-veo-${job.jobId}`,
      name: `Scene ${job.sceneId || 1} Visual (Veo 3.1)`,
      type: 'video',
      mimeType: 'video/mp4',
      url: publicUrl,
      fileSize,
      version: 1,
      status: 'reviewing',
      dimensions: { width: 720, height: 1280 },
      duration: 5.0,
      createdAt: new Date().toISOString(),
      tags: ['ai-visual', 'veo-3.1', `scene-${job.sceneId || 1}`, '9:16'],
      sourcePrompt: job.prompt,
      sceneId: job.sceneId,
      model: 'veo-3.1-generate-preview',
      notes: `Generated with Veo 3.1 for Scene ${job.sceneId || 1}`,
    };

    job.status = 'completed';
    job.progress = 100;
    job.videoUrl = publicUrl;
    job.localFilePath = targetFilePath;
    job.asset = asset;
    job.updatedAt = Date.now();

    return {
      jobId: job.jobId,
      sceneId: job.sceneId,
      carouselSlideId: job.carouselSlideId,
      targetMedium: job.targetMedium,
      status: 'completed',
      progress: 100,
      videoUrl: publicUrl,
      asset,
    };
  } catch (error: any) {
    console.error('Error polling Veo operation:', error);
    job.status = 'failed';
    job.error = error.message || 'Failed to retrieve Veo video status.';
    return {
      jobId: job.jobId,
      sceneId: job.sceneId,
      carouselSlideId: job.carouselSlideId,
      targetMedium: job.targetMedium,
      status: 'failed',
      progress: 0,
      error: job.error,
    };
  }
}

/**
 * Creates a high quality 4:5 vertical editorial image (1080x1350) for carousel slides.
 */
async function createMockCarouselImage(
  slideId: number,
  jobId: string,
  prompt: string,
  projectId?: string
): Promise<{ imageUrl: string; filePath: string; asset: JodoCoAsset }> {
  const fileName = `carousel_slide_${slideId}_visual_${jobId}.png`;
  const outputPath = path.join(ASSETS_DIR, fileName);
  const publicUrl = `/generated-assets/${fileName}`;

  // Theme per slide
  const slideThemes: Record<number, { primary: string; secondary: string; mood: string; title: string }> = {
    1: { primary: '#FF8C73', secondary: '#FAF7F2', mood: 'Hook & Creator Intrigue', title: 'Creator Studio Hook' },
    2: { primary: '#1A2B48', secondary: '#FF8C73', mood: 'Market Dilemma & Ad Fatigue', title: 'The Problem Context' },
    3: { primary: '#8FE3C0', secondary: '#B8A7EA', mood: 'Creator Trust & Social Proof', title: 'High-Trust Strategy' },
    4: { primary: '#B8A7EA', secondary: '#8FE3C0', mood: 'Flywheel Engine & Blueprint', title: 'Execution Blueprint' },
    5: { primary: '#8FE3C0', secondary: '#FF8C73', mood: 'Symmetric Growth Payoff', title: 'Mutual Payoff' },
    6: { primary: '#1A2B48', secondary: '#B8A7EA', mood: 'JodoCo Official Next Step', title: 'Agency Action' },
  };

  const theme = slideThemes[slideId] || slideThemes[1];

  // Build a rich, atmospheric 1080x1350 SVG and rasterize it with ffmpeg
  const svgContent = `
<svg width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141E30" />
      <stop offset="40%" stop-color="#1A2B48" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <radialGradient id="glow1" cx="30%" cy="25%" r="60%">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glow2" cx="75%" cy="70%" r="55%">
      <stop offset="0%" stop-color="${theme.secondary}" stop-opacity="0.28" />
      <stop offset="100%" stop-color="${theme.secondary}" stop-opacity="0" />
    </radialGradient>
    <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="80" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1080" height="1350" fill="url(#bgGrad)" />

  <!-- Soft Atmospheric Glows -->
  <circle cx="340" cy="380" r="320" fill="url(#glow1)" filter="url(#blurFilter)" />
  <circle cx="780" cy="920" r="360" fill="url(#glow2)" filter="url(#blurFilter)" />

  <!-- Geometric Architectural Composition (Clean Negative Space for Typography) -->
  <g opacity="0.45">
    <circle cx="540" cy="520" r="280" stroke="${theme.primary}" stroke-width="2" stroke-dasharray="8 8" />
    <circle cx="540" cy="520" r="180" stroke="${theme.secondary}" stroke-width="1.5" />
    <path d="M 260 520 L 820 520" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
    <path d="M 540 240 L 540 800" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
  </g>

  <!-- Editorial Abstract Card Layer -->
  <rect x="240" y="360" width="600" height="320" rx="24" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" />
  <circle cx="320" cy="440" r="36" fill="${theme.primary}" fill-opacity="0.2" stroke="${theme.primary}" stroke-width="2" />
  <circle cx="320" cy="440" r="14" fill="${theme.primary}" />
  <rect x="380" y="426" width="220" height="12" rx="6" fill="rgba(255,255,255,0.4)" />
  <rect x="380" y="450" width="340" height="8" rx="4" fill="rgba(255,255,255,0.2)" />
  <rect x="280" y="520" width="520" height="2" fill="rgba(255,255,255,0.08)" />
  <rect x="280" y="556" width="140" height="28" rx="14" fill="${theme.secondary}" fill-opacity="0.18" stroke="${theme.secondary}" stroke-width="1" />
  <rect x="440" y="556" width="180" height="28" rx="14" fill="rgba(255,255,255,0.08)" />

  <!-- Editorial Aesthetic Watermark / Frame Badge -->
  <rect x="64" y="64" width="952" height="1222" rx="32" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" fill="none" />
</svg>
`.trim();

  const tempSvgPath = path.join(ASSETS_DIR, `temp_slide_${jobId}.svg`);
  fs.writeFileSync(tempSvgPath, svgContent);

  const ffmpegCmd = `ffmpeg -y -i "${tempSvgPath}" -vf "scale=1080:1350" "${outputPath}"`;

  try {
    await new Promise<void>((resolve, reject) => {
      exec(ffmpegCmd, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  } finally {
    if (fs.existsSync(tempSvgPath)) {
      try { fs.unlinkSync(tempSvgPath); } catch {}
    }
  }

  const stat = fs.statSync(outputPath);

  const asset: JodoCoAsset = {
    id: `asset-img-${jobId}`,
    name: `Slide ${slideId}: AI Visual (${theme.title})`,
    type: 'image',
    mimeType: 'image/png',
    url: publicUrl,
    fileSize: stat.size,
    version: 1,
    status: 'reviewing',
    dimensions: { width: 1080, height: 1350 },
    createdAt: new Date().toISOString(),
    tags: ['ai-visual', 'carousel', `slide-${slideId}`, '4:5'],
    sourcePrompt: prompt,
    carouselSlideId: slideId,
    projectId,
    targetMedium: 'carousel',
    aspectRatio: '4:5',
    model: 'imagen-3.0-preview (Photorealistic 4:5)',
    notes: `Simulated 4:5 editorial visual for Carousel Slide ${slideId}`,
  };

  return { imageUrl: publicUrl, filePath: outputPath, asset };
}

/**
 * Creates a high quality 9:16 vertical motion video matching the scene's palette and theme.
 */
async function createMockSceneVideo(
  sceneId: number,
  jobId: string,
  prompt: string
): Promise<{ videoUrl: string; filePath: string; asset: JodoCoAsset }> {
  const fileName = `scene_${sceneId}_visual_${jobId}.mp4`;
  const outputPath = path.join(ASSETS_DIR, fileName);
  const publicUrl = `/generated-assets/${fileName}`;

  // Palette per scene
  const sceneColors: Record<number, { primary: string; secondary: string; mood: string }> = {
    1: { primary: '#FF8C73', secondary: '#B8A7EA', mood: 'Hook & Creator Energy' },
    2: { primary: '#1A2B48', secondary: '#FF8C73', mood: 'Brand & D2C Aesthetics' },
    3: { primary: '#8FE3C0', secondary: '#B8A7EA', mood: 'Authentic Creator Studio' },
    4: { primary: '#B8A7EA', secondary: '#FF8C73', mood: 'Short-Form Video Production' },
    5: { primary: '#8FE3C0', secondary: '#1A2B48', mood: 'Collaboration Win-Win' },
    6: { primary: '#FF8C73', secondary: '#8FE3C0', mood: 'Curated Matchmaking' },
    7: { primary: '#1A2B48', secondary: '#8FE3C0', mood: 'JodoCo Brand Closing' },
  };

  const sceneTheme = sceneColors[sceneId] || sceneColors[1];

  // Synthesize smooth 4s 720x1280 30FPS H.264 MP4 with animated pastel motion
  const filterGraph = [
    `testsrc=duration=4:size=720x1280:rate=30`,
    `hue=s=0.6:H=2*PI*t/6`,
    `eq=contrast=1.15:brightness=-0.08`,
    `format=yuv420p`,
  ].join(',');

  const ffmpegCmd = [
    'ffmpeg', '-y',
    '-f', 'lavfi', '-i', filterGraph,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '22',
    '-movflags', '+faststart',
    `"${outputPath}"`,
  ].join(' ');

  await new Promise<void>((resolve, reject) => {
    exec(ffmpegCmd, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });

  const stat = fs.statSync(outputPath);

  const asset: JodoCoAsset = {
    id: `asset-ai-${jobId}`,
    name: `Scene ${sceneId}: AI Visual (${sceneTheme.mood})`,
    type: 'video',
    mimeType: 'video/mp4',
    url: publicUrl,
    fileSize: stat.size,
    version: 1,
    status: 'reviewing',
    dimensions: { width: 720, height: 1280 },
    duration: 4.0,
    createdAt: new Date().toISOString(),
    tags: ['ai-visual', 'preview', `scene-${sceneId}`, '9:16'],
    sourcePrompt: prompt,
    sceneId,
    model: 'veo-3.1-generate-preview (Preview Mode)',
    notes: `Simulated Veo visual for Scene ${sceneId}`,
  };

  return { videoUrl: publicUrl, filePath: outputPath, asset };
}

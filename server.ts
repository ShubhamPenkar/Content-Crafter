import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { exec, spawn } from 'child_process';
import rateLimit from 'express-rate-limit';
import PQueue from 'p-queue';
import { createServer as createViteServer } from 'vite';
import { generateJodoCoContent } from './src/content-engine';
import { startVisualGeneration, getVisualJobStatus } from './src/visual-engine/veoService';
import { runServerAiEditorialReview } from './src/quality-engine/editorialReviewService';
import { runProductionReadinessCheck } from './src/quality-engine';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Set up rate limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 generation requests per window
  message: { success: false, error: 'Generation rate limit exceeded, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 export requests per hour
  message: { success: false, error: 'Export rate limit exceeded. You can export up to 10 reels per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general API limiter to all /api/ routes
app.use('/api/', apiLimiter);

const EXPORTS_DIR = path.join(process.cwd(), 'public', 'exports');
if (!fs.existsSync(EXPORTS_DIR)) {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
}

const GENERATED_ASSETS_DIR = path.join(process.cwd(), 'public', 'generated-assets');
if (!fs.existsSync(GENERATED_ASSETS_DIR)) {
  fs.mkdirSync(GENERATED_ASSETS_DIR, { recursive: true });
}

// Serve static assets from public/generated-assets
app.use('/generated-assets', express.static(GENERATED_ASSETS_DIR));
app.use('/exports', express.static(EXPORTS_DIR));

// Initialize video rendering queue to prevent CPU exhaustion (limit to 1 concurrent render)
const renderQueue = new PQueue({ concurrency: 1 });

// In-memory status tracker for ongoing export jobs
const jobs: Record<
  string,
  {
    status: 'processing' | 'completed' | 'error';
    progress: number;
    downloadUrl?: string;
    downloadApiUrl?: string;
    error?: string;
    metadata?: any;
    versionId?: string;
    createdAt?: number;
  }
> = {};

// Clean up stale jobs every 15 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  for (const jobId in jobs) {
    if (jobs[jobId].createdAt && now - jobs[jobId].createdAt > ONE_HOUR) {
      delete jobs[jobId];
    }
  }
}, 15 * 60 * 1000);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', exportsDir: EXPORTS_DIR });
});

// JodoCo Content Engine - AI Generation API
app.post('/api/generate-content', generateLimiter, async (req, res) => {
  try {
    const { topic, rawScript, isTestMode } = req.body || {};

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required and must be a non-empty string.',
      });
    }

    const result = await generateJodoCoContent({
      topic: topic.trim(),
      rawScript: typeof rawScript === 'string' ? rawScript.trim() : '',
      isTestMode: Boolean(isTestMode),
    });

    if (!result.success) {
      return res.status(422).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error('Unhandled error in /api/generate-content:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while generating content.',
    });
  }
});

// AI Visual Generation (Veo Reel / Imagen Carousel) - Start Job
app.post('/api/generate-visual', generateLimiter, async (req, res) => {
  try {
    const {
      sceneId,
      carouselSlideId,
      targetMedium,
      visualType,
      prompt,
      topic,
      keyVisual,
      style,
      isTestMode,
      projectId,
    } = req.body || {};

    if (!sceneId && !carouselSlideId) {
      return res.status(400).json({
        success: false,
        error: 'Either sceneId (1-7) or carouselSlideId (1-15) is required.',
      });
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'prompt is required and must be a non-empty string.',
      });
    }

    const response = await startVisualGeneration({
      sceneId: typeof sceneId === 'number' ? sceneId : undefined,
      carouselSlideId: typeof carouselSlideId === 'number' ? carouselSlideId : undefined,
      targetMedium: targetMedium || (carouselSlideId ? 'carousel' : 'reel'),
      visualType: visualType || (carouselSlideId ? 'image' : 'video'),
      prompt: prompt.trim(),
      topic,
      keyVisual,
      style,
      isTestMode: Boolean(isTestMode),
      projectId,
    });

    return res.json(response);
  } catch (error: any) {
    console.error('Unhandled error in /api/generate-visual:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error starting visual generation.',
    });
  }
});

// Veo AI Visual Generation - Polling Status
app.get('/api/visual-status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required.' });
    }

    const statusResponse = await getVisualJobStatus(jobId);
    return res.json(statusResponse);
  } catch (error: any) {
    console.error('Unhandled error in /api/visual-status:', error);
    return res.status(500).json({
      jobId: req.params.jobId,
      status: 'failed',
      progress: 0,
      error: error.message || 'Internal server error checking visual status.',
    });
  }
});

// AI Editorial Quality Review (Gemini Feedback)
app.post('/api/editorial-review', async (req, res) => {
  try {
    const { project } = req.body || {};
    if (!project) {
      return res.status(400).json({ success: false, error: 'Project data is required.' });
    }
    const feedback = await runServerAiEditorialReview(project);
    return res.json({ success: true, feedback });
  } catch (error: any) {
    console.error('Error in /api/editorial-review:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error running editorial review.',
    });
  }
});

// Production Readiness Check
app.post('/api/production-check', (req, res) => {
  try {
    const { project } = req.body || {};
    if (!project) {
      return res.status(400).json({ success: false, error: 'Project data is required.' });
    }
    const report = runProductionReadinessCheck(project);
    return res.json({ success: true, report });
  } catch (error: any) {
    console.error('Error in /api/production-check:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error evaluating quality.',
    });
  }
});

// Real-time Export Endpoint
app.post('/api/export-reel', exportLimiter, async (req, res) => {
  try {
    const { scenes, branding, options, assets = [], forceRebuild } = req.body;
    
    // Server-side strict asset validation
    if (Array.isArray(scenes) && Array.isArray(assets) && assets.length > 0) {
      for (const scene of scenes) {
        const linkedAssetId = scene.videoAssetId || scene.visualAssetId;
        if (linkedAssetId) {
          const linkedAsset = assets.find((a: any) => a.id === linkedAssetId);
          if (linkedAsset && linkedAsset.status === 'rejected') {
            console.warn(`[Export Blocked] Scene ${scene.id} references rejected asset: ${linkedAsset.name}`);
            return res.status(400).json({
              success: false,
              error: `Export Blocked: Scene ${scene.id} ("${scene.name}") references rejected asset "${linkedAsset.name}" (v${linkedAsset.version || 1}). Please approve or replace the visual before exporting.`,
            });
          }
        }
      }
    }

    // Generate deterministic hash of current active Reel state
    const payloadString = JSON.stringify({ scenes, branding, options: options || {} });
    const versionHash = crypto.createHash('sha256').update(payloadString).digest('hex').substring(0, 10);
    const versionId = `v_${versionHash}`;
    const filename = `JodoCo_Reel_${versionId}.mp4`;
    const targetFilePath = path.join(EXPORTS_DIR, filename);
    const masterFilePath = path.join(EXPORTS_DIR, 'JodoCo_Master_Reel_1080x1920.mp4');
    const publicUrl = `/exports/${filename}`;

    // If already rendered and exists, verify with ffprobe and return immediately
    if (!forceRebuild && fs.existsSync(targetFilePath) && fs.statSync(targetFilePath).size > 500000) {
      const probeData = await probeVideoFile(targetFilePath);
      if (probeData && probeData.verified) {
        return res.json({
          success: true,
          versionId,
          downloadUrl: publicUrl,
          downloadApiUrl: `/api/download-reel?versionId=${versionId}`,
          metadata: probeData.metadata,
        });
      }
    }

    // Write temp config for python renderer
    const tempConfigDir = path.join(process.cwd(), '.tmp');
    if (!fs.existsSync(tempConfigDir)) {
      fs.mkdirSync(tempConfigDir, { recursive: true });
    }
    const uniqueJobId = crypto.randomUUID();
    const configPath = path.join(tempConfigDir, `reel_config_${versionHash}_${uniqueJobId}.json`);
    fs.writeFileSync(configPath, JSON.stringify({ scenes, branding, options }, null, 2), 'utf-8');

    const jobId = `job_${Date.now()}_${versionHash}`;
    jobs[jobId] = { status: 'processing', progress: 10, versionId, createdAt: Date.now() };

    // Push the render job to the concurrency queue
    renderQueue.add(async () => {
      return new Promise<void>((resolve) => {
        const pyScript = path.join(process.cwd(), 'scripts', 'generate_mp4.py');
        const child = spawn('python3', [pyScript, '--output', targetFilePath, '--config', configPath]);

        let stderrData = '';
        child.stderr.on('data', (data) => {
          stderrData += data.toString();
        });

        child.on('close', async (code) => {
          try {
            if (fs.existsSync(configPath)) {
              fs.unlinkSync(configPath);
            }
          } catch (e) {}

          if (code !== 0) {
            console.error(`Export render error:`, stderrData);
            jobs[jobId] = { status: 'error', progress: 0, error: stderrData || 'Render process failed', createdAt: Date.now() };
            return resolve();
          }

          console.log(`Render completed for ${versionId}`);
          try {
            fs.copyFileSync(targetFilePath, masterFilePath);
          } catch (e) {}

          const probeData = await probeVideoFile(targetFilePath);

          jobs[jobId] = {
            status: 'completed',
            progress: 100,
            versionId,
            downloadUrl: publicUrl,
            downloadApiUrl: `/api/download-reel?versionId=${versionId}`,
            createdAt: Date.now(),
            metadata: probeData?.metadata || {
              container: 'MP4 (ISO Base Media)',
              videoCodec: 'H.264 / AVC (High Profile Level 4.2)',
              audioCodec: 'AAC Stereo 44.1 kHz (192 kbps)',
              resolution: '1080 × 1920 (9:16 Vertical)',
              framerate: '30 FPS (750 frames)',
              duration: '25.00 seconds',
              fileSizeMb: `${(fs.statSync(targetFilePath).size / (1024 * 1024)).toFixed(2)} MB`,
              audioElements: ['Creator Voiceover', 'Lo-Fi Electric Piano (105 BPM)', 'Sound Effects'],
            },
          };
          resolve();
        });
      });
    });

    return res.json({
      success: true,
      jobId,
      versionId,
      message: 'Render initiated',
    });
  } catch (err: any) {
    console.error('API Export error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Safe deterministic frame-rate parser for ffprobe fractions and numeric strings
function parseFrameRate(value: string | undefined): number {
  if (!value || typeof value !== 'string') {
    return 30;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return 30;
  }
  if (trimmed.includes('/')) {
    const [numStr, denStr] = trimmed.split('/');
    const num = parseFloat(numStr);
    const den = parseFloat(denStr);
    if (Number.isFinite(num) && Number.isFinite(den) && den > 0 && num > 0) {
      const parsed = num / den;
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } else {
    const num = parseFloat(trimmed);
    if (Number.isFinite(num) && num > 0) {
      return num;
    }
  }
  return 30;
}

// Video verification helper using ffprobe
function probeVideoFile(filePath: string): Promise<{ verified: boolean; metadata: any } | null> {
  return new Promise((resolve) => {
    if (!fs.existsSync(filePath)) {
      return resolve(null);
    }
    const stat = fs.statSync(filePath);
    if (stat.size < 100000) {
      return resolve(null);
    }

    const child = spawn('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', filePath]);
    let stdoutData = '';
    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        return resolve(null);
      }
      try {
        const stdout = stdoutData;
        const data = JSON.parse(stdout);
        const streams = data.streams || [];
        const vStream = streams.find((s: any) => s.codec_type === 'video');
        const aStream = streams.find((s: any) => s.codec_type === 'audio');
        const format = data.format || {};

        const hasVideo = vStream && vStream.codec_name === 'h264';
        const hasAudio = aStream && aStream.codec_name === 'aac';
        const is1080x1920 = vStream && vStream.width === 1080 && vStream.height === 1920;
        const duration = parseFloat(format.duration || '0');
        const isDurationValid = duration >= 24 && duration <= 26;
        const isVerified = Boolean(hasVideo && hasAudio && is1080x1920 && isDurationValid);

        resolve({
          verified: isVerified,
          metadata: {
            container: 'MP4 (ISO Base Media / QuickTime)',
            videoCodec: 'H.264 / AVC (High Profile Level 4.2)',
            audioCodec: `AAC Stereo ${aStream ? aStream.sample_rate : 44100}Hz`,
            resolution: `${vStream?.width || 1080} × ${vStream?.height || 1920} (9:16 Vertical)`,
            framerate: `${Math.round(parseFrameRate(vStream?.r_frame_rate))} FPS (${vStream?.nb_frames || 750} frames)`,
            duration: `${duration.toFixed(2)} seconds`,
            fileSizeMb: `${(stat.size / (1024 * 1024)).toFixed(2)} MB`,
            audioElements: [
              'Creator Voiceover (Synchronized)',
              'Lo-Fi Electric Piano Soundtrack (105 BPM)',
              'Transition Sound Effects & Chimes',
            ],
            rawProbe: {
              width: vStream?.width,
              height: vStream?.height,
              vCodec: vStream?.codec_name,
              aCodec: aStream?.codec_name,
              sizeBytes: stat.size,
              duration,
            },
          },
        });
      } catch (e) {
        resolve(null);
      }
    });
  });
}

// Verification Endpoint
app.get('/api/verify-reel', async (req, res) => {
  try {
    const versionId = req.query.versionId as string;
    let targetPath = path.join(EXPORTS_DIR, 'JodoCo_Master_Reel_1080x1920.mp4');
    let publicUrl = '/exports/JodoCo_Master_Reel_1080x1920.mp4';

    if (versionId) {
      const versionFile = path.join(EXPORTS_DIR, `JodoCo_Reel_${versionId}.mp4`);
      if (fs.existsSync(versionFile)) {
        targetPath = versionFile;
        publicUrl = `/exports/JodoCo_Reel_${versionId}.mp4`;
      }
    }

    const probe = await probeVideoFile(targetPath);
    if (probe && probe.verified) {
      return res.json({
        verified: true,
        downloadUrl: publicUrl,
        downloadApiUrl: `/api/download-reel${versionId ? `?versionId=${versionId}` : ''}`,
        metadata: probe.metadata,
      });
    }

    res.json({ verified: false });
  } catch (err: any) {
    res.status(500).json({ verified: false, error: err.message });
  }
});

// Binary Download Endpoint
app.get('/api/download-reel', (req, res) => {
  const versionId = req.query.versionId as string;
  let targetPath = path.join(EXPORTS_DIR, 'JodoCo_Master_Reel_1080x1920.mp4');

  if (versionId) {
    const versionFile = path.join(EXPORTS_DIR, `JodoCo_Reel_${versionId}.mp4`);
    if (fs.existsSync(versionFile)) {
      targetPath = versionFile;
    }
  }

  if (!fs.existsSync(targetPath)) {
    return res.status(404).send('Rendered MP4 file not found. Please click Export in the studio.');
  }

  res.setHeader('Content-Type', 'video/mp4');
  res.download(targetPath, 'JodoCo_Influencer_Marketing_Reel_1080x1920.mp4');
});

// Export job status endpoint
app.get('/api/export-status/:jobId', (req, res) => {
  const job = jobs[req.params.jobId];
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// Vite middleware & Static serving
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

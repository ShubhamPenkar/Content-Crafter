import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Video,
  X,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Film,
  Zap,
  Sliders,
  Eye,
  Trash2,
  Compass,
  Check,
} from 'lucide-react';
import { SceneInfo } from '../types';
import { JodoCoAsset } from '../project-engine/types';
import {
  buildSceneVeoPrompt,
  STYLE_PRESET_DESCRIPTIONS,
  VisualStylePreset,
  VisualStatusResponse,
} from '../visual-engine';
import { buildProductionVeoPrompt } from '../content-engine/visualPrompt';

interface SceneVisualGeneratorModalProps {
  scene: SceneInfo;
  topic?: string;
  isOpen: boolean;
  onClose: () => void;
  onAttachVisual: (sceneId: number, asset: JodoCoAsset, videoUrl: string, prompt: string) => void;
  onDetachVisual?: (sceneId: number) => void;
  onAddAsset?: (asset: JodoCoAsset) => void;
  projectAssets?: JodoCoAsset[];
  onSelectExistingAsset?: (asset: JodoCoAsset) => void;
}

export const SceneVisualGeneratorModal: React.FC<SceneVisualGeneratorModalProps> = ({
  scene,
  topic,
  isOpen,
  onClose,
  onAttachVisual,
  onDetachVisual,
  onAddAsset,
  projectAssets = [],
  onSelectExistingAsset,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<VisualStylePreset>('cinematic_d2c');
  const [prompt, setPrompt] = useState<string>('');
  const [isTestMode, setIsTestMode] = useState<boolean>(true);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<
    'idle' | 'pending' | 'processing' | 'completed' | 'failed'
  >('idle');
  const [progress, setProgress] = useState<number>(0);
  const [generatedAsset, setGeneratedAsset] = useState<JodoCoAsset | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(scene.videoUrl || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  // Filter version history for this specific scene
  const sceneHistoryAssets = projectAssets.filter(
    (a) => a.sceneId === scene?.id && a.type === 'video'
  ).sort((a, b) => (b.version || 1) - (a.version || 1));

  // Current active asset if any
  const currentAsset = projectAssets.find((a) => a.id === scene?.videoAssetId);
  const nextVersionNumber = sceneHistoryAssets.length > 0
    ? Math.max(...sceneHistoryAssets.map((a) => a.version || 1)) + 1
    : 1;

  // Initialize prompt when scene or style changes
  useEffect(() => {
    if (scene) {
      if (scene.visualPrompt) {
        setPrompt(scene.visualPrompt);
      } else {
        const defaultPrompt = buildProductionVeoPrompt({
          scene,
          topic,
        });
        setPrompt(defaultPrompt);
      }
      if (scene.videoUrl) {
        setGeneratedVideoUrl(scene.videoUrl);
      }
    }
  }, [scene, selectedStyle, topic]);

  // Asynchronous status polling
  useEffect(() => {
    if (!jobId || generationStatus === 'completed' || generationStatus === 'failed') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/visual-status/${jobId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch visual generation status.');
        }

        const data: VisualStatusResponse = await res.json();
        setGenerationStatus(data.status);
        setProgress(data.progress);

        if (data.status === 'completed' && data.videoUrl) {
          setGeneratedVideoUrl(data.videoUrl);
          if (data.asset) {
            setGeneratedAsset(data.asset);
            if (onAddAsset) {
              onAddAsset(data.asset);
            }
          }
          setIsSubmitting(false);
          clearInterval(pollInterval);
        } else if (data.status === 'failed') {
          setErrorMessage(data.error || 'Video generation failed.');
          setIsSubmitting(false);
          clearInterval(pollInterval);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [jobId, generationStatus, onAddAsset]);

  if (!isOpen) return null;

  const handleStartGeneration = async () => {
    if (!prompt.trim()) return;

    setIsSubmitting(true);
    setGenerationStatus('pending');
    setProgress(10);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: scene.id,
          prompt: prompt.trim(),
          topic,
          keyVisual: scene.keyVisual,
          style: selectedStyle,
          isTestMode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start video generation.');
      }

      setJobId(data.jobId);
      setGenerationStatus('processing');
      setProgress(25);
    } catch (err: any) {
      console.error('Start generation error:', err);
      setGenerationStatus('failed');
      setErrorMessage(err.message || 'Could not connect to Veo generation service.');
      setIsSubmitting(false);
    }
  };

  const handleConfirmAttach = () => {
    if (generatedVideoUrl) {
      const assetToAttach: JodoCoAsset = generatedAsset || {
        id: `asset-ai-scene-${scene.id}-v${nextVersionNumber}-${Date.now()}`,
        assetId: `asset-ai-scene-${scene.id}-v${nextVersionNumber}-${Date.now()}`,
        name: `Scene ${scene.id} AI Visual v${nextVersionNumber} (${scene.name})`,
        type: 'video',
        url: generatedVideoUrl,
        version: nextVersionNumber,
        status: 'reviewing',
        dimensions: { width: 720, height: 1280 },
        duration: 4.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sceneId: scene.id,
        prompt: prompt,
        sourcePrompt: prompt,
        visualPrompt: prompt,
        visualReason: scene.visualReason,
        visualDecision: scene.visualDecision || 'ai_video',
        visualPriority: scene.visualPriority || 'high',
        source: isTestMode ? 'mock' : 'veo-ai',
        generationModel: isTestMode ? 'veo-3.1-preview (Test Mode)' : 'veo-3.1-generate-preview',
        model: isTestMode ? 'veo-3.1-preview (Test Mode)' : 'veo-3.1-generate-preview',
        tags: ['ai-visual', `scene-${scene.id}`, `v${nextVersionNumber}`, '9:16'],
      };

      if (onAddAsset && !generatedAsset) {
        onAddAsset(assetToAttach);
      }

      onAttachVisual(scene.id, assetToAttach, generatedVideoUrl, prompt);
      onClose();
    }
  };

  const handleDetach = () => {
    if (onDetachVisual) {
      onDetachVisual(scene.id);
    }
    setGeneratedVideoUrl(null);
    setGeneratedAsset(null);
    setGenerationStatus('idle');
    setProgress(0);
  };

  const handleResetPrompt = () => {
    const freshPrompt = scene.visualPrompt || buildSceneVeoPrompt(scene, topic, selectedStyle);
    setPrompt(freshPrompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-[#EAE6DF] space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-[#1A2B48] shadow-xs"
              style={{ backgroundColor: scene.colorTheme.accent }}
            >
              0{scene.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1A2B48] font-heading">
                  AI Visual Generator • Scene {scene.id}: {scene.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8FE3C0]/25 text-[#1A2B48] border border-[#8FE3C0]/40">
                  Veo 3.1 (9:16)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate high-definition vertical video visual matched to this scene's narrative beat.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Versioning & Pipeline Banner */}
        <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8FE3C0] animate-pulse" />
            <div>
              <span className="font-bold text-[#1A2B48]">
                {currentAsset ? `Current Active: v${currentAsset.version || 1} (${currentAsset.status || 'reviewing'})` : 'No AI Visual Attached (Vector Fallback)'}
              </span>
              <span className="text-slate-500 block text-[11px]">
                Generating will create <strong>Version {nextVersionNumber}</strong> in <span className="text-amber-700 font-semibold">Reviewing</span> state.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('generate')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'generate'
                  ? 'bg-[#1A2B48] text-white shadow-2xs'
                  : 'bg-white border border-[#EAE6DF] text-[#1A2B48] hover:bg-slate-50'
              }`}
            >
              Generate v{nextVersionNumber}
            </button>
            {sceneHistoryAssets.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-[#1A2B48] text-white shadow-2xs'
                    : 'bg-white border border-[#EAE6DF] text-[#1A2B48] hover:bg-slate-50'
                }`}
              >
                Version History ({sceneHistoryAssets.length})
              </button>
            )}
          </div>
        </div>

        {activeTab === 'history' && sceneHistoryAssets.length > 0 ? (
          /* Scene Version History List */
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A2B48]">
                Previous Versions for Scene {scene.id} ({sceneHistoryAssets.length} total)
              </span>
              <span className="text-[11px] text-slate-500">
                Assets are preserved across revisions.
              </span>
            </div>
            <div className="space-y-2">
              {sceneHistoryAssets.map((histAsset) => {
                const isCurrent = histAsset.id === scene.videoAssetId;
                return (
                  <div
                    key={histAsset.id}
                    className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      isCurrent
                        ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300'
                        : 'bg-[#FAF8F5] border-[#EAE6DF]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 rounded-lg overflow-hidden bg-black shrink-0 relative">
                        <video
                          src={histAsset.url}
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/75 text-white px-1 rounded">
                          v{histAsset.version || 1}
                        </span>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1A2B48] font-heading truncate">
                            {histAsset.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              histAsset.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : histAsset.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : histAsset.status === 'archived'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {histAsset.status || 'reviewing'}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono truncate max-w-md">
                          {histAsset.prompt || histAsset.sourcePrompt}
                        </p>
                        <span className="text-[10px] text-slate-400 block">
                          Generated: {new Date(histAsset.createdAt).toLocaleString()} • {histAsset.generationModel || 'Veo 3.1'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectExistingAsset) {
                              onSelectExistingAsset(histAsset);
                            }
                            onAttachVisual(
                              scene.id,
                              histAsset,
                              histAsset.url,
                              histAsset.prompt || ''
                            );
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#1A2B48] hover:bg-[#253D66] text-white font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                        >
                          Revert to v{histAsset.version || 1}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Generate View */
          <>
            {/* Phase 9 Visual Intelligence Recommendation Banner */}
            {scene.visualDecision && (
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#FF8C73]" />
                    <span className="text-xs font-bold text-[#1A2B48]">Editorial Visual Intelligence</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      scene.visualDecision === 'ai_video'
                        ? 'bg-[#B8A7EA]/25 text-[#1A2B48] border-[#B8A7EA]'
                        : scene.visualDecision === 'static_graphic'
                        ? 'bg-[#8FE3C0]/25 text-[#1A2B48] border-[#8FE3C0]'
                        : scene.visualDecision === 'text_only'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      Decision: {scene.visualDecision.replace('_', ' ')}
                    </span>
                    {scene.visualPriority && (
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                        scene.visualPriority === 'high'
                          ? 'bg-[#FF8C73]/20 text-[#FF6B4A]'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {scene.visualPriority} priority
                      </span>
                    )}
                  </div>
                </div>
                {scene.visualReason && (
                  <p className="text-xs text-[#1A2B48]/80 italic">
                    "{scene.visualReason}"
                  </p>
                )}
              </div>
            )}

            {/* Current Scene Context Card */}
            <div className="bg-[#FAF8F5] border border-[#EAE6DF] rounded-2xl p-3.5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  On-Screen Content
                </span>
                <p className="font-bold text-[#1A2B48] line-clamp-2">
                  {scene.onScreenText.join(' • ')}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Voiceover Script
                </span>
                <p className="italic text-slate-600 line-clamp-2">"{scene.voiceover}"</p>
              </div>
            </div>

            {/* Style Presets */}
            <div>
              <label className="block text-xs font-bold text-[#1A2B48] mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#FF8C73]" />
                Cinematic Style Preset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.entries(STYLE_PRESET_DESCRIPTIONS) as [VisualStylePreset, { label: string }][]).map(
                  ([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedStyle(key)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        selectedStyle === key
                          ? 'border-[#1A2B48] bg-[#1A2B48] text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{val.label}</span>
                        {selectedStyle === key && <CheckCircle2 className="w-3.5 h-3.5 text-[#8FE3C0]" />}
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Prompt Input Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#1A2B48] flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-[#8FE3C0]" />
                  Veo 3.1 Generation Prompt (9:16 Vertical)
                </label>
                <button
                  type="button"
                  onClick={handleResetPrompt}
                  className="text-[11px] font-bold text-[#FF8C73] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  Reset to Recommended
                </button>
              </div>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Detailed 9:16 vertical prompt for Veo 3.1..."
                className="w-full text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-2xl p-3 text-[#1A2B48] placeholder-slate-400 focus:outline-hidden focus:border-[#FF8C73] focus:ring-1 focus:ring-[#FF8C73]"
              />
            </div>

            {/* Test Mode & Options */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#FF8C73]" />
                <div>
                  <span className="text-xs font-bold text-[#1A2B48] block">Mock / Offline Mode</span>
                  <span className="text-[10px] text-slate-500">
                    Generate instant realistic video without making live Veo API calls
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTestMode}
                  onChange={(e) => setIsTestMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF8C73]"></div>
              </label>
            </div>

            {/* Progress & Status */}
            {generationStatus !== 'idle' && (
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1A2B48] flex items-center gap-1.5">
                    {generationStatus === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : generationStatus === 'failed' ? (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <RotateCw className="w-4 h-4 text-[#FF8C73] animate-spin" />
                    )}
                    {generationStatus === 'pending' && 'Queuing Veo Generation...'}
                    {generationStatus === 'processing' && 'Rendering 9:16 Video Asset...'}
                    {generationStatus === 'completed' && 'Visual Asset Ready!'}
                    {generationStatus === 'failed' && 'Generation Failed'}
                  </span>
                  <span className="font-mono text-slate-500">{progress}%</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-linear-to-r from-[#FF8C73] to-[#8FE3C0] h-2 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-600 font-medium">{errorMessage}</p>
                )}
              </div>
            )}

            {/* Video Preview If Available */}
            {generatedVideoUrl && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1A2B48] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#8FE3C0]" />
                  Video Preview (9:16 Aspect)
                </span>
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-9/16 max-h-[260px] mx-auto flex items-center justify-center border border-[#EAE6DF]">
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-[#EAE6DF] pt-4">
          <div>
            {scene.videoUrl && (
              <button
                type="button"
                onClick={handleDetach}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Detach Video
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {generatedVideoUrl && generationStatus === 'completed' ? (
              <button
                type="button"
                onClick={handleConfirmAttach}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Attach to Scene {scene.id}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartGeneration}
                disabled={isSubmitting || !prompt.trim()}
                className="px-5 py-2 rounded-xl bg-[#1A2B48] hover:bg-[#2A3F63] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-[#FF8C73]" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FF8C73]" />
                    Generate Veo Visual
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  X,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sliders,
  Eye,
  Trash2,
  Check,
  Layers,
  Info,
} from 'lucide-react';
import { CarouselSlide } from '../carousel-engine/types';
import { JodoCoAsset } from '../project-engine/types';
import { VisualStatusResponse } from '../visual-engine/types';
import { buildCarouselVisualPrompt } from '../content-engine/carouselVisualPrompt';
import { VisualDirection } from '../content-engine/types';

interface CarouselVisualGeneratorModalProps {
  slide: CarouselSlide;
  topic?: string;
  visualDirection?: VisualDirection;
  isOpen: boolean;
  onClose: () => void;
  onAttachVisual: (slideId: string, asset: JodoCoAsset, visualUrl: string, prompt: string) => void;
  onDetachVisual?: (slideId: string) => void;
  onAddAsset?: (asset: JodoCoAsset) => void;
  projectAssets?: JodoCoAsset[];
  projectId?: string;
  onUpdateAssetStatus?: (assetId: string, status: JodoCoAsset['status']) => void;
}

export const CarouselVisualGeneratorModal: React.FC<CarouselVisualGeneratorModalProps> = ({
  slide,
  topic,
  visualDirection,
  isOpen,
  onClose,
  onAttachVisual,
  onDetachVisual,
  onAddAsset,
  projectAssets = [],
  projectId,
  onUpdateAssetStatus,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isTestMode, setIsTestMode] = useState<boolean>(true);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<
    'idle' | 'pending' | 'processing' | 'completed' | 'failed'
  >('idle');
  const [progress, setProgress] = useState<number>(0);
  const [generatedAsset, setGeneratedAsset] = useState<JodoCoAsset | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(slide.visualUrl || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  // Filter version history for this carousel slide
  const slideHistoryAssets = projectAssets
    .filter((a) => a.carouselSlideId === slide?.slideNumber || a.id === slide?.visualAssetId)
    .sort((a, b) => (b.version || 1) - (a.version || 1));

  // Current active asset if any
  const currentAsset = projectAssets.find((a) => a.id === slide?.visualAssetId);
  const nextVersionNumber =
    slideHistoryAssets.length > 0
      ? Math.max(...slideHistoryAssets.map((a) => a.version || 1)) + 1
      : 1;

  // Initialize prompt when slide opens
  useEffect(() => {
    if (slide) {
      if (slide.visualPrompt) {
        setPrompt(slide.visualPrompt);
      } else {
        const generated = buildCarouselVisualPrompt({
          slide: {
            slideNumber: slide.slideNumber,
            role: (slide.template === 'problem_tension'
              ? 'problem_setup'
              : slide.template === 'example_evidence' || slide.template === 'framework_takeaway'
              ? 'step_detail'
              : slide.template === 'outcome_shift'
              ? 'summary'
              : slide.template === 'cta'
              ? 'cta'
              : slide.template === 'insight'
              ? 'core_value'
              : 'hook') as any,
            headline: slide.headline,
            bodyCopy: slide.body,
            bulletPoints: slide.supportingBullets,
          },
          topic,
          direction: visualDirection,
        });
        setPrompt(generated);
      }
      if (slide.visualUrl) {
        setGeneratedImageUrl(slide.visualUrl);
      }
    }
  }, [slide, topic, visualDirection]);

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

        if (data.status === 'completed') {
          const url = data.imageUrl || data.videoUrl;
          if (url) {
            setGeneratedImageUrl(url);
          }
          if (data.asset) {
            const enrichedAsset: JodoCoAsset = {
              ...data.asset,
              version: nextVersionNumber,
              carouselSlideId: slide.slideNumber,
              projectId,
              targetMedium: 'carousel',
              aspectRatio: '4:5',
              status: 'reviewing',
            };
            setGeneratedAsset(enrichedAsset);
            if (onAddAsset) {
              onAddAsset(enrichedAsset);
            }
          }
          setIsSubmitting(false);
          clearInterval(pollInterval);
        } else if (data.status === 'failed') {
          setErrorMessage(data.error || 'Generation failed.');
          setIsSubmitting(false);
          clearInterval(pollInterval);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        setErrorMessage(err.message || 'Status polling error.');
        setIsSubmitting(false);
        clearInterval(pollInterval);
      }
    }, 800);

    return () => clearInterval(pollInterval);
  }, [jobId, generationStatus, onAddAsset, nextVersionNumber, slide.slideNumber, projectId]);

  if (!isOpen || !slide) return null;

  const handleStartGeneration = async () => {
    setIsSubmitting(true);
    setGenerationStatus('pending');
    setProgress(5);
    setErrorMessage(null);
    setGeneratedAsset(null);

    try {
      const res = await fetch('/api/generate-visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carouselSlideId: slide.slideNumber,
          targetMedium: 'carousel',
          visualType: 'image',
          prompt: prompt.trim(),
          topic,
          isTestMode,
          projectId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to trigger visual generation.');
      }

      setJobId(data.jobId);
    } catch (err: any) {
      console.error('Error starting generation:', err);
      setErrorMessage(err.message || 'Could not start generation.');
      setGenerationStatus('failed');
      setIsSubmitting(false);
    }
  };

  const handleAttach = () => {
    if (generatedImageUrl) {
      const assetToAttach: JodoCoAsset = generatedAsset || {
        id: `asset-img-manual-${Date.now()}`,
        name: `Slide ${slide.slideNumber}: 4:5 Editorial Visual (v${nextVersionNumber})`,
        type: 'image',
        mimeType: 'image/png',
        url: generatedImageUrl,
        version: nextVersionNumber,
        status: 'reviewing',
        dimensions: { width: 1080, height: 1350 },
        createdAt: new Date().toISOString(),
        tags: ['carousel', `slide-${slide.slideNumber}`, '4:5'],
        sourcePrompt: prompt,
        carouselSlideId: slide.slideNumber,
        projectId,
        targetMedium: 'carousel',
        aspectRatio: '4:5',
      };

      if (!generatedAsset && onAddAsset) {
        onAddAsset(assetToAttach);
      }

      onAttachVisual(slide.id, assetToAttach, generatedImageUrl, prompt);
      onClose();
    }
  };

  const handleDetach = () => {
    if (onDetachVisual) {
      onDetachVisual(slide.id);
      setGeneratedImageUrl(null);
      setGeneratedAsset(null);
    }
  };

  const handleSelectHistoryAsset = (asset: JodoCoAsset) => {
    setGeneratedImageUrl(asset.url);
    setGeneratedAsset(asset);
    if (asset.sourcePrompt) {
      setPrompt(asset.sourcePrompt);
    }
    onAttachVisual(slide.id, asset, asset.url, asset.sourcePrompt || prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2B48]/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col my-8 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE6DF] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF8C73]/15 text-[#FF8C73] flex items-center justify-center border border-[#FF8C73]/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base text-[#1A2B48]">
                  Carousel Slide {slide.slideNumber} Visual Studio
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#8FE3C0]/20 text-[#1A2B48] border border-[#8FE3C0]/40">
                  4:5 Ratio (1080×1350)
                </span>
              </div>
              <p className="text-xs text-[#1A2B48]/70 truncate max-w-md">
                {slide.headline}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#1A2B48]/60 hover:text-[#1A2B48] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EAE6DF] px-6 bg-white">
          <button
            onClick={() => setActiveTab('generate')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'generate'
                ? 'border-[#FF8C73] text-[#1A2B48]'
                : 'border-transparent text-[#1A2B48]/60 hover:text-[#1A2B48]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF8C73]" />
            <span>Generate & Edit Visual</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-[#FF8C73] text-[#1A2B48]'
                : 'border-transparent text-[#1A2B48]/60 hover:text-[#1A2B48]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#8FE3C0]" />
            <span>Version History ({slideHistoryAssets.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === 'generate' ? (
            <>
              {/* Editorial Strategy Box */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A2B48] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#FF8C73]" />
                    Editorial Strategy
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white border border-[#EAE6DF] text-[#1A2B48]">
                      Decision: {slide.visualDecision || 'ai_image'}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#FF8C73]/15 text-[#1A2B48] border border-[#FF8C73]/30">
                      Priority: {slide.visualPriority || 'high'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#1A2B48]/80 leading-relaxed">
                  {slide.visualReason ||
                    'Editorial visual designed to complement headline hierarchy without obscuring text safe zones.'}
                </p>
                {slide.visualContinuity && (
                  <div className="pt-2 border-t border-[#EAE6DF]/60 text-[11px] text-[#1A2B48]/70">
                    <span className="font-bold text-[#1A2B48]">Continuity: </span>
                    {slide.visualContinuity}
                  </div>
                )}
              </div>

              {/* Visual Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1A2B48] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF8C73]" />
                    4:5 Vertical Visual Prompt (1080×1350)
                  </label>
                  <span className="text-[10px] font-mono text-[#1A2B48]/60">
                    Aspect Ratio: 4:5 Vertical
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Vertical 4:5 photographic editorial portrait..."
                  className="w-full text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl p-3 text-[#1A2B48] focus:outline-hidden focus:border-[#FF8C73] leading-relaxed font-mono"
                />
                <p className="text-[11px] text-[#1A2B48]/60">
                  ⚡ Negative constraints enforced: No baked-in text, no brand logos, ample negative space for typography.
                </p>
              </div>

              {/* Generation Controls */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <label className="flex items-center gap-2 text-xs font-bold text-[#1A2B48] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTestMode}
                    onChange={(e) => setIsTestMode(e.target.checked)}
                    className="rounded border-[#EAE6DF] text-[#FF8C73] focus:ring-[#FF8C73]"
                  />
                  <span>Mock / Simulated Mode (Instant preview)</span>
                </label>

                <button
                  onClick={handleStartGeneration}
                  disabled={isSubmitting || !prompt.trim()}
                  className="px-4 py-2 bg-[#FF8C73] hover:bg-[#FF7A5C] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating ({progress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Generate v{nextVersionNumber} Visual</span>
                    </>
                  )}
                </button>
              </div>

              {/* Progress & Error */}
              {isSubmitting && (
                <div className="space-y-1.5">
                  <div className="w-full bg-[#EAE6DF] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FF8C73] to-[#8FE3C0] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#1A2B48]/70">
                    <span>Synthesizing high-res 4:5 visual...</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Preview Box */}
              {generatedImageUrl && (
                <div className="space-y-3 pt-2 border-t border-[#EAE6DF]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1A2B48] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#8FE3C0]" />
                      Visual Asset Preview
                    </span>
                    {currentAsset && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#EAE6DF] text-[#1A2B48]">
                        Status: <strong className="uppercase">{currentAsset.status}</strong>
                      </span>
                    )}
                  </div>

                  <div className="relative rounded-xl overflow-hidden bg-black/5 border border-[#EAE6DF] aspect-4/5 max-h-72 mx-auto flex items-center justify-center">
                    <img
                      src={generatedImageUrl}
                      alt={`Slide ${slide.slideNumber} Visual`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono">
                      4:5 Vertical
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Version History Tab */
            <div className="space-y-3">
              <div className="text-xs text-[#1A2B48]/70">
                All generated visual assets for Carousel Slide {slide.slideNumber}. You can switch to any previous version.
              </div>

              {slideHistoryAssets.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-[#EAE6DF] text-xs text-[#1A2B48]/60">
                  No previous versions generated yet for this slide.
                </div>
              ) : (
                <div className="space-y-2">
                  {slideHistoryAssets.map((ast) => {
                    const isAttached = ast.id === slide.visualAssetId;
                    return (
                      <div
                        key={ast.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                          isAttached
                            ? 'bg-[#FF8C73]/10 border-[#FF8C73]'
                            : 'bg-white border-[#EAE6DF] hover:border-[#1A2B48]/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={ast.url}
                            alt={ast.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-15 rounded-lg object-cover bg-black/10 border border-[#EAE6DF] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#1A2B48] truncate">
                                {ast.name}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 text-[#1A2B48]">
                                v{ast.version || 1}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  ast.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ast.status === 'rejected'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {ast.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#1A2B48]/60 truncate max-w-sm mt-0.5">
                              {ast.sourcePrompt || '4:5 Editorial Image'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {onUpdateAssetStatus && (
                            <>
                              {ast.status !== 'approved' && (
                                <button
                                  onClick={() => onUpdateAssetStatus(ast.id, 'approved')}
                                  className="p-1.5 text-xs text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 cursor-pointer"
                                  title="Approve asset"
                                >
                                  Approve
                                </button>
                              )}
                              {ast.status !== 'rejected' && (
                                <button
                                  onClick={() => onUpdateAssetStatus(ast.id, 'rejected')}
                                  className="p-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer"
                                  title="Reject asset"
                                >
                                  Reject
                                </button>
                              )}
                            </>
                          )}

                          {!isAttached ? (
                            <button
                              onClick={() => handleSelectHistoryAsset(ast)}
                              className="px-3 py-1.5 rounded-lg bg-[#1A2B48] text-white text-xs font-bold hover:bg-[#253A5C] cursor-pointer"
                            >
                              Use Version
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-[#FF8C73] flex items-center gap-1 px-2 py-1">
                              <Check className="w-3.5 h-3.5" />
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EAE6DF] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            {slide.visualUrl && (
              <button
                onClick={handleDetach}
                className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Detach Visual</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#1A2B48]/70 hover:text-[#1A2B48] rounded-xl hover:bg-black/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAttach}
              disabled={!generatedImageUrl}
              className="px-5 py-2 bg-[#1A2B48] text-white text-xs font-bold rounded-xl hover:bg-[#253A5C] disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#8FE3C0]" />
              <span>Attach to Slide {slide.slideNumber}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

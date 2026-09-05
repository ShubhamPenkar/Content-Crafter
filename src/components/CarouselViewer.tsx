import React, { useState } from 'react';
import { CarouselProject, CarouselSlide } from '../carousel-engine/types';
import { SlideRenderer } from '../carousel-engine/SlideRenderer';
import { SlideInspector } from './SlideInspector';
import { exportCarousel, ExportCarouselResult } from '../carousel-engine/bridge';
import { KNOWN_CAROUSEL_FIXTURE } from '../carousel-engine/fixture';
import { CarouselVisualGeneratorModal } from './CarouselVisualGeneratorModal';
import { JodoCoAsset } from '../project-engine/types';
import { VisualDirection } from '../content-engine/types';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck,
  Check,
  Copy,
  Sliders,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CarouselViewerProps {
  project: CarouselProject;
  onUpdateProject: (updated: CarouselProject) => void;
  onResetProject?: () => void;
  onLoadFixture?: () => void;
  projectAssets?: JodoCoAsset[];
  topic?: string;
  visualDirection?: VisualDirection;
  projectId?: string;
  onAddAsset?: (asset: JodoCoAsset) => void;
  onUpdateAssetStatus?: (assetId: string, status: JodoCoAsset['status']) => void;
  onAttachVisual?: (slideId: string, asset: JodoCoAsset, visualUrl: string, prompt: string) => void;
  onDetachVisual?: (slideId: string) => void;
}

export function CarouselViewer({
  project,
  onUpdateProject,
  onResetProject,
  onLoadFixture,
  projectAssets = [],
  topic,
  visualDirection,
  projectId,
  onAddAsset,
  onUpdateAssetStatus,
  onAttachVisual,
  onDetachVisual,
}: CarouselViewerProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportResult, setExportResult] = useState<ExportCarouselResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [visualModalSlide, setVisualModalSlide] = useState<CarouselSlide | null>(null);

  const slides = project.slides;
  const currentSlide = slides[activeSlideIndex] || slides[0];
  const totalSlides = slides.length;

  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNextSlide = () => {
    setActiveSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  const handleUpdateCurrentSlide = (updatedSlide: CarouselSlide) => {
    const updatedSlides = slides.map((s, idx) =>
      idx === activeSlideIndex ? updatedSlide : s
    );
    onUpdateProject({
      ...project,
      version: (project.version || 1) + 1,
      updatedAt: new Date().toISOString(),
      slides: updatedSlides,
    });
  };

  const handleAttachVisualLocal = (
    slideId: string,
    asset: JodoCoAsset,
    visualUrl: string,
    prompt: string
  ) => {
    if (onAttachVisual) {
      onAttachVisual(slideId, asset, visualUrl, prompt);
    } else {
      const updatedSlides = slides.map((s) => {
        if (s.id === slideId || String(s.slideNumber) === slideId) {
          return {
            ...s,
            visualUrl,
            visualAssetId: asset.id,
            visualAssetType: 'image' as const,
            visualPrompt: prompt,
            visualVersion: asset.version || 1,
          };
        }
        return s;
      });
      onUpdateProject({
        ...project,
        slides: updatedSlides,
        version: (project.version || 1) + 1,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleDetachVisualLocal = (slideId: string) => {
    if (onDetachVisual) {
      onDetachVisual(slideId);
    } else {
      const updatedSlides = slides.map((s) => {
        if (s.id === slideId || String(s.slideNumber) === slideId) {
          return {
            ...s,
            visualUrl: undefined,
            visualAssetId: undefined,
            visualAssetType: undefined,
          };
        }
        return s;
      });
      onUpdateProject({
        ...project,
        slides: updatedSlides,
        version: (project.version || 1) + 1,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleExportClick = () => {
    const result = exportCarousel(project, projectAssets);
    setExportResult(result);
    setExportModalOpen(true);
    if (result.success) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF8C73', '#B8A7EA', '#8FE3C0', '#1A2B48'],
      });
    }
  };

  const handleCopyManifest = () => {
    if (!exportResult) return;
    navigator.clipboard.writeText(JSON.stringify(exportResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Metadata Bar */}
      <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#B8A7EA]/20 text-[#6B46C1]">
                <Layers className="w-4 h-4" />
              </span>
              <h2 className="font-heading font-black text-xl text-[#1A2B48]">
                {project.title}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#1A2B48]/70 border border-[#EAE6DF]">
                4:5 (1080×1350)
              </span>
            </div>
            <p className="text-xs text-[#1A2B48]/70">
              Interactive 4:5 Instagram Carousel Studio • {totalSlides} Deterministic Slides • Live In-Place Editor
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onLoadFixture && (
              <button
                onClick={onLoadFixture}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#8FE3C0]/20 border border-[#EAE6DF] text-xs font-semibold text-[#1A2B48] transition-colors cursor-pointer"
                title="Load 7-template verification fixture"
              >
                <FileCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Load 7-Slide Fixture</span>
              </button>
            )}

            {onResetProject && (
              <button
                onClick={onResetProject}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#EAE6DF] text-xs font-semibold text-[#1A2B48] transition-colors cursor-pointer"
                title="Reset carousel"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={handleExportClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A2B48] hover:bg-[#253A5C] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#FF8C73]" />
              <span>Export Carousel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Carousel Viewer (5 cols) & Right Slide Inspector (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): 4:5 Slide Stage & Thumbnail Strip */}
        <div className="lg:col-span-5 space-y-4">
          {/* Slide Frame (4:5 Aspect Ratio Container) */}
          <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-3xl border border-[#EAE6DF] shadow-sm flex flex-col items-center">
            {/* 4:5 Stage Wrapper */}
            <div className="w-full max-w-[380px] aspect-[4/5] bg-white rounded-2xl shadow-xl overflow-hidden border border-[#EAE6DF]/80 relative select-none">
              <SlideRenderer
                slide={currentSlide}
                branding={project.branding}
                totalSlides={totalSlides}
              />
            </div>

            {/* Slide Navigation Controls */}
            <div className="w-full max-w-[380px] mt-4 flex items-center justify-between">
              <button
                onClick={handlePrevSlide}
                className="p-2 rounded-xl bg-white hover:bg-black/5 border border-[#EAE6DF] text-[#1A2B48] shadow-2xs transition-all cursor-pointer"
                title="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1A2B48]">
                  Slide {activeSlideIndex + 1} of {totalSlides}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-[#EAE6DF] text-[#1A2B48]/70">
                  {currentSlide.template}
                </span>
              </div>

              <button
                onClick={handleNextSlide}
                className="p-2 rounded-xl bg-white hover:bg-black/5 border border-[#EAE6DF] text-[#1A2B48] shadow-2xs transition-all cursor-pointer"
                title="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="bg-white border border-[#EAE6DF] rounded-2xl p-3 shadow-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold text-[#1A2B48]/70 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-[#FF8C73]" />
                Carousel Slide Strip ({totalSlides} Slides)
              </span>
              <span className="text-[10px] text-[#1A2B48]/50">Click to inspect</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {slides.map((s, idx) => {
                const isActive = idx === activeSlideIndex;
                return (
                  <button
                    key={s.id || idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`shrink-0 w-16 aspect-[4/5] rounded-xl border p-1 flex flex-col justify-between text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#FF8C73] bg-[#FF8C73]/10 ring-2 ring-[#FF8C73]/40 shadow-xs'
                        : 'border-[#EAE6DF] bg-[#FAF8F5] hover:border-[#1A2B48]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-bold">
                      <span className="text-[#1A2B48]">{idx + 1}</span>
                      <span className="text-[7px] font-mono px-1 rounded-sm bg-white/80 border border-[#EAE6DF] truncate max-w-[36px]">
                        {s.template.split('_')[0]}
                      </span>
                    </div>
                    <p className="text-[8px] font-semibold text-[#1A2B48] line-clamp-2 leading-tight">
                      {s.headline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Slide Inspector & In-Place Editor */}
        <div className="lg:col-span-7">
          <SlideInspector
            slide={currentSlide}
            totalSlides={totalSlides}
            onUpdateSlide={handleUpdateCurrentSlide}
            onOpenVisualModal={(slide) => setVisualModalSlide(slide)}
            projectAssets={projectAssets}
            topic={topic}
            onDetachVisual={handleDetachVisualLocal}
          />
        </div>
      </div>

      {/* Carousel Visual Generator Studio Modal */}
      {visualModalSlide && (
        <CarouselVisualGeneratorModal
          slide={visualModalSlide}
          topic={topic}
          visualDirection={visualDirection}
          isOpen={!!visualModalSlide}
          onClose={() => setVisualModalSlide(null)}
          onAttachVisual={handleAttachVisualLocal}
          onDetachVisual={handleDetachVisualLocal}
          onAddAsset={onAddAsset}
          projectAssets={projectAssets}
          projectId={projectId}
          onUpdateAssetStatus={onUpdateAssetStatus}
        />
      )}

      {/* Export Preparation Modal */}
      {exportModalOpen && exportResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#EAE6DF] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#8FE3C0]/20 text-[#0D9488]">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-heading font-black text-lg text-[#1A2B48]">
                    Carousel Export Architecture Ready
                  </h3>
                  <p className="text-xs text-[#1A2B48]/60">
                    Phase 5 Export Preparation Layer
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="p-1 rounded-lg text-[#1A2B48]/50 hover:bg-black/5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE6DF] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#1A2B48]/70">Target Dimensions:</span>
                <span className="font-bold text-[#1A2B48]">
                  {exportResult.dimensions.width} × {exportResult.dimensions.height} ({exportResult.dimensions.aspectRatio})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1A2B48]/70">Slide Count:</span>
                <span className="font-bold text-[#1A2B48]">
                  {exportResult.slideCount} Validated Slides
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1A2B48]/70">Export Pipeline Status:</span>
                <span className="font-bold text-[#0D9488]">
                  Ready for PNG / PDF Generation
                </span>
              </div>
            </div>

            {/* Slide Manifest Summary */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold text-[#1A2B48]/70">
                Slide Export Manifest:
              </span>
              {exportResult.slides.map((s) => (
                <div
                  key={s.slideNumber}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs"
                >
                  <span className="font-bold text-[#1A2B48]">
                    Slide {s.slideNumber}: {s.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#0D9488] bg-[#D1F2EB] px-2 py-0.5 rounded-full">
                    {s.template}
                  </span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleCopyManifest}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EAE6DF] text-xs font-bold text-[#1A2B48] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Manifest' : 'Copy Manifest'}</span>
              </button>

              <button
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1A2B48] text-white text-xs font-bold hover:bg-[#253A5C] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

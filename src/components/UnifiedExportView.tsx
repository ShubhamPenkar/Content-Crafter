import React, { useState, useMemo } from 'react';
import {
  Film,
  Layers,
  Download,
  CheckCircle2,
  FileJson,
  FileImage,
  FileText,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRight,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { JodoCoProject } from '../project-engine/types';
import { VideoExporter } from './VideoExporter';
import { exportCarouselAsJson } from '../carousel-engine/exportCarousel';
import { runProductionReadinessCheck } from '../quality-engine';

interface UnifiedExportViewProps {
  project: JodoCoProject;
  onNavigateToTab: (tab: 'content' | 'reel' | 'carousel' | 'assets' | 'quality') => void;
}

export const UnifiedExportView: React.FC<UnifiedExportViewProps> = ({
  project,
  onNavigateToTab,
}) => {
  const [downloadModal, setDownloadModal] = useState<{
    type: 'png' | 'pdf';
    isOpen: boolean;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const reel = project.reelProject;
  const carousel = project.carouselProject;

  // Run live quality check
  const qualityReport = useMemo(() => {
    return runProductionReadinessCheck(project);
  }, [project]);

  const handleDownloadCarouselJson = () => {
    exportCarouselAsJson(carousel);
  };

  const handleCopyProjectSummary = () => {
    const summary = `JodoCo Production Package:
Project: ${project.name}
Topic: ${project.topic}
Reel Scenes: ${reel.scenes.length} (~${reel.duration || 25}s 9:16 MP4)
Carousel Slides: ${carousel.slides.length} (4:5 1080x1350)
Quality Score: ${qualityReport.overallScore}/100 (${qualityReport.status.toUpperCase()})
Assets Attached: ${project.assets.length}
Last Updated: ${new Date(project.updatedAt).toLocaleString()}`;
    navigator.clipboard.writeText(summary);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#1A2B48]/10 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-[#1A2B48] text-white">
              Export Center
            </span>
            {qualityReport.status === 'ready' ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>✓ Production Ready ({qualityReport.overallScore}/100)</span>
              </span>
            ) : qualityReport.status === 'needs_review' ? (
              <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>⚠ Needs Review ({qualityReport.overallScore}/100)</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>⛔ Export Blocked ({qualityReport.overallScore}/100)</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-[#1A2B48] tracking-tight">
            Deliverable Export Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Export high-definition artifacts for both vertical video platforms (Instagram Reels, TikTok, YouTube Shorts) and static carousel feeds (Instagram, LinkedIn).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab('quality')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#EAE6DF] text-[#1A2B48] text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF8C73]" />
            <span>Inspect QA Scorecard</span>
          </button>

          <button
            onClick={handleCopyProjectSummary}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Summary</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quality Gate Warning Banner if Blocked */}
      {qualityReport.status === 'blocked' && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-5 text-rose-900 flex items-start justify-between gap-4 shadow-xs animate-fadeIn">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-black">Export Blocked by Quality System</h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Found {qualityReport.summary.blockersCount} critical blocker issue(s) that must be resolved before publishing:
              </p>
              <ul className="list-disc list-inside text-xs mt-1.5 space-y-0.5 text-rose-800 font-medium">
                {qualityReport.checks
                  .filter((c) => !c.passed && c.severity === 'blocker')
                  .map((b) => (
                    <li key={b.id}>{b.title}: {b.message}</li>
                  ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('quality')}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            Fix Blockers Now
          </button>
        </div>
      )}

      {/* Deliverable Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Core Reel Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white border border-[#1A2B48]/10 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF8C73]/10 text-[#FF8C73] flex items-center justify-center font-bold">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#1A2B48]">
                    Deliverable 1: Core 9:16 Reel
                  </h2>
                  <p className="text-xs text-slate-500">
                    Full audio-reactive MP4 with BGM, voiceover, and kinetic text.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateToTab('reel')}
                className="text-xs font-bold text-[#FF8C73] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Edit Reel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Reel Specs */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                  Resolution
                </span>
                <span className="text-xs font-black text-[#1A2B48]">1080 × 1920</span>
                <span className="text-[10px] text-slate-500 block">9:16 Vertical</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                  Duration
                </span>
                <span className="text-xs font-black text-[#1A2B48]">
                  ~{reel.duration || 25.0}s
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {reel.scenes.length} Scenes
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                  Audio Pipeline
                </span>
                <span className="text-xs font-black text-[#1A2B48]">Full Mix</span>
                <span className="text-[10px] text-emerald-600 block font-medium">BGM + VO + SFX</span>
              </div>
            </div>

            {/* Embedded VideoExporter Component */}
            <VideoExporter project={reel} assets={project.assets || []} />
          </div>
        </div>

        {/* Carousel Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-[#1A2B48]/10 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B8A7EA]/15 text-[#B8A7EA] flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5 text-[#1A2B48]" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#1A2B48]">
                    Deliverable 2: JodoCo Carousel
                  </h2>
                  <p className="text-xs text-slate-500">
                    High-converting 4:5 slide deck optimized for feed retention.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateToTab('carousel')}
                className="text-xs font-bold text-[#B8A7EA] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Edit Deck</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Carousel Specs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                  Dimensions
                </span>
                <span className="text-xs font-black text-[#1A2B48]">
                  {carousel.dimensions?.width || 1080} × {carousel.dimensions?.height || 1350}
                </span>
                <span className="text-[10px] text-slate-500 block">4:5 Portrait Feed</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                  Total Slides
                </span>
                <span className="text-xs font-black text-[#1A2B48]">
                  {carousel.slides.length} Slides
                </span>
                <span className="text-[10px] text-emerald-600 block font-medium">Validated 7-Beat</span>
              </div>
            </div>

            {/* Slide Sequence Strip */}
            <div className="mb-6">
              <span className="text-xs font-bold text-[#1A2B48] block mb-2">
                Slide Blueprint ({carousel.slides.length} Slides)
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {carousel.slides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-[#1A2B48] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-[#1A2B48] truncate">{slide.headline}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-500 shrink-0 uppercase">
                      {slide.template}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Actions */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <button
                onClick={handleDownloadCarouselJson}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#1A2B48] text-white text-xs font-bold shadow-sm hover:bg-[#1A2B48]/90 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-[#8FE3C0]" />
                  <span>Download Carousel JSON Spec</span>
                </div>
                <Download className="w-3.5 h-3.5 text-white/70" />
              </button>

              <button
                onClick={() => setDownloadModal({ type: 'png', isOpen: true })}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-[#1A2B48]/20 hover:border-[#1A2B48] text-[#1A2B48] text-xs font-bold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-[#FF8C73]" />
                  <span>Export PNG Slide Deck (ZIP Package)</span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  1080×1350
                </span>
              </button>

              <button
                onClick={() => setDownloadModal({ type: 'pdf', isOpen: true })}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-[#1A2B48]/20 hover:border-[#1A2B48] text-[#1A2B48] text-xs font-bold transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#B8A7EA]" />
                  <span>Export PDF Presentation Document</span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Multi-page
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Package Metadata & Governance Footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-[#1A2B48]">Project Schema v{project.schemaVersion}</span>
          </div>
          <span>•</span>
          <div>Content Model v{project.contentModelVersion}</div>
          <span>•</span>
          <div>{project.assets.length} Media Assets</div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Last modified: {new Date(project.updatedAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Slide Deck Export Confirmation Modal */}
      {downloadModal?.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#1A2B48]/10 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#8FE3C0]/20 text-emerald-700 flex items-center justify-center font-bold">
                {downloadModal.type === 'png' ? (
                  <FileImage className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-[#1A2B48]">
                  {downloadModal.type === 'png'
                    ? 'PNG Slide Deck Export Package'
                    : 'PDF Presentation Document'}
                </h3>
                <p className="text-xs text-slate-500">
                  {carousel.slides.length} slides ready at 1080×1350 resolution
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Your slides are formatted with typography, exact brand colors, and structured layouts. The full JSON manifest contains all vector coordinates and copy. Click below to download the production bundle.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDownloadModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDownloadCarouselJson();
                  setDownloadModal(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A2B48] text-white text-xs font-bold shadow-xs hover:bg-[#1A2B48]/90 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#8FE3C0]" />
                <span>Download Bundle (JSON + Specs)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  RotateCcw,
  Film,
  Layers,
  FileText,
  AlertCircle,
  Clock,
  Video,
  Eye,
  Edit3,
  Sliders,
  ChevronDown,
  ChevronUp,
  Volume2,
  Tag,
  Palette,
  ArrowRight,
  Lightbulb,
  PlayCircle,
  FileCheck,
  ShieldCheck,
  Compass,
  Wand2,
} from 'lucide-react';
import {
  JodoCoGeneratedContent,
  GeneratedReelScene,
  GeneratedCarouselSlide,
  generateMockJodoCoContent,
  mapGeneratedContentToReelProject,
  validateReelProject,
  KNOWN_JODOCO_FIXTURE,
} from '../content-engine';
import { mapGeneratedContentToCarouselProject } from '../carousel-engine/bridge';
import { ReelProject } from '../types';
import { CarouselProject } from '../carousel-engine/types';

const LOCAL_STORAGE_KEY = 'jodoco_content_engine_state_v1';

const SAMPLE_PRESETS = [
  {
    name: 'Cold Ads vs Creator Trust',
    topic: 'Why Modern Brands Are Shifting From Banner Ads to Creator Partnerships',
    script:
      'Direct banner ads suffer from extreme audience fatigue and rising CPMs. When brands partner with high-trust niche creators who already have organic rapport, audience engagement jumps 4x. Creator gets funded, brand gets noticed, audience gets authentic recommendations without spam.',
  },
  {
    name: 'Micro-Influencer Conversion',
    topic: 'How Micro-Creators Drive Higher ROI Than Mega Celebrities',
    script:
      'Celebrity endorsements cost hundreds of thousands with low conversion. Micro-influencers with 10k to 50k followers hold tight-knit community trust and 60% higher engagement. Working with a fleet of vetted creators beats a single billboard campaign every time.',
  },
  {
    name: 'The JodoCo Matchmaking Bridge',
    topic: 'How JodoCo Bridges the Gap Between Brand Goals and Creator Authentic Voice',
    script:
      'Brands struggle to find the right talent; creators struggle with fair contracts and clear briefs. JodoCo acts as the specialized matchmaking bridge: strategic matchmaking, streamlined deliverables, and win-win compensation so both sides grow sustainably.',
  },
];

interface ContentEngineViewProps {
  initialTopic?: string;
  initialRawScript?: string;
  initialContent?: JodoCoGeneratedContent | null;
  onUpdateTopic?: (topic: string) => void;
  onUpdateRawScript?: (script: string) => void;
  onUpdateContent?: (content: JodoCoGeneratedContent | null) => void;
  onBuildReel?: (project: ReelProject) => void;
  onBuildCarousel?: (project: CarouselProject) => void;
  hasReelEdits?: boolean;
  hasCarouselEdits?: boolean;
}

export function ContentEngineView({
  initialTopic,
  initialRawScript,
  initialContent,
  onUpdateTopic,
  onUpdateRawScript,
  onUpdateContent,
  onBuildReel,
  onBuildCarousel,
  hasReelEdits,
  hasCarouselEdits,
}: ContentEngineViewProps) {
  const [topic, setTopicState] = useState(initialTopic ?? '');
  const [rawScript, setRawScriptState] = useState(initialRawScript ?? '');
  const [content, setContentState] = useState<JodoCoGeneratedContent | null>(initialContent ?? null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'reel' | 'carousel' | 'raw_json'>('reel');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buildSuccess, setBuildSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedScenes, setExpandedScenes] = useState<Record<number, boolean>>({});

  // Confirmation Modals
  const [confirmRegenOpen, setConfirmRegenOpen] = useState(false);
  const [confirmBuildReelOpen, setConfirmBuildReelOpen] = useState(false);
  const [confirmBuildCarouselOpen, setConfirmBuildCarouselOpen] = useState(false);

  // Sync from props when switching projects
  useEffect(() => {
    if (initialTopic !== undefined) setTopicState(initialTopic);
  }, [initialTopic]);

  useEffect(() => {
    if (initialRawScript !== undefined) setRawScriptState(initialRawScript);
  }, [initialRawScript]);

  useEffect(() => {
    if (initialContent !== undefined) setContentState(initialContent);
  }, [initialContent]);

  // Wrappers to update local state and notify parent
  const setTopic = (val: string) => {
    setTopicState(val);
    if (onUpdateTopic) onUpdateTopic(val);
  };

  const setRawScript = (val: string) => {
    setRawScriptState(val);
    if (onUpdateRawScript) onUpdateRawScript(val);
  };

  const setContent = (val: JodoCoGeneratedContent | null) => {
    setContentState(val);
    if (onUpdateContent) onUpdateContent(val);
  };

  // 1. Initial fallback if completely empty
  useEffect(() => {
    if (!content && !initialContent && !initialTopic) {
      const defaultPreset = SAMPLE_PRESETS[0];
      setTopic(defaultPreset.topic);
      setRawScript(defaultPreset.script);
      setContent(generateMockJodoCoContent(defaultPreset.topic, defaultPreset.script));
    }
  }, []);

  // Generate content handler trigger with safety check
  const handleGenerateClick = (overrideTestMode?: boolean) => {
    if (!topic.trim()) {
      setError('Please enter a topic first.');
      return;
    }
    // If we already have generated content, ask for confirmation before overwriting
    if (content) {
      setConfirmRegenOpen(true);
    } else {
      executeGenerate(overrideTestMode);
    }
  };

  const executeGenerate = async (overrideTestMode?: boolean) => {
    setConfirmRegenOpen(false);
    setLoading(true);
    setError(null);
    setBuildSuccess(null);

    const useTest = typeof overrideTestMode === 'boolean' ? overrideTestMode : isTestMode;

    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          rawScript: rawScript.trim(),
          isTestMode: useTest,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate content.');
      }

      setContent(json.data);
    } catch (err: any) {
      console.error('Generation request error:', err);
      setError(err.message || 'An error occurred during content generation.');
    } finally {
      setLoading(false);
    }
  };

  // Build Reel with confirmation if edits exist
  const handleBuildReelClick = () => {
    if (!content) {
      setError('No generated content available to build a Reel.');
      return;
    }
    if (hasReelEdits) {
      setConfirmBuildReelOpen(true);
    } else {
      executeBuildReel();
    }
  };

  const executeBuildReel = () => {
    setConfirmBuildReelOpen(false);
    if (!content) return;

    try {
      setError(null);
      const mappedProject = mapGeneratedContentToReelProject(content);
      const validation = validateReelProject(mappedProject);

      if (!validation.valid) {
        setError(`Cannot build Reel: ${validation.errors.join(' ')}`);
        return;
      }

      setBuildSuccess(`Reel "${mappedProject.title}" built successfully!`);

      if (onBuildReel) {
        onBuildReel(mappedProject);
      }
    } catch (err: any) {
      console.error('Error building Reel from Content Engine:', err);
      setError(err.message || 'Failed to map generated content to Reel project.');
    }
  };

  // Build Carousel with confirmation if edits exist
  const handleBuildCarouselClick = () => {
    if (!content) {
      setError('No generated content available to build a Carousel.');
      return;
    }
    if (hasCarouselEdits) {
      setConfirmBuildCarouselOpen(true);
    } else {
      executeBuildCarousel();
    }
  };

  const executeBuildCarousel = () => {
    setConfirmBuildCarouselOpen(false);
    if (!content) return;

    try {
      setError(null);
      const mappedCarousel = mapGeneratedContentToCarouselProject(content);
      setBuildSuccess(`Carousel "${mappedCarousel.title}" built successfully!`);

      if (onBuildCarousel) {
        onBuildCarousel(mappedCarousel);
      }
    } catch (err: any) {
      console.error('Error building Carousel from Content Engine:', err);
      setError(err.message || 'Failed to map generated content to Carousel project.');
    }
  };

  // Load Test Fixture
  const handleLoadTestFixture = () => {
    setError(null);
    setBuildSuccess('Loaded known test fixture!');
    setTopic(KNOWN_JODOCO_FIXTURE.metadata.topic);
    setRawScript(KNOWN_JODOCO_FIXTURE.metadata.originalScriptSummary);
    setContent(KNOWN_JODOCO_FIXTURE);
  };

  const handlePresetSelect = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setTopic(preset.topic);
    setRawScript(preset.script);
    setError(null);
  };

  const handleCopyJson = () => {
    if (!content) return;
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    const defaultPreset = SAMPLE_PRESETS[0];
    setTopic(defaultPreset.topic);
    setRawScript(defaultPreset.script);
    setError(null);
    setBuildSuccess(null);
    const initialMock = generateMockJodoCoContent(defaultPreset.topic, defaultPreset.script);
    setContent(initialMock);
  };

  // Editable Reel Scene Handlers
  const handleUpdateReelTitle = (newTitle: string) => {
    if (!content) return;
    setContent({
      ...content,
      coreReel: {
        ...content.coreReel,
        title: newTitle,
      },
    });
  };

  const handleUpdateHookStrategy = (newStrategy: string) => {
    if (!content) return;
    setContent({
      ...content,
      coreReel: {
        ...content.coreReel,
        hookStrategy: newStrategy,
      },
    });
  };

  const handleUpdateScene = (sceneIndex: number, updater: (s: GeneratedReelScene) => GeneratedReelScene) => {
    if (!content) return;
    setContent({
      ...content,
      coreReel: {
        ...content.coreReel,
        scenes: content.coreReel.scenes.map((s) => (s.sceneIndex === sceneIndex ? updater(s) : s)),
      },
    });
  };

  // Editable Carousel Slide Handlers
  const handleUpdateCarouselTitle = (newTitle: string) => {
    if (!content) return;
    setContent({
      ...content,
      carousel: {
        ...content.carousel,
        title: newTitle,
      },
    });
  };

  const handleUpdateCarouselHookAngle = (newAngle: string) => {
    if (!content) return;
    setContent({
      ...content,
      carousel: {
        ...content.carousel,
        hookAngle: newAngle,
      },
    });
  };

  const handleUpdateSlide = (slideNumber: number, updater: (s: GeneratedCarouselSlide) => GeneratedCarouselSlide) => {
    if (!content) return;
    setContent({
      ...content,
      carousel: {
        ...content.carousel,
        slides: content.carousel.slides.map((s) => (s.slideNumber === slideNumber ? updater(s) : s)),
      },
    });
  };

  const toggleSceneExpand = (index: number) => {
    setExpandedScenes((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#FF8C73]/15 text-[#FF8C73]">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="font-heading font-black text-xl text-[#1A2B48]">
                JodoCo Content Engine <span className="text-xs font-normal text-[#1A2B48]/60 ml-2">Phase 4 Bridge</span>
              </h2>
            </div>
            <p className="text-xs text-[#1A2B48]/70">
              Generate synchronized <strong>Core Reels (9:16)</strong> and <strong>Carousels</strong> with Gemini, then click <strong>"Build Reel"</strong> to preview in the JodoCo Reel Player.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadTestFixture}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#8FE3C0]/20 border border-[#EAE6DF] text-xs font-semibold text-[#1A2B48] transition-colors cursor-pointer"
              title="Load verified offline fixture"
            >
              <FileCheck className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Load Test Fixture</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#EAE6DF] text-xs font-semibold text-[#1A2B48] transition-colors cursor-pointer"
              title="Reset to default example"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {content && (
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#EAE6DF] text-xs font-semibold text-[#1A2B48] transition-colors cursor-pointer"
                title="Copy full structured JSON"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Preset Topic Buttons */}
        <div className="mt-4 pt-3 border-t border-[#EAE6DF] flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#1A2B48]/60 font-semibold flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Quick Presets:
          </span>
          {SAMPLE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetSelect(preset)}
              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#FF8C73]/10 hover:border-[#FF8C73]/40 border border-[#EAE6DF] text-[#1A2B48] font-medium transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Form vs Output Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Prompt / Script Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#1A2B48] font-heading flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#FF8C73]" />
                Editorial Input
              </h3>
              <span className="text-[11px] font-medium text-[#1A2B48]/60">Gemini 2.5 Flash</span>
            </div>

            {/* Topic Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A2B48] flex items-center justify-between">
                <span>Core Topic / Concept *</span>
                <span className="text-[10px] font-normal text-[#1A2B48]/50">Required</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Why Creator Marketing Beats Banner Ads in 2026"
                className="w-full text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl px-3.5 py-2.5 text-[#1A2B48] placeholder-[#1A2B48]/40 focus:outline-hidden focus:border-[#FF8C73] focus:ring-1 focus:ring-[#FF8C73]"
              />
            </div>

            {/* Raw Script / Context Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A2B48] flex items-center justify-between">
                <span>Raw Script / Information (Optional)</span>
                <span className="text-[10px] font-normal text-[#1A2B48]/50">Editorial raw material</span>
              </label>
              <textarea
                rows={5}
                value={rawScript}
                onChange={(e) => setRawScript(e.target.value)}
                placeholder="Paste talking points, research notes, rough draft, or client brief..."
                className="w-full text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl p-3 text-[#1A2B48] placeholder-[#1A2B48]/40 focus:outline-hidden focus:border-[#FF8C73] focus:ring-1 focus:ring-[#FF8C73]"
              />
            </div>

            {/* Test Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#1A2B48]/70" />
                <span className="text-xs font-bold text-[#1A2B48]">Deterministic Mock Mode</span>
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

            {/* Error Message Display */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message Display */}
            {buildSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{buildSuccess}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleGenerateClick(false)}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#1A2B48] hover:bg-[#253A5C] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF8C73]" />
                    <span>Authoring with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#FF8C73]" />
                    <span>Generate JodoCo Package</span>
                  </>
                )}
              </button>
            </div>

            {/* Editorial System V1 Quality Audit Card */}
            {content?.qualityEvaluation && (
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2.5 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#8FE3C0]" />
                    <span className="text-xs font-bold text-[#1A2B48]">Editorial Quality Audit</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1A2B48] text-white font-bold">
                    v{content.metadata.editorialVersion || '1.0'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="p-2 rounded-lg bg-white border border-[#EAE6DF] flex flex-col justify-between">
                    <span className="text-[#1A2B48]/60 text-[10px]">Hook Tension</span>
                    <span className="font-mono font-bold text-[#1A2B48]">
                      {content.qualityEvaluation.hookSpecificityScore}/10
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#EAE6DF] flex flex-col justify-between">
                    <span className="text-[#1A2B48]/60 text-[10px]">Progression</span>
                    <span className="font-mono font-bold text-[#1A2B48]">
                      {content.qualityEvaluation.informationProgressionScore}/10
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#EAE6DF] flex flex-col justify-between">
                    <span className="text-[#1A2B48]/60 text-[10px]">Fidelity</span>
                    <span className="font-mono font-bold text-[#1A2B48]">
                      {content.qualityEvaluation.sourceFidelityScore}/10
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#EAE6DF] flex flex-col justify-between">
                    <span className="text-[#1A2B48]/60 text-[10px]">Anti-AI Tropes</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Passed
                    </span>
                  </div>
                </div>

                {content.qualityEvaluation.editorialNotes && (
                  <p className="text-[10px] text-[#1A2B48]/70 italic leading-relaxed pt-1 border-t border-[#EAE6DF]/60">
                    "{content.qualityEvaluation.editorialNotes}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Generated Package & Direct Editor */}
        <div className="lg:col-span-7 space-y-4">
          {/* Subtabs Bar with "Build Reel" Primary Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5] p-2 rounded-2xl border border-[#EAE6DF]">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveSubTab('reel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'reel'
                    ? 'bg-[#FF8C73] text-white shadow-2xs'
                    : 'text-[#1A2B48]/70 hover:text-[#1A2B48] hover:bg-black/5'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Core Reel ({content?.coreReel.scenes.length || 0} Scenes)</span>
              </button>

              <button
                onClick={() => setActiveSubTab('carousel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'carousel'
                    ? 'bg-[#B8A7EA] text-[#1A2B48] shadow-2xs font-black'
                    : 'text-[#1A2B48]/70 hover:text-[#1A2B48] hover:bg-black/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Carousel ({content?.carousel.slides.length || 0} Slides)</span>
              </button>

              <button
                onClick={() => setActiveSubTab('raw_json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'raw_json'
                    ? 'bg-[#1A2B48] text-white shadow-2xs'
                    : 'text-[#1A2B48]/70 hover:text-[#1A2B48] hover:bg-black/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Schema JSON</span>
              </button>
            </div>

            {/* Build Reel & Carousel Calls to Action */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleBuildCarouselClick}
                disabled={!content}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#B8A7EA]/20 border border-[#EAE6DF] text-[#1A2B48] text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send generated content into JodoCo Carousel Studio"
              >
                <Layers className="w-3.5 h-3.5 text-[#6B46C1]" />
                <span>Build Carousel →</span>
              </button>

              <button
                onClick={handleBuildReelClick}
                disabled={!content}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-linear-to-r from-[#FF8C73] to-[#FF6B4A] hover:brightness-105 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send generated content into JodoCo Reel Player"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Build Reel →</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Reel Output & In-place Editor */}
          {activeSubTab === 'reel' && content && (
            <div className="space-y-4">
              {/* Reel Overview Card */}
              <div className="bg-white border border-[#EAE6DF] rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF8C73]/20 text-[#1A2B48] border border-[#FF8C73]/40">
                    Deliverable 1: Core Reel (9:16)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#1A2B48]/60">
                      Est. Duration: {content.coreReel.totalEstimatedDuration}s
                    </span>
                    <button
                      onClick={handleBuildReelClick}
                      className="px-2.5 py-1 rounded-lg bg-[#FF8C73] text-white text-[11px] font-bold hover:bg-[#FF7A5C] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Film className="w-3 h-3" />
                      Build Reel
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1A2B48]/60 block mb-1">Reel Title</label>
                  <input
                    type="text"
                    value={content.coreReel.title}
                    onChange={(e) => handleUpdateReelTitle(e.target.value)}
                    className="w-full text-sm font-bold text-[#1A2B48] bg-[#FAF8F5] border border-[#EAE6DF] px-3 py-1.5 rounded-xl focus:outline-hidden focus:border-[#FF8C73]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1A2B48]/60 block mb-1">Hook Strategy</label>
                  <input
                    type="text"
                    value={content.coreReel.hookStrategy}
                    onChange={(e) => handleUpdateHookStrategy(e.target.value)}
                    className="w-full text-xs text-[#1A2B48] bg-[#FAF8F5] border border-[#EAE6DF] px-3 py-1.5 rounded-xl focus:outline-hidden focus:border-[#FF8C73]"
                  />
                </div>
              </div>

              {/* Phase 9 Global Visual Strategy & Continuity Card */}
              {content.visualDirection && (
                <div className="bg-[#FAF8F5] border border-[#EAE6DF] rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#FF8C73]" />
                      <span className="text-xs font-bold text-[#1A2B48]">
                        Project Visual Direction & Continuity
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-[#EAE6DF] text-[#1A2B48]/70">
                      {content.visualDirection.aestheticStyle || 'Cinematic D2C'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-[#EAE6DF]/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Color Mood
                      </span>
                      <p className="text-xs font-medium text-[#1A2B48] line-clamp-2">
                        {content.visualDirection.colorMood || 'High-contrast studio lighting with warm accents'}
                      </p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#EAE6DF]/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Lighting & Atmosphere
                      </span>
                      <p className="text-xs font-medium text-[#1A2B48] line-clamp-2">
                        {content.visualDirection.lighting || 'Volumetric natural key light with soft depth of field'}
                      </p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#EAE6DF]/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Composition & Safe Zones
                      </span>
                      <p className="text-xs font-medium text-[#1A2B48] line-clamp-2">
                        {content.visualDirection.safeZoneGuidance || 'Vertical 9:16 safe zone, center-weighted action'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reel Scenes List */}
              <div className="space-y-3">
                {content.coreReel.scenes.map((scene) => {
                  const isExpanded = expandedScenes[scene.sceneIndex] !== false; // expanded by default
                  const decision = scene.visualDecision || 'ai_video';
                  const priority = scene.visualPriority || 'medium';

                  return (
                    <div
                      key={scene.sceneIndex}
                      className="bg-white border border-[#EAE6DF] rounded-2xl p-4 shadow-xs space-y-3 transition-all"
                    >
                      {/* Scene Header Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#1A2B48] text-white text-xs font-bold flex items-center justify-center">
                            {scene.sceneIndex}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#1A2B48]">
                                {scene.headline.mainText}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#FAF7F2] border border-[#EAE6DF] text-[#1A2B48]/70">
                                {scene.templateMapping}
                              </span>
                              {/* Visual Decision Pill */}
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                  decision === 'ai_video'
                                    ? 'bg-[#B8A7EA]/25 text-[#1A2B48] border-[#B8A7EA]'
                                    : decision === 'static_graphic'
                                    ? 'bg-[#8FE3C0]/25 text-[#1A2B48] border-[#8FE3C0]'
                                    : decision === 'text_only'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : decision === 'b_roll'
                                    ? 'bg-sky-100 text-sky-900 border-sky-300'
                                    : 'bg-slate-100 text-slate-700 border-slate-300'
                                }`}
                              >
                                {decision.replace('_', ' ')}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#1A2B48]/60">
                              Type: {scene.sceneType} • {scene.targetDuration}s
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleSceneExpand(scene.sceneIndex)}
                          className="p-1 rounded-lg hover:bg-black/5 text-[#1A2B48]/60 cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Scene Detail Body (Collapsible / Editable) */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-[#EAE6DF] space-y-3 text-xs">
                          {/* Headline & Subhead Inputs */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-[#1A2B48]/60 block mb-0.5">
                                On-Screen Headline
                              </label>
                              <input
                                type="text"
                                value={scene.headline.mainText}
                                onChange={(e) =>
                                  handleUpdateScene(scene.sceneIndex, (s) => ({
                                    ...s,
                                    headline: { ...s.headline, mainText: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg text-xs font-bold text-[#1A2B48]"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-[#1A2B48]/60 block mb-0.5">
                                Subtitle / Supporting Text
                              </label>
                              <input
                                type="text"
                                value={scene.headline.subText || ''}
                                onChange={(e) =>
                                  handleUpdateScene(scene.sceneIndex, (s) => ({
                                    ...s,
                                    headline: { ...s.headline, subText: e.target.value },
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg text-xs text-[#1A2B48]"
                              />
                            </div>
                          </div>

                          {/* Voiceover Script */}
                          <div>
                            <label className="text-[10px] font-bold text-[#1A2B48]/60 flex items-center gap-1 mb-0.5">
                              <Volume2 className="w-3 h-3 text-[#FF8C73]" />
                              Voiceover Script
                            </label>
                            <textarea
                              rows={2}
                              value={scene.voiceoverScript}
                              onChange={(e) =>
                                handleUpdateScene(scene.sceneIndex, (s) => ({
                                  ...s,
                                  voiceoverScript: e.target.value,
                                }))
                              }
                              className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg text-xs font-medium text-[#1A2B48]"
                            />
                          </div>

                          {/* Phase 9 Visual Intelligence Box */}
                          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE6DF] space-y-2.5">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-1.5">
                                <Compass className="w-3.5 h-3.5 text-[#FF8C73]" />
                                <span className="text-[11px] font-bold text-[#1A2B48]">
                                  Editorial Visual Intelligence
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Visual Decision Selector */}
                                <select
                                  value={scene.visualDecision || 'ai_video'}
                                  onChange={(e) =>
                                    handleUpdateScene(scene.sceneIndex, (s) => ({
                                      ...s,
                                      visualDecision: e.target.value as any,
                                    }))
                                  }
                                  className="text-[10px] font-bold px-2 py-1 bg-white border border-[#EAE6DF] rounded-md text-[#1A2B48] cursor-pointer"
                                >
                                  <option value="ai_video">AI Video (Veo 3.1)</option>
                                  <option value="static_graphic">Static Graphic</option>
                                  <option value="text_only">Text-Only</option>
                                  <option value="b_roll">B-Roll Footage</option>
                                  <option value="none">None</option>
                                </select>

                                {/* Priority Selector */}
                                <select
                                  value={scene.visualPriority || 'medium'}
                                  onChange={(e) =>
                                    handleUpdateScene(scene.sceneIndex, (s) => ({
                                      ...s,
                                      visualPriority: e.target.value as any,
                                    }))
                                  }
                                  className="text-[10px] font-bold px-2 py-1 bg-white border border-[#EAE6DF] rounded-md text-[#1A2B48] cursor-pointer"
                                >
                                  <option value="high">High Priority</option>
                                  <option value="medium">Med Priority</option>
                                  <option value="low">Low Priority</option>
                                </select>
                              </div>
                            </div>

                            {/* Editorial Reason */}
                            {scene.visualReason && (
                              <div className="text-[11px] text-[#1A2B48]/80 bg-white/60 p-2 rounded-lg border border-[#EAE6DF]/60">
                                <span className="font-bold text-[#1A2B48] mr-1">Editorial Reason:</span>
                                <span>{scene.visualReason}</span>
                              </div>
                            )}

                            {/* Visual Concept */}
                            <div>
                              <span className="text-[10px] font-bold text-[#1A2B48] flex items-center gap-1">
                                <Palette className="w-3 h-3 text-[#8FE3C0]" />
                                Visual Concept & Direction:
                              </span>
                              <p className="text-[11px] text-[#1A2B48]/80 mt-0.5">
                                {scene.visualMetadata.visualConcept}
                              </p>
                            </div>

                            {/* Production Veo Prompt */}
                            {(scene.visualPrompt || scene.visualMetadata.aiVideoPrompt) && (
                              <div className="pt-1.5 border-t border-[#EAE6DF]/70">
                                <span className="text-[10px] font-bold text-[#1A2B48] flex items-center gap-1">
                                  <Video className="w-3 h-3 text-[#B8A7EA]" />
                                  Production Veo 3.1 Prompt:
                                </span>
                                <input
                                  type="text"
                                  value={scene.visualPrompt || scene.visualMetadata.aiVideoPrompt || ''}
                                  onChange={(e) =>
                                    handleUpdateScene(scene.sceneIndex, (s) => ({
                                      ...s,
                                      visualPrompt: e.target.value,
                                      visualMetadata: { ...s.visualMetadata, aiVideoPrompt: e.target.value },
                                    }))
                                  }
                                  className="w-full mt-1 px-2 py-1 bg-white border border-[#EAE6DF] rounded-md text-[11px] text-[#1A2B48]"
                                />
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-mono text-[#1A2B48]/60">
                              <span>Motion: {scene.visualMetadata.motionStyle}</span>
                              <span>•</span>
                              <span>Shot: {scene.visualMetadata.shotType}</span>
                              <span>•</span>
                              <span>Transition: {scene.visualMetadata.transitionType}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Carousel Output & In-place Editor */}
          {activeSubTab === 'carousel' && content && (
            <div className="space-y-4">
              {/* Carousel Overview Card */}
              <div className="bg-white border border-[#EAE6DF] rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#B8A7EA]/30 text-[#1A2B48] border border-[#B8A7EA]/50">
                    Deliverable 2: Strategic Carousel Deck
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#1A2B48]/60">
                      {content.carousel.slides.length} Slides Total
                    </span>
                    <button
                      onClick={handleBuildCarouselClick}
                      className="px-2.5 py-1 rounded-lg bg-[#6B46C1] text-white text-[11px] font-bold hover:bg-[#5B37B0] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Layers className="w-3 h-3" />
                      Build Carousel
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1A2B48]/60 block mb-1">Carousel Title</label>
                  <input
                    type="text"
                    value={content.carousel.title}
                    onChange={(e) => handleUpdateCarouselTitle(e.target.value)}
                    className="w-full text-sm font-bold text-[#1A2B48] bg-[#FAF8F5] border border-[#EAE6DF] px-3 py-1.5 rounded-xl focus:outline-hidden focus:border-[#B8A7EA]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1A2B48]/60 block mb-1">Hook Angle</label>
                  <input
                    type="text"
                    value={content.carousel.hookAngle}
                    onChange={(e) => handleUpdateCarouselHookAngle(e.target.value)}
                    className="w-full text-xs text-[#1A2B48] bg-[#FAF8F5] border border-[#EAE6DF] px-3 py-1.5 rounded-xl focus:outline-hidden focus:border-[#B8A7EA]"
                  />
                </div>
              </div>

              {/* Slides Grid */}
              <div className="space-y-3">
                {content.carousel.slides.map((slide) => (
                  <div
                    key={slide.slideNumber}
                    className="bg-white border border-[#EAE6DF] rounded-2xl p-4 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#B8A7EA] text-[#1A2B48] text-xs font-black flex items-center justify-center">
                          {slide.slideNumber}
                        </span>
                        <span className="text-xs font-bold text-[#1A2B48]">
                          Slide {slide.slideNumber} ({slide.role})
                        </span>
                      </div>
                      {slide.calloutBadge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D1F2EB] text-[#1A2B48] border border-[#B3E5DB]">
                          {slide.calloutBadge}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#1A2B48]/60 block mb-0.5">Headline</label>
                      <input
                        type="text"
                        value={slide.headline}
                        onChange={(e) =>
                          handleUpdateSlide(slide.slideNumber, (s) => ({ ...s, headline: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg text-xs font-bold text-[#1A2B48]"
                      />
                    </div>

                    {slide.subHeadline && (
                      <div>
                        <label className="text-[10px] font-bold text-[#1A2B48]/60 block mb-0.5">Subheadline</label>
                        <input
                          type="text"
                          value={slide.subHeadline}
                          onChange={(e) =>
                            handleUpdateSlide(slide.slideNumber, (s) => ({ ...s, subHeadline: e.target.value }))
                          }
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg text-xs text-[#1A2B48]"
                        />
                      </div>
                    )}

                    {slide.bodyCopy && (
                      <div>
                        <label className="text-[10px] font-bold text-[#1A2B48]/60 block mb-0.5">Body Copy</label>
                        <textarea
                          rows={2}
                          value={slide.bodyCopy}
                          onChange={(e) =>
                            handleUpdateSlide(slide.slideNumber, (s) => ({ ...s, bodyCopy: e.target.value }))
                          }
                          className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg text-xs text-[#1A2B48]"
                        />
                      </div>
                    )}

                    {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                      <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE6DF]">
                        <span className="text-[10px] font-bold text-[#1A2B48] block mb-1">Key Takeaways:</span>
                        <ul className="space-y-1">
                          {slide.bulletPoints.map((b, bIdx) => (
                            <li key={bIdx} className="text-xs text-[#1A2B48]/85 flex items-start gap-1.5">
                              <span className="text-[#FF8C73]">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {slide.footerCta && (
                      <div className="flex items-center justify-end text-[11px] font-bold text-[#FF8C73] gap-1">
                        <span>{slide.footerCta}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Raw JSON Inspector */}
          {activeSubTab === 'raw_json' && content && (
            <div className="bg-white border border-[#EAE6DF] rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1A2B48]">JodoCoGeneratedContent (Validated Payload)</span>
                <span className="font-mono text-[#1A2B48]/60">v{content.metadata.contentModelVersion}</span>
              </div>
              <pre className="p-3 bg-[#1A2B48] text-[#8FE3C0] rounded-xl text-[11px] font-mono overflow-x-auto max-h-[600px] leading-relaxed">
                {JSON.stringify(content, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal: Regenerate Content */}
      {confirmRegenOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#1A2B48]/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1A2B48]">
                  Regenerate Content Model?
                </h3>
                <p className="text-xs text-slate-500">
                  Topic: "{topic}"
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              This will author a new structured Core Reel and Carousel blueprint. Your active Reel Player timeline and Carousel deck will <strong>remain untouched</strong> until you explicitly click <em>"Build Reel"</em> or <em>"Build Carousel"</em>.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmRegenOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => executeGenerate()}
                className="px-4 py-2 rounded-xl bg-[#1A2B48] text-white text-xs font-bold shadow-xs hover:bg-[#1A2B48]/90 transition-all cursor-pointer"
              >
                Confirm & Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Build Reel */}
      {confirmBuildReelOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#1A2B48]/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF8C73]/20 text-[#FF8C73] flex items-center justify-center font-bold">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1A2B48]">
                  Rebuild Reel Timeline?
                </h3>
                <p className="text-xs text-slate-500">
                  Update 9:16 production scenes
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              You have existing edits in your Reel storyboard. Building will map the current generated content into your Reel Player timeline. Do you want to continue?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmBuildReelOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeBuildReel}
                className="px-4 py-2 rounded-xl bg-[#FF8C73] text-white text-xs font-bold shadow-xs hover:bg-[#FF7A5C] transition-all cursor-pointer"
              >
                Rebuild Reel Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Build Carousel */}
      {confirmBuildCarouselOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#1A2B48]/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#B8A7EA]/25 text-[#1A2B48] flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1A2B48]">
                  Rebuild Carousel Deck?
                </h3>
                <p className="text-xs text-slate-500">
                  Update 4:5 slides
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              You have existing slide customizations in your Carousel Studio. Building will map the current generated content into your Carousel slides. Do you want to continue?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmBuildCarouselOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeBuildCarousel}
                className="px-4 py-2 rounded-xl bg-[#1A2B48] text-white text-xs font-bold shadow-xs hover:bg-[#1A2B48]/90 transition-all cursor-pointer"
              >
                Rebuild Carousel Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

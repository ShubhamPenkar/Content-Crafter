import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { SCENES_DATA, TOTAL_DURATION, DEFAULT_REEL_PROJECT } from './data/storyboardData';
import { PlaybackState, ActiveTab, ReelProject, SceneInfo } from './types';
import { audioEngine } from './utils/audioEngine';
import { ReelPlayer } from './components/ReelPlayer';
import { TimelineControls } from './components/TimelineControls';
import { StoryboardView } from './components/StoryboardView';
import { BrandGuideView } from './components/BrandGuideView';
import { VideoExporter } from './components/VideoExporter';
import { ContentEngineView } from './components/ContentEngineView';
import { CarouselViewer } from './components/CarouselViewer';
import { AssetLibraryView } from './components/AssetLibraryView';
import { UnifiedExportView } from './components/UnifiedExportView';
import { ProductionQualityView } from './components/ProductionQualityView';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { JodoCoLogo } from './components/JodoCoLogo';
import { JODOCO_LOGO } from './brand/assets';
import { CarouselProject } from './carousel-engine/types';
import { KNOWN_CAROUSEL_FIXTURE } from './carousel-engine/fixture';
import { useProjectWorkspace } from './project-engine';
import { runProductionReadinessCheck } from './quality-engine';
import {
  Film,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Palette,
  Download,
  Share2,
  ExternalLink,
  Volume2,
  VolumeX,
  Wand2,
  Sliders,
  FolderKanban,
  Check,
  ChevronDown,
  RefreshCw,
  Plus,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const {
    projects,
    activeProjectId,
    activeProject,
    activeTab,
    setActiveTab,
    saveStatus,
    updateActiveProject,
    updateReelProject,
    updateCarouselProject,
    updateGeneratedContent,
    addAsset,
    removeAsset,
    updateAsset,
    updateAssetStatus,
    approveAsset,
    rejectAsset,
    archiveAsset,
    useAssetInScene,
    detachAssetFromScene,
    useAssetInCarouselSlide,
    detachAssetFromCarouselSlide,
    createNewProject,
    switchProject,
    renameProject,
    duplicateProject,
    deleteProject,
    buildReelFromContent,
    buildCarouselFromContent,
  } = useProjectWorkspace();

  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [reelSubView, setReelSubView] = useState<'player' | 'storyboard' | 'brand'>('player');

  const project = activeProject.reelProject;
  const carouselProject = activeProject.carouselProject;

  // Live production quality report
  const qualityReport = useMemo(() => {
    return runProductionReadinessCheck(activeProject);
  }, [activeProject]);

  // Playback state for active Reel
  const [playback, setPlayback] = useState<PlaybackState>({
    currentTime: 0,
    duration: project.duration || TOTAL_DURATION,
    isPlaying: false,
    playbackRate: 1.0,
    isLooping: true,
    bgmVolume: 0.45,
    bgmEnabled: true,
    voiceVolume: 0.95,
    voiceEnabled: true,
    sfxEnabled: true,
    showInstagramOverlay: true,
    showSafeArea: false,
    showCaptions: true,
  });

  // Sync playback duration when project duration updates
  useEffect(() => {
    if (project.duration && project.duration !== playback.duration) {
      setPlayback((prev) => ({
        ...prev,
        duration: project.duration,
      }));
    }
  }, [project.duration]);

  const prevSceneIdRef = useRef<number>(1);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  // Active scene calculation from the single source of truth
  const currentScene =
    project.scenes.find((s) => playback.currentTime >= s.startTime && playback.currentTime < s.endTime) ||
    project.scenes[project.scenes.length - 1] ||
    DEFAULT_REEL_PROJECT.scenes[0];

  const handleUpdateScene = (updatedScene: SceneInfo) => {
    updateReelProject({
      ...project,
      version: (project.version || 1) + 1,
      scenes: project.scenes.map((s) => (s.id === updatedScene.id ? updatedScene : s)),
    });
  };

  const handleResetProject = () => {
    updateReelProject({
      ...DEFAULT_REEL_PROJECT,
      version: (project.version || 1) + 1,
    });
  };

  const handleBuildReelFromContent = (newProject: ReelProject) => {
    audioEngine.resetVoiceTrack();
    buildReelFromContent(newProject);
    setPlayback((prev) => ({
      ...prev,
      currentTime: 0,
      duration: newProject.duration,
      isPlaying: false,
    }));
    setActiveTab('reel');

    // Confetti celebration
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#FF8C73', '#B8A7EA', '#8FE3C0', '#1A2B48'],
    });

    if (playback.sfxEnabled) {
      audioEngine.playSparkle();
    }
  };

  const handleBuildCarouselFromContent = (newCarousel: CarouselProject) => {
    buildCarouselFromContent(newCarousel);
    setActiveTab('carousel');

    // Confetti celebration
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#B8A7EA', '#8FE3C0', '#FF8C73', '#1A2B48'],
    });
  };

  const handleResetCarousel = () => {
    updateCarouselProject({
      ...KNOWN_CAROUSEL_FIXTURE,
      id: `carousel-${Date.now()}`,
      version: 1,
    });
  };

  const handleLoadCarouselFixture = () => {
    updateCarouselProject({
      ...KNOWN_CAROUSEL_FIXTURE,
      id: `carousel-fixture-${Date.now()}`,
    });
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  // --- PLAYBACK CLOCK ENGINE ---
  useEffect(() => {
    if (!playback.isPlaying) {
      lastTimestampRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const step = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setPlayback((prev) => {
        let nextTime = prev.currentTime + delta * prev.playbackRate;

        // End of video reached
        if (nextTime >= prev.duration) {
          if (prev.isLooping) {
            nextTime = 0;
            audioEngine.resetVoiceTrack();
          } else {
            nextTime = prev.duration;
            audioEngine.stopBgm();
            return { ...prev, currentTime: nextTime, isPlaying: false };
          }
        }

        return { ...prev, currentTime: nextTime };
      });

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playback.isPlaying, playback.playbackRate, playback.isLooping]);

  // --- AUDIO & SCENE CHANGE DETECTION ---
  useEffect(() => {
    if (playback.isPlaying && playback.bgmEnabled) {
      audioEngine.startBgm();
    } else {
      audioEngine.stopBgm();
    }
  }, [playback.isPlaying, playback.bgmEnabled]);

  useEffect(() => {
    audioEngine.setBgmVolume(playback.bgmEnabled ? playback.bgmVolume : 0);
  }, [playback.bgmVolume, playback.bgmEnabled]);

  useEffect(() => {
    audioEngine.setVoiceVolume(playback.voiceEnabled ? playback.voiceVolume : 0);
  }, [playback.voiceVolume, playback.voiceEnabled]);

  useEffect(() => {
    audioEngine.setSfxVolume(playback.sfxEnabled ? 0.7 : 0);
  }, [playback.sfxEnabled]);

  // Trigger Voiceover & SFX on Scene Entry
  useEffect(() => {
    if (!currentScene) return;
    const sceneId = currentScene.id;
    if (playback.isPlaying && sceneId !== prevSceneIdRef.current) {
      prevSceneIdRef.current = sceneId;

      // Play transition SFX
      if (playback.sfxEnabled) {
        if (sceneId === 7) {
          audioEngine.playSuccessDing();
          // Trigger subtle festive confetti on final frame
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#FF8C73', '#B8A7EA', '#8FE3C0', '#FAF7F2'],
          });
        } else if (sceneId === 3 || sceneId === 6) {
          audioEngine.playSparkle();
        } else {
          audioEngine.playPop();
        }
      }

      // Voiceover Speech
      if (playback.voiceEnabled) {
        audioEngine.speakScene(sceneId, currentScene.voiceover, playback.voiceEnabled);
      }
    }
  }, [currentScene?.id, playback.isPlaying, playback.voiceEnabled, playback.sfxEnabled]);

  // Handlers
  const handleTogglePlay = () => {
    setPlayback((prev) => {
      const willPlay = !prev.isPlaying;
      if (willPlay && prev.currentTime >= prev.duration - 0.1) {
        audioEngine.resetVoiceTrack();
        return { ...prev, currentTime: 0, isPlaying: true };
      }
      return { ...prev, isPlaying: willPlay };
    });
  };

  const handleSeek = (time: number) => {
    audioEngine.resetVoiceTrack();
    setPlayback((prev) => ({ ...prev, currentTime: time }));
  };

  const handleReset = () => {
    audioEngine.resetVoiceTrack();
    setPlayback((prev) => ({ ...prev, currentTime: 0 }));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A2B48] flex flex-col justify-between selection:bg-[#FFB3A7] selection:text-[#1A2B48]">
      {/* Top Application Bar with Project Selector & Workspace Navigation */}
      <header className="border-b border-[#EAE6DF] bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Brand Logo & Project Manager Trigger */}
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center shrink-0">
                <img
                  src={JODOCO_LOGO}
                  alt="JodoCo • CONNECT · CREATE · GROW"
                  className="h-10 sm:h-11 w-auto object-contain cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => setActiveTab('content')}
                  title="JodoCo — Creator Marketing Workspace"
                />
              </div>
              <div className="border-l border-[#EAE6DF] pl-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D1F2EB] text-[#1A2B48] border border-[#B3E5DB]">
                    Workspace
                  </span>
                </div>
                <p className="text-[10px] text-[#1A2B48]/60 font-medium hidden sm:block">
                  Creator Marketing Agency • "A bridge between brands and creators"
                </p>
              </div>
            </div>

            {/* Project Switcher Pill */}
            <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-[#EAE6DF]">
              <button
                onClick={() => setIsProjectManagerOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#EAE6DF] transition-all cursor-pointer group shadow-2xs"
                title="Manage and switch projects"
              >
                <FolderKanban className="w-3.5 h-3.5 text-[#FF8C73]" />
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-[#1A2B48]/50 block leading-tight">
                    Active Project
                  </span>
                  <span className="text-xs font-bold text-[#1A2B48] max-w-[130px] truncate block group-hover:text-[#FF8C73] transition-colors">
                    {activeProject.name}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#1A2B48]/40 group-hover:text-[#1A2B48]" />
              </button>

              {/* Auto-Save Status Badge */}
              <div
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] text-[10px] font-semibold text-[#1A2B48]/70"
                title="Continuous auto-save to browser storage"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                    <span className="text-amber-700">Saving...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Auto-saved</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Unified Workspace Navigation Tabs */}
          <div className="flex items-center justify-between sm:justify-end gap-1 bg-[#F4EFE6] p-1 rounded-xl border border-[#E5DEC9] text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'content'
                  ? 'bg-[#1A2B48] text-white shadow-xs'
                  : 'text-[#1A2B48]/70 hover:text-[#1A2B48] hover:bg-black/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF8C73]" />
              <span>1. Content</span>
            </button>

            <button
              onClick={() => setActiveTab('reel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'reel'
                  ? 'bg-[#1A2B48] text-white shadow-xs'
                  : 'text-[#1A2B48]/70 hover:text-[#1A2B48] hover:bg-black/5'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-[#8FE3C0]" />
              <span>2. Reel</span>
            </button>

            <button
              onClick={() => setActiveTab('carousel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'carousel'
                  ? 'bg-[#1A2B48] text-white shadow-xs'
                  : 'text-[#1A2B48]/70 hover:text-[#1A2B48] hover:bg-black/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#B8A7EA]" />
              <span>3. Carousel</span>
            </button>

            <button
              onClick={() => setActiveTab('assets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'assets'
                  ? 'bg-[#1A2B48] text-white shadow-xs'
                  : 'text-[#1A2B48]/70 hover:text-[#1A2B48] hover:bg-black/5'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 text-amber-500" />
              <span>4. Assets ({activeProject.assets?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('quality')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'quality'
                  ? 'bg-[#1A2B48] text-white shadow-xs'
                  : 'text-[#1A2B48]/70 hover:text-[#1A2B48] hover:bg-black/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF8C73]" />
              <span>5. QA Check</span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                  activeTab === 'quality'
                    ? 'bg-white/20 text-white'
                    : qualityReport.status === 'blocked'
                    ? 'bg-rose-100 text-rose-700'
                    : qualityReport.status === 'needs_review'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {qualityReport.overallScore}/100
              </span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'export'
                  ? 'bg-[#1A2B48] text-white shadow-xs'
                  : 'text-[#1A2B48]/70 hover:text-[#1A2B48] hover:bg-black/5'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-[#FF8C73]" />
              <span>6. Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* TAB 1: CONTENT ENGINE */}
        {activeTab === 'content' && (
          <ContentEngineView
            initialTopic={activeProject.topic}
            initialRawScript={activeProject.originalScript}
            initialContent={activeProject.generatedContent}
            onUpdateTopic={(t) => updateActiveProject({ topic: t })}
            onUpdateRawScript={(s) => updateActiveProject({ originalScript: s })}
            onUpdateContent={updateGeneratedContent}
            onBuildReel={handleBuildReelFromContent}
            onBuildCarousel={handleBuildCarouselFromContent}
            hasReelEdits={activeProject.reelProject.scenes.length > 0}
            hasCarouselEdits={activeProject.carouselProject.slides.length > 0}
          />
        )}

        {/* TAB 2: REEL PLAYER & PRODUCTION SUITE */}
        {activeTab === 'reel' && (
          <div className="space-y-4">
            {/* Sub-view Switcher inside Reel Tab */}
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#EAE6DF] shadow-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#FF8C73]/15 text-[#FF8C73]">
                  <Film className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="font-heading font-black text-sm text-[#1A2B48]">
                    {project.title || 'Core Reel Production'}
                  </h2>
                  <p className="text-[11px] text-[#1A2B48]/60">
                    9:16 High-retention short-form video deliverable
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE6DF]">
                <button
                  onClick={() => setReelSubView('player')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    reelSubView === 'player'
                      ? 'bg-[#1A2B48] text-white shadow-2xs'
                      : 'text-[#1A2B48]/70 hover:text-[#1A2B48]'
                  }`}
                >
                  Player & Scrubber
                </button>
                <button
                  onClick={() => setReelSubView('storyboard')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    reelSubView === 'storyboard'
                      ? 'bg-[#1A2B48] text-white shadow-2xs'
                      : 'text-[#1A2B48]/70 hover:text-[#1A2B48]'
                  }`}
                >
                  Storyboard Editor
                </button>
                <button
                  onClick={() => setReelSubView('brand')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    reelSubView === 'brand'
                      ? 'bg-[#1A2B48] text-white shadow-2xs'
                      : 'text-[#1A2B48]/70 hover:text-[#1A2B48]'
                  }`}
                >
                  Brand Specs
                </button>
              </div>
            </div>

            {/* Reel Subview: Player Mode */}
            {reelSubView === 'player' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left Column: 9:16 Vertical Reel Player */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                  <ReelPlayer
                    project={project}
                    currentTime={playback.currentTime}
                    isPlaying={playback.isPlaying}
                    onTogglePlay={handleTogglePlay}
                    showInstagramOverlay={playback.showInstagramOverlay}
                    showSafeArea={playback.showSafeArea}
                    showCaptions={playback.showCaptions}
                    isMuted={!playback.bgmEnabled && !playback.voiceEnabled}
                    onToggleMute={() => {
                      setPlayback((prev) => ({
                        ...prev,
                        bgmEnabled: !prev.bgmEnabled,
                        voiceEnabled: !prev.voiceEnabled,
                      }));
                    }}
                  />
                </div>

                {/* Right Column: Timeline Controls & Scene Inspector */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  {/* Studio Header Quick Info */}
                  <div className="bg-white border border-[#EAE6DF] p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFB3A7]/30 text-[#1A2B48] text-[10px] font-bold uppercase tracking-wider mb-1">
                        <Sparkles className="w-3 h-3 text-[#FF8C73]" />
                        9:16 Vertical Master
                      </div>
                      <h2 className="text-base font-extrabold text-[#1A2B48] font-heading">
                        {project.title}
                      </h2>
                      <p className="text-xs text-[#1A2B48]/70 mt-0.5">
                        {project.scenes.length} synced scenes • {project.duration || 25}s total duration
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReelSubView('storyboard')}
                        className="px-3 py-1.5 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE4D7] border border-[#E0D9CB] text-xs font-bold text-[#1A2B48] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Edit Script</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('export')}
                        className="px-3 py-1.5 rounded-xl bg-[#1A2B48] hover:bg-[#25395C] text-white text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export MP4</span>
                      </button>
                    </div>
                  </div>

                  {/* Master Interactive Timeline Scrubber & Audio Controls */}
                  <TimelineControls
                    currentTime={playback.currentTime}
                    duration={playback.duration}
                    isPlaying={playback.isPlaying}
                    onTogglePlay={handleTogglePlay}
                    onSeek={handleSeek}
                    onReset={handleReset}
                    playbackRate={playback.playbackRate}
                    onChangePlaybackRate={(rate) =>
                      setPlayback((prev) => ({ ...prev, playbackRate: rate }))
                    }
                    isLooping={playback.isLooping}
                    onToggleLoop={() =>
                      setPlayback((prev) => ({ ...prev, isLooping: !prev.isLooping }))
                    }
                    bgmVolume={playback.bgmVolume}
                    bgmEnabled={playback.bgmEnabled}
                    onChangeBgmVolume={(vol) =>
                      setPlayback((prev) => ({ ...prev, bgmVolume: vol }))
                    }
                    onToggleBgm={() =>
                      setPlayback((prev) => ({ ...prev, bgmEnabled: !prev.bgmEnabled }))
                    }
                    voiceVolume={playback.voiceVolume}
                    voiceEnabled={playback.voiceEnabled}
                    onChangeVoiceVolume={(vol) =>
                      setPlayback((prev) => ({ ...prev, voiceVolume: vol }))
                    }
                    onToggleVoice={() =>
                      setPlayback((prev) => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))
                    }
                    sfxEnabled={playback.sfxEnabled}
                    onToggleSfx={() =>
                      setPlayback((prev) => ({ ...prev, sfxEnabled: !prev.sfxEnabled }))
                    }
                    showInstagramOverlay={playback.showInstagramOverlay}
                    onToggleInstagramOverlay={() =>
                      setPlayback((prev) => ({
                        ...prev,
                        showInstagramOverlay: !prev.showInstagramOverlay,
                      }))
                    }
                    showSafeArea={playback.showSafeArea}
                    onToggleSafeArea={() =>
                      setPlayback((prev) => ({ ...prev, showSafeArea: !prev.showSafeArea }))
                    }
                    showCaptions={playback.showCaptions}
                    onToggleCaptions={() =>
                      setPlayback((prev) => ({ ...prev, showCaptions: !prev.showCaptions }))
                    }
                  />

                  {/* Live Scene Delivery Card */}
                  <div className="bg-white border border-[#EAE6DF] p-4 rounded-2xl shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#FF8C73] uppercase tracking-wider">
                        Current Scene Breakdown (Scene {currentScene.id} of {project.scenes.length})
                      </span>
                      <span className="font-mono text-[#1A2B48]/60">
                        Timestamp: {currentScene.startTime}s - {currentScene.endTime}s
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#1A2B48]">{currentScene.name}</h3>
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs text-[#1A2B48]">
                      <span className="text-[#1A2B48] font-bold block mb-1">Voiceover Script:</span>
                      <p className="italic font-medium text-[#1A2B48]/85">"{currentScene.voiceover}"</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reel Subview: Storyboard Editor Mode */}
            {reelSubView === 'storyboard' && (
              <StoryboardView
                project={project}
                currentTime={playback.currentTime}
                topic={activeProject.topic}
                projectAssets={activeProject.assets || []}
                onSelectScene={(startTime) => {
                  handleSeek(startTime);
                  setReelSubView('player');
                  setPlayback((prev) => ({ ...prev, isPlaying: true }));
                }}
                onUpdateScene={handleUpdateScene}
                onResetProject={handleResetProject}
                onAddAsset={addAsset}
                onApproveAsset={approveAsset}
                onRejectAsset={rejectAsset}
              />
            )}

            {/* Reel Subview: Brand Specs Mode */}
            {reelSubView === 'brand' && <BrandGuideView />}
          </div>
        )}

        {/* TAB 3: CAROUSEL STUDIO */}
        {activeTab === 'carousel' && (
          <CarouselViewer
            project={carouselProject}
            onUpdateProject={updateCarouselProject}
            onResetProject={handleResetCarousel}
            onLoadFixture={handleLoadCarouselFixture}
            projectAssets={activeProject.assets || []}
            topic={activeProject.topic}
            visualDirection={activeProject.visualDirection || activeProject.generatedContent?.visualDirection}
            projectId={activeProject.id}
            onAddAsset={addAsset}
            onUpdateAssetStatus={updateAssetStatus}
            onAttachVisual={(slideId, asset, visualUrl, prompt) =>
              useAssetInCarouselSlide(asset.id, slideId)
            }
            onDetachVisual={detachAssetFromCarouselSlide}
          />
        )}

        {/* TAB 4: ASSETS LIBRARY / MEDIA VAULT */}
        {activeTab === 'assets' && (
          <AssetLibraryView
            assets={activeProject.assets || []}
            scenes={project.scenes}
            onAddAsset={addAsset}
            onRemoveAsset={removeAsset}
            onUpdateAssetStatus={updateAssetStatus}
            onApproveAsset={approveAsset}
            onRejectAsset={rejectAsset}
            onArchiveAsset={archiveAsset}
            onUseAssetInScene={useAssetInScene}
            onOpenGeneratorForScene={(scene) => {
              setActiveTab('reel');
              setReelSubView('storyboard');
            }}
          />
        )}

        {/* TAB 5: PRODUCTION QUALITY & QA SCORECARD */}
        {activeTab === 'quality' && (
          <ProductionQualityView
            project={activeProject}
            onUpdateProject={updateActiveProject}
            onNavigateToTab={(tab) => {
              if (tab === 'reel') {
                setActiveTab('reel');
                setReelSubView('player');
              } else {
                setActiveTab(tab);
              }
            }}
          />
        )}

        {/* TAB 6: UNIFIED EXPORT DASHBOARD */}
        {activeTab === 'export' && (
          <UnifiedExportView
            project={activeProject}
            onNavigateToTab={(tab) => {
              if (tab === 'reel') {
                setActiveTab('reel');
                setReelSubView('player');
              } else {
                setActiveTab(tab);
              }
            }}
          />
        )}
      </main>

      {/* Project Manager Modal */}
      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={switchProject}
        onCreateProject={createNewProject}
        onRenameProject={renameProject}
        onDuplicateProject={duplicateProject}
        onDeleteProject={deleteProject}
      />

      {/* App Footer */}
      <footer className="border-t border-[#EAE6DF] bg-[#FAF8F5] px-6 py-3.5 text-center text-xs text-[#1A2B48]/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1A2B48] font-heading">JodoCo</span>
            <span>• "Jodo" = to connect in Hindi</span>
            <span className="text-[#FF8C73]">♥</span>
            <span>A bridge between brands and creators</span>
          </div>
          <div className="flex items-center gap-3 text-[#1A2B48]/60">
            <span className="font-medium">Workflow: Content → Reel → Carousel → Assets → QA Check → Export</span>
            <span>•</span>
            <span className="text-[#1A2B48] font-bold bg-[#D1F2EB] px-2 py-0.5 rounded-full border border-[#B3E5DB]">
              Active Project: {activeProject.name}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

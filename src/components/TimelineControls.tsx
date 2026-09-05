import React from 'react';
import { SCENES_DATA, TOTAL_DURATION } from '../data/storyboardData';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Music,
  Bell,
  Eye,
  Sliders,
  Shield,
  Subtitles,
  Sparkles,
} from 'lucide-react';

interface TimelineControlsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onReset: () => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  bgmVolume: number;
  bgmEnabled: boolean;
  onChangeBgmVolume: (vol: number) => void;
  onToggleBgm: () => void;
  voiceVolume: number;
  voiceEnabled: boolean;
  onChangeVoiceVolume: (vol: number) => void;
  onToggleVoice: () => void;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  showInstagramOverlay: boolean;
  onToggleInstagramOverlay: () => void;
  showSafeArea: boolean;
  onToggleSafeArea: () => void;
  showCaptions: boolean;
  onToggleCaptions: () => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  onReset,
  playbackRate,
  onChangePlaybackRate,
  isLooping,
  onToggleLoop,
  bgmVolume,
  bgmEnabled,
  onChangeBgmVolume,
  onToggleBgm,
  voiceVolume,
  voiceEnabled,
  onChangeVoiceVolume,
  onToggleVoice,
  sfxEnabled,
  onToggleSfx,
  showInstagramOverlay,
  onToggleInstagramOverlay,
  showSafeArea,
  onToggleSafeArea,
  showCaptions,
  onToggleCaptions,
}) => {
  // Format seconds to mm:ss.d
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const dec = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${dec}`;
  };

  // Find active scene
  const activeScene =
    SCENES_DATA.find((s) => currentTime >= s.startTime && currentTime < s.endTime) ||
    SCENES_DATA[SCENES_DATA.length - 1];

  return (
    <div className="w-full bg-white border border-[#EAE6DF] rounded-2xl p-4 shadow-sm space-y-4 text-[#1A2B48]">
      {/* Top Row: Current Time & Active Scene Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DF] pb-3">
        <div className="flex items-center gap-3">
          {/* Main Play / Pause Button */}
          <button
            onClick={onTogglePlay}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all shadow-xs cursor-pointer ${
              isPlaying
                ? 'bg-[#1A2B48] text-white hover:bg-[#25395C]'
                : 'bg-[#FFB3A7] text-[#1A2B48] hover:bg-[#FFA597]'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Reset / Replay */}
          <button
            onClick={onReset}
            className="w-9 h-9 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE4D7] text-[#1A2B48] flex items-center justify-center transition-colors cursor-pointer border border-[#E0D9CB] shadow-2xs"
            title="Restart Reel"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Time Display */}
          <div className="font-mono text-sm tracking-wide">
            <span className="text-[#1A2B48] font-bold">{formatTime(currentTime)}</span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-slate-500">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Current Active Scene Pill */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs"
            style={{
              backgroundColor: `${activeScene.colorTheme.accent}25`,
              borderColor: activeScene.colorTheme.accent,
              color: '#1A2B48',
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: activeScene.colorTheme.accent }}
            />
            <span className="font-bold">{activeScene.name}</span>
            <span className="text-[#1A2B48]/70 font-normal">({activeScene.subtitle})</span>
          </div>

          {/* Speed Pills */}
          <div className="flex items-center bg-[#F4EFE6] p-0.5 rounded-lg border border-[#E0D9CB]">
            {[0.5, 1, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => onChangePlaybackRate(rate)}
                className={`px-2 py-0.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  playbackRate === rate
                    ? 'bg-[#1A2B48] text-white shadow-2xs'
                    : 'text-[#1A2B48]/70 hover:text-[#1A2B48]'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Scrub Timeline */}
      <div className="space-y-1.5">
        <div className="relative w-full h-8 flex items-center">
          {/* Track background with scene bands */}
          <div className="relative w-full h-3 bg-[#F4EFE6] rounded-full overflow-hidden border border-[#E0D9CB] flex">
            {SCENES_DATA.map((scene) => {
              const sceneWidthPct = ((scene.endTime - scene.startTime) / TOTAL_DURATION) * 100;
              const isPast = currentTime >= scene.endTime;
              const isCurrent = currentTime >= scene.startTime && currentTime < scene.endTime;

              return (
                <div
                  key={scene.id}
                  style={{ width: `${sceneWidthPct}%` }}
                  className="h-full border-r border-[#E0D9CB] relative group transition-colors"
                >
                  <div
                    className="h-full opacity-40 group-hover:opacity-70 transition-opacity"
                    style={{ backgroundColor: scene.colorTheme.accent }}
                  />
                  {isCurrent && (
                    <div
                      className="absolute inset-0 opacity-90"
                      style={{
                        width: `${((currentTime - scene.startTime) / (scene.endTime - scene.startTime)) * 100}%`,
                        backgroundColor: scene.colorTheme.accent,
                      }}
                    />
                  )}
                  {isPast && (
                    <div
                      className="absolute inset-0 opacity-90"
                      style={{ backgroundColor: scene.colorTheme.accent }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Slider input */}
          <input
            type="range"
            min={0}
            max={TOTAL_DURATION}
            step={0.05}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer z-20"
          />

          {/* Draggable Playhead Thumb Indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-6 bg-white rounded-md shadow-md border-2 border-[#1A2B48] pointer-events-none z-10 flex items-center justify-center transition-all"
            style={{ left: `${(currentTime / TOTAL_DURATION) * 100}%` }}
          >
            <div className="w-1 h-3 bg-[#FFB3A7] rounded-full" />
          </div>
        </div>

        {/* Scene Jump Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {SCENES_DATA.map((scene) => {
            const isActive = currentTime >= scene.startTime && currentTime < scene.endTime;
            return (
              <button
                key={scene.id}
                onClick={() => onSeek(scene.startTime)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#1A2B48] border-[#1A2B48] text-white shadow-xs'
                    : 'bg-[#FAF8F5] border-[#EAE6DF] text-[#1A2B48]/70 hover:bg-[#F4EFE6] hover:text-[#1A2B48]'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: scene.colorTheme.accent }}
                />
                <span>{scene.name.split(':')[0]}</span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{scene.startTime}s</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls Grid: Audio Engine & Display Overlays */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#EAE6DF] text-xs">
        {/* 1. Background Music Controller */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleBgm}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                bgmEnabled ? 'bg-[#FFB3A7]/30 text-[#1A2B48] font-bold' : 'bg-slate-200 text-slate-500'
              }`}
              title={bgmEnabled ? 'Mute Music' : 'Enable Music'}
            >
              <Music className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-[#1A2B48]">Upbeat BGM</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={bgmEnabled ? bgmVolume : 0}
            onChange={(e) => onChangeBgmVolume(parseFloat(e.target.value))}
            className="w-16 accent-[#FF8C73] cursor-pointer"
            title="Music Volume"
          />
        </div>

        {/* 2. Voiceover Controller */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleVoice}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                voiceEnabled ? 'bg-[#D1F2EB] text-[#1A2B48] font-bold' : 'bg-slate-200 text-slate-500'
              }`}
              title={voiceEnabled ? 'Disable Voiceover' : 'Enable Voiceover'}
            >
              {voiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </button>
            <span className="font-semibold text-[#1A2B48]">AI Voiceover</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={voiceEnabled ? voiceVolume : 0}
            onChange={(e) => onChangeVoiceVolume(parseFloat(e.target.value))}
            className="w-16 accent-[#8FE3C0] cursor-pointer"
            title="Voice Volume"
          />
        </div>

        {/* 3. SFX & Captions */}
        <div className="flex items-center justify-around p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
          <button
            onClick={onToggleSfx}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              sfxEnabled ? 'bg-[#E0D7FF] text-[#1A2B48] font-bold' : 'text-[#1A2B48]/60 hover:text-[#1A2B48]'
            }`}
            title="Sound Effects (Pops, Swooshes)"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1A2B48]" />
            <span className="font-semibold">SFX</span>
          </button>

          <div className="h-4 w-px bg-[#EAE6DF]" />

          <button
            onClick={onToggleCaptions}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              showCaptions ? 'bg-amber-100 text-amber-900 font-bold' : 'text-[#1A2B48]/60 hover:text-[#1A2B48]'
            }`}
            title="Captions / Subtitles"
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span className="font-semibold">Captions</span>
          </button>
        </div>

        {/* 4. Instagram UI & Safe Area Toggles */}
        <div className="flex items-center justify-around p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
          <button
            onClick={onToggleInstagramOverlay}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              showInstagramOverlay ? 'bg-pink-100 text-pink-900 font-bold' : 'text-[#1A2B48]/60 hover:text-[#1A2B48]'
            }`}
            title="Toggle Instagram App UI Overlay"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="font-semibold">IG Overlay</span>
          </button>

          <div className="h-4 w-px bg-[#EAE6DF]" />

          <button
            onClick={onToggleSafeArea}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              showSafeArea ? 'bg-sky-100 text-sky-900 font-bold' : 'text-[#1A2B48]/60 hover:text-[#1A2B48]'
            }`}
            title="Toggle 9:16 Safe Area Margins"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="font-semibold">Safe Area</span>
          </button>
        </div>
      </div>
    </div>
  );
};

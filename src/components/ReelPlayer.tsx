import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SCENES_DATA, TOTAL_DURATION } from '../data/storyboardData';
import { ReelProject } from '../types';
import { Scene1Hook } from './scenes/Scene1Hook';
import { Scene2Brand } from './scenes/Scene2Brand';
import { Scene3Creator } from './scenes/Scene3Creator';
import { Scene4Content } from './scenes/Scene4Content';
import { Scene5BothSidesWin } from './scenes/Scene5BothSidesWin';
import { Scene6JodoCo } from './scenes/Scene6JodoCo';
import { Scene7FinalFrame } from './scenes/Scene7FinalFrame';
import { JodoCoLogo } from './JodoCoLogo';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Music2,
  CheckCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ReelPlayerProps {
  project?: ReelProject;
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  showInstagramOverlay: boolean;
  showSafeArea: boolean;
  showCaptions: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({
  project,
  currentTime,
  isPlaying,
  onTogglePlay,
  showInstagramOverlay,
  showSafeArea,
  showCaptions,
  isMuted,
  onToggleMute,
}) => {
  const scenes = project?.scenes || SCENES_DATA;
  const branding = project?.branding;

  // Determine current active scene
  const activeSceneIndex = scenes.findIndex(
    (scene) => currentTime >= scene.startTime && currentTime < scene.endTime
  );

  const currentScene = activeSceneIndex !== -1 ? scenes[activeSceneIndex] : scenes[scenes.length - 1];
  const isFinalFrame = currentScene.id === 7 || currentTime >= 22;

  // Scene progress within current scene (0 to 1)
  const sceneDuration = currentScene.endTime - currentScene.startTime;
  const progressInScene = Math.max(0, Math.min(1, (currentTime - currentScene.startTime) / sceneDuration));

  // Render Scene Component
  const renderSceneContent = () => {
    switch (currentScene.id) {
      case 1:
        return <Scene1Hook scene={currentScene} progress={progressInScene} />;
      case 2:
        return <Scene2Brand scene={currentScene} progress={progressInScene} />;
      case 3:
        return <Scene3Creator scene={currentScene} progress={progressInScene} />;
      case 4:
        return <Scene4Content scene={currentScene} progress={progressInScene} />;
      case 5:
        return <Scene5BothSidesWin scene={currentScene} progress={progressInScene} />;
      case 6:
        return <Scene6JodoCo scene={currentScene} progress={progressInScene} />;
      case 7:
      default:
        return <Scene7FinalFrame scene={currentScene} branding={branding} progress={progressInScene} />;
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* 9:16 Vertical Reel Canvas Container */}
      <div
        id="jodoco-reel-canvas"
        className="relative w-[340px] xs:w-[360px] sm:w-[380px] h-[605px] xs:h-[640px] sm:h-[680px] rounded-[40px] bg-[#FAF7F2] shadow-2xl border-[8px] border-[#1A2B48] overflow-hidden select-none flex flex-col justify-between"
      >
        {/* Animated Background Canvas Grain/Dots */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#1A2B48 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Top Progress Bar for the Reel (Instagram Style) */}
        <div className="absolute top-3 left-4 right-4 z-40 flex gap-1">
          {scenes.map((scene) => {
            const isCompleted = currentTime >= scene.endTime;
            const isCurrent = currentTime >= scene.startTime && currentTime < scene.endTime;
            const scenePct = isCompleted
              ? 100
              : isCurrent
              ? ((currentTime - scene.startTime) / (scene.endTime - scene.startTime)) * 100
              : 0;

            return (
              <div
                key={scene.id}
                className="flex-1 h-1 bg-[#1A2B48]/15 rounded-full overflow-hidden backdrop-blur-xs"
              >
                <div
                  className="h-full bg-[#FFB3A7] transition-all duration-75 ease-linear rounded-full"
                  style={{ width: `${scenePct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Scene Container with Smooth Keyframed Fade/Switch */}
        <div className="relative w-full h-full">
          {/* Active AI Visual Background (if generated for current scene) */}
          {currentScene.videoUrl && (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <video
                key={currentScene.videoUrl}
                src={currentScene.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover scale-105"
              />
              {/* High-legibility contrast backdrop */}
              <div className="absolute inset-0 bg-[#131B2E]/35 backdrop-blur-[0.5px]" />
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative z-10 w-full h-full"
            >
              {renderSceneContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Persistent JodoCo Watermark / Brand Mark (Bottom-Right corner inside safe area for Scenes 1-6) */}
        {!isFinalFrame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-6 right-5 z-30 pointer-events-auto"
          >
            <div className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#EAE6DF] shadow-xs flex items-center hover:scale-105 transition-transform">
              <JodoCoLogo size="xs" variant="full" className="h-4" />
            </div>
          </motion.div>
        )}

        {/* Dynamic Voiceover Subtitle / Captions overlay (if enabled) */}
        {showCaptions && (
          <div className="absolute bottom-16 left-6 right-6 z-35 flex justify-center pointer-events-none">
            <motion.div
              key={currentScene.id}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold text-center leading-snug shadow-lg border border-white/10 max-w-[90%]"
            >
              <span className="text-[#8FE3C0] font-bold mr-1">Voiceover:</span>
              "{currentScene.voiceover}"
            </motion.div>
          </div>
        )}

        {/* Instagram Reel Native UI Overlay (Simulating real Instagram App experience) */}
        {showInstagramOverlay && (
          <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4">
            {/* Top Bar: Live Reel Title */}
            <div className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#0F172A] drop-shadow-xs">Reels</span>
              </div>
              <button
                onClick={onToggleMute}
                className="pointer-events-auto p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Bottom & Right Engagement Overlay */}
            <div className="flex items-end justify-between pb-2">
              {/* Left Profile Info & Caption */}
              <div className="space-y-1 max-w-[70%] text-[#0F172A]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#131B2E] text-white flex items-center justify-center font-bold text-[10px]">
                    JC
                  </div>
                  <span className="text-xs font-black drop-shadow-xs">jodoco.agency</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488] fill-[#8FE3C0]" />
                  <span className="text-[10px] font-bold text-[#FF8C73] border border-[#FF8C73]/40 bg-[#FFF0ED] px-1.5 py-0.2 rounded-sm">
                    Follow
                  </span>
                </div>
                <p className="text-[10px] text-[#334155] line-clamp-2 leading-tight">
                  What is Influencer Marketing? 💡 Connecting brands with the right creators. #CreatorMarketing #JodoCo
                </p>
                <div className="flex items-center gap-1.5 text-[9px] text-[#64748B]">
                  <Music2 className="w-3 h-3 text-[#FF8C73] animate-pulse" />
                  <span className="truncate">JodoCo Original Audio • Upbeat Vibe</span>
                </div>
              </div>

              {/* Right Side Social Actions */}
              <div className="flex flex-col items-center gap-3 text-[#0F172A]">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-md shadow-xs flex items-center justify-center">
                    <Heart className="w-4 h-4 text-[#FF6B4A] fill-[#FF6B4A]" />
                  </div>
                  <span className="text-[9px] font-bold mt-0.5">24.5k</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-md shadow-xs flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-[#0F172A]" />
                  </div>
                  <span className="text-[9px] font-bold mt-0.5">380</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-md shadow-xs flex items-center justify-center">
                    <Send className="w-4 h-4 text-[#0F172A]" />
                  </div>
                  <span className="text-[9px] font-bold mt-0.5">1.8k</span>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-md shadow-xs flex items-center justify-center">
                  <Bookmark className="w-4 h-4 text-[#0F172A]" />
                </div>

                {/* Spinning Audio Album Cover */}
                <div className="w-7 h-7 rounded-full bg-linear-to-tr from-[#FF8C73] via-[#B8A7EA] to-[#8FE3C0] p-0.5 animate-spin-slow">
                  <div className="w-full h-full rounded-full bg-[#131B2E] flex items-center justify-center text-[8px] text-white">
                    🎵
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instagram Reels Safe Area Overlay Guide */}
        {showSafeArea && (
          <div className="absolute inset-0 z-40 pointer-events-none border-2 border-dashed border-sky-400/70 m-3 rounded-2xl flex flex-col justify-between p-3 bg-sky-500/5">
            <div className="h-14 border-b border-dashed border-sky-400/50 flex items-center justify-between text-[10px] font-mono text-sky-700 bg-sky-100/60 px-2 rounded-sm">
              <span>Header Safe Zone (14%)</span>
              <span>Protected</span>
            </div>
            <div className="flex-1 flex items-center justify-center text-center">
              <span className="text-[11px] font-mono font-bold text-sky-700/80 bg-white/80 px-2.5 py-1 rounded-md border border-sky-300">
                Primary Content Safe Area (9:16)
              </span>
            </div>
            <div className="h-24 border-t border-dashed border-sky-400/50 flex flex-col justify-center text-[10px] font-mono text-sky-700 bg-sky-100/60 px-2 rounded-sm">
              <span>Engagement & Bottom Caption Zone (20%)</span>
              <span>Reserved for IG UI & Logo Mark</span>
            </div>
          </div>
        )}

        {/* Click on reel canvas to toggle Play / Pause */}
        <button
          onClick={onTogglePlay}
          className="absolute inset-0 z-20 cursor-pointer w-full h-full opacity-0"
          aria-label={isPlaying ? 'Pause Reel' : 'Play Reel'}
        />
      </div>
    </div>
  );
};

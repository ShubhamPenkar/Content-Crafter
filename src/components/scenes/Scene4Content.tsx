import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Eye, TrendingUp, Sparkles, Video } from 'lucide-react';
import { SceneInfo } from '../../types';

interface SceneProps {
  scene?: SceneInfo;
  progress: number; // 0 to 1 within this 4-second scene
}

export const Scene4Content: React.FC<SceneProps> = ({ scene, progress }) => {
  const stepTag = scene?.name || 'Step 3: The Flywheel';
  const step1Text = scene?.onScreenText?.[0] || 'Creator creates.';
  const step2Text = scene?.onScreenText?.[1] || 'Audience watches.';
  const step3Text = scene?.onScreenText?.[2] || 'Brand gets noticed.';
  // Phase 1 (0 to 0.33): Creator creates

  // Phase 2 (0.33 to 0.66): Audience watches
  // Phase 3 (0.66 to 1.0): Brand gets noticed
  const phase = progress < 0.33 ? 1 : progress < 0.66 ? 2 : 3;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden">
      {/* Background Pastel Aura */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        className="absolute top-1/4 -right-10 w-52 h-52 rounded-full bg-[#B8A7EA]/25 blur-3xl pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        className="absolute -bottom-10 -left-10 w-52 h-52 rounded-full bg-[#FF8C73]/25 blur-3xl pointer-events-none"
      />

      {/* Top Step Pill */}
      <div className="pt-6 z-10">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#EAE3D6] text-[#0F172A] text-[11px] font-bold tracking-wider uppercase shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#B8A7EA]" />
          Step 3: The Flywheel
        </motion.div>
      </div>

      {/* Center Layout: Mini Social Reel Mock + 3 Punchy Statements */}
      <div className="flex-1 flex flex-col justify-center items-center my-auto z-10 space-y-5 w-full">
        {/* Animated 3-Step Sequence Badges */}
        <div className="w-full space-y-2">
          {/* Step 1: Creator creates */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{
              x: 0,
              opacity: phase >= 1 ? 1 : 0.4,
              scale: phase === 1 ? 1.03 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-colors ${
              phase === 1
                ? 'bg-white border-[#B8A7EA] shadow-md text-[#0F172A]'
                : phase > 1
                ? 'bg-white/80 border-[#E8E0D2] text-[#475569]'
                : 'bg-white/40 border-transparent text-[#94A3B8]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#B8A7EA]/20 text-[#6B46C1] flex items-center justify-center text-xs font-black">
                1
              </span>
              <span className="text-base font-extrabold font-heading">
                {step1Text}
              </span>
            </div>
            {phase === 1 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs px-2 py-0.5 rounded-full bg-[#F2ECFD] text-[#7C3AED] font-bold"
              >
                🎬 Filming Reel
              </motion.span>
            )}
          </motion.div>

          {/* Step 2: Audience watches */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{
              x: 0,
              opacity: phase >= 2 ? 1 : 0.4,
              scale: phase === 2 ? 1.03 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
            className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-colors ${
              phase === 2
                ? 'bg-white border-[#8FE3C0] shadow-md text-[#0F172A]'
                : phase > 2
                ? 'bg-white/80 border-[#E8E0D2] text-[#475569]'
                : 'bg-white/40 border-[#E8E0D2]/50 text-[#94A3B8]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#8FE3C0]/25 text-[#0D9488] flex items-center justify-center text-xs font-black">
                2
              </span>
              <span className="text-base font-extrabold font-heading">
                {step2Text}
              </span>
            </div>
            {phase === 2 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs px-2 py-0.5 rounded-full bg-[#E8F8F1] text-[#0D9488] font-bold"
              >
                👀 18.5k Views
              </motion.span>
            )}
          </motion.div>

          {/* Step 3: Brand gets noticed */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{
              x: 0,
              opacity: phase >= 3 ? 1 : 0.4,
              scale: phase === 3 ? 1.04 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.2 }}
            className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-colors ${
              phase === 3
                ? 'bg-white border-[#FF8C73] shadow-lg shadow-[#FF8C73]/15 text-[#0F172A]'
                : 'bg-white/40 border-[#E8E0D2]/50 text-[#94A3B8]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#FF8C73]/20 text-[#EA580C] flex items-center justify-center text-xs font-black">
                3
              </span>
              <span className="text-base font-black font-heading text-[#0F172A]">
                {step3Text}
              </span>
            </div>
            {phase === 3 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs px-2 py-0.5 rounded-full bg-[#FFF0ED] text-[#EA580C] font-bold flex items-center gap-1"
              >
                <TrendingUp className="w-3 h-3" />
                Orders +340%
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* Mini Dynamic Vertical Phone Mock with Live Viral Engagement */}
        <motion.div
          initial={{ scale: 0.9, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[290px] rounded-3xl bg-[#131B2E] p-3 text-white shadow-xl relative overflow-hidden border-2 border-white/20"
        >
          {/* Top Camera Notch */}
          <div className="flex justify-center mb-2">
            <div className="w-12 h-2.5 bg-black/40 rounded-full" />
          </div>

          {/* Reel Canvas Screen */}
          <div className="relative h-32 rounded-2xl bg-linear-to-b from-[#25304B] to-[#121826] p-3 flex flex-col justify-between overflow-hidden">
            {/* Floating Live Reactions (Hearts & Comments) */}
            <div className="absolute right-2 bottom-3 flex flex-col items-center gap-2 z-20">
              <motion.div
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
              >
                <Heart className="w-4 h-4 text-[#FF6B4A] fill-[#FF6B4A]" />
              </motion.div>
              <span className="text-[9px] font-bold">14.2k</span>

              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[9px] font-bold">840</span>

              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Share2 className="w-3.5 h-3.5 text-[#8FE3C0]" />
              </div>
            </div>

            {/* Creator Story Tag inside Reel */}
            <div className="flex items-center gap-2 z-10">
              <div className="w-6 h-6 rounded-full bg-[#FF8C73] flex items-center justify-center text-xs">
                👩‍🎨
              </div>
              <div>
                <span className="text-[11px] font-bold block leading-none">@alexa_vlogs</span>
                <span className="text-[8px] text-white/70">Sponsored by Aura</span>
              </div>
            </div>

            {/* Live Comment Bubble Pop-In */}
            <AnimatePresence mode="wait">
              {phase === 2 && (
                <motion.div
                  key="comment-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] text-white max-w-[70%]"
                >
                  <span className="font-bold text-[#8FE3C0]">@priya_d:</span> "Just bought this! Love the aesthetic 😍"
                </motion.div>
              )}
              {phase === 3 && (
                <motion.div
                  key="comment-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#FF8C73]/90 text-[#0F172A] font-bold px-2.5 py-1 rounded-xl text-[10px] max-w-[75%]"
                >
                  🚀 "Aura Serum sold out 500 units in 2 hours!"
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Safe zone spacer */}
      <div className="h-10 z-10 w-full" />
    </div>
  );
};

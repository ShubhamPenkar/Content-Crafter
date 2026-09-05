import React from 'react';
import { motion } from 'motion/react';
import { JodoCoLogo } from '../JodoCoLogo';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { SceneInfo } from '../../types';

interface SceneProps {
  scene?: SceneInfo;
  progress: number; // 0 to 1 within this 4-second scene
}

export const Scene6JodoCo: React.FC<SceneProps> = ({ scene, progress }) => {
  const item1 = scene?.onScreenText?.[0] || 'RIGHT CREATOR.';
  const item2 = scene?.onScreenText?.[1] || 'RIGHT AUDIENCE.';
  const item3 = scene?.onScreenText?.[2] || 'RIGHT PARTNERSHIP.';
  const introText = scene?.onScreenText?.[3] || "That's where JodoCo comes in.";
  // Phase 1 (0 to 0.25): RIGHT CREATOR.

  // Phase 2 (0.25 to 0.5): RIGHT AUDIENCE.
  // Phase 3 (0.5 to 0.75): RIGHT PARTNERSHIP.
  // Phase 4 (0.75 to 1.0): That's where JodoCo comes in.
  const phase = progress < 0.25 ? 1 : progress < 0.5 ? 2 : progress < 0.75 ? 3 : 4;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden">
      {/* Background Pastel Waves */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 0.6 }}
        className="absolute -top-12 -left-12 w-60 h-60 rounded-full bg-[#FF8C73]/25 blur-3xl pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 0.5 }}
        className="absolute top-1/3 -right-12 w-60 h-60 rounded-full bg-[#B8A7EA]/30 blur-3xl pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 0.5 }}
        className="absolute -bottom-10 left-1/4 w-60 h-60 rounded-full bg-[#8FE3C0]/30 blur-3xl pointer-events-none"
      />

      {/* Top Brand Tag */}
      <div className="pt-6 z-10">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 border border-[#EAE3D6] text-[#0F172A] text-[11px] font-bold tracking-wider uppercase shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF8C73]" />
          The Ultimate Matchmaker
        </motion.div>
      </div>

      {/* Center Layout: Converging Brand & Creator -> 3 Kinetic Statements -> JodoCo Reveal */}
      <div className="flex-1 flex flex-col justify-center items-center text-center my-auto z-10 space-y-4 w-full">
        {/* Converging Nodes */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center gap-3 relative py-2"
        >
          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-11 h-11 rounded-2xl bg-white border-2 border-[#FFE2DC] shadow-md flex items-center justify-center text-lg"
          >
            🏢
          </motion.div>

          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF8C73] animate-ping" />
            <span className="w-2 h-2 rounded-full bg-[#B8A7EA]" />
            <span className="w-2 h-2 rounded-full bg-[#8FE3C0]" />
          </div>

          <motion.div
            animate={{ x: [0, -8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-11 h-11 rounded-2xl bg-white border-2 border-[#D8F5E9] shadow-md flex items-center justify-center text-lg"
          >
            👩‍🎨
          </motion.div>
        </motion.div>

        {/* Sequential Kinetic Typographic Stack */}
        <div className="w-full space-y-2.5 max-w-[290px]">
          {/* 1. RIGHT CREATOR */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: phase >= 1 ? 1 : 0.8,
              opacity: phase >= 1 ? 1 : 0,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white border-2 border-[#B8A7EA] shadow-md"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
              <span className="font-heading font-black text-sm tracking-wide text-[#0F172A]">
                RIGHT CREATOR.
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F2ECFD] text-[#7C3AED]">
              Vetted & Authentic
            </span>
          </motion.div>

          {/* 2. RIGHT AUDIENCE */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: phase >= 2 ? 1 : 0.8,
              opacity: phase >= 2 ? 1 : 0,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white border-2 border-[#8FE3C0] shadow-md"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
              <span className="font-heading font-black text-sm tracking-wide text-[#0F172A]">
                RIGHT AUDIENCE.
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8F8F1] text-[#0D9488]">
              High Intent
            </span>
          </motion.div>

          {/* 3. RIGHT PARTNERSHIP */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: phase >= 3 ? 1 : 0.8,
              opacity: phase >= 3 ? 1 : 0,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white border-2 border-[#FF8C73] shadow-md"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#EA580C]" />
              <span className="font-heading font-black text-sm tracking-wide text-[#0F172A]">
                RIGHT PARTNERSHIP.
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF0ED] text-[#EA580C]">
              Win-Win ROI
            </span>
          </motion.div>
        </div>

        {/* Phase 4: That's where JodoCo comes in */}
        {phase >= 4 && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="pt-2 space-y-2"
          >
            <p className="text-sm font-bold text-[#64748B] tracking-wide">
              That's where
            </p>
            <div className="inline-block p-1">
              <JodoCoLogo size="lg" variant="badge" />
            </div>
            <p className="text-xs font-bold text-[#FF6B4A]">
              comes in.
            </p>
          </motion.div>
        )}
      </div>

      {/* Safe zone spacer */}
      <div className="h-10 z-10 w-full" />
    </div>
  );
};

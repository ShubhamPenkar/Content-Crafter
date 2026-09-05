import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { SceneInfo } from '../../types';

interface SceneProps {
  scene?: SceneInfo;
  progress: number; // 0 to 1 within this scene
}

export const Scene1Hook: React.FC<SceneProps> = ({ scene, progress }) => {
  const line1 = scene?.onScreenText?.[0] || 'INFLUENCER';
  const line2 = scene?.onScreenText?.[1] || 'MARKETING?';
  const tagText = scene?.subtitle || 'Creator Economy 101';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 select-none overflow-hidden">
      {/* Decorative Pastel Blobs & Circles */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 0.6 }}
        className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-[#FF8C73]/25 blur-2xl pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="absolute top-1/3 -right-12 w-48 h-48 rounded-full bg-[#B8A7EA]/30 blur-2xl pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute -bottom-10 left-1/4 w-52 h-52 rounded-full bg-[#8FE3C0]/30 blur-2xl pointer-events-none"
      />

      {/* Top Tag */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="pt-6 z-10"
      >
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 border border-[#E5DEC9] text-[#0F172A] text-[11px] font-bold tracking-wider uppercase shadow-xs">
          <Sparkles className="w-3 h-3 text-[#FF8C73]" />
          {tagText}
        </span>
      </motion.div>

      {/* Center Hero Kinetic Text & Connectors */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-10 max-w-[90%] my-auto">
        {/* Animated Connector Wave */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-24 h-1 bg-linear-to-r from-[#FF8C73] via-[#B8A7EA] to-[#8FE3C0] rounded-full mb-6"
        />

        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#64748B] uppercase mb-1"
        >
          WHAT IS
        </motion.p>

        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          className="relative my-2"
        >
          <div className="absolute -inset-2 bg-linear-to-r from-[#FF8C73]/20 via-[#B8A7EA]/25 to-[#8FE3C0]/20 rounded-2xl blur-sm -z-10" />
          <h1 className="text-3xl sm:text-[34px] font-extrabold text-[#0F172A] tracking-tight leading-[1.08] font-heading">
            {line1} <br />
            <span className="relative inline-block text-[#0F172A]">
              {line2}
              {/* Highlight Underline */}
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewBox="0 0 200 12"
                className="absolute -bottom-1 left-0 w-full h-3 text-[#FF8C73]"
              >
                <path
                  d="M2 7 C50 2, 150 2, 198 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </motion.svg>
            </span>
          </h1>
        </motion.div>

        {/* 20s Explainer Pill */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#131B2E] text-white text-xs font-semibold shadow-md"
        >
          <Zap className="w-3.5 h-3.5 text-[#8FE3C0] fill-[#8FE3C0]" />
          <span>explained in 20 seconds</span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <ArrowRight className="w-3.5 h-3.5 text-[#FF8C73]" />
          </motion.span>
        </motion.div>

        {/* Minimal D2C Product Peek Doodle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/85 border border-[#E8E0D2] shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-[#FF8C73]/20 flex items-center justify-center text-xs">
              📦
            </div>
            <span className="text-[11px] font-bold text-[#334155]">Brand</span>
          </div>

          {/* Dotted Connector */}
          <div className="flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8A7EA] animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8A7EA]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8A7EA]" />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/85 border border-[#E8E0D2] shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-[#8FE3C0]/25 flex items-center justify-center text-xs">
              ✨
            </div>
            <span className="text-[11px] font-bold text-[#334155]">Creator</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Spacer for safe zone & corner logo */}
      <div className="h-10 z-10 w-full" />
    </div>
  );
};

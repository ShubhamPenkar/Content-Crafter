import React from 'react';
import { motion } from 'motion/react';
import { JodoCoLogo } from '../JodoCoLogo';
import { Sparkles, Send, ArrowUpRight } from 'lucide-react';
import { SceneInfo, ReelBranding } from '../../types';

interface SceneProps {
  scene?: SceneInfo;
  branding?: ReelBranding;
  progress: number;
}

export const Scene7FinalFrame: React.FC<SceneProps> = ({ scene, branding, progress }) => {
  const topTag = branding?.ctaSubtext || 'The Creator Marketing Bridge';
  const slogan = branding?.slogan || 'CONNECT • CREATE • GROW';
  const subSlogan = branding?.subSlogan || 'Brands × Creators';
  const ctaText = branding?.ctaText || "Let's Jodo.";
  const websiteUrl = branding?.websiteUrl || 'jodoco.agency';

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-6 select-none overflow-hidden bg-[#FAF7F2]">
      {/* Subtle organic background pastel warmth */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.35, 0.5, 0.35],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-linear-to-tr from-[#FFAAA0]/20 via-[#DDD4FC]/20 to-[#9FE8D4]/20 blur-3xl pointer-events-none"
      />

      {/* Top Safe-Zone Header (Inside Instagram Safe Margin) */}
      <div className="pt-8 z-10">
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#EAE6DF] text-[#1A2B48] text-[11px] font-bold shadow-2xs"
        >
          <Sparkles className="w-3 h-3 text-[#FFAAA0]" />
          <span>{topTag}</span>
        </motion.div>
      </div>

      {/* Center Layout: Large Centered Actual JodoCo Logo + Underneath Texts */}
      <div className="flex-1 flex flex-col justify-center items-center text-center my-auto z-10 w-full max-w-[320px] px-2">
        {/* Animated Flying Paper Plane Doodle flying gracefully from the logo */}
        <div className="relative w-full flex justify-center items-center">
          {/* Subtle Trail Dotted Path */}
          <motion.svg
            viewBox="0 0 200 60"
            className="absolute -top-10 -right-2 w-28 h-12 pointer-events-none z-20 overflow-visible text-[#FFAAA0]"
          >
            <motion.path
              d="M 10 45 Q 60 10, 110 20 T 170 8"
              fill="none"
              stroke="#FFAAA0"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            />
          </motion.svg>

          {/* Flying Paper Plane Icon */}
          <motion.div
            initial={{ scale: 0, x: -30, y: 20, rotate: -20, opacity: 0 }}
            animate={{
              scale: [0, 1.1, 1],
              x: [0, 8, 0],
              y: [0, -6, 0],
              rotate: [15, 22, 15],
              opacity: 1,
            }}
            transition={{
              scale: { duration: 0.4, delay: 0.3 },
              x: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute -top-10 right-4 z-20"
          >
            <div className="w-7 h-7 rounded-full bg-white shadow-md border border-[#FFAAA0]/40 flex items-center justify-center text-[#FFAAA0]">
              <Send className="w-3.5 h-3.5 fill-[#FFAAA0]/20 -rotate-12 translate-x-0.5" />
            </div>
          </motion.div>

          {/* Large Centered Authentic JodoCo Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="p-2 select-none"
          >
            <JodoCoLogo size="hero" animated={true} />
          </motion.div>
        </div>

        {/* SubSlogan Badge */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-2 flex flex-col items-center space-y-2 w-full"
        >
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#EAE6DF] text-[#1A2B48] text-xs font-extrabold tracking-wide shadow-2xs">
              {subSlogan}
            </span>
          </div>
        </motion.div>

        {/* Optional Final CTA */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.35 }}
          className="mt-6 w-full flex flex-col items-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.035, 1],
              boxShadow: [
                '0 4px 12px rgba(26, 43, 72, 0.08)',
                '0 8px 20px rgba(255, 170, 160, 0.28)',
                '0 4px 12px rgba(26, 43, 72, 0.08)',
              ],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-[#1A2B48] text-white font-heading font-black text-sm tracking-wide cursor-pointer hover:bg-[#223659] transition-colors"
          >
            <span>{ctaText}</span>
            <ArrowUpRight className="w-4 h-4 text-[#9FE8D4]" />
          </motion.div>

          <p className="text-[11px] text-[#1A2B48]/60 font-semibold tracking-tight mt-2.5">
            {websiteUrl}
          </p>
        </motion.div>
      </div>

      {/* Bottom Safe Area Spacer */}
      <div className="h-8 z-10 w-full" />
    </div>
  );
};


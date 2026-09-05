import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Star, Package, Eye } from 'lucide-react';
import { SceneInfo } from '../../types';

interface SceneProps {
  scene?: SceneInfo;
  progress: number;
}

export const Scene2Brand: React.FC<SceneProps> = ({ scene, progress }) => {
  const stepTitle = scene?.name || 'Step 1: The Brand Challenge';
  const subtitle = scene?.subtitle || '3–6 seconds';
  const text1 = scene?.onScreenText?.[0] || 'A brand wants people to notice its product.';

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden">
      {/* Background Soft Blobs */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        className="absolute -top-12 -left-10 w-48 h-48 rounded-full bg-[#FF8C73]/25 blur-3xl pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        className="absolute bottom-10 -right-12 w-52 h-52 rounded-full bg-[#B8A7EA]/25 blur-3xl pointer-events-none"
      />

      {/* Top Header Tag */}
      <div className="pt-6 z-10">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#EAE3D6] text-[#0F172A] text-[11px] font-bold tracking-wider uppercase shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF8C73]" />
          Step 1: The Brand Challenge
        </motion.div>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col justify-center my-auto z-10 space-y-6">
        {/* On Screen Main Headline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FF8C73]/20 text-[#D95338] text-xs font-bold uppercase tracking-wide">
            <Package className="w-3.5 h-3.5" />
            The Product
          </div>
          <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0F172A] leading-tight font-heading">
            A brand wants people to{' '}
            <span className="relative inline-block px-1.5 py-0.5 rounded-lg bg-[#FF8C73]/20 text-[#0F172A]">
              notice
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="absolute bottom-0 left-0 h-1 bg-[#FF8C73] rounded-full"
              />
            </span>{' '}
            its product.
          </h2>
        </motion.div>

        {/* Visual Illustration: Illustrated D2C Product Card + Extending Connector */}
        <div className="relative pt-2">
          {/* Card */}
          <motion.div
            initial={{ scale: 0.9, x: -30, opacity: 0 }}
            animate={{ scale: 1, x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
            className="w-full max-w-[280px] rounded-2xl bg-white p-4 border-2 border-[#FFE8E2] shadow-lg shadow-[#FF8C73]/10 relative z-20"
          >
            {/* Product Mock Container */}
            <div className="h-32 rounded-xl bg-linear-to-b from-[#FFF5F2] to-[#FAF7F2] border border-[#F5EAD9] flex items-center justify-center relative overflow-hidden">
              {/* Floating Sparkles */}
              <div className="absolute top-2 right-2 flex items-center gap-0.5 text-[10px] font-bold text-[#E66E53] bg-white px-2 py-0.5 rounded-full shadow-2xs border border-[#FBEAE6]">
                <Star className="w-3 h-3 fill-[#FFB800] text-[#FFB800]" />
                4.9 D2C
              </div>

              {/* Illustrated Eco-D2C Bottle / Box */}
              <div className="relative flex flex-col items-center">
                {/* Bottle Cap */}
                <div className="w-6 h-3 bg-[#131B2E] rounded-t-sm" />
                {/* Bottle Neck */}
                <div className="w-4 h-2 bg-[#E2D8C9]" />
                {/* Bottle Body */}
                <div className="w-16 h-20 bg-linear-to-b from-[#FF8C73] to-[#FF6B4A] rounded-xl flex flex-col items-center justify-center p-1 text-white shadow-md relative">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
                  </div>
                  <span className="text-[9px] font-black tracking-wider uppercase mt-1">AURA</span>
                </div>
              </div>

              {/* Tag bottom left */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-semibold text-[#64748B] bg-white/90 px-2 py-0.5 rounded-md border border-[#EBE3D7]">
                <Eye className="w-3 h-3 text-[#FF8C73]" />
                <span>Seeking Reach</span>
              </div>
            </div>

            {/* Product Card Details */}
            <div className="mt-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#0F172A]">Aura Botanical Serum</h4>
                <p className="text-[11px] text-[#64748B] font-medium">Modern D2C Brand</p>
              </div>
              <span className="text-xs font-extrabold text-[#0F172A] px-2 py-1 rounded-lg bg-[#FAF7F2] border border-[#E5DEC9]">
                $38
              </span>
            </div>
          </motion.div>

          {/* Animated Dotted Coral Connector Ray extending to the Right */}
          <div className="absolute top-1/2 -translate-y-1/2 right-0 left-[260px] flex items-center z-10">
            <svg className="w-full h-12 overflow-visible" viewBox="0 0 140 40">
              {/* Pulsing Connector Path */}
              <motion.path
                d="M 0 20 Q 50 5, 100 20 T 140 20"
                fill="none"
                stroke="#FF8C73"
                strokeWidth="3.5"
                strokeDasharray="6 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
              {/* Glowing Forward Indicator Arrow */}
              <motion.circle
                cx="120"
                cy="20"
                r="6"
                fill="#FF8C73"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <motion.circle cx="120" cy="20" r="3" fill="#FFFFFF" />
            </svg>
          </div>
        </div>

        {/* Minimal Goal Subtext */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 text-xs text-[#64748B] font-medium"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C73]" />
          <span>How does a brand cut through traditional ad fatigue?</span>
        </motion.div>
      </div>

      {/* Bottom Spacer for safe zone */}
      <div className="h-10 z-10 w-full" />
    </div>
  );
};

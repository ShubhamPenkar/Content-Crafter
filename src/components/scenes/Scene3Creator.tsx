import React from 'react';
import { motion } from 'motion/react';
import { Users, Sparkles, CheckCircle2, ArrowRight, Video } from 'lucide-react';
import { SceneInfo } from '../../types';

interface SceneProps {
  scene?: SceneInfo;
  progress: number;
}

export const Scene3Creator: React.FC<SceneProps> = ({ scene, progress }) => {
  const stepTag = scene?.name || 'Step 2: The Solution';
  const headerPrefix = scene?.onScreenText?.[0] || 'Instead of traditional cold ads:';
  const headline = scene?.onScreenText?.[1] || 'Partner with a creator who already has the right audience.';

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden">
      {/* Pastel Blobs */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        className="absolute -top-10 right-0 w-48 h-48 rounded-full bg-[#8FE3C0]/30 blur-3xl pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        className="absolute bottom-12 -left-10 w-52 h-52 rounded-full bg-[#B8A7EA]/30 blur-3xl pointer-events-none"
      />

      {/* Top Header Tag */}
      <div className="pt-6 z-10">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#EAE3D6] text-[#0F172A] text-[11px] font-bold tracking-wider uppercase shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#8FE3C0]" />
          Step 2: The Solution
        </motion.div>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col justify-center my-auto z-10 space-y-4">
        {/* BRAND → CREATOR Connection Tag */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#131B2E] text-white shadow-md"
        >
          <span className="text-xs font-bold text-[#FF8C73]">BRAND</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#B8A7EA]" />
          <span className="text-xs font-bold text-[#8FE3C0]">CREATOR</span>
          <Sparkles className="w-3.5 h-3.5 text-[#FDE68A]" />
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-1.5"
        >
          <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Instead of traditional cold ads:
          </p>
          <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#0F172A] leading-snug font-heading">
            Partner with a creator who already has the{' '}
            <span className="relative inline-block mt-1">
              <span className="px-2.5 py-1 rounded-xl bg-linear-to-r from-[#8FE3C0] to-[#A3E4D7] text-[#0F172A] font-black shadow-sm">
                right audience.
              </span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-2 -right-2 text-sm"
              >
                ✨
              </motion.span>
            </span>
          </h2>
        </motion.div>

        {/* Creator Illustrated Visual Card */}
        <motion.div
          initial={{ scale: 0.9, y: 25, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.2 }}
          className="w-full rounded-2xl bg-white p-4 border-2 border-[#DDF6EC] shadow-lg shadow-[#8FE3C0]/15 relative overflow-hidden"
        >
          {/* Connector Line Landing Point */}
          <div className="absolute top-4 left-0 -ml-2 w-4 h-4 rounded-full bg-[#FF8C73] flex items-center justify-center animate-ping" />

          <div className="flex items-center gap-3.5">
            {/* Friendly Creator Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-[#B8A7EA] via-[#FF8C73] to-[#8FE3C0] p-1 shadow-md">
                <div className="w-full h-full rounded-xl bg-[#FAF7F2] flex items-center justify-center overflow-hidden">
                  <span className="text-2xl">👩‍🎨</span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#8FE3C0] border-2 border-white flex items-center justify-center text-[10px] text-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F172A]" />
              </div>
            </div>

            {/* Creator Metrics */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-[#0F172A] truncate">Alexa • Lifestyle & D2C</h4>
              </div>
              <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                <Users className="w-3 h-3 text-[#8FE3C0]" />
                <span className="font-semibold text-[#0F172A]">240K engaged followers</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8F8F1] text-[#0D9488] border border-[#BCECD8]">
                  8.4% Eng. Rate
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F2ECFD] text-[#7C3AED] border border-[#DDD0FA]">
                  High Trust
                </span>
              </div>
            </div>
          </div>

          {/* Connected Bridge Ribbon */}
          <div className="mt-3 pt-3 border-t border-[#F0EBE0] flex items-center justify-between text-xs text-[#334155]">
            <div className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-[#FF8C73]" />
              <span className="text-[11px] font-semibold">Authentic Storytelling</span>
            </div>
            <span className="text-[11px] font-bold text-[#0D9488] bg-[#E8F8F1] px-2 py-0.5 rounded-full">
              Matched by JodoCo
            </span>
          </div>
        </motion.div>
      </div>

      {/* Safe zone spacer */}
      <div className="h-10 z-10 w-full" />
    </div>
  );
};

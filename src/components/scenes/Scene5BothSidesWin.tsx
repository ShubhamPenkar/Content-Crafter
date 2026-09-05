import React from 'react';
import { motion } from 'motion/react';
import { Check, Handshake, Sparkles, TrendingUp, DollarSign, Award, ShieldCheck } from 'lucide-react';
import { SceneInfo } from '../../types';

interface SceneProps {
  scene?: SceneInfo;
  progress: number;
}

export const Scene5BothSidesWin: React.FC<SceneProps> = ({ scene, progress }) => {
  const stepTag = scene?.name || 'Win-Win Ecosystem';
  const headline = scene?.onScreenText?.[0] || 'Both sides benefit when the partnership is right.';

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden">
      {/* Background Blobs */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        className="absolute top-10 -left-10 w-48 h-48 rounded-full bg-[#FF8C73]/25 blur-3xl pointer-events-none"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        className="absolute top-10 -right-10 w-48 h-48 rounded-full bg-[#8FE3C0]/25 blur-3xl pointer-events-none"
      />

      {/* Top Step Pill */}
      <div className="pt-6 z-10">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#EAE3D6] text-[#0F172A] text-[11px] font-bold tracking-wider uppercase shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF8C73]" />
          Win-Win Ecosystem
        </motion.div>
      </div>

      {/* Center Layout: Main Headline + Split Screen Comparison Cards */}
      <div className="flex-1 flex flex-col justify-center my-auto z-10 space-y-4">
        {/* On Screen Main Headline */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-1"
        >
          <h2 className="text-2xl sm:text-[25px] font-extrabold text-[#0F172A] leading-snug font-heading">
            Both sides benefit when the <br />
            <span className="relative inline-block px-2.5 py-0.5 rounded-xl bg-linear-to-r from-[#FF8C73]/20 via-[#B8A7EA]/25 to-[#8FE3C0]/25 text-[#0F172A] font-black mt-1">
              partnership is right.
            </span>
          </h2>
        </motion.div>

        {/* Clean Split-Screen Bento Cards */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 relative">
          {/* Central Handshake Node Floating Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.3 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#131B2E] text-white border-2 border-white shadow-xl flex items-center justify-center"
          >
            <Handshake className="w-5 h-5 text-[#8FE3C0]" />
          </motion.div>

          {/* LEFT CARD: BRAND */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl bg-white p-3.5 border-2 border-[#FFE8E2] shadow-md flex flex-col justify-between space-y-3"
          >
            {/* Header */}
            <div className="flex items-center gap-1.5 border-b border-[#FFEBE6] pb-2">
              <div className="w-5 h-5 rounded-lg bg-[#FF8C73]/20 flex items-center justify-center text-xs">
                🏢
              </div>
              <h3 className="text-xs font-black tracking-wider text-[#FF6B4A] uppercase">
                BRAND
              </h3>
            </div>

            {/* Bullet points */}
            <div className="space-y-2 text-left">
              <div className="flex items-start gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#FFEAE5] text-[#EA580C] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] leading-none">Reach</p>
                  <p className="text-[9px] text-[#64748B] mt-0.5">Targeted eyes</p>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#FFEAE5] text-[#EA580C] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] leading-none">Trust</p>
                  <p className="text-[9px] text-[#64748B] mt-0.5">Creator credibility</p>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#FFEAE5] text-[#EA580C] flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] leading-none">Customers</p>
                  <p className="text-[9px] text-[#64748B] mt-0.5">High conversion</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT CARD: CREATOR */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl bg-white p-3.5 border-2 border-[#DDF6EC] shadow-md flex flex-col justify-between space-y-3"
          >
            {/* Header */}
            <div className="flex items-center gap-1.5 border-b border-[#E3F8EE] pb-2">
              <div className="w-5 h-5 rounded-lg bg-[#8FE3C0]/25 flex items-center justify-center text-xs">
                ✨
              </div>
              <h3 className="text-xs font-black tracking-wider text-[#0D9488] uppercase">
                CREATOR
              </h3>
            </div>

            {/* Bullet points */}
            <div className="space-y-2 text-left">
              <div className="flex items-start gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#E5F8F0] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                  <DollarSign className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] leading-none">Paid Collabs</p>
                  <p className="text-[9px] text-[#64748B] mt-0.5">Monetize content</p>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#E5F8F0] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] leading-none">Creative Free</p>
                  <p className="text-[9px] text-[#64748B] mt-0.5">Original format</p>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <div className="w-4 h-4 rounded-full bg-[#E5F8F0] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] leading-none">Partnership</p>
                  <p className="text-[9px] text-[#64748B] mt-0.5">Long term growth</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-[#64748B] font-medium"
        >
          <span>Authentic matches create organic virality.</span>
        </motion.div>
      </div>

      {/* Safe zone spacer */}
      <div className="h-10 z-10 w-full" />
    </div>
  );
};

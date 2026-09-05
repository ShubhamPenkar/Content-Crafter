import React from 'react';
import { CarouselSlide, CarouselBrandConfig } from '../types';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import { JodoCoLogo } from '../../components/JodoCoLogo';
import { SlideVisualMedia } from '../SlideVisualMedia';

interface TemplateProps {
  slide: CarouselSlide;
  branding: CarouselBrandConfig;
  totalSlides: number;
}

export function TemplateOutcomeShift({ slide, branding, totalSlides }: TemplateProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-8 sm:p-10 relative overflow-hidden bg-radial from-[#F4FAF8] via-[#FAF7F2] to-[#FAF7F2]">
      {/* Attached Visual Asset Layer */}
      <SlideVisualMedia slide={slide} opacity={0.35} />

      {/* Background Soft Blobs */}
      <div className="absolute top-10 left-10 w-56 h-56 rounded-full bg-[#8FE3C0]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-[#FF8C73]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-white border border-[#EAE6DF] shadow-xs">
            <JodoCoLogo size="sm" variant="mark" />
          </div>
          <span className="text-xs font-bold text-[#1A2B48]/70">
            {branding.handle || '@jodoco.agency'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#D1F2EB] text-[#0D9488] border border-[#B3E5DB]">
            {slide.categoryBadge || 'The Shift'}
          </span>
          <span className="text-xs font-mono font-bold text-[#1A2B48]/50">
            {slide.slideNumber} / {totalSlides}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="my-auto space-y-5 relative z-10">
        {slide.visualHighlight?.badgeText && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#8FE3C0] text-xs font-bold text-[#0D9488] shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slide.visualHighlight.badgeText}</span>
          </div>
        )}

        <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#1A2B48] leading-tight">
          {slide.headline}
        </h2>

        {slide.subHeadline && (
          <p className="text-xs sm:text-sm font-semibold text-[#1A2B48]/70">
            {slide.subHeadline}
          </p>
        )}

        {slide.body && (
          <p className="text-xs sm:text-sm text-[#1A2B48]/85 leading-relaxed bg-white/70 p-3.5 rounded-xl border border-[#EAE6DF]">
            {slide.body}
          </p>
        )}

        {/* Win-Win Split Cards */}
        {slide.supportingBullets && slide.supportingBullets.length > 0 && (
          <div className="space-y-2.5">
            {slide.supportingBullets.map((bullet, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs"
              >
                <div className="p-1 rounded-lg bg-[#D1F2EB] text-[#0D9488] shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#1A2B48] leading-relaxed">
                  {bullet}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Takeaway Card */}
        {slide.takeaway && (
          <div className="p-4 rounded-2xl bg-[#E8F8F5] border border-[#8FE3C0] shadow-xs text-xs sm:text-sm font-bold text-[#0F5132]">
            {slide.takeaway}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[#EAE6DF] flex items-center justify-between relative z-10 text-xs">
        <span className="font-medium text-[#1A2B48]/60">Symmetric Growth</span>
        <div className="flex items-center gap-1 text-[#1A2B48]/70 font-semibold">
          <span>Final Step</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

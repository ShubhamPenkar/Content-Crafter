import React from 'react';
import { CarouselSlide, CarouselBrandConfig } from '../types';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { JodoCoLogo } from '../../components/JodoCoLogo';
import { SlideVisualMedia } from '../SlideVisualMedia';

interface TemplateProps {
  slide: CarouselSlide;
  branding: CarouselBrandConfig;
  totalSlides: number;
}

export function TemplateCTA({ slide, branding, totalSlides }: TemplateProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-8 sm:p-10 relative overflow-hidden bg-radial from-[#FFFDF9] via-[#FAF7F2] to-[#F4EFE6]">
      {/* Attached Visual Asset Layer */}
      <SlideVisualMedia slide={slide} opacity={0.35} />

      {/* Background Soft Ambient Blobs */}
      <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-[#FF8C73]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-[#B8A7EA]/20 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded-lg bg-white border border-[#EAE6DF] shadow-xs">
            <JodoCoLogo size="xs" variant="full" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FF8C73]/20 text-[#1A2B48] border border-[#FF8C73]/40">
            {slide.categoryBadge || 'Next Step'}
          </span>
          <span className="text-xs font-mono font-bold text-[#1A2B48]/50">
            {slide.slideNumber} / {totalSlides}
          </span>
        </div>
      </div>

      {/* Main Content & CTA Lockup */}
      <div className="my-auto space-y-6 text-center relative z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs mx-auto">
          <JodoCoLogo size="md" variant="full" />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#1A2B48] leading-tight">
            {slide.headline}
          </h2>
          {slide.subHeadline && (
            <p className="text-xs sm:text-sm font-semibold text-[#1A2B48]/70 max-w-[85%] mx-auto">
              {slide.subHeadline}
            </p>
          )}
        </div>

        {slide.body && (
          <div className="p-4 rounded-2xl bg-white/80 border border-[#EAE6DF] shadow-xs max-w-[90%] mx-auto text-left">
            <p className="text-xs sm:text-sm text-[#1A2B48]/85 leading-relaxed font-medium">
              {slide.body}
            </p>
          </div>
        )}

        {/* CTA Button Lockup */}
        <div className="pt-2 max-w-[85%] mx-auto space-y-2">
          <div className="w-full py-3.5 px-6 rounded-2xl bg-[#1A2B48] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF8C73]" />
            <span>{slide.ctaText || "Let's Jodo."}</span>
            <ArrowRight className="w-4 h-4 text-[#8FE3C0]" />
          </div>

          <p className="text-xs font-medium text-[#1A2B48]/60">
            {slide.ctaSubtext || 'The Creator Marketing Bridge • jodoco.agency'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[#EAE6DF] flex items-center justify-between relative z-10 text-xs">
        <span className="font-medium text-[#1A2B48]/60">
          {slide.footerNote || 'jodoco.agency • Brands × Creators'}
        </span>
        <div className="flex items-center gap-1 text-[#FF8C73] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Save & Share</span>
        </div>
      </div>
    </div>
  );
}

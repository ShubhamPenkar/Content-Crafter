import React from 'react';
import { CarouselSlide, CarouselBrandConfig } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';
import { JodoCoLogo } from '../../components/JodoCoLogo';
import { SlideVisualMedia } from '../SlideVisualMedia';

interface TemplateProps {
  slide: CarouselSlide;
  branding: CarouselBrandConfig;
  totalSlides: number;
}

export function TemplateHook({ slide, branding, totalSlides }: TemplateProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-8 sm:p-10 relative overflow-hidden bg-radial from-[#FFFDF9] via-[#FAF7F2] to-[#F4EFE6]">
      {/* Attached Visual Asset Layer */}
      <SlideVisualMedia slide={slide} opacity={0.4} />

      {/* Decorative ambient background accent blobs */}
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#FF8C73]/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-[#B8A7EA]/15 blur-2xl pointer-events-none" />

      {/* Slide Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded-lg bg-white border border-[#EAE6DF] shadow-xs">
            <JodoCoLogo size="xs" variant="full" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {slide.categoryBadge && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FF8C73]/15 text-[#1A2B48] border border-[#FF8C73]/30">
              {slide.categoryBadge}
            </span>
          )}
          <span className="text-xs font-mono font-bold text-[#1A2B48]/50">
            {slide.slideNumber} / {totalSlides}
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="my-auto space-y-6 relative z-10">
        {/* Highlight Tag */}
        {slide.visualHighlight?.badgeText && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#EAE6DF] text-xs font-bold text-[#FF8C73] shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{slide.visualHighlight.badgeText}</span>
          </div>
        )}

        {/* Large Hook Headline */}
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#1A2B48] leading-[1.15] tracking-tight">
          {slide.headline}
        </h1>

        {/* Subheadline */}
        {slide.subHeadline && (
          <p className="text-sm sm:text-base font-semibold text-[#1A2B48]/80 leading-relaxed max-w-[90%]">
            {slide.subHeadline}
          </p>
        )}

        {/* Body Paragraph in clean card */}
        {slide.body && (
          <div className="bg-white/85 backdrop-blur-xs border border-[#EAE6DF] rounded-2xl p-5 shadow-xs">
            <p className="text-xs sm:text-sm text-[#1A2B48]/85 leading-relaxed">
              {slide.body}
            </p>
          </div>
        )}
      </div>

      {/* Footer Strip */}
      <div className="pt-4 border-t border-[#EAE6DF]/70 flex items-center justify-between relative z-10 text-xs">
        <span className="font-medium text-[#1A2B48]/60">
          {slide.footerNote || 'Swipe to see the breakdown →'}
        </span>
        <div className="flex items-center gap-1 text-[#FF8C73] font-bold">
          <span>Swipe</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

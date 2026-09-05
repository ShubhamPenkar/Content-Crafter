import React from 'react';
import { CarouselSlide, CarouselBrandConfig } from '../types';
import { Lightbulb, ChevronRight } from 'lucide-react';
import { JodoCoLogo } from '../../components/JodoCoLogo';
import { SlideVisualMedia } from '../SlideVisualMedia';

interface TemplateProps {
  slide: CarouselSlide;
  branding: CarouselBrandConfig;
  totalSlides: number;
}

export function TemplateInsight({ slide, branding, totalSlides }: TemplateProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-8 sm:p-10 relative overflow-hidden bg-radial from-[#F4FAF8] via-[#FAF7F2] to-[#FAF7F2]">
      {/* Attached Visual Asset Layer */}
      <SlideVisualMedia slide={slide} opacity={0.35} />

      {/* Background Soft Blob */}
      <div className="absolute top-1/3 -left-16 w-64 h-64 rounded-full bg-[#8FE3C0]/15 blur-3xl pointer-events-none" />

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
            {slide.categoryBadge || 'Core Insight'}
          </span>
          <span className="text-xs font-mono font-bold text-[#1A2B48]/50">
            {slide.slideNumber} / {totalSlides}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="my-auto space-y-6 relative z-10">
        {/* Metric Callout if available */}
        {slide.visualHighlight?.metricNumber && (
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#8FE3C0] shadow-xs">
            <span className="text-2xl sm:text-3xl font-black font-heading text-[#0D9488]">
              {slide.visualHighlight.metricNumber}
            </span>
            {slide.visualHighlight.metricLabel && (
              <span className="text-xs font-bold text-[#1A2B48]/80 max-w-[220px] leading-tight">
                {slide.visualHighlight.metricLabel}
              </span>
            )}
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
          <div className="p-5 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs">
            <p className="text-xs sm:text-sm text-[#1A2B48]/90 leading-relaxed font-medium">
              {slide.body}
            </p>
          </div>
        )}

        {/* Insight Highlight Card */}
        {slide.takeaway && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#E8F8F5] border border-[#8FE3C0] shadow-xs">
            <Lightbulb className="w-5 h-5 text-[#0D9488] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-bold text-[#0F5132] leading-snug">
              {slide.takeaway}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[#EAE6DF] flex items-center justify-between relative z-10 text-xs">
        <span className="font-medium text-[#1A2B48]/60">The Strategic Shift</span>
        <div className="flex items-center gap-1 text-[#1A2B48]/70 font-semibold">
          <span>Next Slide</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

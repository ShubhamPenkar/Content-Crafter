import React from 'react';
import { CarouselSlide, CarouselBrandConfig } from '../types';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { JodoCoLogo } from '../../components/JodoCoLogo';
import { SlideVisualMedia } from '../SlideVisualMedia';

interface TemplateProps {
  slide: CarouselSlide;
  branding: CarouselBrandConfig;
  totalSlides: number;
}

export function TemplateProblemTension({ slide, branding, totalSlides }: TemplateProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-8 sm:p-10 relative overflow-hidden bg-[#FAF7F2]">
      {/* Attached Visual Asset Layer */}
      <SlideVisualMedia slide={slide} opacity={0.35} />

      {/* Background Soft Blob */}
      <div className="absolute top-1/4 -right-20 w-60 h-60 rounded-full bg-[#FF8C73]/10 blur-3xl pointer-events-none" />

      {/* Slide Header */}
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
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFE8E2] text-[#FF6B4A] border border-[#FFD0BF]">
            {slide.categoryBadge || 'The Tension'}
          </span>
          <span className="text-xs font-mono font-bold text-[#1A2B48]/50">
            {slide.slideNumber} / {totalSlides}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="my-auto space-y-5 relative z-10">
        {/* Metric Callout Card if present */}
        {slide.visualHighlight?.metricNumber && (
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#FFD0BF] shadow-xs">
            <span className="text-2xl sm:text-3xl font-black font-heading text-[#FF8C73]">
              {slide.visualHighlight.metricNumber}
            </span>
            {slide.visualHighlight.metricLabel && (
              <span className="text-xs font-bold text-[#1A2B48]/70 max-w-[200px] leading-tight">
                {slide.visualHighlight.metricLabel}
              </span>
            )}
          </div>
        )}

        <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#1A2B48] leading-snug">
          {slide.headline}
        </h2>

        {slide.subHeadline && (
          <p className="text-xs sm:text-sm font-semibold text-[#1A2B48]/70">
            {slide.subHeadline}
          </p>
        )}

        {slide.body && (
          <p className="text-xs sm:text-sm text-[#1A2B48]/85 leading-relaxed bg-white/60 p-3.5 rounded-xl border border-[#EAE6DF]">
            {slide.body}
          </p>
        )}

        {/* Bullets List */}
        {slide.supportingBullets && slide.supportingBullets.length > 0 && (
          <div className="space-y-2">
            {slide.supportingBullets.map((bullet, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#EAE6DF] shadow-xs"
              >
                <AlertCircle className="w-4 h-4 text-[#FF8C73] shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-[#1A2B48]">{bullet}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tension / Takeaway Banner */}
        {slide.takeaway && (
          <div className="p-3.5 rounded-xl bg-[#FFF3F0] border-l-4 border-[#FF8C73] text-xs font-bold text-[#1A2B48]">
            {slide.takeaway}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[#EAE6DF] flex items-center justify-between relative z-10 text-xs">
        <span className="font-medium text-[#1A2B48]/60">Why this happens</span>
        <div className="flex items-center gap-1 text-[#1A2B48]/70 font-semibold">
          <span>Next Slide</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

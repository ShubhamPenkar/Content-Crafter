import React from 'react';
import { CarouselSlide, CarouselBrandConfig } from '../types';
import { CheckCircle2, TrendingUp, ChevronRight } from 'lucide-react';
import { JodoCoLogo } from '../../components/JodoCoLogo';
import { SlideVisualMedia } from '../SlideVisualMedia';

interface TemplateProps {
  slide: CarouselSlide;
  branding: CarouselBrandConfig;
  totalSlides: number;
}

export function TemplateExampleEvidence({ slide, branding, totalSlides }: TemplateProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-8 sm:p-10 relative overflow-hidden bg-radial from-[#F9F7FD] via-[#FAF7F2] to-[#FAF7F2]">
      {/* Attached Visual Asset Layer */}
      <SlideVisualMedia slide={slide} opacity={0.35} />

      {/* Background Soft Blob */}
      <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-[#B8A7EA]/15 blur-3xl pointer-events-none" />

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
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#EDE8FA] text-[#6B46C1] border border-[#DDD4FC]">
            {slide.categoryBadge || 'Case Evidence'}
          </span>
          <span className="text-xs font-mono font-bold text-[#1A2B48]/50">
            {slide.slideNumber} / {totalSlides}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="my-auto space-y-5 relative z-10">
        {/* Metric Highlight */}
        {slide.visualHighlight?.metricNumber && (
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#DDD4FC] shadow-xs">
            <div className="p-1.5 rounded-xl bg-[#EDE8FA] text-[#6B46C1]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black font-heading text-[#6B46C1] block leading-none">
                {slide.visualHighlight.metricNumber}
              </span>
              {slide.visualHighlight.metricLabel && (
                <span className="text-[11px] font-bold text-[#1A2B48]/70">
                  {slide.visualHighlight.metricLabel}
                </span>
              )}
            </div>
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
          <p className="text-xs sm:text-sm text-[#1A2B48]/85 leading-relaxed bg-white/70 p-3.5 rounded-xl border border-[#EAE6DF]">
            {slide.body}
          </p>
        )}

        {/* Evidence Bullets */}
        {slide.supportingBullets && slide.supportingBullets.length > 0 && (
          <div className="space-y-2">
            {slide.supportingBullets.map((bullet, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#EAE6DF] shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-[#6B46C1] shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-[#1A2B48]">{bullet}</span>
              </div>
            ))}
          </div>
        )}

        {/* Takeaway */}
        {slide.takeaway && (
          <div className="p-3.5 rounded-xl bg-[#F4F0FD] border-l-4 border-[#B8A7EA] text-xs font-bold text-[#1A2B48]">
            {slide.takeaway}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[#EAE6DF] flex items-center justify-between relative z-10 text-xs">
        <span className="font-medium text-[#1A2B48]/60">Proven Results</span>
        <div className="flex items-center gap-1 text-[#1A2B48]/70 font-semibold">
          <span>Next Slide</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

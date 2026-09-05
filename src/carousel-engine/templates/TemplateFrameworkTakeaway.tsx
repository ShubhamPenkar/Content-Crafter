import React from 'react';
import { CarouselSlide, CarouselBrandConfig } from '../types';
import { Layers, ChevronRight } from 'lucide-react';
import { JodoCoLogo } from '../../components/JodoCoLogo';
import { SlideVisualMedia } from '../SlideVisualMedia';

interface TemplateProps {
  slide: CarouselSlide;
  branding: CarouselBrandConfig;
  totalSlides: number;
}

export function TemplateFrameworkTakeaway({ slide, branding, totalSlides }: TemplateProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between p-8 sm:p-10 relative overflow-hidden bg-[#FAF7F2]">
      {/* Attached Visual Asset Layer */}
      <SlideVisualMedia slide={slide} opacity={0.35} />

      {/* Background Soft Blobs */}
      <div className="absolute top-10 right-10 w-48 h-48 rounded-full bg-[#B8A7EA]/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[#8FE3C0]/10 blur-2xl pointer-events-none" />

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
            {slide.categoryBadge || 'The Framework'}
          </span>
          <span className="text-xs font-mono font-bold text-[#1A2B48]/50">
            {slide.slideNumber} / {totalSlides}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="my-auto space-y-5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#1A2B48] text-[#8FE3C0]">
            <Layers className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1A2B48]/70">
            Operational Blueprint
          </span>
        </div>

        <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#1A2B48] leading-tight">
          {slide.headline}
        </h2>

        {slide.subHeadline && (
          <p className="text-xs sm:text-sm font-semibold text-[#1A2B48]/70">
            {slide.subHeadline}
          </p>
        )}

        {/* Step Cards Grid */}
        {slide.supportingBullets && slide.supportingBullets.length > 0 ? (
          <div className="space-y-2.5">
            {slide.supportingBullets.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs"
              >
                <span className="w-6 h-6 rounded-lg bg-[#FF8C73]/15 text-[#FF8C73] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#1A2B48] leading-relaxed">
                  {step}
                </span>
              </div>
            ))}
          </div>
        ) : (
          slide.body && (
            <div className="p-5 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs">
              <p className="text-xs sm:text-sm text-[#1A2B48]/85 leading-relaxed font-medium">
                {slide.body}
              </p>
            </div>
          )
        )}

        {/* Takeaway */}
        {slide.takeaway && (
          <div className="p-3.5 rounded-xl bg-white border border-[#EAE6DF] text-xs font-bold text-[#1A2B48] flex items-center gap-2">
            <span className="text-[#FF8C73]">★</span>
            <span>{slide.takeaway}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[#EAE6DF] flex items-center justify-between relative z-10 text-xs">
        <span className="font-medium text-[#1A2B48]/60">Step-by-Step Blueprint</span>
        <div className="flex items-center gap-1 text-[#1A2B48]/70 font-semibold">
          <span>Next Slide</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

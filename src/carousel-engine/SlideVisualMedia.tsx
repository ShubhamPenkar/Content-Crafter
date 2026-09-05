import React from 'react';
import { CarouselSlide } from './types';

interface SlideVisualMediaProps {
  slide: CarouselSlide;
  className?: string;
  opacity?: number;
}

/**
 * Renders the attached 4:5 visual asset (image or video) with appropriate readability scrim
 * so typography and badges maintain WCAG AA contrast.
 */
export function SlideVisualMedia({
  slide,
  className = '',
  opacity = 0.45,
}: SlideVisualMediaProps) {
  if (!slide.visualUrl) return null;

  const isVideo = slide.visualAssetType === 'video' || slide.visualUrl.endsWith('.mp4');

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
      {isVideo ? (
        <video
          src={slide.visualUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ opacity }}
        />
      ) : (
        <img
          src={slide.visualUrl}
          alt={slide.headline}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          style={{ opacity }}
        />
      )}

      {/* Editorial Gradient Scrim for WCAG AA readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/80 to-[#FAF7F2]/40" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#FAF7F2]/40 to-[#FAF7F2]/90" />
    </div>
  );
}

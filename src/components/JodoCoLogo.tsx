import React from 'react';
import { JODOCO_LOGO, JODOCO_CANONICAL_BRAND } from '../brand/assets';

interface JodoCoLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'mark' | 'badge';
  className?: string;
  theme?: 'dark' | 'light' | 'cream';
  animated?: boolean;
  showSlogan?: boolean;
  useImageTag?: boolean;
}

export const JodoCoLogo: React.FC<JodoCoLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  animated = false,
}) => {
  // Sizing preserving the 920:435 aspect ratio (~2.11:1) of the canonical official logo
  const sizeClasses = {
    xs: 'h-6 w-auto max-w-[85px]',
    sm: 'h-8 sm:h-9 w-auto max-w-[125px]',
    md: 'h-10 sm:h-11 w-auto max-w-[170px]',
    lg: 'h-13 sm:h-14 w-auto max-w-[230px]',
    xl: 'h-16 sm:h-18 w-auto max-w-[300px]',
    hero: 'h-24 sm:h-28 w-auto max-w-[420px]',
  };

  const animClass = animated ? 'animate-pulse hover:scale-105 transition-transform duration-300' : '';

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#EAE6DF] shadow-xs select-none ${className}`}
      >
        <img
          src={JODOCO_LOGO}
          alt="JodoCo • CONNECT · CREATE · GROW"
          className={`${sizeClasses[size]} object-contain`}
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  // Canonical Official Logo scaled appropriately for all contexts
  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src={JODOCO_LOGO}
        alt="JodoCo • CONNECT · CREATE · GROW"
        className={`${sizeClasses[size]} object-contain ${animClass}`}
        loading="eager"
        decoding="async"
      />
    </div>
  );
};


import React, { useState } from 'react';
import { JodoCoLogo } from './JodoCoLogo';
import { JODOCO_CANONICAL_BRAND } from '../brand/brandAssets';
import { Sparkles, Check, Copy, Heart, Layers, Download, ShieldCheck } from 'lucide-react';

export const BrandGuideView: React.FC = () => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const colors = [
    { name: 'Warm Cream (Canvas)', hex: JODOCO_CANONICAL_BRAND.palette.creamBase, text: 'text-[#1A2B48]' },
    { name: 'Peach Coral (Segment J & Antennae)', hex: JODOCO_CANONICAL_BRAND.palette.segmentJ, text: 'text-[#1A2B48]' },
    { name: 'Soft Apricot (Segment O)', hex: JODOCO_CANONICAL_BRAND.palette.segmentO1, text: 'text-[#1A2B48]' },
    { name: 'Pastel Lavender (Segment D)', hex: JODOCO_CANONICAL_BRAND.palette.segmentD, text: 'text-[#1A2B48]' },
    { name: 'Pastel Lilac (Segment O)', hex: JODOCO_CANONICAL_BRAND.palette.segmentO2, text: 'text-[#1A2B48]' },
    { name: 'Aqua Mint (Segment C)', hex: JODOCO_CANONICAL_BRAND.palette.segmentC, text: 'text-[#1A2B48]' },
    { name: 'Pale Mint (Segment O)', hex: JODOCO_CANONICAL_BRAND.palette.segmentO3, text: 'text-[#1A2B48]' },
    { name: 'Deep Navy (Primary Text)', hex: JODOCO_CANONICAL_BRAND.palette.primaryNavy, text: 'text-white' },
    { name: 'Coral Accent (Highlighter)', hex: JODOCO_CANONICAL_BRAND.palette.coralAccent, text: 'text-[#1A2B48]' },
  ];

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="w-full space-y-6 text-[#1A2B48]">
      {/* Brand Identity Hero Header */}
      <div className="bg-white border border-[#EAE6DF] p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFB3A7]/30 text-[#1A2B48] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8C73]" />
            Brand Identity Specification
          </div>
          <h2 className="text-2xl font-black text-[#1A2B48] font-heading">
            JodoCo — Modern Creator Marketing
          </h2>
          <p className="text-sm text-[#1A2B48]/80 max-w-xl leading-relaxed">
            The name comes from the Hindi word <strong className="text-[#FF8C73]">"Jodo" (जोड़ो)</strong>, meaning <strong className="text-[#1A2B48]">"to connect"</strong>. JodoCo serves as the trusted bridge connecting ambitious brands with authentic creators.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE6DF] shadow-sm shrink-0 flex flex-col items-center gap-3">
          <JodoCoLogo size="lg" variant="full" />
          <div className="flex items-center gap-2 pt-1 border-t border-[#EAE6DF] w-full justify-center text-xs">
            <a
              href={JODOCO_CANONICAL_BRAND.assets.logoPng}
              download="jodoco_logo_canonical.png"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#EAE6DF] text-[#1A2B48] font-bold hover:bg-[#F4EFE6] transition-colors"
            >
              <Download className="w-3 h-3 text-[#FF8C73]" /> PNG
            </a>
            <a
              href={JODOCO_CANONICAL_BRAND.assets.logoSvg}
              download="jodoco_logo_canonical.svg"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#EAE6DF] text-[#1A2B48] font-bold hover:bg-[#F4EFE6] transition-colors"
            >
              <Download className="w-3 h-3 text-[#B8A7EA]" /> SVG
            </a>
          </div>
        </div>
      </div>

      {/* Brand Personality & Design Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brand Persona */}
        <div className="bg-white border border-[#EAE6DF] p-5 rounded-2xl space-y-3 shadow-sm">
          <h3 className="text-base font-bold text-[#1A2B48] flex items-center gap-2 font-heading">
            <Heart className="w-4 h-4 text-[#FF8C73]" /> Brand Personality
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {['Young & Energetic', 'Smart & Strategic', 'Friendly & Approachable', 'Creative & Modern', 'Subtly Playful', 'Professional Craft'].map((trait, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8FE3C0]" />
                <span className="font-semibold text-[#1A2B48]">{trait}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Language Principles */}
        <div className="bg-white border border-[#EAE6DF] p-5 rounded-2xl space-y-3 shadow-sm">
          <h3 className="text-base font-bold text-[#1A2B48] flex items-center gap-2 font-heading">
            <Layers className="w-4 h-4 text-[#B8A7EA]" /> Visual Rules & Aesthetics
          </h3>
          <ul className="text-xs text-[#1A2B48]/80 space-y-2">
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-[#1A2B48] shrink-0 mt-0.5" />
              <span><strong>Warm Pastel Canvas:</strong> Off-white cream background with soft organic blobs.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-[#1A2B48] shrink-0 mt-0.5" />
              <span><strong>Connector Lines:</strong> Signature dotted lines symbolizing seamless brand-creator bridges.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-[#1A2B48] shrink-0 mt-0.5" />
              <span><strong>Anti-Corporate Motion:</strong> Clean animated illustrations, generous whitespace, avoiding stock video clichés.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Color Palette Swatches */}
      <div className="bg-white border border-[#EAE6DF] p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1A2B48] font-heading">
            Official Pastel Color Palette
          </h3>
          <span className="text-xs text-[#1A2B48]/60">Click any swatch to copy Hex code</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => handleCopy(c.hex)}
              className="p-3 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] hover:bg-[#F4EFE6] transition-all text-left group cursor-pointer shadow-2xs"
            >
              <div
                className="w-full h-14 rounded-xl shadow-xs mb-2.5 flex items-center justify-center font-bold text-xs border border-black/5"
                style={{ backgroundColor: c.hex }}
              >
                <span className={c.text}>{c.hex}</span>
              </div>
              <p className="text-xs font-bold text-[#1A2B48] truncate">{c.name}</p>
              <div className="flex items-center justify-between mt-1 text-[11px] text-[#1A2B48]/60">
                <span className="font-mono">{c.hex}</span>
                {copiedHex === c.hex ? (
                  <span className="text-[#1A2B48] font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3 text-[#FF8C73]" /> Copied
                  </span>
                ) : (
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#1A2B48]" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

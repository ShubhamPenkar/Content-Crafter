import React, { useState } from 'react';
import {
  CarouselProject,
  CarouselSlide,
  CarouselSlideTemplate,
  CarouselVisualDecision,
  CarouselVisualPriority,
} from '../carousel-engine/types';
import {
  Type,
  List,
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { JodoCoAsset } from '../project-engine/types';

interface SlideInspectorProps {
  slide: CarouselSlide;
  totalSlides: number;
  onUpdateSlide: (updatedSlide: CarouselSlide) => void;
  onOpenVisualModal?: (slide: CarouselSlide) => void;
  projectAssets?: JodoCoAsset[];
  topic?: string;
  onDetachVisual?: (slideId: string) => void;
}

const TEMPLATE_OPTIONS: Array<{
  value: CarouselSlideTemplate;
  label: string;
  desc: string;
}> = [
  { value: 'hook', label: '1. Hook', desc: 'Attention-grabbing title & payoff' },
  { value: 'problem_tension', label: '2. Problem / Tension', desc: 'Ad fatigue & high CPM costs' },
  { value: 'insight', label: '3. Insight', desc: 'Why creator trust wins' },
  { value: 'example_evidence', label: '4. Evidence / Case', desc: 'Data metrics & case studies' },
  { value: 'framework_takeaway', label: '5. Framework / Steps', desc: '3-step flywheel or process' },
  { value: 'outcome_shift', label: '6. Outcome / Shift', desc: 'Both sides win symmetric shift' },
  { value: 'cta', label: '7. CTA & Bridge', desc: 'Action lockup & next steps' },
];

const VISUAL_DECISION_OPTIONS: Array<{
  value: CarouselVisualDecision;
  label: string;
  desc: string;
}> = [
  { value: 'ai_image', label: 'AI Image (4:5)', desc: 'High-emotion editorial creator portrait or relatable situation' },
  { value: 'diagram', label: 'Diagram / Chart', desc: 'Structured tactical graphic with bullets/arrows' },
  { value: 'static_graphic', label: 'Static Graphic', desc: 'Balanced card layout or abstract branding' },
  { value: 'ui_mockup', label: 'UI Mockup', desc: 'Creator workflow or platform screen element' },
  { value: 'text_only', label: 'Text-First Only', desc: 'Clean typography without decorative background imagery' },
  { value: 'none', label: 'None', desc: 'Default minimalist brand color canvas' },
];

const VISUAL_PRIORITY_OPTIONS: Array<{
  value: CarouselVisualPriority;
  label: string;
}> = [
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low / Optional' },
];

export function SlideInspector({
  slide,
  totalSlides,
  onUpdateSlide,
  onOpenVisualModal,
  projectAssets = [],
  topic,
  onDetachVisual,
}: SlideInspectorProps) {
  const [newBulletText, setNewBulletText] = useState('');

  // Attached Asset details if available
  const attachedAsset = projectAssets.find((a) => a.id === slide.visualAssetId);

  const handleTemplateChange = (template: CarouselSlideTemplate) => {
    onUpdateSlide({
      ...slide,
      template,
    });
  };

  const handleHeadlineChange = (val: string) => {
    onUpdateSlide({ ...slide, headline: val });
  };

  const handleSubHeadlineChange = (val: string) => {
    onUpdateSlide({ ...slide, subHeadline: val });
  };

  const handleCategoryBadgeChange = (val: string) => {
    onUpdateSlide({ ...slide, categoryBadge: val });
  };

  const handleBodyChange = (val: string) => {
    onUpdateSlide({ ...slide, body: val });
  };

  const handleTakeawayChange = (val: string) => {
    onUpdateSlide({ ...slide, takeaway: val });
  };

  const handleCtaTextChange = (val: string) => {
    onUpdateSlide({ ...slide, ctaText: val });
  };

  const handleCtaSubtextChange = (val: string) => {
    onUpdateSlide({ ...slide, ctaSubtext: val });
  };

  const handleMetricNumberChange = (val: string) => {
    onUpdateSlide({
      ...slide,
      visualHighlight: {
        ...slide.visualHighlight,
        metricNumber: val,
      },
    });
  };

  const handleMetricLabelChange = (val: string) => {
    onUpdateSlide({
      ...slide,
      visualHighlight: {
        ...slide.visualHighlight,
        metricLabel: val,
      },
    });
  };

  const handleBadgeTextChange = (val: string) => {
    onUpdateSlide({
      ...slide,
      visualHighlight: {
        ...slide.visualHighlight,
        badgeText: val,
      },
    });
  };

  const handleBulletChange = (idx: number, text: string) => {
    const bullets = [...(slide.supportingBullets || [])];
    bullets[idx] = text;
    onUpdateSlide({ ...slide, supportingBullets: bullets });
  };

  const handleDeleteBullet = (idx: number) => {
    const bullets = (slide.supportingBullets || []).filter((_, i) => i !== idx);
    onUpdateSlide({ ...slide, supportingBullets: bullets });
  };

  const handleAddBullet = () => {
    if (!newBulletText.trim()) return;
    const bullets = [...(slide.supportingBullets || []), newBulletText.trim()];
    onUpdateSlide({ ...slide, supportingBullets: bullets });
    setNewBulletText('');
  };

  const handleVisualDecisionChange = (val: CarouselVisualDecision) => {
    onUpdateSlide({ ...slide, visualDecision: val });
  };

  const handleVisualPriorityChange = (val: CarouselVisualPriority) => {
    onUpdateSlide({ ...slide, visualPriority: val });
  };

  const handleVisualReasonChange = (val: string) => {
    onUpdateSlide({ ...slide, visualReason: val });
  };

  const handleVisualPromptChange = (val: string) => {
    onUpdateSlide({ ...slide, visualPrompt: val });
  };

  const handleVisualContinuityChange = (val: string) => {
    onUpdateSlide({ ...slide, visualContinuity: val });
  };

  return (
    <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-[#1A2B48] text-white text-xs font-bold flex items-center justify-center">
            {slide.slideNumber}
          </span>
          <h3 className="font-heading font-black text-sm text-[#1A2B48]">
            Slide Inspector (Slide {slide.slideNumber} of {totalSlides})
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#1A2B48]/60">
          Template: {slide.template}
        </span>
      </div>

      {/* SECTION: AI Carousel Visual Intelligence & Studio */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#FAF8F5] to-[#FFFDF9] border border-[#FF8C73]/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FF8C73] text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-[#1A2B48]">
              Carousel Visual Intelligence (4:5)
            </span>
          </div>

          {onOpenVisualModal && (
            <button
              onClick={() => onOpenVisualModal(slide)}
              className="px-3 py-1.5 bg-[#FF8C73] hover:bg-[#FF7A5C] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{slide.visualUrl ? 'Edit / Regenerate Visual' : '⚡ Generate 4:5 Visual'}</span>
            </button>
          )}
        </div>

        {/* Visual Decision & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1A2B48]/70 block">
              Editorial Visual Decision
            </label>
            <select
              value={slide.visualDecision || 'ai_image'}
              onChange={(e) => handleVisualDecisionChange(e.target.value as CarouselVisualDecision)}
              className="w-full text-xs bg-white border border-[#EAE6DF] rounded-xl px-3 py-2 text-[#1A2B48] focus:outline-hidden focus:border-[#FF8C73] font-bold"
            >
              {VISUAL_DECISION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1A2B48]/70 block">
              Visual Priority
            </label>
            <div className="flex gap-1.5">
              {VISUAL_PRIORITY_OPTIONS.map((opt) => {
                const isSelected = (slide.visualPriority || 'medium') === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleVisualPriorityChange(opt.value)}
                    className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A2B48] text-white border-[#1A2B48]'
                        : 'bg-white text-[#1A2B48]/70 border-[#EAE6DF] hover:border-[#1A2B48]/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Editorial Reason */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#1A2B48]/70 flex items-center justify-between">
            <span>Editorial Justification / Purpose</span>
            <span className="text-[10px] text-[#1A2B48]/50">Why this visual elevates story</span>
          </label>
          <textarea
            rows={2}
            value={slide.visualReason || ''}
            onChange={(e) => handleVisualReasonChange(e.target.value)}
            placeholder="Why this slide needs an image vs clean typography card..."
            className="w-full text-xs bg-white border border-[#EAE6DF] rounded-xl p-2.5 text-[#1A2B48] focus:outline-hidden focus:border-[#FF8C73]"
          />
        </div>

        {/* 4:5 Visual Prompt */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#1A2B48]/70 flex items-center justify-between">
            <span>4:5 Production Prompt (1080×1350)</span>
            <span className="text-[10px] font-mono text-[#1A2B48]/50">Strictly no baked text</span>
          </label>
          <textarea
            rows={3}
            value={slide.visualPrompt || ''}
            onChange={(e) => handleVisualPromptChange(e.target.value)}
            placeholder="Vertical 4:5 photographic editorial still..."
            className="w-full text-xs font-mono bg-white border border-[#EAE6DF] rounded-xl p-2.5 text-[#1A2B48] focus:outline-hidden focus:border-[#FF8C73] leading-relaxed"
          />
        </div>

        {/* Continuity Guidelines */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#1A2B48]/70 block">
            Aesthetic Continuity Notes
          </label>
          <input
            type="text"
            value={slide.visualContinuity || ''}
            onChange={(e) => handleVisualContinuityChange(e.target.value)}
            placeholder="e.g. Warm peach accents, soft natural studio light..."
            className="w-full text-xs bg-white border border-[#EAE6DF] rounded-xl px-3 py-2 text-[#1A2B48] focus:outline-hidden focus:border-[#FF8C73]"
          />
        </div>

        {/* Attached Visual Status Card */}
        {slide.visualUrl ? (
          <div className="p-3 rounded-xl bg-white border border-[#8FE3C0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={slide.visualUrl}
                alt="Slide Visual"
                referrerPolicy="no-referrer"
                className="w-12 h-15 rounded-lg object-cover bg-black/5 border border-[#EAE6DF]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-[#1A2B48]">
                    Visual Asset Attached (v{slide.visualVersion || 1})
                  </span>
                </div>
                {attachedAsset && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        attachedAsset.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : attachedAsset.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Status: {attachedAsset.status}
                    </span>
                    <span className="text-[10px] text-[#1A2B48]/60 truncate max-w-[140px]">
                      {attachedAsset.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {onOpenVisualModal && (
                <button
                  type="button"
                  onClick={() => onOpenVisualModal(slide)}
                  className="px-2.5 py-1 text-xs font-bold text-[#1A2B48] bg-[#FAF8F5] hover:bg-[#EAE6DF] rounded-lg border border-[#EAE6DF] cursor-pointer"
                >
                  Manage
                </button>
              )}
              {onDetachVisual && (
                <button
                  type="button"
                  onClick={() => onDetachVisual(slide.id)}
                  className="p-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                  title="Detach visual from slide"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-white border border-[#EAE6DF] flex items-center justify-between text-xs">
            <span className="text-[#1A2B48]/70">No visual attached to this slide yet.</span>
            {onOpenVisualModal && (
              <button
                type="button"
                onClick={() => onOpenVisualModal(slide)}
                className="text-xs font-bold text-[#FF8C73] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                Generate Visual
              </button>
            )}
          </div>
        )}
      </div>

      {/* Template Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#1A2B48] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#FF8C73]" />
          <span>Slide Layout Template</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {TEMPLATE_OPTIONS.map((opt) => {
            const isSelected = slide.template === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleTemplateChange(opt.value)}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FF8C73]/10 border-[#FF8C73] text-[#1A2B48] shadow-2xs'
                    : 'bg-[#FAF8F5] border-[#EAE6DF] text-[#1A2B48]/70 hover:border-[#1A2B48]/30'
                }`}
              >
                <div className="text-xs font-bold">{opt.label}</div>
                <div className="text-[10px] text-[#1A2B48]/60 truncate">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Badge & Tag */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#1A2B48]/70 block">
            Top Category Badge
          </label>
          <input
            type="text"
            value={slide.categoryBadge || ''}
            onChange={(e) => handleCategoryBadgeChange(e.target.value)}
            placeholder="e.g. JodoCo Strategy"
            className="w-full text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl px-3 py-2 text-[#1A2B48] focus:outline-hidden focus:border-[#FF8C73]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#1A2B48]/70 block">
            Badge Tag / Highlight
          </label>
          <input
            type="text"
            value={slide.visualHighlight?.badgeText || ''}
            onChange={(e) => handleBadgeTextChange(e.target.value)}
            placeholder="e.g. 4x Organic Reach"
            className="w-full text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl px-3 py-2 text-[#1A2B48] focus:outline-hidden focus:border-[#FF8C73]"
          />
        </div>
      </div>

      {/* Headline & Subheadline */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#1A2B48] flex items-center justify-between">
            <span>Primary Headline *</span>
            <span className="text-[10px] font-normal text-[#1A2B48]/50">High Visual Impact</span>
          </label>
          <input
            type="text"
            value={slide.headline}
            onChange={(e) => handleHeadlineChange(e.target.value)}
            className="w-full text-xs font-bold bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl px-3 py-2 text-[#1A2B48] focus:outline-hidden focus:border-[#FF8C73]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#1A2B48]/70 block">
            Subheadline / Supporting Context
          </label>
          <input
            type="text"
            value={slide.subHeadline || ''}
            onChange={(e) => handleSubHeadlineChange(e.target.value)}
            placeholder="e.g. Why modern brands are shifting budgets..."
            className="w-full text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl px-3 py-2 text-[#1A2B48] focus:outline-hidden focus:border-[#FF8C73]"
          />
        </div>
      </div>

      {/* Body Copy */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-[#1A2B48] flex items-center justify-between">
          <span>Body Copy / Narrative</span>
          <span className="text-[10px] font-normal text-[#1A2B48]/50">Editorial Paragraph</span>
        </label>
        <textarea
          rows={3}
          value={slide.body || ''}
          onChange={(e) => handleBodyChange(e.target.value)}
          placeholder="Detailed narrative or explanation..."
          className="w-full text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl p-3 text-[#1A2B48] focus:outline-hidden focus:border-[#FF8C73]"
        />
      </div>

      {/* Metric Highlight (for Evidence / Insight templates) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#1A2B48]/70 block">
            Metric Number (Optional)
          </label>
          <input
            type="text"
            value={slide.visualHighlight?.metricNumber || ''}
            onChange={(e) => handleMetricNumberChange(e.target.value)}
            placeholder="e.g. 3.8x or 84%"
            className="w-full text-xs font-bold bg-white border border-[#EAE6DF] rounded-lg px-2.5 py-1.5 text-[#1A2B48]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#1A2B48]/70 block">
            Metric Label
          </label>
          <input
            type="text"
            value={slide.visualHighlight?.metricLabel || ''}
            onChange={(e) => handleMetricLabelChange(e.target.value)}
            placeholder="e.g. ROAS over cold PPC"
            className="w-full text-xs bg-white border border-[#EAE6DF] rounded-lg px-2.5 py-1.5 text-[#1A2B48]"
          />
        </div>
      </div>

      {/* Supporting Bullets */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#1A2B48] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <List className="w-3.5 h-3.5 text-[#8FE3C0]" />
            Supporting Bullets / Steps
          </span>
          <span className="text-[10px] font-normal text-[#1A2B48]/50">
            {slide.supportingBullets?.length || 0} items
          </span>
        </label>

        {slide.supportingBullets && slide.supportingBullets.length > 0 && (
          <div className="space-y-1.5">
            {slide.supportingBullets.map((bullet, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#1A2B48]/50 w-4">{idx + 1}.</span>
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => handleBulletChange(idx, e.target.value)}
                  className="flex-1 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg px-2.5 py-1.5 text-[#1A2B48] focus:outline-hidden focus:border-[#FF8C73]"
                />
                <button
                  onClick={() => handleDeleteBullet(idx)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove bullet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add bullet input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newBulletText}
            onChange={(e) => setNewBulletText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddBullet();
              }
            }}
            placeholder="Add new bullet or step..."
            className="flex-1 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg px-2.5 py-1.5 text-[#1A2B48] focus:outline-hidden focus:border-[#FF8C73]"
          />
          <button
            onClick={handleAddBullet}
            className="px-2.5 py-1.5 bg-[#1A2B48] text-white rounded-lg text-xs font-bold hover:bg-[#253A5C] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Takeaway / Tension Banner */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-[#1A2B48] flex items-center justify-between">
          <span>Key Takeaway / Bottom Line</span>
          <span className="text-[10px] font-normal text-[#1A2B48]/50">Summary Banner</span>
        </label>
        <input
          type="text"
          value={slide.takeaway || ''}
          onChange={(e) => handleTakeawayChange(e.target.value)}
          placeholder="e.g. Outcome: When incentives align, compounding growth follows."
          className="w-full text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl px-3 py-2 text-[#1A2B48] focus:outline-hidden focus:border-[#FF8C73]"
        />
      </div>

      {/* CTA Controls (if CTA template) */}
      {slide.template === 'cta' && (
        <div className="space-y-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#FF8C73]/30">
          <span className="text-xs font-bold text-[#1A2B48] block">CTA Callout Customization</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-[#1A2B48]/70 block mb-0.5">
                Button Text
              </label>
              <input
                type="text"
                value={slide.ctaText || "Let's Jodo."}
                onChange={(e) => handleCtaTextChange(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-[#EAE6DF] rounded-lg px-2.5 py-1.5 text-[#1A2B48]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#1A2B48]/70 block mb-0.5">
                Subtext / Website
              </label>
              <input
                type="text"
                value={slide.ctaSubtext || 'Visit jodoco.agency'}
                onChange={(e) => handleCtaSubtextChange(e.target.value)}
                className="w-full text-xs bg-white border border-[#EAE6DF] rounded-lg px-2.5 py-1.5 text-[#1A2B48]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

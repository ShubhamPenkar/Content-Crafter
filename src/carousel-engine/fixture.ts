import { CarouselProject } from './types';
import { CAROUSEL_SPEC } from './spec';

/**
 * Deterministic 7-Slide JodoCo Carousel Fixture covering all 7 templates:
 * 1. Hook
 * 2. Problem / Tension
 * 3. Insight
 * 4. Example / Evidence
 * 5. Framework / Takeaway
 * 6. Outcome / Shift
 * 7. CTA
 */
export const KNOWN_CAROUSEL_FIXTURE: CarouselProject = {
  id: 'fixture-carousel-1',
  title: 'Why Creator Marketing Beats Cold Ads in 2026',
  topic: 'Why Creator Marketing Beats Cold Ads',
  hookAngle: 'Direct contrast between ad fatigue and organic creator trust',
  dimensions: CAROUSEL_SPEC.dimensions,
  branding: CAROUSEL_SPEC.branding,
  version: 1,
  createdAt: '2026-08-28T08:00:00.000Z',
  updatedAt: '2026-08-28T08:00:00.000Z',
  slides: [
    {
      id: 'slide-1',
      slideNumber: 1,
      template: 'hook',
      categoryBadge: 'JodoCo Strategy',
      headline: 'Cold Ads are Dying. Here is What Works in 2026.',
      subHeadline: 'Why the fastest-growing brands have shifted ad spend to authentic creators.',
      body: 'Audiences skip interrupted ads in 0.4 seconds. But when a creator they trust shares a product organically, engagement jumps 4x.',
      takeaway: 'Swipe to see the 3-step creator partnership flywheel →',
      visualHighlight: {
        badgeText: '4x Organic ROI',
        accentColor: '#FF8C73',
      },
      footerNote: 'Swipe to explore',
    },
    {
      id: 'slide-2',
      slideNumber: 2,
      template: 'problem_tension',
      categoryBadge: 'The Problem',
      headline: 'The Hidden Cost of Cold Banner Ads',
      subHeadline: 'CPMs keep climbing while consumer trust hits all-time lows.',
      body: 'Traditional digital ads suffer from banner blindness. Users scroll directly past generic commercial interruptions.',
      supportingBullets: [
        'Rising customer acquisition costs (CAC) with diminishing retention',
        'Zero organic goodwill or long-term community affinity',
        'Zero creative rapport between brand narrative and real customer lives',
      ],
      takeaway: 'Tension: Brands need reach, but interruptive ads repel modern audiences.',
      visualHighlight: {
        metricNumber: '84%',
        metricLabel: 'of consumers skip cold digital display ads',
        accentColor: '#FF8C73',
      },
    },
    {
      id: 'slide-3',
      slideNumber: 3,
      template: 'insight',
      categoryBadge: 'Core Insight',
      headline: 'Enter: The High-Trust Creator',
      subHeadline: 'People do not buy from logos. People buy from people they trust.',
      body: 'A creator has spent years cultivating an authentic relationship with their community. An endorsement is not an ad—it is a trusted recommendation.',
      takeaway: 'Trust cannot be bought with ad budget. It must be partnered with.',
      visualHighlight: {
        metricNumber: '9.2%',
        metricLabel: 'Average engagement on authentic niche creator partnerships',
        accentColor: '#8FE3C0',
      },
    },
    {
      id: 'slide-4',
      slideNumber: 4,
      template: 'example_evidence',
      categoryBadge: 'Case Study & Evidence',
      headline: 'Lumina Skin: A Real Growth Case Study',
      subHeadline: 'How a modern D2C brand replaced cold display ads with creator fleet storytelling.',
      body: 'Instead of running $50K into cold PPC banners, Lumina partnered with 8 niche skincare creators for authentic product routines.',
      supportingBullets: [
        '3.8x Return on Ad Spend (ROAS) compared to baseline cold campaigns',
        '185K highly targeted video impressions across engaged demographics',
        '64% of first-time purchasers cited creator video as primary discovery source',
      ],
      takeaway: 'Evidence: Authentic storytelling outperforms corporate ad copy on every conversion metric.',
      visualHighlight: {
        metricNumber: '3.8x',
        metricLabel: 'ROAS over traditional display ads',
        accentColor: '#B8A7EA',
      },
    },
    {
      id: 'slide-5',
      slideNumber: 5,
      template: 'framework_takeaway',
      categoryBadge: 'The 3-Step Engine',
      headline: 'The Creator Marketing Flywheel',
      subHeadline: 'How sustainable creator partnerships build compounding value.',
      body: 'High-performing creator marketing is an operational system, not a one-off lottery ticket.',
      supportingBullets: [
        'Step 1: Strategic Matchmaking — Align brand values with niche creator affinity',
        'Step 2: Creative Autonomy — Empower creators with briefs, not rigid scripts',
        'Step 3: Trackable Distribution — Measure engagement, track conversion, and scale',
      ],
      takeaway: 'Framework: Align incentives, respect creative freedom, measure real conversion.',
      visualHighlight: {
        badgeText: 'Flywheel Engine',
        accentColor: '#B8A7EA',
      },
    },
    {
      id: 'slide-6',
      slideNumber: 6,
      template: 'outcome_shift',
      categoryBadge: 'Symmetric Win',
      headline: 'The Paradigm Shift: Both Sides Win',
      subHeadline: 'From extractive sponsorship to collaborative ecosystem.',
      body: 'Traditional ads extract money from brands and attention from audiences. Strategic creator partnerships build mutual prosperity.',
      supportingBullets: [
        'Brand Wins: Authentic market penetration, verifiable customer trust, lower acquisition cost',
        'Creator Wins: Fair sponsorship compensation, creative respect, long-term brand relationship',
      ],
      takeaway: 'Outcome: When creator incentives and brand goals align, compounding growth follows.',
      visualHighlight: {
        badgeText: 'Win-Win Ecosystem',
        accentColor: '#8FE3C0',
      },
    },
    {
      id: 'slide-7',
      slideNumber: 7,
      template: 'cta',
      categoryBadge: 'The Matchmaking Bridge',
      headline: "Ready to Bridge the Gap? Let's Jodo.",
      subHeadline: 'Strategic Creator Partnerships for High-Growth Brands.',
      body: 'JodoCo connects top-tier verified creators with ambitious brands to build campaigns that audiences actually watch and trust.',
      ctaText: "Let's Jodo.",
      ctaSubtext: 'Visit jodoco.agency',
      ctaUrl: 'https://jodoco.agency',
      takeaway: 'Scale your creator partnerships today.',
      visualHighlight: {
        badgeText: 'Official Agency Partner',
        accentColor: '#FF8C73',
      },
      footerNote: 'jodoco.agency • Brands × Creators',
    },
  ],
};

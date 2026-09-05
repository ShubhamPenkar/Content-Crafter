import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Sliders,
  Layers,
  Film,
  FolderKanban,
  Download,
  ChevronDown,
  ChevronUp,
  Wand2,
  HelpCircle,
  ArrowRight,
  Info,
  Check,
  RotateCcw,
  Clock,
  Palette,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { JodoCoProject } from '../project-engine/types';
import {
  runProductionReadinessCheck,
  applyQuickFix,
  QualityReport,
  QualityCheck,
  CheckCategory,
  QualityStatus,
  AiEditorialFeedback,
} from '../quality-engine';

interface ProductionQualityViewProps {
  project: JodoCoProject;
  onUpdateProject: (updater: (prev: JodoCoProject) => JodoCoProject) => void;
  onNavigateToTab: (tab: 'content' | 'reel' | 'carousel' | 'assets' | 'export') => void;
}

export const ProductionQualityView: React.FC<ProductionQualityViewProps> = ({
  project,
  onUpdateProject,
  onNavigateToTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CheckCategory | 'all'>('all');
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AiEditorialFeedback | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [fixSuccessMessage, setFixSuccessMessage] = useState<string | null>(null);

  // Compute live deterministic report
  const report: QualityReport = useMemo(() => {
    return runProductionReadinessCheck(project);
  }, [project]);

  const { overallScore, status, summary, categoryScores, checks } = report;

  // Filter checks according to active category tab
  const filteredChecks = useMemo(() => {
    if (selectedCategory === 'all') return checks;
    return checks.filter((c) => c.category === selectedCategory);
  }, [checks, selectedCategory]);

  const handleApplyFix = (checkId: string) => {
    onUpdateProject((prev) => {
      const fixed = applyQuickFix(prev, checkId);
      return fixed;
    });
    setFixSuccessMessage('Quick fix applied successfully!');
    setTimeout(() => setFixSuccessMessage(null), 3000);
  };

  const handleRunAiReview = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/editorial-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.feedback) {
          setAiFeedback(data.feedback);
        }
      }
    } catch (err) {
      console.warn('Could not run online editorial review, using offline heuristic:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Status color styles
  const getStatusBadge = (s: QualityStatus) => {
    switch (s) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            READY FOR EXPORT
          </span>
        );
      case 'needs_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            NEEDS REVIEW
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            EXPORT BLOCKED
          </span>
        );
    }
  };

  const getCategoryIcon = (cat: CheckCategory) => {
    switch (cat) {
      case 'editorial':
        return <Sliders className="w-4 h-4 text-[#FF8C73]" />;
      case 'brand':
        return <Palette className="w-4 h-4 text-[#8FE3C0]" />;
      case 'visual':
        return <Eye className="w-4 h-4 text-[#B8A7EA]" />;
      case 'accessibility':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'assets':
        return <FolderKanban className="w-4 h-4 text-amber-500" />;
      case 'technical':
        return <Film className="w-4 h-4 text-indigo-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-[#1A2B48]" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner: QA Scorecard & Deliverable Readiness */}
      <div className="bg-white border border-[#1A2B48]/10 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-[#1A2B48] text-white">
              Phase 12 Production Quality Assurance
            </span>
            {getStatusBadge(status)}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A2B48] tracking-tight">
            Production Readiness & Brand QA
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl">
            Automated validation layer analyzing narrative pacing, typography safe zones, asset lifecycle states, and platform video/carousel technical constraints.
          </p>
        </div>

        {/* Big Overall Quality Score Circle */}
        <div className="flex items-center gap-6 bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE6DF]">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-black text-[#1A2B48] tracking-tight">
              {overallScore}
              <span className="text-base font-bold text-slate-400">/100</span>
            </div>
            <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mt-0.5">
              Overall Score
            </div>
          </div>

          <div className="h-10 w-px bg-slate-300" />

          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="font-bold text-slate-700">Blockers:</span>
              <span className="font-black text-rose-600">{summary.blockersCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-bold text-slate-700">Warnings:</span>
              <span className="font-black text-amber-600">{summary.warningsCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-700">Passed:</span>
              <span className="font-black text-emerald-600">{summary.passedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {fixSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{fixSuccessMessage}</span>
          </div>
          <button
            onClick={() => setFixSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Deliverables Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reel Status Card */}
        <div className="bg-white border border-[#1A2B48]/10 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#FF8C73]/15 text-[#FF8C73]">
                  <Film className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-[#1A2B48]">Reel Storyboard</h3>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                {summary.reelScore}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {project.reelProject.scenes.length} synced scenes • 9:16 (1080×1920) • {project.reelProject.duration || 25}s
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            {getStatusBadge(summary.reelStatus)}
            <button
              onClick={() => onNavigateToTab('reel')}
              className="text-xs font-bold text-[#1A2B48] hover:text-[#FF8C73] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Inspect Reel</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Carousel Status Card */}
        <div className="bg-white border border-[#1A2B48]/10 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#B8A7EA]/20 text-[#B8A7EA]">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-[#1A2B48]">Carousel Deck</h3>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                {summary.carouselScore}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {project.carouselProject.slides.length} cards • 4:5 Portrait (1080×1350)
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            {getStatusBadge(summary.carouselStatus)}
            <button
              onClick={() => onNavigateToTab('carousel')}
              className="text-xs font-bold text-[#1A2B48] hover:text-[#B8A7EA] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Inspect Slides</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Asset Library Status Card */}
        <div className="bg-white border border-[#1A2B48]/10 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600">
                  <FolderKanban className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-[#1A2B48]">Asset Vault</h3>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                {summary.assetsSummary.total} Total
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <span className="text-emerald-600 font-bold">{summary.assetsSummary.approved} approved</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{summary.assetsSummary.reviewing} reviewing</span>
              <span>•</span>
              <span className="text-rose-600 font-bold">{summary.assetsSummary.rejected} rejected</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              {summary.assetsSummary.orphaned} unattached in vault
            </span>
            <button
              onClick={() => onNavigateToTab('assets')}
              className="text-xs font-bold text-[#1A2B48] hover:text-amber-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Manage Assets</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main QA Details & Category Inspector */}
      <div className="bg-white border border-[#1A2B48]/10 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Category Tabs with individual scores */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#1A2B48] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Checks ({checks.length})
          </button>

          {(Object.keys(categoryScores) as CheckCategory[]).map((cat) => {
            const catScore = categoryScores[cat];
            const isSelected = selectedCategory === cat;
            const hasBlockers = catScore.blockersCount > 0;
            const hasErrors = catScore.errorsCount > 0;
            const hasWarnings = catScore.warningsCount > 0;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1A2B48] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{catScore.name}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : hasBlockers
                      ? 'bg-rose-100 text-rose-700'
                      : hasErrors || hasWarnings
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {catScore.score}pts
                </span>
              </button>
            );
          })}
        </div>

        {/* Checks List */}
        <div className="space-y-3">
          {filteredChecks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No check issues in this category.
            </div>
          ) : (
            filteredChecks.map((check) => {
              const isExpanded = expandedCheckId === check.id;

              return (
                <div
                  key={check.id}
                  className={`border rounded-xl transition-all ${
                    !check.passed && check.severity === 'blocker'
                      ? 'border-rose-300 bg-rose-50/40'
                      : !check.passed && check.severity === 'error'
                      ? 'border-amber-300 bg-amber-50/30'
                      : !check.passed && check.severity === 'warning'
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50'
                  }`}
                >
                  <div className="p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {check.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : check.severity === 'blocker' ? (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        ) : check.severity === 'error' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Info className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-[#1A2B48]">
                            {check.title}
                          </h4>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              check.passed
                                ? 'bg-emerald-100 text-emerald-800'
                                : check.severity === 'blocker'
                                ? 'bg-rose-100 text-rose-800'
                                : check.severity === 'error'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {check.passed ? 'PASSED' : check.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{check.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {check.autoFixable && !check.passed && (
                        <button
                          onClick={() => handleApplyFix(check.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#FF8C73] hover:bg-[#ff7a5d] text-white text-xs font-extrabold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Quick Fix</span>
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedCheckId(isExpanded ? null : check.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer transition-colors"
                        title="View details"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Explanation Section */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-200/60 bg-white/80 rounded-b-xl space-y-2 text-xs">
                      {check.whyItMatters && (
                        <div>
                          <span className="font-bold text-slate-700">Why it matters: </span>
                          <span className="text-slate-600">{check.whyItMatters}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-700">Recommendation: </span>
                        <span className="text-slate-600">{check.recommendation}</span>
                      </div>
                      {check.autoFixDescription && (
                        <div className="pt-1 text-[11px] text-[#FF8C73] font-bold">
                          ✓ Auto-fix available: {check.autoFixDescription}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Optional AI Editorial Review Section */}
      <div className="bg-white border border-[#1A2B48]/10 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF8C73]/15 text-[#FF8C73]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1A2B48]">
                Optional AI Editorial Review (Gemini Feedback)
              </h3>
              <p className="text-xs text-slate-500">
                Qualitative evaluation of hook curiosity, narrative clarity, and audience resonance.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAiReview}
            disabled={isLoadingAi}
            className="px-4 py-2 rounded-xl bg-[#1A2B48] hover:bg-[#25395C] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoadingAi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Copy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#FF8C73]" />
                <span>Run Editorial Review</span>
              </>
            )}
          </button>
        </div>

        {aiFeedback && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs animate-fadeIn">
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EAE6DF] space-y-1">
              <span className="font-extrabold text-[#1A2B48]">Hook Strength:</span>
              <p className="text-slate-600">{aiFeedback.hookFeedback}</p>
            </div>
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EAE6DF] space-y-1">
              <span className="font-extrabold text-[#1A2B48]">Narrative Clarity:</span>
              <p className="text-slate-600">{aiFeedback.clarityFeedback}</p>
            </div>
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EAE6DF] space-y-1">
              <span className="font-extrabold text-[#1A2B48]">Storytelling & Flow:</span>
              <p className="text-slate-600">{aiFeedback.storytellingFeedback}</p>
            </div>
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EAE6DF] space-y-1">
              <span className="font-extrabold text-[#1A2B48]">CTA Actionability:</span>
              <p className="text-slate-600">{aiFeedback.ctaQuality}</p>
            </div>

            {aiFeedback.suggestions && aiFeedback.suggestions.length > 0 && (
              <div className="col-span-1 md:col-span-2 bg-white border border-[#FF8C73]/30 p-4 rounded-xl space-y-2">
                <span className="font-black text-[#1A2B48] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF8C73]" />
                  Editorial Recommendations:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {aiFeedback.suggestions.map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex items-center justify-between bg-white border border-[#1A2B48]/10 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Last evaluated: {new Date(report.timestamp).toLocaleTimeString()}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab('export')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              status === 'blocked'
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : status === 'needs_review'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-[#1A2B48] hover:bg-[#25395C] text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>
              {status === 'blocked'
                ? 'Export Blocked (Fix Blockers)'
                : status === 'needs_review'
                ? 'Proceed to Export (With Warnings)'
                : 'Proceed to Export Deliverables'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

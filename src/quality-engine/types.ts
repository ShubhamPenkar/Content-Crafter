export type CheckSeverity = 'info' | 'warning' | 'error' | 'blocker';

export type CheckCategory =
  | 'editorial'
  | 'brand'
  | 'visual'
  | 'accessibility'
  | 'assets'
  | 'technical'
  | 'export';

export type QualityStatus = 'ready' | 'needs_review' | 'blocked';

export type TargetMedium = 'reel' | 'carousel' | 'project' | 'asset';

export interface QualityCheck {
  id: string;
  category: CheckCategory;
  severity: CheckSeverity;
  passed: boolean;
  title: string;
  message: string;
  recommendation: string;
  whyItMatters?: string;
  targetMedium?: TargetMedium;
  targetId?: string | number;
  autoFixable?: boolean;
  autoFixDescription?: string;
  autoFixType?:
    | 'trim_headline'
    | 'trim_whitespace'
    | 'apply_brand_color'
    | 'fix_duration'
    | 'unbind_rejected_asset'
    | 'set_safe_area'
    | 'add_missing_cta'
    | 'generic';
}

export interface CategoryScore {
  category: CheckCategory;
  name: string;
  score: number; // 0 - 100
  weight: number; // e.g. 25, 20, 15...
  passedCount: number;
  totalCount: number;
  blockersCount: number;
  errorsCount: number;
  warningsCount: number;
}

export interface QualityAssetSummary {
  total: number;
  approved: number;
  reviewing: number;
  rejected: number;
  archived: number;
  orphaned: number;
}

export interface QualityReportSummary {
  reelScore: number;
  reelStatus: QualityStatus;
  carouselScore: number;
  carouselStatus: QualityStatus;
  blockersCount: number;
  errorsCount: number;
  warningsCount: number;
  infoCount: number;
  passedCount: number;
  totalChecks: number;
  assetsSummary: QualityAssetSummary;
}

export interface AiEditorialFeedback {
  hookFeedback?: string;
  clarityFeedback?: string;
  storytellingFeedback?: string;
  redundancyNotes?: string;
  ctaQuality?: string;
  audienceRelevance?: string;
  suggestions?: string[];
  reviewedAt?: string;
}

export interface QualityReport {
  overallScore: number; // Deterministic 0-100 score
  status: QualityStatus; // 'ready' | 'needs_review' | 'blocked'
  summary: QualityReportSummary;
  categoryScores: Record<CheckCategory, CategoryScore>;
  checks: QualityCheck[];
  timestamp: string;
  aiReview?: AiEditorialFeedback;
}

export interface BrandConfig {
  id: string;
  name: string;
  domain: string;
  blogDomain?: string;
  targetKeywords: string[];
  competitors: string[];
  gscProperty?: string;
  ga4Property?: string;
  locationCode: number;
  languageCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Keyword {
  id: string;
  brandId: string;
  keyword: string;
  volume: number;
  cpc: number;
  difficulty: number;
  intent: KeywordIntent;
  clusterId?: string;
  targetUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type KeywordIntent = 'informational' | 'navigational' | 'commercial' | 'transactional';

export interface KeywordPosition {
  id: string;
  keywordId: string;
  brandId: string;
  position: number | null;
  previousPosition: number | null;
  url: string;
  title: string;
  snippet: string;
  searchVolume: number;
  keywordDifficulty: number;
  checkedAt: Date;
}

export interface CompetitorKeyword {
  keyword: string;
  position: number;
  url: string;
  searchVolume: number;
  keywordDifficulty: number;
  cpc: number;
  intent: KeywordIntent;
  trafficEstimate: number;
}

export interface CompetitorDomain {
  domain: string;
  totalKeywords: number;
  estimatedTraffic: number;
  topPages: TopPage[];
  keywords: CompetitorKeyword[];
}

export interface TopPage {
  url: string;
  estimatedTraffic: number;
  keywordsCount: number;
  topKeywords: string[];
}

export interface Backlink {
  id: string;
  brandId: string;
  sourceUrl: string;
  targetUrl: string;
  anchor: string;
  domainRating: number;
  pageRating: number;
  isNew: boolean;
  isLost: boolean;
  toxicityScore: number;
  linkType: 'dofollow' | 'nofollow' | 'ugc' | 'sponsored';
  firstSeen: Date;
  lastSeen: Date;
}

export interface TechnicalAudit {
  id: string;
  brandId: string;
  lcp: number;
  inp: number;
  cls: number;
  fcp: number;
  ttfb: number;
  performanceScore: number;
  indexationRate: number;
  crawlErrors: CrawlError[];
  schemaCoverage: SchemaCoverage;
  checkedAt: Date;
}

export interface CrawlError {
  url: string;
  statusCode: number;
  errorType: string;
  firstDetected: Date;
}

export interface SchemaCoverage {
  article: number;
  faq: number;
  breadcrumb: number;
  product: number;
  organization: number;
  total: number;
}

export interface ContentPage {
  id: string;
  brandId: string;
  url: string;
  title: string;
  targetKeyword: string;
  wordCount: number;
  contentScore: number;
  optimizationScore: number;
  lastOptimizedAt: Date | null;
  publishedAt: Date;
  status: 'draft' | 'published' | 'needs_update';
}

export interface ContentBrief {
  targetKeyword: string;
  searchIntent: KeywordIntent;
  recommendedWordCount: number;
  suggestedHeadings: string[];
  faqQuestions: string[];
  entitiesToCover: string[];
  competitorContent: CompetitorContent[];
  internalLinkOpportunities: string[];
}

export interface CompetitorContent {
  url: string;
  title: string;
  wordCount: number;
  headings: string[];
  keywordDensity: Record<string, number>;
}

export interface Report {
  id: string;
  brandId: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'custom';
  status: 'generating' | 'ready' | 'failed';
  data: Record<string, unknown>;
  generatedAt: Date;
  sentAt: Date | null;
}

export interface Alert {
  id: string;
  brandId: string;
  type: 'position_drop' | 'new_toxic_backlink' | 'cwv_regression' | 'competitor_outrank' | 'indexation_drop';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: Record<string, unknown>;
  acknowledged: boolean;
  createdAt: Date;
}

export interface DataForSEOConfig {
  login: string;
  password: string;
  baseUrl: string;
}

export interface SERPRequest {
  keyword: string;
  location_code: number;
  language_code: string;
  device: 'desktop' | 'mobile';
  depth: number;
}

export interface SERPResult {
  keyword: string;
  type: string;
  rank_group: number;
  rank_absolute: number;
  domain: string;
  title: string;
  description: string;
  url: string;
  is_malicious: boolean;
  featured_snippet: boolean;
  sitelinks: Sitelink[];
}

export interface Sitelink {
  title: string;
  url: string;
}

export interface RankedKeywordsResponse {
  target: string;
  location_code: number;
  language_code: string;
  total_count: number;
  items: CompetitorKeyword[];
}

export interface DomainIntersectionResponse {
  target1: string;
  target2: string;
  intersection: CompetitorKeyword[];
}

export interface DomainRankOverviewResponse {
  target: string;
  total_keywords: number;
  estimated_traffic: number;
  top_pages: TopPage[];
}

export type Language = 'en' | 'es';

export interface KeywordVolume {
  keyword: string;
  searchVolume: string;
}

export interface RisingKeyword {
  keyword: string;
  growthPercentage: number;
}

export interface TopArticle {
  title: string;
  url: string;
  source: string;
}

export interface PopularityComparison {
  last24HoursIndex: number;
  previous24HoursIndex: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface AnalysisData {
  topKeywords: KeywordVolume[];
  risingKeywords: RisingKeyword[];
  topArticles: TopArticle[];
  popularityComparison: PopularityComparison;
}

export interface GroundingSource {
  uri: string;
  title: string;
}
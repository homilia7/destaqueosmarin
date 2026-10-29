export interface ProjectFeature {
  id: string;
  order: number;
  category: string;
  title: string;
  badge?: string;
  problem: string;
  solution: string;
  impact: string;
  actionText?: string;
  actionPath?: string;
}

export interface ProjectMetric {
  value: string;
  label: string;
  sublabel: string;
}

export interface ProjectPresentationData {
  heroTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  metrics: ProjectMetric[];
  features: ProjectFeature[];
  closingTitle: string;
  closingText: string;
  closingQuote: string;
}

export interface Ad {
  id: string;
  brand: string;
  format: 'video' | 'static' | 'carousel';
  theme: string;
  tone: string;
  hook: string;
  days_active: number;
  proven: boolean;
  copy: string;
  summary: string;
  additional_signals?: {
    promise_type: string;
    objection_handling: string;
    cta_style: string;
    authority_signals: string;
    before_after: boolean;
    urgency_framing: string;
    audience_persona: string;
  };
}

export interface Territory {
  name: string;
  brands: string[];
  description: string;
}

export interface IntelligenceBrief {
  summary: string;
  patterns: string[];
  experiments: string[];
  scaling_ads: string[];
  emerging_themes: string[];
  opportunities: string[];
}

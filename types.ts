export interface LandingContent {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  features: FeatureItem[];
  pricing: PricingTier[];
}

export interface FeatureItem {
  id: number;
  title: string;
  description: string;
  iconName: string; // 'Zap', 'Shield', 'Chart'
}

export interface PricingTier {
  name: string;
  price: string; // Annual price
  monthlyPrice?: string; // Monthly price
  originalPrice?: string;
  features: string[];
  recommended?: boolean;
}

export enum OptimizationTone {
  PROFESSIONAL = "Professional",
  PLAYFUL = "Playful",
  URGENT = "Urgent",
  MINIMALIST = "Minimalist",
}

export interface OptimizationRequest {
  currentContent: LandingContent;
  tone: OptimizationTone;
}

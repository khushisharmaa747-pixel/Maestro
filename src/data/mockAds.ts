import { Ad } from '../types';

export const initialAds: Ad[] = [
  {
    id: "mam_001",
    brand: "Mamaearth",
    format: "video",
    theme: "hair loss",
    tone: "expert",
    hook: "Tired of hair fall that just won't stop?",
    days_active: 62,
    proven: true,
    copy: "Mamaearth Onion Hair Oil is clinically tested to reduce hair fall by up to 96% in just 4 weeks.",
    summary: "Targets mass hair fall concern with clinical proof.",
    additional_signals: {
      promise_type: "Clinical Efficacy",
      objection_handling: "Safety/Chemicals",
      cta_style: "Direct Shop",
      authority_signals: "Clinically Tested",
      before_after: false,
      urgency_framing: "None",
      audience_persona: "Concerned Hair Fall Sufferer"
    }
  },
  {
    id: "wb_001",
    brand: "Wellbeing Nutrition",
    format: "video",
    theme: "supplements",
    tone: "clinical",
    hook: "70% of Indians are Vitamin D deficient",
    days_active: 55,
    proven: true,
    copy: "Wellbeing Nutrition's plant-based Vitamin D3+K2 melts deliver 3x better absorption than tablets.",
    summary: "Attacks the absorption gap in supplements.",
    additional_signals: {
      promise_type: "Superior Absorption",
      objection_handling: "Tablet inefficiency",
      cta_style: "Direct Shop",
      authority_signals: "Plant-based, Certified",
      before_after: false,
      urgency_framing: "None",
      audience_persona: "Health-conscious urbanite"
    }
  },
  {
    id: "oz_001",
    brand: "Oziva",
    format: "video",
    theme: "routine",
    tone: "emotional",
    hook: "I lost 6 kg in 3 months",
    days_active: 49,
    proven: true,
    copy: "OZiva Protein & Herbs for Women combines plant protein with Ayurvedic herbs.",
    summary: "Uses relatable UGC testimonial.",
    additional_signals: {
      promise_type: "Weight Management",
      objection_handling: "Restrictive dieting",
      cta_style: "Start Journey",
      authority_signals: "Ayurvedic Herbs",
      before_after: true,
      urgency_framing: "None",
      audience_persona: "Weight-loss seeker"
    }
  },
  {
    id: "mam_002",
    brand: "Mamaearth",
    format: "static",
    theme: "skin health",
    tone: "expert",
    hook: "India's #1 natural skincare brand",
    days_active: 45,
    proven: true,
    copy: "Mamaearth Vitamin C Face Wash is loved by 50 lakh+ customers for its instant glow.",
    summary: "Uses market leadership and volume proof.",
    additional_signals: {
      promise_type: "Instant Glow",
      objection_handling: "Chemical safety",
      cta_style: "Buy Now",
      authority_signals: "50 Lakh+ Customers",
      before_after: false,
      urgency_framing: "None",
      audience_persona: "Natural beauty enthusiast"
    }
  },
  {
    id: "bf_001",
    brand: "Boldfit",
    format: "video",
    theme: "confidence",
    tone: "humorous",
    hook: "This isn't just a pre-workout",
    days_active: 71,
    proven: true,
    copy: "Boldfit Extreme Pre-Workout — 200mg caffeine, 6g L-Citrulline, zero fillers.",
    summary: "Sells aggressive performance identity.",
    additional_signals: {
      promise_type: "Performance Boost",
      objection_handling: "Fillers/Quality",
      cta_style: "Buy Pre-Workout",
      authority_signals: "3 Lakh+ Athletes",
      before_after: false,
      urgency_framing: "None",
      audience_persona: "Gym-goer"
    }
  },
  {
    id: "tmc_001",
    brand: "The Moms Co",
    format: "video",
    theme: "routine",
    tone: "emotional",
    hook: "As a first-time mum, I was terrified",
    days_active: 67,
    proven: true,
    copy: "The Moms Co Baby Lotion has zero toxins, is dermatologist-tested and made with natural ingredients.",
    summary: "Uses maternal anxiety as emotional driver.",
    additional_signals: {
      promise_type: "Safety/Purity",
      objection_handling: "Toxins/Chemicals",
      cta_style: "Shop Baby Care",
      authority_signals: "Dermatologist-tested",
      before_after: false,
      urgency_framing: "None",
      audience_persona: "New Mother"
    }
  }
];

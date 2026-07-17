import type { ExtractionResult } from '@/types';

const WEIGHTS: Record<string, number> = {
  full_name: 40,
  gender: 15,
  date_of_birth: 25,
  age: 10,
  phone: 18,
  profile_type: 12,
  height_feet: 6,
  gotram: 12,
  nakshatram: 12,
  rashi: 12,
  education: 5,
  occupation: 5,
  father_name: 12,
  mother_name: 10,
  caste: 5,
  native_place: 5,
  city: 5,
  state: 3,
  district: 3,
  salary: 4,
  email: 6,
  whatsapp: 4,
  address: 4,
  time_of_birth: 4,
  place_of_birth: 4,
  height_inches: 2,
  weight: 2,
  padam: 6,
  business_name: 2,
  business_type: 1,
  annual_income: 2,
  mother_gotram: 4,
  mother_surname: 2,
  father_occupation: 2,
  siblings: 3,
  family_background: 3,
  property_details: 1,
  family_values: 1,
  additional_info: 1,
  education_preference: 2,
  occupation_preference: 2,
  location_preference: 2,
  community_preference: 2,
  other_expectations: 1,
  expected_age_min: 4,
  expected_age_max: 4,
  expected_height_min: 1,
  expected_height_max: 1,
  education_qualification: 2,
  career: 2,
};

const CONFIDENCE_MULTIPLIER: Record<string, number> = {
  high: 1.0,
  medium: 0.6,
  low: 0.2,
};

const MAX_SCORE = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

export const CONFIDENCE_THRESHOLD = 60;

interface ScoringResult {
  overall: number;
  percentage: number;
  meetsThreshold: boolean;
  fieldScores: Record<string, { weight: number; score: number }>;
}

export function scoreConfidence(result: ExtractionResult): ScoringResult {
  let total = 0;
  const fieldScores: Record<string, { weight: number; score: number }> = {};

  for (const [key, field] of Object.entries(result.fields)) {
    const weight = WEIGHTS[key] || 2;
    if (field.value !== null) {
      const multiplier = CONFIDENCE_MULTIPLIER[field.confidence] || 0;
      const score = weight * multiplier;
      total += score;
      fieldScores[key] = { weight, score };
    } else {
      fieldScores[key] = { weight, score: 0 };
    }
  }

  const percentage = MAX_SCORE > 0 ? Math.round((total / MAX_SCORE) * 100) : 0;

  return {
    overall: Math.round(total * 10) / 10,
    percentage,
    meetsThreshold: percentage >= CONFIDENCE_THRESHOLD,
    fieldScores,
  };
}

export { WEIGHTS, MAX_SCORE };

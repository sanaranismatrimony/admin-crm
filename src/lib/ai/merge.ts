import type { ExtractionResult, ConfidenceLevel, ExtractedField } from '@/types';

const CONFIDENCE_ORDER: Record<ConfidenceLevel, number> = { high: 3, medium: 2, low: 1 };

function pickField<T>(
  rules: ExtractedField<T>,
  groq: ExtractedField<T>,
): ExtractedField<T> {
  const rScore = CONFIDENCE_ORDER[rules.confidence] || 0;
  const gScore = CONFIDENCE_ORDER[groq.confidence] || 0;

  if (rules.value === null && groq.value === null) {
    return { value: null, confidence: 'low' };
  }

  if (rules.value === null && groq.value !== null) {
    return groq;
  }

  if (groq.value === null && rules.value !== null) {
    return rules;
  }

  if (rScore > gScore) return rules;
  if (gScore > rScore) return groq;

  return rules;
}

export interface MergeLog {
  field: string;
  source: 'rules' | 'groq' | 'both';
  conflict?: string;
}

export function mergeResults(rules: ExtractionResult, groq: ExtractionResult): { result: ExtractionResult; log: MergeLog[] } {
  const merged: Record<string, ExtractedField<unknown>> = { ...rules.fields };
  const log: MergeLog[] = [];

  for (const [key, rField] of Object.entries(rules.fields)) {
    const gField = groq.fields[key as keyof typeof groq.fields];
    if (!gField) continue;

    const rVal = rField.value;
    const gVal = gField.value;
    const conflict = (rVal !== null && gVal !== null && String(rVal).toLowerCase() !== String(gVal).toLowerCase())
      ? `Conflict: rules="${rVal}" vs groq="${gVal}"`
      : null;

    if (rVal !== null && gVal !== null) {
      const picked = pickField(rField as ExtractedField<unknown>, gField as ExtractedField<unknown>);
      merged[key] = picked;
      log.push({
        field: key,
        source: picked === rField ? 'rules' : 'groq',
        conflict: conflict || undefined,
      });
    } else if (rVal !== null) {
      merged[key] = rField;
      log.push({ field: key, source: 'rules' });
    } else if (gVal !== null) {
      merged[key] = gField;
      log.push({ field: key, source: 'groq' });
    }
  }

  const fieldCount = Object.values(merged).filter(f => f.value !== null).length;

  return {
    result: {
      fields: merged as unknown as ExtractionResult['fields'],
      raw_text: rules.raw_text || groq.raw_text,
      field_count: fieldCount,
    },
    log,
  };
}

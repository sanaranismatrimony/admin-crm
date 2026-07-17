import type { ExtractionResult } from '@/types';
import { extractText, ExtractionError } from './text-extract';
import { cleanText } from './text-clean';
import { ruleExtract } from './rules';
import { scoreConfidence, CONFIDENCE_THRESHOLD } from './confidence';
import { extractWithGroq } from './groq';
import { mergeResults } from './merge';
import { normalizeExtraction, type NormalizedResult } from './normalize';
import { validateExtraction, type ValidationWarning } from './validate';
import { hashFile, getCached, setCached } from './cache';

export { ExtractionError } from './text-extract';
export type { ValidationWarning } from './validate';

export interface ExtractionPipelineOptions {
  skipCache?: boolean;
  skipAi?: boolean;
  threshold?: number;
}

export interface ExtractionPipelineResult {
  result: ExtractionResult;
  normalized: NormalizedResult;
  confidence: { overall: number; percentage: number; meetsThreshold: boolean };
  source: 'cache' | 'rules' | 'groq' | 'merged';
  warnings: ValidationWarning[];
  mergeLog?: { field: string; source: 'rules' | 'groq' | 'both'; conflict?: string }[];
}

export async function extractBiodata(
  buffer: ArrayBuffer,
  mimeType: string,
  fileName: string,
  options: ExtractionPipelineOptions = {},
): Promise<ExtractionPipelineResult> {
  const { skipCache = false, skipAi = false, threshold = CONFIDENCE_THRESHOLD } = options;

  const fileHash = hashFile(buffer);
  if (!skipCache) {
    const cached = getCached(fileHash);
    if (cached) {
      const normalized = normalizeExtraction(cached);
      const scored = scoreConfidence(cached);
      const warnings = validateExtraction(cached);
      return {
        result: cached,
        normalized,
        confidence: {
          overall: scored.overall,
          percentage: scored.percentage,
          meetsThreshold: scored.meetsThreshold,
        },
        source: 'cache',
        warnings,
      };
    }
  }

  const extracted = await extractText(buffer, mimeType, fileName);
  const cleaned = cleanText(extracted.text);

  const rulesResult = ruleExtract(cleaned);
  const rulesScore = scoreConfidence(rulesResult);

  if (rulesScore.meetsThreshold || skipAi) {
    const normalized = normalizeExtraction(rulesResult);
    const warnings = validateExtraction(rulesResult);
    setCached(fileHash, normalized.fields as unknown as ExtractionResult);

    return {
      result: { ...rulesResult, raw_text: cleaned },
      normalized,
      confidence: { overall: rulesScore.overall, percentage: rulesScore.percentage, meetsThreshold: true },
      source: 'rules',
      warnings,
    };
  }

  let source: 'rules' | 'groq' | 'merged';
  let finalResult: ExtractionResult;
  let mergeLog: { field: string; source: 'rules' | 'groq' | 'both'; conflict?: string }[] | undefined;

  try {
    const groqResult = await extractWithGroq(cleaned);
    const merged = mergeResults(rulesResult, groqResult);
    finalResult = merged.result;
    mergeLog = merged.log;
    source = 'groq';
    if (mergeLog.some(l => l.source === 'rules')) source = 'merged';
  } catch {
    finalResult = rulesResult;
    source = 'rules';
  }

  const normalized = normalizeExtraction(finalResult);
  const scored = scoreConfidence(finalResult);
  const warnings = validateExtraction(finalResult);

  const scoredResult = {
    ...finalResult,
    raw_text: cleaned,
  };

  setCached(fileHash, scoredResult);

  return {
    result: scoredResult,
    normalized,
    confidence: {
      overall: scored.overall,
      percentage: scored.percentage,
      meetsThreshold: scored.percentage >= threshold,
    },
    source,
    warnings,
    mergeLog,
  };
}

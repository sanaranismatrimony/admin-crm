import type { ExtractionResult, ExtractedField, ConfidenceLevel } from '@/types';
import { GOTRAM_VARIANTS, RASHI_VARIANTS, NAKSHATRAM_VARIANTS, normalizeDict } from './rules';

function str(value: string | null, confidence: ConfidenceLevel = 'low'): ExtractedField<string> {
  if (!value || value.trim() === '') return { value: null, confidence: 'low' };
  return { value: value.trim(), confidence };
}

function num(value: number | null, confidence: ConfidenceLevel = 'low'): ExtractedField<number> {
  if (value === null || isNaN(value)) return { value: null, confidence: 'low' };
  return { value, confidence };
}

function normalizeHeight(raw: string): { feet: number | null; inches: number | null } {
  const s = raw.trim().toLowerCase();

  const cmMatch = s.match(/(\d+)\s*cm/i);
  if (cmMatch) {
    const cm = parseInt(cmMatch[1]);
    if (cm >= 100 && cm <= 250) {
      const totalInches = cm / 2.54;
      return { feet: Math.floor(totalInches / 12), inches: Math.round(totalInches % 12) };
    }
    return { feet: null, inches: null };
  }

  const meterMatch = s.match(/(\d+)\.(\d+)\s*m/i);
  if (meterMatch) {
    const m = parseInt(meterMatch[1]) * 100 + parseInt(meterMatch[2]) * 10;
    const totalInches = m / 2.54;
    return { feet: Math.floor(totalInches / 12), inches: Math.round(totalInches % 12) };
  }

  const feetInchMatch = s.match(/(\d+)\s*['\u2019\u02CA]?\s*(?:ft|feet|foot|f\b)?[,\s]*(\d*)\s*(?:"|\u201D|in|inches?|inch)?/i);
  if (feetInchMatch) {
    const f = parseInt(feetInchMatch[1]);
    const i = feetInchMatch[2] ? parseInt(feetInchMatch[2]) : 0;
    if (f >= 1 && f <= 8 && i >= 0 && i <= 11) return { feet: f, inches: i };
    return { feet: null, inches: null };
  }

  const decimalMatch = s.match(/(\d+)\.(\d+)/);
  if (decimalMatch) {
    const whole = parseInt(decimalMatch[1]);
    const frac = parseInt(decimalMatch[2]);
    if (whole >= 1 && whole <= 8 && frac >= 0 && frac <= 11) return { feet: whole, inches: frac };
  }

  return { feet: null, inches: null };
}

function normalizeSalary(raw: string): string | null {
  const s = raw.trim().toLowerCase();

  if (s.includes('lakh') || s.includes('lpa') || s.includes('lacs')) {
    const match = s.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const lakhs = parseFloat(match[1]);
      if (lakhs > 0) return `₹${Math.round(lakhs * 100000)}`;
    }
    return null;
  }

  if (s.includes('crore') || s.includes('cr')) {
    const match = s.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const crores = parseFloat(match[1]);
      if (crores > 0) return `₹${Math.round(crores * 10000000)}`;
    }
    return null;
  }

  const digits = s.replace(/[₹,$,\s]/g, '');
  const numMatch = digits.match(/^(\d+)$/);
  if (numMatch) {
    const n = parseInt(numMatch[1]);
    if (n > 0) return `₹${n}`;
  }

  return null;
}

function normalizeGender(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (/^(?:male|groom|boy|man|brother|son|bridegroom)$/.test(s)) return 'male';
  if (/^(?:female|bride|girl|woman|sister|daughter)$/.test(s)) return 'female';
  if (s === 'm') return 'male';
  if (s === 'f') return 'female';
  return null;
}

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-()+\u2013\u2014]/g, '');
  if (/^(?:\+?91)?([6-9]\d{9})$/.test(digits)) {
    const m = digits.match(/^(?:\+?91)?([6-9]\d{9})$/);
    return m ? m[1] : null;
  }
  if (/^\d{10}$/.test(digits) && /^[6-9]/.test(digits)) return digits;
  return null;
}

function normalizeDate(raw: string): string | null {
  const s = raw.trim();

  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const ddmmMatch = s.match(/^(\d{1,2})\s*[\/\-\.]\s*(\d{1,2})\s*[\/\-\.]\s*(\d{4})/);
  if (ddmmMatch) {
    let d = parseInt(ddmmMatch[1]), m = parseInt(ddmmMatch[2]), y = parseInt(ddmmMatch[3]);
    if (d > 31) { [d, m] = [m, d]; }
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= new Date().getFullYear() + 1) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  const monMatch = s.match(/^(\d{1,2})\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*[,.\s]*\s*(\d{4})/i);
  if (monMatch) {
    return `${monMatch[2]}-${String(parseMon(monMatch[1])).padStart(2, '0')}-${String(parseInt(monMatch[0])).padStart(2, '0')}`;
  }

  return null;
}

function parseMon(s: string): number {
  const m: Record<string, number> = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
    may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9,
    september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
  };
  return m[s.toLowerCase().substring(0, 3)] || 1;
}

function normalizeTime(raw: string): string | null {
  const s = raw.trim();

  const h24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const h = parseInt(h24[1]), m = parseInt(h24[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  const h12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/);
  if (h12) {
    let h = parseInt(h12[1]);
    const m = parseInt(h12[2]), a = h12[3].toUpperCase();
    if (a === 'PM' && h < 12) h += 12;
    if (a === 'AM' && h === 12) h = 0;
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  const hOnly = s.match(/^(\d{1,2})\s*(AM|PM|am|pm)$/);
  if (hOnly) {
    let h = parseInt(hOnly[1]);
    const a = hOnly[2].toUpperCase();
    if (a === 'PM' && h < 12) h += 12;
    if (a === 'AM' && h === 12) h = 0;
    if (h >= 0 && h <= 23) return `${String(h).padStart(2, '0')}:00`;
  }

  const dotMatch = s.match(/^(\d{1,2})\.(\d{2})$/);
  if (dotMatch) {
    const h = parseInt(dotMatch[1]), m = parseInt(dotMatch[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  return null;
}

function normalizeCaste(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (/^(kv|k\.v\.?|kalingavyasya|k v|kalinga vysya|k\.vysya)$/.test(s)) {
    return 'Kalinga Vysya';
  }
  return raw.trim() || null;
}

function normalizeState(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  const states: Record<string, string> = {
    'andhra pradesh': 'Andhra Pradesh', 'ap': 'Andhra Pradesh',
    'telangana': 'Telangana', 'tg': 'Telangana', 'telengana': 'Telangana',
    'tamil nadu': 'Tamil Nadu', 'tn': 'Tamil Nadu',
    'karnataka': 'Karnataka', 'ka': 'Karnataka',
    'kerala': 'Kerala', 'kl': 'Kerala',
    'maharastra': 'Maharashtra', 'maharashtra': 'Maharashtra',
    'gujarat': 'Gujarat',
    'rajasthan': 'Rajasthan',
    'madhya pradesh': 'Madhya Pradesh', 'mp': 'Madhya Pradesh',
    'uttar pradesh': 'Uttar Pradesh', 'up': 'Uttar Pradesh',
    'bihar': 'Bihar',
    'west bengal': 'West Bengal', 'wb': 'West Bengal',
    'odisha': 'Odisha', 'orissa': 'Odisha',
    'jharkhand': 'Jharkhand',
    'chhattisgarh': 'Chhattisgarh',
    'punjab': 'Punjab',
    'haryana': 'Haryana',
    'himachal pradesh': 'Himachal Pradesh', 'hp': 'Himachal Pradesh',
    'delhi': 'Delhi',
  };
  return states[s] || raw.trim();
}

function normalizePadam(raw: string): string | null {
  const m = raw.trim().match(/^([1-4])/);
  return m ? m[1] : null;
}

interface NormalizationWarning {
  field: string;
  message: string;
}

export interface NormalizedResult {
  fields: ExtractionResult['fields'];
  warnings: NormalizationWarning[];
}

export function normalizeExtraction(result: ExtractionResult): NormalizedResult {
  const f = result.fields;
  const warnings: NormalizationWarning[] = [];

  const normalized: ExtractionResult['fields'] = { ...f };

  if (f.gender.value) {
    const norm = normalizeGender(f.gender.value);
    if (norm && norm !== f.gender.value.toLowerCase()) {
      normalized.gender = str(norm, f.gender.confidence);
    }
  }

  for (const key of ['salary', 'annual_income'] as const) {
    if (f[key].value) {
      const norm = normalizeSalary(f[key].value);
      if (norm) {
        normalized[key] = str(norm, f[key].confidence);
      }
    }
  }

  if (f.phone.value) {
    const norm = normalizePhone(f.phone.value);
    if (norm && norm !== f.phone.value.replace(/[\s\-()+\u2013\u2014]/g, '')) {
      normalized.phone = str(norm, f.phone.confidence);
    } else if (!norm && f.phone.value) {
      warnings.push({ field: 'phone', message: `Phone number looks invalid: ${f.phone.value}` });
    } else if (norm) {
      normalized.phone = str(norm, f.phone.confidence);
    }
  }

  if (f.whatsapp.value) {
    const norm = normalizePhone(f.whatsapp.value);
    if (norm) {
      normalized.whatsapp = str(norm, f.whatsapp.confidence);
    }
  }

  if (f.date_of_birth.value) {
    const norm = normalizeDate(f.date_of_birth.value);
    if (norm) {
      normalized.date_of_birth = str(norm, f.date_of_birth.confidence);
    }
  }

  if (f.time_of_birth.value) {
    const norm = normalizeTime(f.time_of_birth.value);
    if (norm) {
      normalized.time_of_birth = str(norm, f.time_of_birth.confidence);
    }
  }

  if (f.caste.value) {
    const norm = normalizeCaste(f.caste.value);
    if (norm !== f.caste.value) {
      normalized.caste = str(norm, f.caste.confidence);
    }
  }

  if (f.gotram.value) {
    const norm = normalizeDict(f.gotram.value, GOTRAM_VARIANTS);
    if (norm !== f.gotram.value) {
      normalized.gotram = str(norm, f.gotram.confidence);
    }
  }

  if (f.rashi.value) {
    const norm = normalizeDict(f.rashi.value, RASHI_VARIANTS);
    if (norm !== f.rashi.value) {
      normalized.rashi = str(norm, f.rashi.confidence);
    }
  }

  if (f.nakshatram.value) {
    const norm = normalizeDict(f.nakshatram.value, NAKSHATRAM_VARIANTS);
    if (norm !== f.nakshatram.value) {
      normalized.nakshatram = str(norm, f.nakshatram.confidence);
    }
  }

  if (f.mother_gotram.value) {
    const norm = normalizeDict(f.mother_gotram.value, GOTRAM_VARIANTS);
    if (norm !== f.mother_gotram.value) {
      normalized.mother_gotram = str(norm, f.mother_gotram.confidence);
    }
  }

  if (f.state.value) {
    const norm = normalizeState(f.state.value);
    if (norm !== f.state.value) {
      normalized.state = str(norm, f.state.confidence);
    }
  }

  if (f.padam.value) {
    const norm = normalizePadam(f.padam.value);
    if (norm) {
      normalized.padam = str(norm, f.padam.confidence);
    }
  }

  if (f.email.value) {
    const email = f.email.value.trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      normalized.email = str(email, f.email.confidence);
    } else {
      warnings.push({ field: 'email', message: `Email looks invalid: ${f.email.value}` });
    }
  }

  if (!f.full_name.value) {
    warnings.push({ field: 'full_name', message: 'Full name is required but was not extracted' });
  }

  if (!f.gender.value && !f.profile_type.value) {
    warnings.push({ field: 'gender', message: 'Gender/Profile type not detected' });
  }

  return { fields: normalized, warnings };
}

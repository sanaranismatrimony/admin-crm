import type { ExtractionResult, ExtractedField } from '@/types';

const DEFAULT_MODEL = 'openai/gpt-oss-120b';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MAX_RETRIES = 3;

const SYSTEM_PROMPT = `You are a matrimonial biodata extraction assistant for Telugu/Kalinga Vysya families. Extract all available information from the provided biodata document text.

Return ONLY valid JSON with this exact structure. For each field include "value" and "confidence" ("high"|"medium"|"low"). Set value to null if not found. NEVER guess or fabricate values.

Important field name mappings (normalize to these exact keys):
- profile_type: one of "bride", "groom", "second_marriage_bride", "second_marriage_groom", "other_caste_bride", "other_caste_groom"
- gender: "male" or "female"
- DOB / Date of Birth / Birth Date: date_of_birth
- Time of Birth / Birth Time: time_of_birth
- Place of Birth / Birth Place: place_of_birth
- Age: age (number)
- Height: height_feet (number), height_inches (number) — e.g. 5'8" → feet=5, inches=8
- Weight: weight (number)
- Gothram / Gotram: gotram (use the exact spelling from the text, then normalize)
- Nakshatra / Birth Star: nakshatram
- Rashi / Janma Rashi: rashi
- Padam / Paadam: padam (must be one of "1","2","3","4")
- Education / Qualification: education
- Education Qualification / Degree: education_qualification
- Occupation / Profession / Job: occupation
- Career / Field: career
- Salary / Income / Annual Income: salary
- Business Name: business_name
- Business Type: business_type
- Annual Income / Business Income: annual_income
- Native Place / Hometown: native_place
- Village / City / Residence: city
- District: district
- State: state
- Father's Name / Father Name: father_name
- Father's Occupation: father_occupation
- Mother's Name / Mother Name: mother_name
- Mother's Surname: mother_surname
- Mother's Gotram: mother_gotram
- Siblings / Brother / Sister: siblings (string description)
- Family Background: family_background
- Property Details: property_details
- Family Values: family_values
- Additional Info: additional_info
- Expected Age: expected_age_min, expected_age_max (numbers)
- Expected Height: expected_height_min, expected_height_max (numbers)
- Education Preference: education_preference
- Occupation Preference: occupation_preference
- Location Preference: location_preference
- Community Preference: community_preference
- Other Expectations: other_expectations
- Phone / Mobile / Contact No: phone
- WhatsApp: whatsapp
- Email / E-mail: email
- Address / Postal Address: address
- Caste / Community: caste

EXACT ACCEPTED VALUES (return these exact strings):
- profile_type: "bride", "groom", "second_marriage_bride", "second_marriage_groom", "other_caste_bride", "other_caste_groom"
- gender: "male", "female"
- rashi: "Mesh" (Aries), "Vrishabh" (Taurus), "Mithun" (Gemini), "Kark" (Cancer), "Simha" (Leo), "Kanya" (Virgo), "Tula" (Libra), "Vrishchik" (Scorpio), "Dhanu" (Sagittarius), "Makar" (Capricorn), "Kumbh" (Aquarius), "Meen" (Pisces)
- nakshatram: "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Moola", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
- padam: "1", "2", "3", "4"
- caste: "Kalinga Vysya" or as found in text`;

function str(value: unknown, confidence: 'high' | 'medium' | 'low' = 'medium'): ExtractedField<string> {
  if (value === null || value === undefined || value === '') return { value: null, confidence: 'low' };
  return { value: String(value), confidence: confidence };
}

function num(value: unknown, confidence: 'high' | 'medium' | 'low' = 'medium'): ExtractedField<number> {
  if (value === null || value === undefined) return { value: null, confidence: 'low' };
  const n = typeof value === 'number' ? value : parseInt(String(value));
  if (isNaN(n)) return { value: null, confidence: 'low' };
  return { value: n, confidence };
}

function parseResponse(text: string): ExtractionResult {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/{[\s\S]*?}/);
  const raw: Record<string, unknown> = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : {};
  const fields: Record<string, unknown> = (raw.fields as Record<string, unknown>) || raw;

  function extractStr(key: string): ExtractedField<string> {
    const f = fields[key];
    if (!f || (typeof f === 'object' && f !== null && !('value' in (f as Record<string, unknown>)))) {
      return { value: null, confidence: 'low' };
    }
    if (typeof f === 'object' && f !== null) {
      const v = (f as Record<string, unknown>).value;
      const c = (f as Record<string, unknown>).confidence;
      if (v === null || v === undefined || v === '') return { value: null, confidence: 'low' };
      return { value: String(v), confidence: (c as 'high'|'medium'|'low') || 'medium' };
    }
    if (String(f).trim()) return { value: String(f).trim(), confidence: 'medium' };
    return { value: null, confidence: 'low' };
  }

  function extractNum(key: string): ExtractedField<number> {
    const f = fields[key];
    if (!f || (typeof f === 'object' && f !== null && !('value' in (f as Record<string, unknown>)))) {
      return { value: null, confidence: 'low' };
    }
    if (typeof f === 'object' && f !== null) {
      const v = (f as Record<string, unknown>).value;
      const c = (f as Record<string, unknown>).confidence;
      const n = typeof v === 'number' ? v : parseInt(String(v));
      if (isNaN(n) || n === null || n === undefined) return { value: null, confidence: 'low' };
      return { value: n, confidence: (c as 'high'|'medium'|'low') || 'medium' };
    }
    const n = typeof f === 'number' ? f : parseInt(String(f));
    if (isNaN(n)) return { value: null, confidence: 'low' };
    return { value: n, confidence: 'medium' };
  }

  const result: ExtractionResult = {
    fields: {
      full_name: extractStr('full_name'),
      date_of_birth: extractStr('date_of_birth'),
      time_of_birth: extractStr('time_of_birth'),
      place_of_birth: extractStr('place_of_birth'),
      age: extractNum('age'),
      height_feet: extractNum('height_feet'),
      height_inches: extractNum('height_inches'),
      weight: extractNum('weight'),
      profile_type: extractStr('profile_type'),
      gender: extractStr('gender'),
      caste: extractStr('caste'),
      gotram: extractStr('gotram'),
      rashi: extractStr('rashi'),
      nakshatram: extractStr('nakshatram'),
      padam: extractStr('padam'),
      education: extractStr('education'),
      education_qualification: extractStr('education_qualification'),
      career: extractStr('career'),
      occupation: extractStr('occupation'),
      salary: extractStr('salary'),
      business_name: extractStr('business_name'),
      business_type: extractStr('business_type'),
      annual_income: extractStr('annual_income'),
      state: extractStr('state'),
      district: extractStr('district'),
      city: extractStr('city'),
      native_place: extractStr('native_place'),
      father_name: extractStr('father_name'),
      father_occupation: extractStr('father_occupation'),
      mother_name: extractStr('mother_name'),
      mother_surname: extractStr('mother_surname'),
      mother_gotram: extractStr('mother_gotram'),
      siblings: extractStr('siblings'),
      family_background: extractStr('family_background'),
      property_details: extractStr('property_details'),
      family_values: extractStr('family_values'),
      additional_info: extractStr('additional_info'),
      expected_age_min: extractNum('expected_age_min'),
      expected_age_max: extractNum('expected_age_max'),
      expected_height_min: extractNum('expected_height_min'),
      expected_height_max: extractNum('expected_height_max'),
      education_preference: extractStr('education_preference'),
      occupation_preference: extractStr('occupation_preference'),
      location_preference: extractStr('location_preference'),
      community_preference: extractStr('community_preference'),
      other_expectations: extractStr('other_expectations'),
      phone: extractStr('phone'),
      whatsapp: extractStr('whatsapp'),
      email: extractStr('email'),
      address: extractStr('address'),
    },
    raw_text: '',
    field_count: 0,
  };

  result.field_count = Object.values(result.fields).filter(f => f.value !== null).length;

  return result;
}

export async function ocrWithGroqVision(
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const base64 = Buffer.from(buffer).toString('base64');
  const dataUri = `data:${mimeType};base64,${base64}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_VISION_MODEL || 'llama-3.2-90b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract ALL visible text from this image exactly as written. Return only the extracted text, nothing else.',
              },
              { type: 'image_url', image_url: { url: dataUri } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Groq vision API error (${response.status}): ${body.substring(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Groq vision returned an empty response');
    }

    return content.trim();
  } finally {
    clearTimeout(timeout);
  }
}

export async function extractWithGroq(text: string): Promise<ExtractionResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Extract information from this biodata text:\n\n${text}` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        const isRateLimit = response.status === 429;
        const isTimeout = response.status === 504;

        if ((isRateLimit || isTimeout) && attempt < MAX_RETRIES - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 15000);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid Groq API key. Please check your GROQ_API_KEY.');
        }

        throw new Error(`Groq API error (${response.status}): ${body.substring(0, 200)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Groq returned an empty response');
      }

      return parseResponse(content);
    } catch (err: any) {
      lastError = err;
      if (err.message?.includes('API key') || err.message?.includes('Invalid')) {
        throw err;
      }
      if (attempt < MAX_RETRIES - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 15000);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  throw lastError || new Error('AI extraction failed after all retries');
}

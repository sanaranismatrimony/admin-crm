import type { ExtractionResult, ExtractedField } from '@/types';

function kv(text: string, patterns: (string | RegExp)[], flags = 'i'): string | null {
  for (const pattern of patterns) {
    const re = pattern instanceof RegExp ? pattern : new RegExp(
      `(?:^|\\n)\\s*` +
      pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
`\\s*[:.\\-–—]?\\s*(.+)\\s*(?:\\n|$)`,
      'm' + flags
    );
    const match = text.match(re);
    if (match) return match[1].trim();
  }
  return null;
}

function kvMulti(text: string, pattern: string | RegExp, flags = 'i'): string[] {
  const re = pattern instanceof RegExp ? pattern : new RegExp(
    `(?:^|\\n)\\s*` +
    pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    `\\s*[:.\\-–—]?\\s*(.+)\\s*(?:\\n|$)`,
    'gm' + flags
  );
  const matches: string[] = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    matches.push(m[1].trim());
  }
  return matches;
}

function findFirstLine(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  return lines[0] || '';
}

function matchSection(text: string, sectionName: string): string {
  const re = new RegExp(
    `(?:^|\\n)\\s*` +
    sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    `\\s*[:.\\-–—]?\\s*\\n?([\\s\\S]*?)(?:\\n\\s*\\n|$)`,
    'im'
  );
  const match = text.match(re);
  return match ? match[1].trim() : '';
}

function allPatterns(text: string, patterns: (string | RegExp)[], flags = 'i'): string | null {
  for (const p of patterns) {
    const re = p instanceof RegExp ? p : new RegExp(p, flags);
    const match = text.match(re);
    if (match) return match[1]?.trim() || match[0]?.trim() || null;
  }
  return null;
}

function str(value: string | null, confidence: 'high' | 'medium' | 'low' = 'medium'): ExtractedField<string> {
  if (!value || value.trim() === '') return { value: null, confidence: 'low' };
  return { value: value.trim(), confidence };
}

function num(value: number | null, confidence: 'high' | 'medium' | 'low' = 'medium'): ExtractedField<number> {
  if (value === null || isNaN(value)) return { value: null, confidence: 'low' };
  return { value, confidence };
}

export const GOTRAM_VARIANTS: Record<string, string> = {
  'kasyapa': 'Kasyapa', 'kashyapa': 'Kasyapa', 'kassapa': 'Kasyapa',
  'vasista': 'Vasista', 'vashista': 'Vasista', 'vasishta': 'Vasista',
  'atreyasa': 'Atreyasa', 'atreya': 'Atreyasa',
  'bharadwaja': 'Bharadwaja', 'bharadvaja': 'Bharadwaja',
  'viswamitra': 'Viswamitra', 'vishwamitra': 'Viswamitra',
  'srungara saala': 'Srungara Saala', 'srungarasaala': 'Srungara Saala',
  'srunugara saala': 'Srungara Saala',
  'koundinya': 'Koundinya', 'kaundinya': 'Koundinya',
  'dhanunjaya': 'Dhanunjaya', 'dhananjaya': 'Dhanunjaya',
  'ananda': 'Ananda', 'anandha': 'Ananda',
  'nagesa': 'Nagesa', 'nagesha': 'Nagesa',
  'manugula': 'Manugula', 'manugulla': 'Manugula',
  'kamakoti': 'Kamakoti', 'kamakshi': 'Kamakoti',
  'sankha': 'Sankha', 'sanka': 'Sankha',
  'yellavula': 'Yellavula',
  'siripurapu': 'Siripurapu',
  'devula': 'Devula',
  'kummari': 'Kummari',
  'nuka': 'Nuka',
  'dasa': 'Dasa',
  'kanumilli': 'Kanumilli',
  'vatsyayana': 'Vatsyayana',
  'pydi': 'Pydi',
  'setty': 'Setty',
  'vadapalli': 'Vadapalli',
  'sagi': 'Sagi',
  'gampa': 'Gampa',
  'nerella': 'Nerella',
  'karri': 'Karri',
  'dulla': 'Dulla',
  'sabbella': 'Sabbella',
  'tumu': 'Tumu',
  'pilli': 'Pilli',
  'gummadidala': 'Gummadidala',
  'chebrolu': 'Chebrolu',
  'mithinti': 'Mithinti',
  'nalluri': 'Nalluri',
  'dondapati': 'Dondapati',
  'medapati': 'Medapati',
  'gajula': 'Gajula',
  'sunkara': 'Sunkara',
  'vadlamudi': 'Vadlamudi',
  'kakarla': 'Kakarla',
  'kolli': 'Kolli',
  'guduru': 'Guduru',
  'vinnakota': 'Vinnakota',
  'kapuluru': 'Kapuluru',
  'yalamanchili': 'Yalamanchili',
};

export const RASHI_VARIANTS: Record<string, string> = {
  'mesham': 'Mesh', 'mesha': 'Mesh', 'aries': 'Mesh',
  'vrishabam': 'Vrishabh', 'vrishabha': 'Vrishabh', 'taurus': 'Vrishabh',
  'mithunam': 'Mithun', 'mithuna': 'Mithun', 'gemini': 'Mithun',
  'karkatakam': 'Kark', 'karkataka': 'Kark', 'cancer': 'Kark',
  'simham': 'Simha', 'simha': 'Simha', 'leo': 'Simha',
  'kanya': 'Kanya', 'virgo': 'Kanya',
  'tulam': 'Tula', 'tula': 'Tula', 'libra': 'Tula',
  'vrischikam': 'Vrishchik', 'vrischika': 'Vrishchik', 'scorpio': 'Vrishchik',
  'dhanusu': 'Dhanu', 'dhanus': 'Dhanu', 'sagittarius': 'Dhanu',
  'makaram': 'Makar', 'makara': 'Makar', 'capricorn': 'Makar',
  'kumbham': 'Kumbh', 'kumbha': 'Kumbh', 'aquarius': 'Kumbh',
  'meenam': 'Meen', 'meena': 'Meen', 'pisces': 'Meen',
};

export const NAKSHATRAM_VARIANTS: Record<string, string> = {
  'ashwini': 'Ashwini', 'aswini': 'Ashwini',
  'bharani': 'Bharani',
  'krittika': 'Krittika', 'karthika': 'Krittika', 'karthigai': 'Krittika',
  'rohini': 'Rohini',
  'mrigasira': 'Mrigashira', 'mrigashira': 'Mrigashira', 'mrigasiras': 'Mrigashira',
  'ardra': 'Ardra', 'arudra': 'Ardra',
  'punarvasu': 'Punarvasu', 'punarpusam': 'Punarvasu',
  'pushya': 'Pushya', 'pusyam': 'Pushya', 'poosam': 'Pushya',
  'aslesha': 'Ashlesha', 'ashlesha': 'Ashlesha', 'aayilyam': 'Ashlesha',
  'magha': 'Magha', 'makam': 'Magha',
  'purva phalguni': 'Purva Phalguni', 'purvaphalguni': 'Purva Phalguni', 'pooram': 'Purva Phalguni',
  'uttara phalguni': 'Uttara Phalguni', 'uttaraphalguni': 'Uttara Phalguni', 'uttaram': 'Uttara Phalguni',
  'hasta': 'Hasta', 'hastha': 'Hasta',
  'chitra': 'Chitra', 'chithra': 'Chitra', 'chitta': 'Chitra',
  'swati': 'Swati', 'svati': 'Swati', 'sowthi': 'Swati',
  'visakha': 'Vishakha', 'vishakha': 'Vishakha', 'visagam': 'Vishakha',
  'anuradha': 'Anuradha', 'anusham': 'Anuradha',
  'jyeshta': 'Jyeshtha', 'jyeshtha': 'Jyeshtha', 'kettai': 'Jyeshtha',
  'mula': 'Moola', 'moola': 'Moola',
  'purva ashadha': 'Purva Ashadha', 'purvashadha': 'Purva Ashadha', 'pooradam': 'Purva Ashadha',
  'uttara ashadha': 'Uttara Ashadha', 'uttarashadha': 'Uttara Ashadha', 'uthradam': 'Uttara Ashadha',
  'sravana': 'Shravana', 'shravana': 'Shravana', 'sravanam': 'Shravana', 'thiruvonam': 'Shravana',
  'dhanishta': 'Dhanishta', 'sravishtha': 'Dhanishta', 'avittam': 'Dhanishta',
  'sathabisha': 'Shatabhisha', 'shatabisha': 'Shatabhisha', 'sadhabisham': 'Shatabhisha',
  'purva bhadra': 'Purva Bhadrapada', 'purvabhadra': 'Purva Bhadrapada', 'poorattadhi': 'Purva Bhadrapada',
  'uttara bhadra': 'Uttara Bhadrapada', 'uttarabhadra': 'Uttara Bhadrapada', 'uttarattadhi': 'Uttara Bhadrapada',
  'revati': 'Revati', 'reavthi': 'Revati',
};

export function normalizeDict(value: string | null, dict: Record<string, string>): string | null {
  if (!value) return null;
  const key = value.toLowerCase().trim().replace(/\s+/g, ' ');
  if (dict[key]) return dict[key];
  for (const [k, v] of Object.entries(dict)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return value.trim();
}

export function ruleExtract(text: string): ExtractionResult {
  const docTitle = findFirstLine(text).toLowerCase();
  const lower = text.toLowerCase();

  const genderPatterns = [
    /(?:^|\n)\s*(?:gender|sex)\s*[:.\-]?\s*(male|female)\b/im,
    /(?:^|\n)\s*(?:i am|i'm)\s+(?:a\s+)?(male|female)\b/im,
  ];
  const genderMatch = allPatterns(text, genderPatterns);
  let gender: ExtractedField<string> = str(genderMatch, genderMatch ? 'high' : 'low');

  if (!gender.value) {
    if (/\bbride\b/i.test(docTitle)) gender = str('female', 'medium');
    else if (/\bgroom\b/i.test(docTitle)) gender = str('male', 'medium');
  }

  const brideKeywords = ['bride', 'daughter', 'girl', 'female', 'she'];
  const groomKeywords = ['groom', 'son', 'boy', 'male', 'he'];
  let isBride = 0, isGroom = 0;
  for (const kw of brideKeywords) if (lower.includes(kw)) isBride++;
  for (const kw of groomKeywords) if (lower.includes(kw)) isGroom++;

  let profileType: ExtractedField<string>;
  if (gender.value === 'female') {
    if (/\bsecond\s*marriage\b/i.test(lower) && /\b(?:bride|groom)\b/i.test(lower)) {
      profileType = str('second_marriage_bride', 'medium');
    } else if (/\bother\s*caste\b/i.test(lower)) {
      profileType = str('other_caste_bride', 'medium');
    } else {
      profileType = str('bride', 'medium');
    }
  } else if (gender.value === 'male') {
    if (/\bsecond\s*marriage\b/i.test(lower)) {
      profileType = str('second_marriage_groom', 'medium');
    } else if (/\bother\s*caste\b/i.test(lower)) {
      profileType = str('other_caste_groom', 'medium');
    } else {
      profileType = str('groom', 'medium');
    }
  } else {
    profileType = str(isBride > isGroom ? 'bride' : 'groom', 'low');
    if (gender.value === null) {
      gender = str(isBride > isGroom ? 'female' : 'male', 'low');
    }
  }

  const fullName = kv(text, [
    'Name of the (?:Bride|Groom)',
    '(?:Bride|Groom)\\s*(?:Name|s Name)',
    'Full Name',
    'Name',
    'Applicant Name',
  ], 'i') || (() => {
    const firstLine = findFirstLine(text);
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    for (const line of lines.slice(0, 5)) {
      if (/^[A-Z][a-zA-Z\s.]+$/.test(line) && line.split(/\s+/).length >= 2 &&
          !/^(?:name|biodata|profile|resume|matrimony)/i.test(line)) {
        return line;
      }
    }
    return null;
  })();

  const dateOfBirth = kv(text, [
    'Date of Birth',
    'DOB',
    'Birth Date',
    'Date Of Birth',
    'D\\.?O\\.?B\\.?',
  ]);

  const timeOfBirth = kv(text, [
    'Time of Birth',
    'Birth Time',
    'Time Of Birth',
    'TOB',
    'T\\.?O\\.?B\\.?',
    'Janma Samayam',
    'Birth Time',
  ]);

  const placeOfBirth = kv(text, [
    'Place of Birth',
    'Birth Place',
    'Place Of Birth',
    'Janma Sthanam',
    'Birth Place',
  ]);

  const ageText = kv(text, [
    'Age',
    'Current Age',
    'Age Now',
  ]);
  const ageNum = ageText ? parseInt(ageText) : null;
  const age = ageNum && !isNaN(ageNum) ? ageNum : null;

  const fullNameLower = (fullName || '').toLowerCase();
  let ageFromDob: number | null = null;
  if (dateOfBirth) {
    const dobMatch = dateOfBirth.match(/(\d{4})/);
    if (dobMatch) {
      ageFromDob = new Date().getFullYear() - parseInt(dobMatch[1]);
    }
  }

  const heightMatch = allPatterns(text, [
    /(?:height|stature|heigh)\s*[:.\-]?\s*(\d+)\s*['\u2019\u02CA]?\s*(?:ft\s*)?(\d*)\s*(?:"|\u201D|inches?|inch|in\b|'s)?/i,
    /(?:height|stature)\s*[:.\-]?\s*(\d+)\s*\.\s*(\d+)\s*(?:ft|feet|foot)?/i,
    /(?:height|stature)\s*[:.\-]?\s*(\d+)\s*(?:ft|feet|foot)\s*(\d*)\s*(?:in|inches?)?/i,
    /(?:height|stature)\s*[:.\-]?\s*(\d+)\s*(?:cm|cms?|centimeters?)\b/i,
  ]);
  let heightFeet: number | null = null;
  let heightInches: number | null = null;
  if (heightMatch) {
    const parts = heightMatch.match(/(\d+)/g);
    if (heightMatch.toLowerCase().includes('cm')) {
      const cm = parseInt(parts?.[1] || '0');
      if (cm > 0) {
        const totalInches = cm / 2.54;
        heightFeet = Math.floor(totalInches / 12);
        heightInches = Math.round(totalInches % 12);
      }
    } else if (parts) {
      heightFeet = parseInt(parts[0]);
      heightInches = parts.length > 1 ? parseInt(parts[1]) : 0;
    }
  }

  const weightMatch = kv(text, ['Weight', 'Body Weight']);
  const weight = weightMatch ? parseInt(weightMatch) : null;

  const gotramRaw = kv(text, [
    'Gothram',
    'Gotram',
    'Gothram',
    'Gotra',
    'Family Gothram',
    'Inti Peru',
    'Gothra',
  ]);
  const gotram = normalizeDict(gotramRaw, GOTRAM_VARIANTS) || gotramRaw || null;

  const rashiRaw = kv(text, [
    'Rashi',
    'Rasi',
    'Janma Rashi',
    'Zodiac',
    'Raasi',
  ]);
  const rashi = normalizeDict(rashiRaw, RASHI_VARIANTS) || rashiRaw || null;

  const nakshatraRaw = kv(text, [
    'Nakshatra',
    'Nakshatram',
    'Nakshathram',
    'Natchathiram',
    'Birth Star',
    'Star',
    'Nakshtra',
    'Nakshatra',
  ]);
  const nakshatram = normalizeDict(nakshatraRaw, NAKSHATRAM_VARIANTS) || nakshatraRaw || null;

  const padamText = kv(text, [
    'Padam',
    'Paadam',
    'Padham',
  ]);
  const padam = padamText ? padamText.match(/[1-4]/)?.[0] || null : null;

  const education = kv(text, [
    'Education',
    'Qualification',
    'Educational Qualification',
    'Academic Qualification',
    'Studies',
    'Education Qualification',
  ]);

  const educationQual = kv(text, [
    'Degree',
    'Education Details',
    'Educational Details',
  ]);

  const occupation = kv(text, [
    'Occupation',
    'Profession',
    'Job',
    'Employment',
    'Designation',
    'Working As',
    'Service',
  ]);

  const career = kv(text, [
    'Career',
    'Field',
    'Work Field',
    'Industry',
  ]);

  const salaryText = kv(text, [
    'Salary',
    'Annual Income',
    'Income',
    'CTC',
    'Package',
    'Yearly Income',
    'Monthly Income',
    'Expected Salary',
  ]);

  const businessName = kv(text, [
    'Business Name',
    'Business',
    'Company Name',
    'Firm Name',
  ]);

  const businessType = kv(text, [
    'Business Type',
    'Type of Business',
    'Nature of Business',
  ]);

  const annualIncome = kv(text, [
    'Annual Income',
    'Yearly Income',
    'Business Income',
    'Total Income',
  ]);

  const nativePlace = kv(text, [
    'Native Place',
    'Native',
    'Hometown',
    'Home Town',
    'Place of Origin',
  ]);

  const cityText = kv(text, [
    'City',
    'Village',
    'Residence',
    'Current City',
    'Residing At',
    'Present Address.*?\\n?\\s*(\\w+)',
  ]);

  const district = kv(text, [
    'District',
    'Dist',
  ]);

  const state = kv(text, [
    'State',
  ]);

  const fatherName = kv(text, [
    "Father's Name",
    'Father Name',
    'Fathers Name',
    'Father',
  ]);

  const fatherOcc = kv(text, [
    "Father's Occupation",
    'Father Occupation',
    "Father's Profession",
  ]);

  const motherName = kv(text, [
    "Mother's Name",
    'Mother Name',
    'Mothers Name',
    'Mother',
  ]);

  const motherSurname = kv(text, [
    "Mother's Surname",
    'Mother Surname',
    "Mother's Maiden Name",
    "Mother's Gotram",
  ]);

  const motherGotramRaw = kv(text, [
    "Mother's Gotram",
    'Mother Gotram',
    'Mother Gothram',
  ]);
  const motherGotram = normalizeDict(motherGotramRaw, GOTRAM_VARIANTS) || motherGotramRaw || null;

  const siblingsSection = matchSection(text, 'Siblings');
  const siblings = siblingsSection ||
    kv(text, [
      'Siblings',
      'Brother',
      'Sister',
      'Brothers and Sisters',
      'Brothers & Sisters',
    ]);

  const familyBg = matchSection(text, 'Family Background') ||
    kv(text, ['Family Background', 'Family Details', 'Family Info']);

  const propertyDetails = matchSection(text, 'Property') ||
    kv(text, ['Property Details', 'Properties', 'Property']);

  const familyValues = kv(text, [
    'Family Values',
    'Family Type',
    'Family Status',
  ]);

  const additionalInfo = matchSection(text, 'Additional') ||
    kv(text, [
      'Additional Info',
      'Additional Information',
      'Other Info',
      'About Me',
      'About Us',
    ]);

  const caste = kv(text, [
    'Caste',
    'Community',
    'Sub Caste',
    'Subcaste',
  ]);

  const phone = allPatterns(text, [
    /(?:phone|mobile|contact|whatsapp|cell|tel|telephone)\s*[:.\-]?\s*(\+?[\d\s\-()]{8,17})/i,
    /(\+?91[-\s]?[6-9]\d{9})\b/,
    /(\+?91[-\s]?\d{10})\b/,
    /(0\d{10})\b/,
    /\b([6-9]\d{9})\b/,
  ]);

  const whatsappRaw = allPatterns(text, [
    /(?:whatsapp|whats app|watsapp)\s*[:.\-]?\s*(\+?[\d\s\-()]{8,17})/i,
  ]);
  const whatsappVal = whatsappRaw || phone;

  const email = allPatterns(text, [
    /(?:email|e-mail|mail)\s*[:.\-]?\s*([\w._%+\-]+@[\w.\-]+\.[a-z]{2,})/i,
    /\b([\w._%+\-]+@[\w.\-]+\.[a-z]{2,})\b/i,
  ]);

  const addressSection = matchSection(text, 'Address') ||
    matchSection(text, 'Contact Address') ||
    matchSection(text, 'Permanent Address') ||
    matchSection(text, 'Postal Address') ||
    matchSection(text, 'Residential Address');

  const address = addressSection || kv(text, [
    'Address',
    'Present Address',
    'Mailing Address',
  ]);

  const expectedAgeRaw = kv(text, [
    'Expected Age',
    'Age Preference',
    'Preferred Age',
    'Age Expectation',
  ]);
  let expectedAgeMin: number | null = null;
  let expectedAgeMax: number | null = null;
  if (expectedAgeRaw) {
    const range = expectedAgeRaw.match(/(\d+)\s*(?:-|to|–)\s*(\d+)/);
    if (range) {
      expectedAgeMin = parseInt(range[1]);
      expectedAgeMax = parseInt(range[2]);
    } else {
      const single = expectedAgeRaw.match(/(\d+)/);
      if (single) expectedAgeMin = parseInt(single[1]);
    }
  }

  const expectedHeightRaw = kv(text, [
    'Expected Height',
    'Height Preference',
    'Preferred Height',
  ]);
  let expectedHeightMin: number | null = null;
  let expectedHeightMax: number | null = null;
  if (expectedHeightRaw) {
    const range = expectedHeightRaw.match(/(\d+)\s*(?:-|to|–)\s*(\d+)/);
    if (range) {
      expectedHeightMin = parseInt(range[1]);
      expectedHeightMax = parseInt(range[2]);
    }
  }

  const educationPref = kv(text, [
    'Education Preference',
    'Preferred Education',
    'Education Expectation',
  ]);

  const occupationPref = kv(text, [
    'Occupation Preference',
    'Preferred Occupation',
  ]);

  const locationPref = kv(text, [
    'Location Preference',
    'Preferred Location',
    'City Preference',
  ]);

  const communityPref = kv(text, [
    'Community Preference',
    'Caste Preference',
    'Preferred Community',
  ]);

  const otherExpectations = matchSection(text, 'Expectations') ||
    kv(text, [
      'Other Expectations',
      'Expectations',
      'Other Preferences',
    ]);

  function conf(value: unknown, method: 'direct' | 'regex'): 'high' | 'medium' | 'low' {
    if (value === null || value === undefined) return 'low';
    if (method === 'direct') return 'high';
    return 'medium';
  }

  const fields = {
    full_name: str(fullName, fullName ? conf(fullName, 'regex') : 'low'),
    date_of_birth: str(dateOfBirth, dateOfBirth ? 'high' : 'low'),
    time_of_birth: str(timeOfBirth, timeOfBirth ? 'high' : 'low'),
    place_of_birth: str(placeOfBirth, placeOfBirth ? 'medium' : 'low'),
    age: num(age ?? ageFromDob, age !== null ? 'high' : (ageFromDob !== null ? 'medium' : 'low')),
    height_feet: num(heightFeet, heightFeet ? 'medium' : 'low'),
    height_inches: num(heightInches, heightInches ? 'medium' : 'low'),
    weight: num(weight, weight ? 'medium' : 'low'),
    profile_type: profileType,
    gender: gender,
    caste: str(caste, caste ? 'medium' : 'low'),
    gotram: str(gotram, gotram ? 'medium' : 'low'),
    rashi: str(rashi, rashi ? 'medium' : 'low'),
    nakshatram: str(nakshatram, nakshatram ? 'medium' : 'low'),
    padam: str(padam, padam ? 'high' : 'low'),
    education: str(education, education ? 'medium' : 'low'),
    education_qualification: str(educationQual, educationQual ? 'medium' : 'low'),
    career: str(career, career ? 'medium' : 'low'),
    occupation: str(occupation, occupation ? 'medium' : 'low'),
    salary: str(salaryText, salaryText ? 'medium' : 'low'),
    business_name: str(businessName, businessName ? 'medium' : 'low'),
    business_type: str(businessType, businessType ? 'medium' : 'low'),
    annual_income: str(annualIncome, annualIncome ? 'medium' : 'low'),
    state: str(state, state ? 'medium' : 'low'),
    district: str(district, district ? 'medium' : 'low'),
    city: str(cityText, cityText ? 'medium' : 'low'),
    native_place: str(nativePlace, nativePlace ? 'medium' : 'low'),
    father_name: str(fatherName, fatherName ? 'high' : 'low'),
    father_occupation: str(fatherOcc, fatherOcc ? 'medium' : 'low'),
    mother_name: str(motherName, motherName ? 'high' : 'low'),
    mother_surname: str(motherSurname, motherSurname ? 'medium' : 'low'),
    mother_gotram: str(motherGotram, motherGotram ? 'medium' : 'low'),
    siblings: str(siblings, siblings ? 'medium' : 'low'),
    family_background: str(familyBg, familyBg ? 'medium' : 'low'),
    property_details: str(propertyDetails, propertyDetails ? 'medium' : 'low'),
    family_values: str(familyValues, familyValues ? 'medium' : 'low'),
    additional_info: str(additionalInfo, additionalInfo ? 'medium' : 'low'),
    expected_age_min: num(expectedAgeMin, expectedAgeMin ? 'medium' : 'low'),
    expected_age_max: num(expectedAgeMax, expectedAgeMax ? 'medium' : 'low'),
    expected_height_min: num(expectedHeightMin, expectedHeightMin ? 'medium' : 'low'),
    expected_height_max: num(expectedHeightMax, expectedHeightMax ? 'medium' : 'low'),
    education_preference: str(educationPref, educationPref ? 'medium' : 'low'),
    occupation_preference: str(occupationPref, occupationPref ? 'medium' : 'low'),
    location_preference: str(locationPref, locationPref ? 'medium' : 'low'),
    community_preference: str(communityPref, communityPref ? 'medium' : 'low'),
    other_expectations: str(otherExpectations, otherExpectations ? 'medium' : 'low'),
    phone: str(phone, phone ? 'high' : 'low'),
    whatsapp: str(whatsappVal, whatsappVal ? 'high' : 'low'),
    email: str(email, email ? 'high' : 'low'),
    address: str(address, address ? 'medium' : 'low'),
  };

  const fieldCount = Object.values(fields).filter(f => f.value !== null).length;

  return { fields, raw_text: text, field_count: fieldCount };
}

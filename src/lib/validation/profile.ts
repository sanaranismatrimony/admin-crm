import { z } from 'zod';

const profileTypeEnum = z.enum(['bride', 'groom', 'second_marriage_bride', 'second_marriage_groom', 'other_caste_bride', 'other_caste_groom']);
const genderEnum = z.enum(['male', 'female']);
const statusEnum = z.enum(['active', 'inactive']);

const visibilitySettingsSchema = z.object({
  show_location: z.boolean(),
  show_expectations: z.boolean(),
  show_contact: z.boolean(),
}).optional();

export const profileSchema = z.object({
  profile_type: profileTypeEnum,
  gender: genderEnum,
  status: statusEnum.default('active'),
  show_full_profile: z.coerce.boolean().default(false),
  visibility_settings: visibilitySettingsSchema,

  full_name: z.string().min(1, 'Full Name is required'),
  date_of_birth: z.string().min(1, 'Date of Birth is required'),
  time_of_birth: z.string().min(1, 'Time of Birth is required'),
  place_of_birth: z.string().min(1, 'Place of Birth is required'),
  age: z.coerce.number().int().min(18, 'Age must be at least 18').max(100, 'Age must be at most 100'),
  height_feet: z.coerce.number().int().min(1).max(8),
  height_inches: z.coerce.number().int().min(0).max(11),
  weight: z.preprocess(
    (v) => (v === '' || v === null || v === undefined) ? undefined : v,
    z.coerce.number().int().min(20).max(200).optional()
  ),

  caste: z.string(),
  gotram: z.string().min(1, 'Gotram is required'),
  rashi: z.string().min(1, 'Rashi is required'),
  nakshatram: z.string().min(1, 'Nakshatram is required'),
  padam: z.string().min(1, 'Padam is required'),

  education: z.string().optional().default(''),
  education_qualification: z.string().optional().default(''),
  career: z.string().optional().default(''),
  occupation: z.string().optional().default(''),
  salary: z.string().optional().default(''),
  business_name: z.string().optional().default(''),
  business_type: z.string().optional().default(''),
  annual_income: z.string().optional().default(''),

  state: z.string().min(1, 'State is required'),
  district: z.string().optional().default(''),
  city: z.string().min(1, 'City is required'),
  native_place: z.string().min(1, 'Native Place is required'),

  father_name: z.string().min(1, 'Father Name is required'),
  father_occupation: z.string().min(1, 'Father Occupation is required'),
  mother_name: z.string().min(1, 'Mother Name is required'),
  mother_surname: z.string().min(1, 'Mother Surname is required'),
  mother_gotram: z.string().min(1, 'Mother Gotram is required'),

  family_background: z.string().optional().default(''),
  property_details: z.string().optional().default(''),
  family_values: z.string().optional().default(''),
  additional_info: z.string().optional().default(''),

  expected_age_min: z.coerce.number().int().min(0).default(0),
  expected_age_max: z.coerce.number().int().min(0).default(0),
  expected_height_min: z.coerce.number().int().min(0).default(0),
  expected_height_max: z.coerce.number().int().min(0).default(0),
  education_preference: z.string().optional().default(''),
  occupation_preference: z.string().optional().default(''),
  location_preference: z.string().optional().default(''),
  community_preference: z.string().optional().default(''),
  other_expectations: z.string().optional().default(''),

  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number'),
  whatsapp: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional().default(''),
  admin_notes: z.string().optional().default(''),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export function parseProfileForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return profileSchema.safeParse(raw);
}

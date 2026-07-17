export type ProfileType = 'bride' | 'groom' | 'second_marriage_bride' | 'second_marriage_groom' | 'other_caste_bride' | 'other_caste_groom';

export type ProfileStatus = 'active' | 'inactive';

export type Gender = 'male' | 'female';

export type InterestStatus = 'interested' | 'not_interested' | 'need_more_time' | null;

export type MatchStage =
  | 'shared'                // First profile sent to the other party
  | 'responded'             // Recipient said interested
  | 'both_shared'           // Second profile shared back
  | 'both_responded'        // Both sides interested (mutual interest)
  | 'contact_shared'        // Contact details disclosed to both families
  | 'family_communication'  // Families talking (conference call etc.)
  | 'first_meeting'         // Groom's family visited bride
  | 'second_meeting'        // Bride's family visited groom
  | 'final_meeting'         // Final meeting — alliance talk
  | 'match_fixed'           // Match confirmed by both families
  | 'payment_pending'       // Awaiting payment collection
  | 'completed'             // Marriage completed
  | 'rejected'              // One party rejected
  | 'cancelled';            // Admin cancelled for operational reasons

export type InitiatedBy = 'bride' | 'groom';

export type PaymentStatus = 'pending' | 'paid';

export interface Sibling {
  id?: string;
  profile_id?: string;
  name: string;
  gender: Gender;
  marital_status: 'married' | 'unmarried';
  occupation: string;
}

export interface VisibilitySettings {
  show_location: boolean;
  show_expectations: boolean;
  show_contact: boolean;
}

export interface Profile {
  id: string;
  profile_id: string;
  profile_type: ProfileType;
  gender: Gender;
  status: ProfileStatus;
  show_full_profile: boolean;
  visibility_settings: VisibilitySettings;

  full_name: string;
  date_of_birth: string;
  time_of_birth: string;
  place_of_birth: string;
  age: number;
  height_feet: number;
  height_inches: number;
  weight: number;

  caste: string;
  gotram: string;
  rashi: string;
  nakshatram: string;
  padam: string;

  education: string;
  education_qualification: string;
  career: string;
  occupation: string;
  salary: string;
  business_name: string;
  business_type: string;
  annual_income: string;

  state: string;
  district: string;
  city: string;
  native_place: string;

  father_name: string;
  father_occupation: string;
  mother_name: string;
  mother_surname: string;
  mother_gotram: string;

  family_background: string;
  property_details: string;
  family_values: string;
  additional_info: string;

  expected_age_min: number;
  expected_age_max: number;
  expected_height_min: number;
  expected_height_max: number;
  education_preference: string;
  occupation_preference: string;
  location_preference: string;
  community_preference: string;
  other_expectations: string;

  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  admin_notes: string;

  photo_urls: string[];
  biodata_original: string;
  biodata_card: string;

  created_at: string;
  updated_at: string;
}

export interface ProfileShare {
  id: string;
  profile_id: string;
  match_id: string | null;
  share_token: string;
  recipient_name: string;
  recipient_phone: string;
  shared_by: string;
  shared_date: string;
  viewed_at: string | null;
  view_count: number;
  interest_status: InterestStatus;
  notes: string;
  can_view_contact: boolean;
  can_view_location: boolean;
  is_revoked: boolean;
  revoked_at: string | null;
}

export interface ProfileView {
  id: string;
  share_token: string;
  profile_id: string;
  ip_address: string;
  user_agent: string;
  viewed_at: string;
}

export interface Match {
  id: string;
  bride_profile_id: string;
  groom_profile_id: string;
  stage: MatchStage;
  initiated_by: InitiatedBy;
  bride_interest: InterestStatus;
  groom_interest: InterestStatus;

  // Sharing timestamps
  shared_to_bride_at: string | null;
  shared_to_groom_at: string | null;

  // Post mutual-interest stages
  contact_shared_at: string | null;
  family_communication_at: string | null;

  // Meeting stages (optional)
  first_meeting_date: string | null;
  first_meeting_notes: string;
  second_meeting_date: string | null;
  second_meeting_notes: string;
  final_meeting_date: string | null;
  final_meeting_notes: string;

  // Confirmation
  match_fixed_date: string | null;
  payment_pending_at: string | null;
  confirmed_date: string | null;

  // On-hold (flag, not a stage)
  is_on_hold: boolean;
  on_hold_at: string | null;
  on_hold_reason: string;

  // Rejection (terminal)
  rejected_by: string | null;
  rejected_at: string | null;

  // Cancellation (terminal)
  cancelled_at: string | null;
  cancel_reason: string | null;

  // Wedding completion
  wedding_date: string | null;
  wedding_photos: string[];
  success_story: string;

  // Admin
  certificate_url: string;
  admin_notes: string;
  created_at: string;
}

export interface Payment {
  id: string;
  match_id: string;
  payment_for: string; // 'bride' or 'groom'
  amount: number;
  status: PaymentStatus;
  paid_date: string;
  notes: string;
  created_at: string;
}

export interface Family {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  created_at: string;
}

// ─── Biodata Extraction ─────────────────────────────────

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ExtractedField<T> {
  value: T | null;
  confidence: ConfidenceLevel;
}

export interface ExtractionResult {
  fields: {
    full_name: ExtractedField<string>;
    date_of_birth: ExtractedField<string>;
    time_of_birth: ExtractedField<string>;
    place_of_birth: ExtractedField<string>;
    age: ExtractedField<number>;
    height_feet: ExtractedField<number>;
    height_inches: ExtractedField<number>;
    weight: ExtractedField<number>;
    profile_type: ExtractedField<string>;
    gender: ExtractedField<string>;
    caste: ExtractedField<string>;
    gotram: ExtractedField<string>;
    rashi: ExtractedField<string>;
    nakshatram: ExtractedField<string>;
    padam: ExtractedField<string>;
    education: ExtractedField<string>;
    education_qualification: ExtractedField<string>;
    career: ExtractedField<string>;
    occupation: ExtractedField<string>;
    salary: ExtractedField<string>;
    business_name: ExtractedField<string>;
    business_type: ExtractedField<string>;
    annual_income: ExtractedField<string>;
    state: ExtractedField<string>;
    district: ExtractedField<string>;
    city: ExtractedField<string>;
    native_place: ExtractedField<string>;
    father_name: ExtractedField<string>;
    father_occupation: ExtractedField<string>;
    mother_name: ExtractedField<string>;
    mother_surname: ExtractedField<string>;
    mother_gotram: ExtractedField<string>;
    siblings: ExtractedField<string>;
    family_background: ExtractedField<string>;
    property_details: ExtractedField<string>;
    family_values: ExtractedField<string>;
    additional_info: ExtractedField<string>;
    expected_age_min: ExtractedField<number>;
    expected_age_max: ExtractedField<number>;
    expected_height_min: ExtractedField<number>;
    expected_height_max: ExtractedField<number>;
    education_preference: ExtractedField<string>;
    occupation_preference: ExtractedField<string>;
    location_preference: ExtractedField<string>;
    community_preference: ExtractedField<string>;
    other_expectations: ExtractedField<string>;
    phone: ExtractedField<string>;
    whatsapp: ExtractedField<string>;
    email: ExtractedField<string>;
    address: ExtractedField<string>;
  };
  raw_text: string;
  field_count: number;
}

export type ExtractStage = 'uploading' | 'analyzing' | 'extracting' | 'done' | 'error';

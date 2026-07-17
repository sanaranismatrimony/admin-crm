'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Upload, Image, Tag, User, Compass, GraduationCap, MapPin, Users, ClipboardList, Heart, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { SiblingForm } from './SiblingForm';
import { PhotoUpload } from './PhotoUpload';
import { BiodataUpload } from './BiodataUpload';
import { createProfile, deleteProfilePhotos, updateProfile, checkDuplicateProfile } from '@/lib/db/profiles';
import type { Profile, ProfileType, Sibling, ExtractionResult, ConfidenceLevel } from '@/types';

const profileTypeOptions = [
  { value: 'bride', label: 'Bride' },
  { value: 'groom', label: 'Groom' },
  { value: 'second_marriage_bride', label: 'Second Marriage Bride' },
  { value: 'second_marriage_groom', label: 'Second Marriage Groom' },
  { value: 'other_caste_bride', label: 'Other Caste Bride' },
  { value: 'other_caste_groom', label: 'Other Caste Groom' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const rashiOptions = [
  { value: 'Mesh', label: 'Mesh - Aries' },
  { value: 'Vrishabh', label: 'Vrishabh - Taurus' },
  { value: 'Mithun', label: 'Mithun - Gemini' },
  { value: 'Kark', label: 'Kark - Cancer' },
  { value: 'Simha', label: 'Simha - Leo' },
  { value: 'Kanya', label: 'Kanya - Virgo' },
  { value: 'Tula', label: 'Tula - Libra' },
  { value: 'Vrishchik', label: 'Vrishchik - Scorpio' },
  { value: 'Dhanu', label: 'Dhanu - Sagittarius' },
  { value: 'Makar', label: 'Makar - Capricorn' },
  { value: 'Kumbh', label: 'Kumbh - Aquarius' },
  { value: 'Meen', label: 'Meen - Pisces' },
];

const nakshatramOptions = [
  { value: 'Ashwini', label: 'Ashwini' },
  { value: 'Bharani', label: 'Bharani' },
  { value: 'Krittika', label: 'Krittika' },
  { value: 'Rohini', label: 'Rohini' },
  { value: 'Mrigashira', label: 'Mrigashira' },
  { value: 'Ardra', label: 'Ardra' },
  { value: 'Punarvasu', label: 'Punarvasu' },
  { value: 'Pushya', label: 'Pushya' },
  { value: 'Ashlesha', label: 'Ashlesha' },
  { value: 'Magha', label: 'Magha' },
  { value: 'Purva Phalguni', label: 'Purva Phalguni' },
  { value: 'Uttara Phalguni', label: 'Uttara Phalguni' },
  { value: 'Hasta', label: 'Hasta' },
  { value: 'Chitra', label: 'Chitra' },
  { value: 'Swati', label: 'Swati' },
  { value: 'Vishakha', label: 'Vishakha' },
  { value: 'Anuradha', label: 'Anuradha' },
  { value: 'Jyeshtha', label: 'Jyeshtha' },
  { value: 'Moola', label: 'Moola' },
  { value: 'Purva Ashadha', label: 'Purva Ashadha' },
  { value: 'Uttara Ashadha', label: 'Uttara Ashadha' },
  { value: 'Shravana', label: 'Shravana' },
  { value: 'Dhanishta', label: 'Dhanishta' },
  { value: 'Shatabhisha', label: 'Shatabhisha' },
  { value: 'Purva Bhadrapada', label: 'Purva Bhadrapada' },
  { value: 'Uttara Bhadrapada', label: 'Uttara Bhadrapada' },
  { value: 'Revati', label: 'Revati' },
];

const padamOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
];

const genderMap: Record<ProfileType, 'male' | 'female'> = {
  bride: 'female',
  groom: 'male',
  second_marriage_bride: 'female',
  second_marriage_groom: 'male',
  other_caste_bride: 'female',
  other_caste_groom: 'male',
};

interface ProfileFormProps {
  profile?: Profile;
  siblings?: Sibling[];
  mode: 'create' | 'edit';
}

type SectionKey =
  | 'photos' | 'classification' | 'personal' | 'community'
  | 'education' | 'location' | 'family' | 'background'
  | 'expectations' | 'contact';

const sectionLabels: Record<SectionKey, string> = {
  photos: 'Profile Photos',
  classification: 'Classification & Status',
  personal: 'Personal & Birth Details',
  community: 'Community Details',
  education: 'Education & Career',
  location: 'Location',
  family: 'Family Details',
  background: 'Additional Background',
  expectations: 'Partner Expectations',
  contact: 'Contact Details',
};

const sectionIcons: Record<SectionKey, React.ReactNode> = {
  photos: <Image className="w-4 h-4" />,
  classification: <Tag className="w-4 h-4" />,
  personal: <User className="w-4 h-4" />,
  community: <Compass className="w-4 h-4" />,
  education: <GraduationCap className="w-4 h-4" />,
  location: <MapPin className="w-4 h-4" />,
  family: <Users className="w-4 h-4" />,
  background: <ClipboardList className="w-4 h-4" />,
  expectations: <Heart className="w-4 h-4" />,
  contact: <Phone className="w-4 h-4" />,
};

const alphabetPattern = '^[A-Za-z\\s]+$';
const alphaSpecialPattern = '^[A-Za-z\\s\\.,\\-\\&\\(\\)\\/]+$';

function FormSection({ section, children }: { section: SectionKey; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {sectionIcons[section]}
          <h3 className="text-base font-semibold text-[var(--brown)]">{sectionLabels[section]}</h3>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${cols === 1 ? '' : 'sm:grid-cols-2'}`}>
      {children}
    </div>
  );
}

export function ProfileForm({ profile, siblings: initialSiblings, mode }: ProfileFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>(profile?.photo_urls || []);
  const [removedPhotoUrls, setRemovedPhotoUrls] = useState<string[]>([]);
  const [siblings, setSiblings] = useState<Sibling[]>(initialSiblings || []);
  const [autoFillData, setAutoFillData] = useState<ExtractionResult | null>(null);
  const [normalizedFields, setNormalizedFields] = useState<ExtractionResult['fields'] | null>(null);
  const [confidenceMap, setConfidenceMap] = useState<Record<string, ConfidenceLevel>>({});
  const [profileType, setProfileType] = useState<string>(profile?.profile_type || '');
  const [gender, setGender] = useState<string>(profile?.gender || '');
  const [isKalingaVysya, setIsKalingaVysya] = useState(!profile?.caste || profile?.caste === 'Kalinga Vysya');
  const [otherCaste, setOtherCaste] = useState(profile?.caste && profile?.caste !== 'Kalinga Vysya' ? profile.caste : '');
  const [whatsappSame, setWhatsappSame] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneValue, setPhoneValue] = useState(profile?.phone || '');
  const [whatsappValue, setWhatsappValue] = useState(profile?.whatsapp || '');

  useEffect(() => {
    if (profileType && genderMap[profileType as ProfileType]) {
      setGender(genderMap[profileType as ProfileType]);
    }
  }, [profileType]);

  useEffect(() => {
    setPhoneValue(profile?.phone || '');
    setWhatsappValue(profile?.whatsapp || '');
  }, [profile?.id, profile?.phone, profile?.whatsapp]);

  useEffect(() => {
    const source = normalizedFields || autoFillData?.fields;
    if (!source) return;
    const f = formRef.current;
    if (!f) return;

    const fields = source as any;

    function setFieldValue(name: string, value: unknown) {
      if (value === null || value === undefined) return;
      const el = f!.querySelector(`[name="${name}"]`) as HTMLElement | null;
      if (!el) return;

      if (el.tagName === 'SELECT') {
        (el as HTMLSelectElement).value = String(value);
        (el as HTMLSelectElement).dispatchEvent(new Event('change', { bubbles: true }));
      } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        const input = el as HTMLInputElement | HTMLTextAreaElement;
        const nativeSetter = Object.getOwnPropertyDescriptor(
          el.tagName === 'TEXTAREA' 
            ? window.HTMLTextAreaElement.prototype 
            : window.HTMLInputElement.prototype, 
          'value'
        )?.set;
        if (nativeSetter) {
          nativeSetter.call(input, String(value));
        } else {
          input.value = String(value);
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Set profile_type and gender first (they affect other fields)
    if (fields.profile_type?.value) {
      setFieldValue('profile_type', fields.profile_type.value);
      setProfileType(String(fields.profile_type.value));
    }
    if (fields.gender?.value) {
      setFieldValue('gender', fields.gender.value);
      setGender(String(fields.gender.value));
    }

    // Auto-calculate age from DOB if age not provided
    if (fields.date_of_birth?.value && !fields.age?.value) {
      const dob = new Date(String(fields.date_of_birth.value));
      if (!isNaN(dob.getTime())) {
        const today = new Date();
        let calculatedAge = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          calculatedAge--;
        }
        if (calculatedAge > 0 && calculatedAge < 150) {
          setFieldValue('age', calculatedAge);
        }
      }
    }

    // Set all other fields
    const fieldName = [
      'full_name', 'date_of_birth', 'time_of_birth', 'place_of_birth', 'age',
      'height_feet', 'height_inches', 'weight',
      'gotram', 'education', 'education_qualification', 'career', 'occupation',
      'salary', 'business_name', 'business_type', 'annual_income',
      'state', 'district', 'city', 'native_place',
      'father_name', 'father_occupation', 'mother_name', 'mother_surname', 'mother_gotram',
      'family_background', 'property_details', 'family_values', 'additional_info',
      'expected_age_min', 'expected_age_max', 'expected_height_min', 'expected_height_max',
      'education_preference', 'occupation_preference', 'location_preference', 'community_preference',
      'other_expectations', 'phone', 'whatsapp', 'email', 'address',
    ];

    for (const name of fieldName) {
      const f = fields[name];
      if (f?.value !== null && f?.value !== undefined) {
        setFieldValue(name, f.value);
      }
    }

    // Handle caste separately (checkbox logic)
    if (fields.caste?.value) {
      const casteVal = String(fields.caste.value).trim();
      const isKV = casteVal.toLowerCase() === 'kalinga vysya';
      setIsKalingaVysya(isKV);
      if (!isKV) setOtherCaste(casteVal);
    }

    // Set rashi, nakshatram, padam (selects)
    if (fields.rashi?.value) setFieldValue('rashi', fields.rashi.value);
    if (fields.nakshatram?.value) setFieldValue('nakshatram', fields.nakshatram.value);
    if (fields.padam?.value) setFieldValue('padam', fields.padam.value);

    // Sync phone to whatsapp if whatsapp not explicitly provided
    if (fields.phone?.value && !fields.whatsapp?.value) {
      setWhatsappSame(true);
      setWhatsappValue(String(fields.phone.value));
    } else if (fields.whatsapp?.value) {
      setWhatsappValue(String(fields.whatsapp.value));
    }
  }, [autoFillData, normalizedFields]);

  function handleExtracted(data: ExtractionResult, normalized?: ExtractionResult['fields']) {
    setAutoFillData(data);
    if (normalized) setNormalizedFields(normalized);
    const map: Record<string, ConfidenceLevel> = {};
    const src = normalized || data.fields;
    if (src) {
      for (const [key, field] of Object.entries(src)) {
        if (field.value !== null) map[key] = field.confidence;
      }
    }
    setConfidenceMap(map);
  }

  function validate(formEl: HTMLFormElement): boolean {
    const errs: Record<string, string> = {};

    const fd = new FormData(formEl);

    const getVal = (name: string): string => (fd.get(name) as string || '').trim();

    const profileTypeVal = getVal('profile_type');
    if (!profileTypeVal) errs['profile_type'] = 'Category is required';

    const statusVal = getVal('status');
    if (!statusVal) errs['status'] = 'Status is required';

    const fullName = getVal('full_name');
    if (!fullName) errs['full_name'] = 'Full Name is required';
    else if (!/^[A-Za-z\s]+$/.test(fullName)) errs['full_name'] = 'Only alphabets allowed';

    const dob = getVal('date_of_birth');
    if (!dob) errs['date_of_birth'] = 'Date of Birth is required';

    const tob = getVal('time_of_birth');
    if (!tob) errs['time_of_birth'] = 'Time of Birth is required';

    const placeOfBirth = getVal('place_of_birth');
    if (!placeOfBirth) errs['place_of_birth'] = 'Place of Birth is required';
    else if (!/^[A-Za-z\s]+$/.test(placeOfBirth)) errs['place_of_birth'] = 'Only alphabets allowed';

    const age = getVal('age');
    if (!age) errs['age'] = 'Age is required';

    const heightFeet = getVal('height_feet');
    if (!heightFeet) errs['height_feet'] = 'Height is required';

    const heightInches = getVal('height_inches');
    if (!heightInches) errs['height_inches'] = 'Inches is required';

    if (!isKalingaVysya && !otherCaste.trim()) errs['other_caste'] = 'Please specify caste';
    if (!isKalingaVysya && otherCaste.trim() && !/^[A-Za-z\s]+$/.test(otherCaste.trim())) errs['other_caste'] = 'Only alphabets allowed';

    const gotram = getVal('gotram');
    if (!gotram) errs['gotram'] = 'Gotram is required';

    const rashi = getVal('rashi');
    if (!rashi) errs['rashi'] = 'Rashi is required';

    const nakshatram = getVal('nakshatram');
    if (!nakshatram) errs['nakshatram'] = 'Nakshatram is required';

    const padam = getVal('padam');
    if (!padam) errs['padam'] = 'Padam is required';

    const education = getVal('education');
    if (education && !/^[A-Za-z\s\.,\-&()\/]+$/.test(education)) errs['education'] = 'No numbers allowed';

    const eduQual = getVal('education_qualification');
    if (eduQual && !/^[A-Za-z\s\.,\-&()\/]+$/.test(eduQual)) errs['education_qualification'] = 'No numbers allowed';

    const career = getVal('career');
    if (career && !/^[A-Za-z\s\.,\-&()\/]+$/.test(career)) errs['career'] = 'No numbers allowed';

    const occupation = getVal('occupation');
    if (occupation && !/^[A-Za-z\s\.,\-&()\/]+$/.test(occupation)) errs['occupation'] = 'No numbers allowed';

    const salary = getVal('salary');
    if (salary && !/^[A-Za-z0-9\s\/,]+$/.test(salary)) errs['salary'] = 'Only alphanumeric allowed';

    const annualIncome = getVal('annual_income');
    if (annualIncome && !/^[A-Za-z0-9\s\/,]+$/.test(annualIncome)) errs['annual_income'] = 'Only alphanumeric allowed';

    const state = getVal('state');
    if (!state) errs['state'] = 'State is required';
    else if (!/^[A-Za-z\s]+$/.test(state)) errs['state'] = 'Only alphabets allowed';

    const city = getVal('city');
    if (!city) errs['city'] = 'City is required';
    else if (!/^[A-Za-z\s]+$/.test(city)) errs['city'] = 'Only alphabets allowed';

    const nativePlace = getVal('native_place');
    if (!nativePlace) errs['native_place'] = 'Native Place is required';
    else if (!/^[A-Za-z\s]+$/.test(nativePlace)) errs['native_place'] = 'Only alphabets allowed';

    const fatherName = getVal('father_name');
    if (!fatherName) errs['father_name'] = 'Father\'s Name is required';
    else if (!/^[A-Za-z\s]+$/.test(fatherName)) errs['father_name'] = 'Only alphabets allowed';

    const fatherOcc = getVal('father_occupation');
    if (!fatherOcc) errs['father_occupation'] = 'Father\'s Occupation is required';
    else if (!/^[A-Za-z\s]+$/.test(fatherOcc)) errs['father_occupation'] = 'Only alphabets allowed';

    const motherName = getVal('mother_name');
    if (!motherName) errs['mother_name'] = 'Mother\'s Name is required';
    else if (!/^[A-Za-z\s]+$/.test(motherName)) errs['mother_name'] = 'Only alphabets allowed';

    const motherSurname = getVal('mother_surname');
    if (!motherSurname) errs['mother_surname'] = 'Mother\'s Surname is required';
    else if (!/^[A-Za-z\s]+$/.test(motherSurname)) errs['mother_surname'] = 'Only alphabets allowed';

    const motherGotram = getVal('mother_gotram');
    if (!motherGotram) errs['mother_gotram'] = 'Mother\'s Gotram is required';

    const phone = getVal('phone');
    if (!phone) {
      errs['phone'] = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      errs['phone'] = 'Enter valid 10-digit Indian mobile number';
    }

    if (!whatsappSame) {
      const whatsapp = getVal('whatsapp');
      if (!whatsapp) {
        errs['whatsapp'] = 'WhatsApp number is required';
      } else if (!/^[6-9]\d{9}$/.test(whatsapp.replace(/\s/g, ''))) {
        errs['whatsapp'] = 'Enter valid 10-digit Indian mobile number';
      }
    }

    const email = getVal('email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs['email'] = 'Enter a valid email address';
    }

    // Age vs DOB consistency
    const dobVal = getVal('date_of_birth');
    const ageVal = getVal('age');
    if (dobVal && ageVal) {
      const dob = new Date(dobVal);
      if (!isNaN(dob.getTime())) {
        const today = new Date();
        let calcAge = today.getFullYear() - dob.getFullYear();
        const mDiff = today.getMonth() - dob.getMonth();
        if (mDiff < 0 || (mDiff === 0 && today.getDate() < dob.getDate())) calcAge--;
        if (Math.abs(calcAge - parseInt(ageVal)) >= 2) {
          errs['age'] = `Age (${ageVal}) doesn't match DOB (calculated: ${calcAge})`;
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate(e.currentTarget)) return;

    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.set('photo_urls', JSON.stringify(photoUrls));
    formData.set('siblings', JSON.stringify(siblings));
    formData.set('gender', gender);
    formData.set('caste', isKalingaVysya ? 'Kalinga Vysya' : otherCaste.trim());
    formData.set('whatsapp', whatsappSame ? phoneValue : whatsappValue);

    try {
      // Check for duplicate profiles on create
      if (mode === 'create') {
        const duplicateCheck = await checkDuplicateProfile(
          formData.get('full_name') as string,
          formData.get('date_of_birth') as string,
          formData.get('phone') as string,
        );
        if (duplicateCheck.length > 0) {
          const dup = duplicateCheck[0];
          const confirmMsg = `A similar profile already exists:\n\nName: ${dup.full_name}\nDOB: ${dup.date_of_birth?.split('T')[0] || 'N/A'}\nPhone: ${dup.phone}\nProfile ID: ${dup.profile_id}\n\nDo you still want to create this profile?`;
          if (!window.confirm(confirmMsg)) {
            setLoading(false);
            return;
          }
        }
      }

      if (mode === 'create') {
        await createProfile(formData);
        if (removedPhotoUrls.length > 0) {
          try {
            await deleteProfilePhotos(removedPhotoUrls);
          } catch (cleanupError) {
            console.warn('Photo cleanup failed after create', cleanupError);
          }
        }
        router.push('/admin/profiles');
      } else if (profile) {
        await updateProfile(profile.id, formData);
        if (removedPhotoUrls.length > 0) {
          try {
            await deleteProfilePhotos(removedPhotoUrls);
          } catch (cleanupError) {
            console.warn('Photo cleanup failed after update', cleanupError);
          }
        }
        router.push('/admin/profiles');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 max-w-4xl" noValidate>
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-sm text-[var(--red)] border border-red-100">{error}</div>
      )}

      {mode === 'create' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[var(--gray-400)]" />
              <h3 className="text-base font-semibold text-[var(--brown)]">Quick Import from Biodata</h3>
            </div>
          </CardHeader>
          <CardContent>
            <BiodataUpload onExtracted={handleExtracted} />
            {autoFillData && autoFillData.field_count > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-green-50 text-sm text-[var(--green)] border border-green-200">
                {autoFillData.field_count} fields extracted. Review and edit below before saving.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <FormSection section="photos">
        <PhotoUpload
          urls={photoUrls}
          onChange={setPhotoUrls}
          onRemove={(url) => {
            setRemovedPhotoUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
          }}
        />
      </FormSection>

      <FormSection section="classification">
        <Grid>
          <Select
            name="profile_type"
            label="Category *"
            required
            placeholder="Select category"
            options={profileTypeOptions}
            value={profileType}
            onChange={(e) => setProfileType(e.target.value)}
            error={errors['profile_type']}
          />
          <Select
            name="gender"
            label="Gender *"
            value={gender}
            disabled
            options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]}
            error={errors['gender']}
          />
          <Select
            name="status"
            label="Status *"
            required
            options={statusOptions}
            defaultValue={profile?.status || 'active'}
            error={errors['status']}
          />
        </Grid>
      </FormSection>

      <FormSection section="personal">
        <Grid>
          <Input name="full_name" label="Full Name *" required placeholder="Enter full name"
            defaultValue={profile?.full_name || ''}
            pattern={alphabetPattern}
            title="Only alphabets allowed"
            error={errors['full_name']}
            confidence={confidenceMap['full_name']}
          />
          <Input name="date_of_birth" label="Date of Birth *" type="date" required
            defaultValue={profile?.date_of_birth?.split('T')[0] || ''}
            error={errors['date_of_birth']}
            confidence={confidenceMap['date_of_birth']}
          />
          <Input name="time_of_birth" label="Time of Birth *" type="time" required
            defaultValue={profile?.time_of_birth || ''}
            error={errors['time_of_birth']}
            confidence={confidenceMap['time_of_birth']}
          />
          <Input name="place_of_birth" label="Place of Birth *" required placeholder="Enter place of birth"
            defaultValue={profile?.place_of_birth || ''}
            pattern={alphabetPattern}
            title="Only alphabets allowed"
            error={errors['place_of_birth']}
            confidence={confidenceMap['place_of_birth']}
          />
          <Input name="age" label="Age *" type="number" required min={18} max={100}
            defaultValue={profile?.age || ''}
            error={errors['age']}
            confidence={confidenceMap['age']}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input name="height_feet" label="Height (Feet) *" type="number" required min={1} max={8} step="1"
              defaultValue={profile?.height_feet || ''}
              error={errors['height_feet']}
              confidence={confidenceMap['height_feet']}
            />
            <Input name="height_inches" label="Inches *" type="number" required min={0} max={11}
              defaultValue={profile?.height_inches || ''}
              error={errors['height_inches']}
              confidence={confidenceMap['height_inches']}
            />
          </div>
          <Input name="weight" label="Weight (kg)" type="number" min={20} max={200}
            defaultValue={profile?.weight || ''}
            confidence={confidenceMap['weight']}
          />
        </Grid>
      </FormSection>

      <FormSection section="community">
        <Grid>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--brown-mid)]">Caste *</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isKalingaVysya}
                onChange={(e) => setIsKalingaVysya(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--gray-300)] text-[var(--gold)] focus:ring-[var(--gold)]"
              />
              <span className="text-sm text-[var(--brown)]">Kalinga Vysya</span>
            </label>
            {!isKalingaVysya && (
              <Input
                placeholder="Specify caste"
                value={otherCaste}
                onChange={(e) => setOtherCaste(e.target.value)}
                pattern={alphabetPattern}
                title="Only alphabets allowed"
                error={errors['other_caste']}
                name="other_caste_input"
              />
            )}
            {isKalingaVysya && (
              <input type="hidden" name="caste" value="Kalinga Vysya" />
            )}
            {!isKalingaVysya && (
              <input type="hidden" name="caste" value={otherCaste} />
            )}
          </div>
          <Input name="gotram" label="Gotram *" required placeholder="Enter gotram"
            defaultValue={profile?.gotram || ''}
            error={errors['gotram']}
            confidence={confidenceMap['gotram']}
          />
          <Select name="rashi" label="Rashi *" required placeholder="Select rashi"
            options={rashiOptions}
            defaultValue={profile?.rashi || ''}
            error={errors['rashi']}
            confidence={confidenceMap['rashi']}
          />
          <div className="grid grid-cols-2 gap-2">
            <Select name="nakshatram" label="Nakshatram *" required placeholder="Select"
              options={nakshatramOptions}
              defaultValue={profile?.nakshatram || ''}
              error={errors['nakshatram']}
              confidence={confidenceMap['nakshatram']}
            />
            <Select name="padam" label="Padam *" required placeholder="Select"
              options={padamOptions}
              defaultValue={profile?.padam || ''}
              error={errors['padam']}
              confidence={confidenceMap['padam']}
            />
          </div>
        </Grid>
      </FormSection>

      <FormSection section="education">
        <Grid>
          <Input name="education" label="Education" placeholder="Enter education"
            defaultValue={profile?.education || ''}
            pattern={alphaSpecialPattern}
            title="No numbers allowed"
            error={errors['education']}
            confidence={confidenceMap['education']}
          />
          <Input name="education_qualification" label="Education Qualification"
            defaultValue={profile?.education_qualification || ''}
            pattern={alphaSpecialPattern}
            title="No numbers allowed"
            error={errors['education_qualification']}
            confidence={confidenceMap['education_qualification']}
          />
          <Input name="career" label="Career"
            defaultValue={profile?.career || ''}
            pattern={alphaSpecialPattern}
            title="No numbers allowed"
            error={errors['career']}
            confidence={confidenceMap['career']}
          />
          <Input name="occupation" label="Occupation / Job"
            defaultValue={profile?.occupation || ''}
            pattern={alphaSpecialPattern}
            title="No numbers allowed"
            error={errors['occupation']}
            confidence={confidenceMap['occupation']}
          />
          <Input name="salary" label="Salary"
            defaultValue={profile?.salary || ''}
            error={errors['salary']}
            confidence={confidenceMap['salary']}
          />
        </Grid>
        <div className="mt-4 p-4 bg-[var(--cream)] rounded-xl border border-[var(--gray-100)]">
          <p className="text-sm font-medium text-[var(--brown-mid)] mb-3">Business Details (If Applicable)</p>
          <Grid>
            <Input name="business_name" label="Business Name"
              defaultValue={profile?.business_name || ''}
              pattern={alphaSpecialPattern}
              title="No numbers allowed"
              confidence={confidenceMap['business_name']}
            />
            <Input name="business_type" label="Business Type"
              defaultValue={profile?.business_type || ''}
              pattern={alphaSpecialPattern}
              title="No numbers allowed"
              confidence={confidenceMap['business_type']}
            />
            <Input name="annual_income" label="Approximate Annual Income"
              defaultValue={profile?.annual_income || ''}
              error={errors['annual_income']}
              confidence={confidenceMap['annual_income']}
            />
          </Grid>
        </div>
      </FormSection>

      <FormSection section="location">
        <Grid>
          <Input name="state" label="State *" required
            defaultValue={profile?.state || ''}
            pattern={alphabetPattern}
            title="Only alphabets allowed"
            error={errors['state']}
            confidence={confidenceMap['state']}
          />
          <Input name="district" label="District"
            defaultValue={profile?.district || ''}
            pattern={alphabetPattern}
            title="Only alphabets allowed"
            confidence={confidenceMap['district']}
          />
          <Input name="city" label="City / Village *" required
            defaultValue={profile?.city || ''}
            pattern={alphabetPattern}
            title="Only alphabets allowed"
            error={errors['city']}
            confidence={confidenceMap['city']}
          />
          <Input name="native_place" label="Native Place *" required
            defaultValue={profile?.native_place || ''}
            pattern={alphabetPattern}
            title="Only alphabets allowed"
            error={errors['native_place']}
            confidence={confidenceMap['native_place']}
          />
        </Grid>
      </FormSection>

      <FormSection section="family">
        <Grid>
          <Input name="father_name" label="Father's Name *" required
            defaultValue={profile?.father_name || ''}
            pattern={alphabetPattern}
            title="Only alphabets allowed"
            error={errors['father_name']}
            confidence={confidenceMap['father_name']}
          />
          <Input name="father_occupation" label="Father's Occupation *" required
            defaultValue={profile?.father_occupation || ''}
            pattern={alphabetPattern}
            title="Only alphabets allowed"
            error={errors['father_occupation']}
            confidence={confidenceMap['father_occupation']}
          />
          <Input name="mother_name" label="Mother's Name *" required
            defaultValue={profile?.mother_name || ''}
            pattern={alphabetPattern}
            title="Only alphabets allowed"
            error={errors['mother_name']}
            confidence={confidenceMap['mother_name']}
          />
          <Input name="mother_surname" label="Mother's Surname *" required
            defaultValue={profile?.mother_surname || ''}
            pattern={alphabetPattern}
            title="Only alphabets allowed"
            error={errors['mother_surname']}
            confidence={confidenceMap['mother_surname']}
          />
          <Input name="mother_gotram" label="Mother's Gotram *" required
            defaultValue={profile?.mother_gotram || ''}
            error={errors['mother_gotram']}
            confidence={confidenceMap['mother_gotram']}
          />
        </Grid>
        <div className="mt-4">
          <p className="text-sm font-medium text-[var(--brown-mid)] mb-3">Siblings</p>
          <SiblingForm siblings={siblings} onChange={setSiblings} />
        </div>
      </FormSection>

      <FormSection section="background">
        <Grid cols={1}>
          <Textarea name="family_background" label="Family Background"
            defaultValue={profile?.family_background || ''}
            confidence={confidenceMap['family_background']}
          />
          <Textarea name="property_details" label="Property Details"
            defaultValue={profile?.property_details || ''}
            confidence={confidenceMap['property_details']}
          />
          <Textarea name="family_values" label="Family Values"
            defaultValue={profile?.family_values || ''}
            confidence={confidenceMap['family_values']}
          />
          <Textarea name="additional_info" label="Any Additional Information"
            defaultValue={profile?.additional_info || ''}
            confidence={confidenceMap['additional_info']}
          />
        </Grid>
      </FormSection>

      <FormSection section="expectations">
        <Grid>
          <div className="grid grid-cols-2 gap-2">
            <Input name="expected_age_min" label="Expected Age (Min)" type="number" min={18} max={100}
              defaultValue={profile?.expected_age_min || ''}
              confidence={confidenceMap['expected_age_min']}
            />
            <Input name="expected_age_max" label="Expected Age (Max)" type="number" min={18} max={100}
              defaultValue={profile?.expected_age_max || ''}
              confidence={confidenceMap['expected_age_max']}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input name="expected_height_min" label="Expected Height (Min feet)" type="number" min={1} max={8}
              defaultValue={profile?.expected_height_min || ''}
              confidence={confidenceMap['expected_height_min']}
            />
            <Input name="expected_height_max" label="Expected Height (Max feet)" type="number" min={1} max={8}
              defaultValue={profile?.expected_height_max || ''}
              confidence={confidenceMap['expected_height_max']}
            />
          </div>
          <Input name="education_preference" label="Education Preference"
            defaultValue={profile?.education_preference || ''}
            confidence={confidenceMap['education_preference']}
          />
          <Input name="occupation_preference" label="Occupation Preference"
            defaultValue={profile?.occupation_preference || ''}
            confidence={confidenceMap['occupation_preference']}
          />
          <Input name="location_preference" label="Location Preference"
            defaultValue={profile?.location_preference || ''}
            confidence={confidenceMap['location_preference']}
          />
          <Input name="community_preference" label="Community Preference"
            defaultValue={profile?.community_preference || ''}
            confidence={confidenceMap['community_preference']}
          />
        </Grid>
        <div className="mt-4">
          <Textarea name="other_expectations" label="Other Expectations"
            defaultValue={profile?.other_expectations || ''}
            confidence={confidenceMap['other_expectations']}
          />
        </div>
      </FormSection>

      <FormSection section="contact">
        <Grid>
          <Input name="phone" label="Phone Number *" type="tel" required
            defaultValue={profile?.phone || ''}
            onChange={(e) => {
              setPhoneValue(e.target.value);
              if (whatsappSame) setWhatsappValue(e.target.value);
            }}
            error={errors['phone']}
            confidence={confidenceMap['phone']}
          />
          <div className="flex flex-col gap-2">
            <Input
              name="whatsapp"
              label="WhatsApp Number *"
              type="tel"
              required
              value={whatsappSame ? phoneValue : whatsappValue}
              onChange={(e) => setWhatsappValue(e.target.value)}
              disabled={whatsappSame}
              error={errors['whatsapp']}
              confidence={confidenceMap['whatsapp']}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappSame}
                onChange={(e) => {
                  setWhatsappSame(e.target.checked);
                  if (e.target.checked) setWhatsappValue(phoneValue);
                }}
                className="w-4 h-4 rounded border-[var(--gray-300)] text-[var(--gold)] focus:ring-[var(--gold)]"
              />
              <span className="text-xs text-[var(--brown)]">Same as Phone number</span>
            </label>
          </div>
          <Input name="email" label="Email" type="email"
            defaultValue={profile?.email || ''}
            confidence={confidenceMap['email']}
          />
          <Input name="address" label="Address"
            defaultValue={profile?.address || ''}
            confidence={confidenceMap['address']}
          />
        </Grid>
        <div className="mt-4">
          <Textarea name="admin_notes" label="Admin Notes"
            defaultValue={profile?.admin_notes || ''}
          />
        </div>
      </FormSection>

      <div className="flex items-center gap-3 pt-2 pb-8">
        <Button type="submit" loading={loading} size="lg">
          <Save className="w-4 h-4" />
          {mode === 'create' ? 'Create Profile' : 'Update Profile'}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateProfileId } from '@/lib/utils/profile-id';
import { parseProfileForm } from '@/lib/validation/profile';
import { requireAdmin } from '@/lib/auth/require-admin';
import type { Profile, ProfileType, ProfileStatus, Sibling } from '@/types';

async function db() {
  return createServerSupabase();
}

function getProfilePhotoStoragePath(url: string): string | null {
  try {
    const parsed = new URL(url);
    const marker = '/storage/v1/object/public/profile-photos/';
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;
    const path = parsed.pathname.slice(index + marker.length);
    return path || null;
  } catch {
    return null;
  }
}

export async function deleteProfilePhotos(photoUrls: string[]) {
  const paths = photoUrls
    .map(getProfilePhotoStoragePath)
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) return;

  const admin = createAdminClient();
  const { error } = await admin.storage.from('profile-photos').remove(paths);
  if (error) throw new Error(error.message);
}

export async function getProfiles(type?: ProfileType, status?: ProfileStatus) {
  await requireAdmin();
  const supabase = await db();
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

  if (type) query = query.eq('profile_type', type);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as Profile[];
}

export async function getProfile(id: string) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function getProfileByProfileId(profileId: string) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('profile_id', profileId)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function createProfile(formData: FormData) {
  await requireAdmin();
  const parsed = parseProfileForm(formData);
  if (!parsed.success) {
    const msgs = Object.entries(parsed.error.format()).map(([k, v]) => `${k}: ${(v as any)._errors?.join(', ') || v}`).join('; ');
    throw new Error(`Validation failed: ${msgs}`);
  }

  const supabase = await db();
  const raw = Object.fromEntries(formData.entries());
  const profileType = parsed.data.profile_type;
  const profileId = (raw.profile_id as string) || await generateProfileId(profileType);

  const profile = {
    ...parsed.data,
    profile_id: profileId,
    show_full_profile: raw.show_full_profile === 'true',
    visibility_settings: {
      show_location: raw.show_location === 'true',
      show_expectations: raw.show_expectations === 'true',
      show_contact: raw.show_contact === 'true',
    },
    photo_urls: raw.photo_urls ? JSON.parse(raw.photo_urls as string) : [],
    biodata_original: (raw.biodata_original as string) || '',
    biodata_card: (raw.biodata_card as string) || '',
  };

  const { data, error } = await supabase.from('profiles').insert(profile).select().single();
  if (error) throw new Error(error.message);

  if (raw.siblings) {
    const siblings = JSON.parse(raw.siblings as string) as Sibling[];
    if (siblings.length > 0) {
      const siblingInserts = siblings.map((s) => ({
        ...s,
        profile_id: data.id,
      }));
      const { error: sibError } = await supabase.from('siblings').insert(siblingInserts);
      if (sibError) throw new Error(sibError.message);
    }
  }

  return data as Profile;
}

export async function updateProfile(id: string, formData: FormData) {
  await requireAdmin();
  const parsed = parseProfileForm(formData);
  if (!parsed.success) {
    const msgs = Object.entries(parsed.error.format()).map(([k, v]) => `${k}: ${(v as any)._errors?.join(', ') || v}`).join('; ');
    throw new Error(`Validation failed: ${msgs}`);
  }

  const supabase = await db();
  const raw = Object.fromEntries(formData.entries());

  const { data: existingProfile, error: existingError } = await supabase
    .from('profiles')
    .select('show_full_profile, visibility_settings')
    .eq('id', id)
    .single();

  if (existingError) throw new Error(existingError.message);

  const showFullProfile = typeof raw.show_full_profile === 'string'
    ? raw.show_full_profile === 'true'
    : Boolean(existingProfile?.show_full_profile);

  const existingVisibility = (existingProfile?.visibility_settings || {}) as {
    show_location?: boolean;
    show_expectations?: boolean;
    show_contact?: boolean;
  };

  const visibilitySettings = {
    show_location: typeof raw.show_location === 'string' ? raw.show_location === 'true' : Boolean(existingVisibility.show_location),
    show_expectations: typeof raw.show_expectations === 'string' ? raw.show_expectations === 'true' : Boolean(existingVisibility.show_expectations),
    show_contact: typeof raw.show_contact === 'string' ? raw.show_contact === 'true' : Boolean(existingVisibility.show_contact),
  };

  const profile = {
    ...parsed.data,
    show_full_profile: showFullProfile,
    visibility_settings: visibilitySettings,
    photo_urls: raw.photo_urls ? JSON.parse(raw.photo_urls as string) : [],
    biodata_original: (raw.biodata_original as string) || '',
    biodata_card: (raw.biodata_card as string) || '',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('profiles').update(profile).eq('id', id).select().single();
  if (error) throw new Error(error.message);

  if (raw.siblings) {
    const siblings = JSON.parse(raw.siblings as string) as Sibling[];
    await supabase.from('siblings').delete().eq('profile_id', id);
    if (siblings.length > 0) {
      const siblingInserts = siblings.map((s) => ({
        ...s,
        profile_id: id,
      }));
      const { error: sibError } = await supabase.from('siblings').insert(siblingInserts);
      if (sibError) throw new Error(sibError.message);
    }
  }

  return data as Profile;
}

export async function getSiblings(profileId: string) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase.from('siblings').select('*').eq('profile_id', profileId);
  if (error) throw new Error(error.message);
  return data as Sibling[];
}

export async function getProfileDeleteInfo(id: string) {
  await requireAdmin();
  const supabase = await db();

  const { data: profile } = await supabase.from('profiles').select('full_name, photo_urls').eq('id', id).single();
  if (!profile) throw new Error('Profile not found');

  const { data: matches, count: matchCount } = await supabase
    .from('matches')
    .select(`
      id,
      bride:profiles!matches_bride_profile_id_fkey(id, full_name),
      groom:profiles!matches_groom_profile_id_fkey(id, full_name)
    `, { count: 'exact', head: false })
    .or(`bride_profile_id.eq.${id},groom_profile_id.eq.${id}`);

  const { count: shareCount } = await supabase
    .from('profile_shares')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', id);

  const { count: siblingCount } = await supabase
    .from('siblings')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', id);

  const matchPartners = (matches || []).map((m: any) => {
    const partner = m.bride?.id === id ? m.groom : m.bride;
    return partner?.full_name || 'Unknown';
  }).filter(Boolean);

  return {
    fullName: profile.full_name,
    photoCount: (profile.photo_urls || []).length,
    matches: matchPartners,
    shareCount: shareCount || 0,
    siblingCount: siblingCount || 0,
  };
}

export async function deleteProfile(id: string) {
  await requireAdmin();
  const supabase = await db();

  // Clean up photos from storage before deleting
  const { data: profile } = await supabase.from('profiles').select('photo_urls').eq('id', id).single();
  if (profile?.photo_urls && profile.photo_urls.length > 0) {
    await deleteProfilePhotos(profile.photo_urls);
  }

  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Escape special chars in Supabase .or() filter values */
function esc(val: string): string {
  return val.replace(/[.,()]/g, '');
}

/** Escape LIKE wildcards from user search input */
function sanitizeLike(val: string): string {
  return val.replace(/[%_]/g, '');
}

export async function checkDuplicateProfile(
  fullName: string,
  dateOfBirth: string,
  phone: string,
): Promise<Pick<Profile, 'id' | 'full_name' | 'date_of_birth' | 'phone' | 'profile_id'>[]> {
  if (!fullName || !dateOfBirth || !phone) return [];

  const supabase = await db();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, date_of_birth, phone, profile_id')
    .ilike('full_name', fullName)
    .eq('date_of_birth', dateOfBirth.split('T')[0])
    .or(`phone.eq.${esc(phone)},whatsapp.eq.${esc(phone)}`)
    .limit(5);

  if (error) throw new Error(error.message);
  return (data || []) as Pick<Profile, 'id' | 'full_name' | 'date_of_birth' | 'phone' | 'profile_id'>[];
}

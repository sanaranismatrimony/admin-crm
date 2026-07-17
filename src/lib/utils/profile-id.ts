import { createServerSupabase } from '@/lib/supabase/server';
import type { ProfileType } from '@/types';

async function db() {
  return createServerSupabase();
}

const prefixMap: Record<ProfileType, string> = {
  bride: 'BR',
  groom: 'GR',
  second_marriage_bride: 'SMB',
  second_marriage_groom: 'SMG',
  other_caste_bride: 'OCB',
  other_caste_groom: 'OCG',
};

export async function generateProfileId(type: ProfileType): Promise<string> {
  const prefix = prefixMap[type];
  const year = new Date().getFullYear().toString().slice(-2);
  const idPrefix = `${prefix}${year}`;
  const supabase = await db();

  const { data, error } = await supabase
    .rpc('next_profile_id', { prefix_param: idPrefix });

  if (error || data === null || data === undefined) {
    throw new Error('Failed to generate profile ID');
  }

  return `${idPrefix}-${String(data).padStart(3, '0')}`;
}

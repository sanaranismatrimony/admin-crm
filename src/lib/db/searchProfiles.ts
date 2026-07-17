'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import type { Profile, ProfileType, ProfileStatus } from '@/types';

export interface SearchFilters {
  q?: string;
  categories?: ProfileType[];
  ageMin?: number;
  ageMax?: number;
  heightMinFeet?: number;
  heightMinInches?: number;
  heightMaxFeet?: number;
  heightMaxInches?: number;
  gotrams?: string[];
  statuses?: ProfileStatus[];
  rashis?: string[];
  nakshatrams?: string[];
  sort?: 'newest' | 'recently_updated' | 'age_asc' | 'age_desc' | 'salary' | 'most_shared';
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  profiles: Profile[];
  total: number;
  page: number;
  pageCount: number;
  suggestions: { profile_id: string; full_name: string; age: number; city: string }[];
}

const PAGE_SIZE = 24;

export async function searchProfilesAction(filters: SearchFilters): Promise<SearchResult> {
  const supabase = await createServerSupabase();
  const page = Math.max(1, filters.page || 1);
  const pageSize = filters.pageSize || PAGE_SIZE;
  const q = filters.q?.trim();

  let query = supabase.from('profiles').select('*', { count: 'exact' });

  if (q) {
    const safe = q.replace(/[%_]/g, '');
    const searchPattern = `%${safe}%`;
    const searchOr = [
      `full_name.ilike.${searchPattern}`,
      `profile_id.ilike.${searchPattern}`,
      `phone.ilike.${searchPattern}`,
      `whatsapp.ilike.${searchPattern}`,
      `father_name.ilike.${searchPattern}`,
      `mother_name.ilike.${searchPattern}`,
      `occupation.ilike.${searchPattern}`,
      `education.ilike.${searchPattern}`,
      `native_place.ilike.${searchPattern}`,
      `city.ilike.${searchPattern}`,
      `district.ilike.${searchPattern}`,
      `state.ilike.${searchPattern}`,
      `gotram.ilike.${searchPattern}`,
      `rashi.ilike.${searchPattern}`,
      `nakshatram.ilike.${searchPattern}`,
    ].join(',');
    query = query.or(searchOr);
  }

  if (filters.categories && filters.categories.length > 0) {
    query = query.in('profile_type', filters.categories);
  }

  if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
    const now = new Date();
    if (filters.ageMin !== undefined) {
      const maxDob = new Date(now.getFullYear() - filters.ageMin, now.getMonth(), now.getDate()).toISOString().split('T')[0];
      query = query.lte('date_of_birth', maxDob);
    }
    if (filters.ageMax !== undefined) {
      const minDob = new Date(now.getFullYear() - filters.ageMax - 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];
      query = query.gte('date_of_birth', minDob);
    }
  }

  if (filters.heightMinFeet !== undefined || filters.heightMinInches !== undefined) {
    const minFeet = filters.heightMinFeet ?? 0;
    const minInches = filters.heightMinInches ?? 0;
    query = query.or(`height_feet.gt.${minFeet},and(height_feet.eq.${minFeet},height_inches.gte.${minInches})`);
  }

  if (filters.heightMaxFeet !== undefined || filters.heightMaxInches !== undefined) {
    const maxFeet = filters.heightMaxFeet ?? 9;
    const maxInches = filters.heightMaxInches ?? 11;
    query = query.or(`height_feet.lt.${maxFeet},and(height_feet.eq.${maxFeet},height_inches.lte.${maxInches})`);
  }

  if (filters.gotrams && filters.gotrams.length > 0) {
    query = query.in('gotram', filters.gotrams);
  }

  if (filters.statuses && filters.statuses.length > 0) {
    query = query.in('status', filters.statuses);
  }

  if (filters.rashis && filters.rashis.length > 0) {
    query = query.in('rashi', filters.rashis);
  }

  if (filters.nakshatrams && filters.nakshatrams.length > 0) {
    query = query.in('nakshatram', filters.nakshatrams);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  switch (filters.sort || 'newest') {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'recently_updated':
      query = query.order('updated_at', { ascending: false });
      break;
    case 'age_asc':
      query = query.order('date_of_birth', { ascending: false });
      break;
    case 'age_desc':
      query = query.order('date_of_birth', { ascending: true });
      break;
    case 'salary':
      query = query.order('annual_income', { ascending: false, nullsFirst: false });
      break;
    case 'most_shared':
      query = query.order('created_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  let suggestions: { profile_id: string; full_name: string; age: number; city: string }[] = [];
  if (q && q.length >= 2) {
    const safeQ = q.replace(/[%_]/g, '');
    const { data: sug } = await supabase
      .from('profiles')
      .select('profile_id, full_name, age, city')
      .or(`full_name.ilike.%${safeQ}%,profile_id.ilike.%${safeQ}%`)
      .limit(8);
    if (sug) {
      suggestions = sug.map((s: { profile_id: string; full_name: string; age: number; city: string | null }) => ({
        profile_id: s.profile_id,
        full_name: s.full_name,
        age: s.age,
        city: s.city || '',
      }));
    }
  }

  return { profiles: (data as Profile[]) || [], total, page, pageCount, suggestions };
}

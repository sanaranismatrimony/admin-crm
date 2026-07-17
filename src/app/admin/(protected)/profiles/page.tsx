import { createServerSupabase } from '@/lib/supabase/server';
import { searchProfilesAction } from '@/lib/db/searchProfiles';
import { ProfileBrowser } from '@/components/admin/ProfileBrowser';
import type { ProfileType, ProfileStatus } from '@/types';

function parseCSV(val: string | undefined): string[] {
  if (!val) return [];
  return val.split(',').filter(Boolean);
}

function parseProfileTypes(val: string | undefined): ProfileType[] {
  const valid: ProfileType[] = ['bride', 'groom', 'second_marriage_bride', 'second_marriage_groom', 'other_caste_bride', 'other_caste_groom'];
  return parseCSV(val).filter((v): v is ProfileType => valid.includes(v as ProfileType));
}

function parseProfileStatuses(val: string | undefined): ProfileStatus[] {
  const valid: ProfileStatus[] = ['active', 'inactive'];
  return parseCSV(val).filter((v): v is ProfileStatus => valid.includes(v as ProfileStatus));
}

function parseNum(val: string | undefined): number | undefined {
  if (!val) return undefined;
  const n = parseInt(val, 10);
  return isNaN(n) ? undefined : n;
}

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const q = typeof sp.q === 'string' ? sp.q : '';
  const categories = parseProfileTypes(typeof sp.type === 'string' ? sp.type : undefined);
  const ageMin = parseNum(typeof sp.ageMin === 'string' ? sp.ageMin : undefined);
  const ageMax = parseNum(typeof sp.ageMax === 'string' ? sp.ageMax : undefined);
  const heightMinFeet = parseNum(typeof sp.hMinFt === 'string' ? sp.hMinFt : undefined);
  const heightMinInches = parseNum(typeof sp.hMinIn === 'string' ? sp.hMinIn : undefined);
  const heightMaxFeet = parseNum(typeof sp.hMaxFt === 'string' ? sp.hMaxFt : undefined);
  const heightMaxInches = parseNum(typeof sp.hMaxIn === 'string' ? sp.hMaxIn : undefined);
  const gotrams = parseCSV(typeof sp.gotram === 'string' ? sp.gotram : undefined);
  const statuses = parseProfileStatuses(typeof sp.status === 'string' ? sp.status : undefined);
  const rashis = parseCSV(typeof sp.rashi === 'string' ? sp.rashi : undefined);
  const nakshatrams = parseCSV(typeof sp.naks === 'string' ? sp.naks : undefined);
  const sort = (typeof sp.sort === 'string' && ['newest', 'recently_updated', 'age_asc', 'age_desc', 'salary', 'most_shared'].includes(sp.sort)
    ? sp.sort
    : 'newest') as 'newest' | 'recently_updated' | 'age_asc' | 'age_desc' | 'salary' | 'most_shared';
  const page = Math.max(1, parseNum(typeof sp.page === 'string' ? sp.page : undefined) || 1);

  const initialFilters = {
    q,
    categories,
    ageMin,
    ageMax,
    heightMinFeet,
    heightMinInches,
    heightMaxFeet,
    heightMaxInches,
    gotrams,
    statuses,
    rashis,
    nakshatrams,
    sort,
  };

  const [result, allGotrams, allRashis, allNakshatrams] = await Promise.all([
    searchProfilesAction({
      q: q || undefined,
      categories: categories.length > 0 ? categories : undefined,
      ageMin,
      ageMax,
      heightMinFeet,
      heightMinInches,
      heightMaxFeet,
      heightMaxInches,
      gotrams: gotrams.length > 0 ? gotrams : undefined,
      statuses: statuses.length > 0 ? statuses : undefined,
      rashis: rashis.length > 0 ? rashis : undefined,
      nakshatrams: nakshatrams.length > 0 ? nakshatrams : undefined,
      sort,
      page,
    }),
    fetchDistinct('gotram'),
    fetchDistinct('rashi'),
    fetchDistinct('nakshatram'),
  ]);

  return (
    <ProfileBrowser
      initialProfiles={result.profiles}
      initialTotal={result.total}
      initialPage={result.page}
      initialPageCount={result.pageCount}
      initialFilters={initialFilters}
      allGotrams={allGotrams}
      allRashis={allRashis}
      allNakshatrams={allNakshatrams}
    />
  );
}

async function fetchDistinct(column: string): Promise<string[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('profiles')
    .select(column)
    .not(column, 'is', null)
    .neq(column, '')
    .order(column, { ascending: true });
  if (!data) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const row of data) {
    const rec = row as unknown as Record<string, unknown>;
    const val = typeof rec[column] === 'string' ? (rec[column] as string) : '';
    if (val && !seen.has(val)) {
      seen.add(val);
      result.push(val);
    }
  }
  return result;
}

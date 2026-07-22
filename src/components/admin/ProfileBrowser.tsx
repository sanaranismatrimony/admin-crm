'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { GlobalSearchBar } from './filters/GlobalSearchBar';
import { FilterBar } from './filters/FilterBar';
import { ActiveFilters } from './filters/ActiveFilters';
import { SortDropdown } from './filters/SortDropdown';
import { ProfileGrid } from './ProfileGrid';
import { Pagination } from './Pagination';

import { searchProfilesAction } from '@/lib/db/searchProfiles';
import { useDebounce } from '@/lib/utils/debounce';

import type { Profile, ProfileType, ProfileStatus } from '@/types';
import type { SortOption } from './filters/SortDropdown';

interface ProfileBrowserProps {
  initialProfiles: Profile[];
  initialTotal: number;
  initialPage: number;
  initialPageCount: number;
  initialFilters: {
    q: string;
    categories: ProfileType[];
    ageMin: number | undefined;
    ageMax: number | undefined;
    heightMinFeet: number | undefined;
    heightMinInches: number | undefined;
    heightMaxFeet: number | undefined;
    heightMaxInches: number | undefined;
    gotrams: string[];
    statuses: ProfileStatus[];
    rashis: string[];
    nakshatrams: string[];
    sort: SortOption;
  };
  allGotrams: string[];
  allRashis: string[];
  allNakshatrams: string[];
}

export function ProfileBrowser({
  initialProfiles,
  initialTotal,
  initialPage,
  initialPageCount,
  initialFilters,
  allGotrams,
  allRashis,
  allNakshatrams,
}: ProfileBrowserProps) {
  const router = useRouter();

  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [pageCount, setPageCount] = useState(initialPageCount);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{ profile_id: string; full_name: string; age: number; city: string }[]>([]);

  const [q, setQ] = useState(initialFilters.q);
  const [categories, setCategories] = useState<ProfileType[]>(initialFilters.categories);
  const [ageMin, setAgeMin] = useState<number | undefined>(initialFilters.ageMin);
  const [ageMax, setAgeMax] = useState<number | undefined>(initialFilters.ageMax);
  const [heightMinFeet, setHeightMinFeet] = useState<number | undefined>(initialFilters.heightMinFeet);
  const [heightMinInches, setHeightMinInches] = useState<number | undefined>(initialFilters.heightMinInches);
  const [heightMaxFeet, setHeightMaxFeet] = useState<number | undefined>(initialFilters.heightMaxFeet);
  const [heightMaxInches, setHeightMaxInches] = useState<number | undefined>(initialFilters.heightMaxInches);
  const [gotrams, setGotrams] = useState<string[]>(initialFilters.gotrams);
  const [statuses, setStatuses] = useState<ProfileStatus[]>(initialFilters.statuses);
  const [rashis, setRashis] = useState<string[]>(initialFilters.rashis);
  const [nakshatrams, setNakshatrams] = useState<string[]>(initialFilters.nakshatrams);
  const [sort, setSort] = useState<SortOption>(initialFilters.sort);

  const debouncedQ = useDebounce(q, 300);
  const hasMounted = useRef(false);
  const pendingRef = useRef(0);

  async function search(overrides?: {
    q?: string;
    categories?: ProfileType[];
    ageMin?: number;
    ageMax?: number;
    gotrams?: string[];
    statuses?: ProfileStatus[];
    rashis?: string[];
    nakshatrams?: string[];
    sort?: SortOption;
    page?: number;
  }) {
    const id = ++pendingRef.current;
    setLoading(true);
    try {
      const result = await searchProfilesAction({
        q: overrides?.q ?? (debouncedQ || undefined),
        categories: overrides?.categories ?? (categories.length > 0 ? categories : undefined),
        ageMin: overrides?.ageMin ?? ageMin,
        ageMax: overrides?.ageMax ?? ageMax,
        heightMinFeet,
        heightMinInches,
        heightMaxFeet,
        heightMaxInches,
        gotrams: overrides?.gotrams ?? (gotrams.length > 0 ? gotrams : undefined),
        statuses: overrides?.statuses ?? (statuses.length > 0 ? statuses : undefined),
        rashis: overrides?.rashis ?? (rashis.length > 0 ? rashis : undefined),
        nakshatrams: overrides?.nakshatrams ?? (nakshatrams.length > 0 ? nakshatrams : undefined),
        sort: overrides?.sort ?? sort,
        page: overrides?.page ?? page,
      });
      if (id === pendingRef.current && hasMounted.current) {
        setProfiles(result.profiles);
        setTotal(result.total);
        setPage(result.page);
        setPageCount(result.pageCount);
        setSuggestions(result.suggestions);
      }
    } finally {
      if (id === pendingRef.current) setLoading(false);
    }
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (categories.length > 0) params.set('type', categories.join(','));
    if (ageMin !== undefined) params.set('ageMin', ageMin.toString());
    if (ageMax !== undefined) params.set('ageMax', ageMax.toString());
    if (heightMinFeet !== undefined) params.set('hMinFt', heightMinFeet.toString());
    if (heightMinInches !== undefined) params.set('hMinIn', heightMinInches.toString());
    if (heightMaxFeet !== undefined) params.set('hMaxFt', heightMaxFeet.toString());
    if (heightMaxInches !== undefined) params.set('hMaxIn', heightMaxInches.toString());
    if (gotrams.length > 0) params.set('gotram', gotrams.join(','));
    if (statuses.length > 0) params.set('status', statuses.join(','));
    if (rashis.length > 0) params.set('rashi', rashis.join(','));
    if (nakshatrams.length > 0) params.set('naks', nakshatrams.join(','));
    if (sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());
    const suffix = params.toString();
    router.replace(suffix ? `/admin/profiles?${suffix}` : '/admin/profiles', { scroll: false });
  }

  useEffect(() => {
    if (!hasMounted.current) { hasMounted.current = true; return; }
    search();
    syncUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, categories, ageMin, ageMax, heightMinFeet, heightMinInches, heightMaxFeet, heightMaxInches, gotrams, statuses, rashis, nakshatrams, sort, page]);

  function handleFilterChange(updater: () => void) {
    updater();
    if (page !== 1) setPage(1);
  }

  function handleSelectSuggestion(suggestion: { profile_id: string }) {
    setQ(suggestion.profile_id);
  }

  function clearAllFilters() {
    setQ('');
    setCategories([]);
    setAgeMin(undefined);
    setAgeMax(undefined);
    setHeightMinFeet(undefined);
    setHeightMinInches(undefined);
    setHeightMaxFeet(undefined);
    setHeightMaxInches(undefined);
    setGotrams([]);
    setStatuses([]);
    setRashis([]);
    setNakshatrams([]);
    setSort('newest');
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <GlobalSearchBar
            value={q}
            onChange={setQ}
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </div>
        <Link href="/admin/profiles/new">
          <Button>
            <Plus className="w-4 h-4" /> Add Profile
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <FilterBar
          categories={categories}
          onCategoriesChange={(v) => handleFilterChange(() => setCategories(v))}
          ageMin={ageMin}
          ageMax={ageMax}
          onAgeChange={(min, max) => handleFilterChange(() => { setAgeMin(min); setAgeMax(max); })}
          heightMinFeet={heightMinFeet}
          heightMinInches={heightMinInches}
          heightMaxFeet={heightMaxFeet}
          heightMaxInches={heightMaxInches}
          onHeightChange={(mf, mi, xf, xi) => handleFilterChange(() => { setHeightMinFeet(mf); setHeightMinInches(mi); setHeightMaxFeet(xf); setHeightMaxInches(xi); })}
          gotrams={gotrams}
          onGotramsChange={(v) => handleFilterChange(() => setGotrams(v))}
          statuses={statuses}
          onStatusesChange={(v) => handleFilterChange(() => setStatuses(v))}
          rashis={rashis}
          onRashisChange={(v) => handleFilterChange(() => setRashis(v))}
          nakshatrams={nakshatrams}
          onNakshatramsChange={(v) => handleFilterChange(() => setNakshatrams(v))}
          allGotrams={allGotrams}
          allRashis={allRashis}
          allNakshatrams={allNakshatrams}
        />
        <SortDropdown value={sort} onChange={(v) => handleFilterChange(() => setSort(v))} />
      </div>

      <ActiveFilters
        q={q}
        categories={categories}
        ageMin={ageMin}
        ageMax={ageMax}
        gotrams={gotrams}
        statuses={statuses}
        rashis={rashis}
        nakshatrams={nakshatrams}
        onClearSearch={() => handleFilterChange(() => setQ(''))}
        onClearCategory={(cat) => handleFilterChange(() => setCategories((prev) => prev.filter((c) => c !== cat)))}
        onClearAge={() => handleFilterChange(() => { setAgeMin(undefined); setAgeMax(undefined); })}
        onClearGotram={(g) => handleFilterChange(() => setGotrams((prev) => prev.filter((x) => x !== g)))}
        onClearStatus={(s) => handleFilterChange(() => setStatuses((prev) => prev.filter((x) => x !== s)))}
        onClearRashi={(r) => handleFilterChange(() => setRashis((prev) => prev.filter((x) => x !== r)))}
        onClearNakshatram={(n) => handleFilterChange(() => setNakshatrams((prev) => prev.filter((x) => x !== n)))}
        onClearAll={clearAllFilters}
      />

      <ProfileGrid profiles={profiles} searchTerm={debouncedQ} loading={loading} />

      <Pagination page={page} pageCount={pageCount} total={total} onPageChange={(p) => { setPage(p); }} />
    </div>
  );
}

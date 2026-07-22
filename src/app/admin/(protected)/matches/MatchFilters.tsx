'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Select } from '@/components/ui/Select';

const stageOptions = [
  { value: 'all', label: 'All Stages' },
  { value: 'shared', label: 'Profile Shared' },
  { value: 'responded', label: 'Recipient Interested' },
  { value: 'both_shared', label: 'Shared Back' },
  { value: 'both_responded', label: 'Mutual Interest' },
  { value: 'contact_shared', label: 'Contact Shared' },
  { value: 'family_communication', label: 'Families Communicating' },
  { value: 'first_meeting', label: 'First Meeting' },
  { value: 'second_meeting', label: 'Second Meeting' },
  { value: 'final_meeting', label: 'Final Meeting' },
  { value: 'match_fixed', label: 'Match Fixed' },
  { value: 'payment_pending', label: 'Payment Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface MatchFiltersProps {
  currentStage: string;
  currentSearch: string;
}

export function MatchFilters({ currentStage, currentSearch }: MatchFiltersProps) {
  const router = useRouter();

  function handleStageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const stage = e.target.value;
    const params = new URLSearchParams();
    if (stage && stage !== 'all') params.set('stage', stage);
    if (currentSearch) params.set('search', currentSearch);
    const qs = params.toString();
    router.push(`/admin/matches${qs ? `?${qs}` : ''}`);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const search = form.get('search') as string;
    const params = new URLSearchParams();
    if (currentStage && currentStage !== 'all') params.set('stage', currentStage);
    if (search) params.set('search', search);
    const qs = params.toString();
    router.push(`/admin/matches${qs ? `?${qs}` : ''}`);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="w-52">
        <Select
          options={stageOptions}
          value={currentStage || 'all'}
          onChange={handleStageChange}
        />
      </div>
      <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            name="search"
            defaultValue={currentSearch}
            placeholder="Search by name..."
            className="w-full rounded-xl border pl-10 pr-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 focus:border-[var(--gold)]"
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-input)',
            }}
          />
        </div>
        <button type="submit" className="text-sm font-medium hover:underline" style={{ color: 'var(--gold-dark)' }}>
          Search
        </button>
      </form>
    </div>
  );
}

'use client';

import { FilterCapsule } from './FilterCapsule';
import { Checkbox } from '@/components/ui/Checkbox';
import type { ProfileStatus } from '@/types';

const ALL_STATUSES: ProfileStatus[] = ['active', 'inactive'];

interface StatusFilterProps {
  selected: ProfileStatus[];
  onChange: (selected: ProfileStatus[]) => void;
}

export function StatusFilter({ selected, onChange }: StatusFilterProps) {
  function toggle(status: ProfileStatus) {
    if (selected.includes(status)) {
      onChange(selected.filter((s) => s !== status));
    } else {
      onChange([...selected, status]);
    }
  }

  const label = selected.length === 0
    ? 'Status'
    : selected.length === 1
      ? selected[0].charAt(0).toUpperCase() + selected[0].slice(1)
      : `${selected.length} selected`;

  return (
    <FilterCapsule label={label} isActive={selected.length > 0}>
      <div className="space-y-0.5 min-w-[140px]">
        {ALL_STATUSES.map((status) => (
          <Checkbox
            key={status}
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            checked={selected.includes(status)}
            onChange={() => toggle(status)}
          />
        ))}
      </div>
    </FilterCapsule>
  );
}

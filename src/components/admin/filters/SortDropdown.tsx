'use client';

import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown';
import { ArrowUpDown } from 'lucide-react';

type SortOption = 'newest' | 'recently_updated' | 'age_asc' | 'age_desc' | 'salary' | 'most_shared';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'recently_updated', label: 'Recently Updated' },
  { value: 'age_asc', label: 'Age (Youngest First)' },
  { value: 'age_desc', label: 'Age (Oldest First)' },
  { value: 'salary', label: 'Highest Salary' },
  { value: 'most_shared', label: 'Most Shared' },
];

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? 'Sort';

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-all"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-input)',
            color: 'var(--text-muted)',
          }}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {currentLabel}
        </button>
      }
      align="end"
    >
      <div className="py-1">
        {SORT_OPTIONS.map((option, i) => (
          <div key={option.value}>
            {i > 0 && <DropdownSeparator />}
            <DropdownItem active={value === option.value} onClick={() => onChange(option.value)}>
              {option.label}
            </DropdownItem>
          </div>
        ))}
      </div>
    </Dropdown>
  );
}

export type { SortOption };

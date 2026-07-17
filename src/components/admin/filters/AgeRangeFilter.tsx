'use client';

import { FilterCapsule } from './FilterCapsule';

interface AgeRangeFilterProps {
  min: number | undefined;
  max: number | undefined;
  onChange: (min: number | undefined, max: number | undefined) => void;
}

export function AgeRangeFilter({ min, max, onChange }: AgeRangeFilterProps) {
  const isActive = min !== undefined || max !== undefined;
  const label = isActive
    ? `Age: ${min ?? 18} - ${max ?? 70}`
    : 'Age';

  return (
    <FilterCapsule label={label} isActive={isActive} width="min-w-[220px]">
      <div className="flex items-center gap-2 px-1 py-1">
        <div className="flex-1">
          <label className="text-[10px] font-medium text-[var(--gray-400)] uppercase tracking-wider mb-1 block">
            Min
          </label>
          <input
            type="number"
            min={18}
            max={100}
            value={min ?? ''}
            onChange={(e) => {
              const v = e.target.value ? parseInt(e.target.value) : undefined;
              onChange(v, max);
            }}
            placeholder="18"
            className="w-full px-3 py-2 rounded-lg border border-[var(--gray-200)] text-sm text-[var(--brown)] bg-white placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)]"
          />
        </div>
        <span className="text-[var(--gray-400)] mt-5">—</span>
        <div className="flex-1">
          <label className="text-[10px] font-medium text-[var(--gray-400)] uppercase tracking-wider mb-1 block">
            Max
          </label>
          <input
            type="number"
            min={18}
            max={100}
            value={max ?? ''}
            onChange={(e) => {
              const v = e.target.value ? parseInt(e.target.value) : undefined;
              onChange(min, v);
            }}
            placeholder="70"
            className="w-full px-3 py-2 rounded-lg border border-[var(--gray-200)] text-sm text-[var(--brown)] bg-white placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/30 focus:border-[var(--gold)]"
          />
        </div>
      </div>
    </FilterCapsule>
  );
}

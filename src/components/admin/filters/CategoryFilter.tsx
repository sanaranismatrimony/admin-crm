'use client';

import { FilterCapsule } from './FilterCapsule';
import { Checkbox } from '@/components/ui/Checkbox';
import { profileTypeLabel } from '@/lib/utils/format';
import type { ProfileType } from '@/types';

const ALL_CATEGORIES: ProfileType[] = [
  'bride',
  'groom',
  'second_marriage_bride',
  'second_marriage_groom',
  'other_caste_bride',
  'other_caste_groom',
];

interface CategoryFilterProps {
  selected: ProfileType[];
  onChange: (selected: ProfileType[]) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  function toggle(cat: ProfileType) {
    if (selected.includes(cat)) {
      onChange(selected.filter((s) => s !== cat));
    } else {
      onChange([...selected, cat]);
    }
  }

  const label = selected.length === 0
    ? 'Category'
    : selected.length === 1
      ? profileTypeLabel(selected[0])
      : `${selected.length} selected`;

  return (
    <FilterCapsule label={label} isActive={selected.length > 0}>
      <div className="space-y-0.5 min-w-[180px]">
        {ALL_CATEGORIES.map((cat) => (
          <Checkbox
            key={cat}
            label={profileTypeLabel(cat)}
            checked={selected.includes(cat)}
            onChange={() => toggle(cat)}
          />
        ))}
      </div>
    </FilterCapsule>
  );
}

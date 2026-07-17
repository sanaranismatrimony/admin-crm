'use client';

import { Chip } from '@/components/ui/Chip';
import { X } from 'lucide-react';
import type { ProfileType, ProfileStatus } from '@/types';

interface ActiveFilter {
  type: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFiltersProps {
  q: string;
  categories: ProfileType[];
  ageMin: number | undefined;
  ageMax: number | undefined;
  gotrams: string[];
  statuses: ProfileStatus[];
  rashis: string[];
  nakshatrams: string[];
  onClearSearch: () => void;
  onClearCategory: (cat: ProfileType) => void;
  onClearAge: () => void;
  onClearGotram: (g: string) => void;
  onClearStatus: (s: ProfileStatus) => void;
  onClearRashi: (r: string) => void;
  onClearNakshatram: (n: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  q,
  categories,
  ageMin,
  ageMax,
  gotrams,
  statuses,
  rashis,
  nakshatrams,
  onClearSearch,
  onClearCategory,
  onClearAge,
  onClearGotram,
  onClearStatus,
  onClearRashi,
  onClearNakshatram,
  onClearAll,
}: ActiveFiltersProps) {
  const chips: ActiveFilter[] = [];

  if (q) {
    chips.push({ type: 'search', label: `Search: "${q}"`, onRemove: onClearSearch });
  }

  for (const cat of categories) {
    chips.push({ type: 'category', label: cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()), onRemove: () => onClearCategory(cat) });
  }

  if (ageMin !== undefined || ageMax !== undefined) {
    chips.push({
      type: 'age',
      label: `Age: ${ageMin ?? 18} - ${ageMax ?? 70}`,
      onRemove: onClearAge,
    });
  }

  for (const g of gotrams) {
    chips.push({ type: 'gotram', label: g, onRemove: () => onClearGotram(g) });
  }

  for (const s of statuses) {
    chips.push({ type: 'status', label: s.charAt(0).toUpperCase() + s.slice(1), onRemove: () => onClearStatus(s) });
  }

  for (const r of rashis) {
    chips.push({ type: 'rashi', label: r, onRemove: () => onClearRashi(r) });
  }

  for (const n of nakshatrams) {
    chips.push({ type: 'nakshatram', label: n, onRemove: () => onClearNakshatram(n) });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {chips.map((chip, i) => (
        <Chip key={`${chip.type}-${i}`} label={chip.label} onRemove={chip.onRemove} variant="gold" />
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 text-xs text-[var(--gray-400)] hover:text-[var(--red)] transition-colors font-medium"
      >
        <X className="w-3 h-3" />
        Clear All
      </button>
    </div>
  );
}

'use client';

import { FilterCapsule } from './FilterCapsule';
import { Select } from '@/components/ui/Select';

interface HeightRangeFilterProps {
  minFeet: number | undefined;
  minInches: number | undefined;
  maxFeet: number | undefined;
  maxInches: number | undefined;
  onChange: (
    minFeet: number | undefined,
    minInches: number | undefined,
    maxFeet: number | undefined,
    maxInches: number | undefined,
  ) => void;
}

const FEET_OPTIONS = Array.from({ length: 4 }, (_, i) => {
  const v = i + 4;
  return { value: v.toString(), label: `${v} ft` };
});

const INCH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i.toString(),
  label: `${i} in`,
}));

function heightLabel(feet?: number, inches?: number) {
  if (feet === undefined && inches === undefined) return null;
  return `${feet ?? 0}'${inches ?? 0}"`;
}

export function HeightRangeFilter({ minFeet, minInches, maxFeet, maxInches, onChange }: HeightRangeFilterProps) {
  const isActive = minFeet !== undefined || maxFeet !== undefined;
  const label = isActive
    ? `Ht: ${heightLabel(minFeet, minInches) ?? '?'} - ${heightLabel(maxFeet, maxInches) ?? '?'}`
    : 'Height';

  return (
    <FilterCapsule label={label} isActive={isActive} width="min-w-[280px]">
      <div className="space-y-3 px-1 py-1">
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
            Min Height
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                options={FEET_OPTIONS}
                value={minFeet?.toString() ?? ''}
                onChange={(e) => { const v = e.target.value; onChange(v ? parseInt(v) : undefined, minInches, maxFeet, maxInches); }}
                placeholder="Feet"
              />
            </div>
            <div className="flex-1">
              <Select
                options={INCH_OPTIONS}
                value={minInches?.toString() ?? ''}
                onChange={(e) => { const v = e.target.value; onChange(minFeet, v ? parseInt(v) : undefined, maxFeet, maxInches); }}
                placeholder="Inches"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
            Max Height
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                options={FEET_OPTIONS}
                value={maxFeet?.toString() ?? ''}
                onChange={(e) => { const v = e.target.value; onChange(minFeet, minInches, v ? parseInt(v) : undefined, maxInches); }}
                placeholder="Feet"
              />
            </div>
            <div className="flex-1">
              <Select
                options={INCH_OPTIONS}
                value={maxInches?.toString() ?? ''}
                onChange={(e) => { const v = e.target.value; onChange(minFeet, minInches, maxFeet, v ? parseInt(v) : undefined); }}
                placeholder="Inches"
              />
            </div>
          </div>
        </div>
      </div>
    </FilterCapsule>
  );
}

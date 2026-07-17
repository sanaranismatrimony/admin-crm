'use client';

import { CategoryFilter } from './CategoryFilter';
import { AgeRangeFilter } from './AgeRangeFilter';
import { HeightRangeFilter } from './HeightRangeFilter';
import { StatusFilter } from './StatusFilter';
import { FilterCapsule } from './FilterCapsule';
import { MultiSelectFilter } from './MultiSelectFilter';
import type { ProfileType, ProfileStatus } from '@/types';

interface FilterBarProps {
  categories: ProfileType[];
  onCategoriesChange: (cats: ProfileType[]) => void;
  ageMin: number | undefined;
  ageMax: number | undefined;
  onAgeChange: (min: number | undefined, max: number | undefined) => void;
  heightMinFeet: number | undefined;
  heightMinInches: number | undefined;
  heightMaxFeet: number | undefined;
  heightMaxInches: number | undefined;
  onHeightChange: (
    minFeet: number | undefined,
    minInches: number | undefined,
    maxFeet: number | undefined,
    maxInches: number | undefined,
  ) => void;
  gotrams: string[];
  onGotramsChange: (g: string[]) => void;
  statuses: ProfileStatus[];
  onStatusesChange: (s: ProfileStatus[]) => void;
  rashis: string[];
  onRashisChange: (r: string[]) => void;
  nakshatrams: string[];
  onNakshatramsChange: (n: string[]) => void;
  allGotrams: string[];
  allRashis: string[];
  allNakshatrams: string[];
}

export function FilterBar({
  categories,
  onCategoriesChange,
  ageMin,
  ageMax,
  onAgeChange,
  heightMinFeet,
  heightMinInches,
  heightMaxFeet,
  heightMaxInches,
  onHeightChange,
  gotrams,
  onGotramsChange,
  statuses,
  onStatusesChange,
  rashis,
  onRashisChange,
  nakshatrams,
  onNakshatramsChange,
  allGotrams,
  allRashis,
  allNakshatrams,
}: FilterBarProps) {
  const gotramLabel = gotrams.length === 0 ? 'Gotram' : `${gotrams.length} selected`;
  const rashiLabel = rashis.length === 0 ? 'Rashi' : `${rashis.length} selected`;
  const nakshatramLabel = nakshatrams.length === 0 ? 'Nakshatram' : `${nakshatrams.length} selected`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <CategoryFilter selected={categories} onChange={onCategoriesChange} />
      <AgeRangeFilter min={ageMin} max={ageMax} onChange={onAgeChange} />
      <HeightRangeFilter
        minFeet={heightMinFeet}
        minInches={heightMinInches}
        maxFeet={heightMaxFeet}
        maxInches={heightMaxInches}
        onChange={onHeightChange}
      />
      {allGotrams.length > 0 && (
        <FilterCapsule label={gotramLabel} isActive={gotrams.length > 0}>
          <MultiSelectFilter
            options={allGotrams}
            selected={gotrams}
            onChange={onGotramsChange}
            placeholder="Search gotrams..."
          />
        </FilterCapsule>
      )}
      {allRashis.length > 0 && (
        <FilterCapsule label={rashiLabel} isActive={rashis.length > 0}>
          <MultiSelectFilter
            options={allRashis}
            selected={rashis}
            onChange={onRashisChange}
            placeholder="Search rashis..."
          />
        </FilterCapsule>
      )}
      {allNakshatrams.length > 0 && (
        <FilterCapsule label={nakshatramLabel} isActive={nakshatrams.length > 0}>
          <MultiSelectFilter
            options={allNakshatrams}
            selected={nakshatrams}
            onChange={onNakshatramsChange}
            placeholder="Search nakshatrams..."
          />
        </FilterCapsule>
      )}
      <StatusFilter selected={statuses} onChange={onStatusesChange} />
    </div>
  );
}

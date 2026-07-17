'use client';

import { ProfileCard } from './ProfileCard';
import type { Profile } from '@/types';

interface ProfileGridProps {
  profiles: Profile[];
  searchTerm?: string;
}

export function ProfileGrid({ profiles, searchTerm }: ProfileGridProps) {
  if (profiles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[var(--gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <p className="text-[var(--gray-400)] font-medium">No profiles match your search</p>
        <p className="text-xs text-[var(--gray-400)] mt-1">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} searchTerm={searchTerm} />
      ))}
    </div>
  );
}

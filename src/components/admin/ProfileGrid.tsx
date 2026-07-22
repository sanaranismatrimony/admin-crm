'use client';

import { motion } from 'framer-motion';
import { ProfileCard } from './ProfileCard';
import type { Profile } from '@/types';

interface ProfileGridProps {
  profiles: Profile[];
  searchTerm?: string;
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
    >
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 skeleton" />
        <div className="h-4 w-40 skeleton" />
        <div className="h-3 w-24 skeleton" />
        <div className="h-3 w-32 skeleton" />
        <div className="flex justify-center gap-3 pt-2">
          <div className="w-9 h-9 rounded-full skeleton" />
          <div className="w-9 h-9 rounded-full skeleton" />
          <div className="w-9 h-9 rounded-full skeleton" />
          <div className="w-9 h-9 rounded-full skeleton" />
        </div>
      </div>
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export function ProfileGrid({ profiles, searchTerm, loading }: ProfileGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(212,168,83,0.1)' }}
        >
          <svg className="w-8 h-8" style={{ color: 'var(--gold)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No profiles match your search</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search terms</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {profiles.map((profile) => (
        <motion.div key={profile.id} variants={item}>
          <ProfileCard profile={profile} searchTerm={searchTerm} />
        </motion.div>
      ))}
    </motion.div>
  );
}

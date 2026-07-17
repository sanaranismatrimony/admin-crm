'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { createMatch, searchProfilesForMatch } from '@/lib/db/matches';
import { stageLabel } from '@/lib/utils/format';
import type { InitiatedBy } from '@/types';

interface SendProfileDialogProps {
  profileId: string;
  profileName: string;
  profileGender: string;
  existingMatches?: Array<{
    id: string;
    bride_profile_id: string;
    groom_profile_id: string;
    stage: string;
  }>;
}

interface ProfileResult {
  id: string;
  profile_id: string;
  full_name: string;
  gender: string;
  age: number;
  city: string;
}

export function SendProfileDialog({ profileId, profileName, profileGender, existingMatches = [] }: SendProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const oppositeGender = profileGender === 'male' ? 'female' : 'male';

  // Check if a profile already has an active match with the current profile
  function getExistingMatch(targetId: string): { id: string; stage: string } | null {
    for (const m of existingMatches) {
      const isBride = profileGender === 'female' ? profileId : targetId;
      const isGroom = profileGender === 'male' ? profileId : targetId;
      if (m.bride_profile_id === isBride && m.groom_profile_id === isGroom) {
        if (m.stage !== 'rejected' && m.stage !== 'cancelled') {
          return { id: m.id, stage: m.stage };
        }
      }
    }
    return null;
  }

  async function handleSearch(query: string) {
    setSearch(query);
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await searchProfilesForMatch(query, oppositeGender);
      setResults(data || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(targetProfileId: string) {
    setCreating(targetProfileId);
    setError('');

    try {
      const brideId = profileGender === 'female' ? profileId : targetProfileId;
      const groomId = profileGender === 'male' ? profileId : targetProfileId;
      const initiatedBy: InitiatedBy = profileGender === 'female' ? 'bride' : 'groom';

      await createMatch(brideId, groomId, initiatedBy);
      setIsOpen(false);
      setSearch('');
      setResults([]);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create match');
    } finally {
      setCreating(null);
    }
  }

  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>
        <UserPlus className="w-4 h-4" /> Send {profileGender === 'male' ? 'to Bride' : 'Groom'}
      </Button>

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setSearch(''); setResults([]); }} title={`Send ${profileName}`} maxWidth="max-w-md">
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-sm text-[var(--red)] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gray-400)]" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={`Search ${profileGender === 'male' ? 'brides' : 'grooms'}...`}
              className="w-full rounded-xl border border-[var(--gray-200)] pl-10 pr-4 py-2.5 text-sm text-[var(--brown)] bg-white placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 focus:border-[var(--gold)]"
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-[var(--gray-400)] animate-spin" />
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="divide-y divide-[var(--gray-100)] max-h-64 overflow-y-auto -mx-2">
              {results.map((profile) => {
                const existing = getExistingMatch(profile.id);
                return (
                  <button
                    key={profile.id}
                    onClick={() => !existing && handleSelect(profile.id)}
                    disabled={creating === profile.id || !!existing}
                    className="w-full flex items-center justify-between px-2 py-3 hover:bg-[var(--cream)] transition-colors rounded-lg text-left disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--brown)]">{profile.full_name || 'Unnamed'}</p>
                      <p className="text-xs text-[var(--gray-400)]">
                        {profile.profile_id} &middot; {profile.age || '?'} yrs
                        {profile.city ? ` · ${profile.city}` : ''}
                      </p>
                    </div>
                    {existing ? (
                      <Badge variant="info">{stageLabel(existing.stage)}</Badge>
                    ) : creating === profile.id ? (
                      <Loader2 className="w-4 h-4 text-[var(--gold)] animate-spin" />
                    ) : (
                      <span className="text-xs text-[var(--gold-dark)] font-medium">Select</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {!loading && search.trim() && results.length === 0 && (
            <p className="text-sm text-[var(--gray-400)] text-center py-4">
              No {profileGender === 'male' ? 'brides' : 'grooms'} found matching &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}

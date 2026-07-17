'use client';

import Link from 'next/link';
import { ExternalLink, HeartHandshake, Pause } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { stageLabel, stageBadgeVariant } from '@/lib/utils/format';
import { getStageProgress } from '@/lib/utils/format';

interface MatchWithProfiles {
  id: string;
  bride_profile_id: string;
  groom_profile_id: string;
  stage: string;
  is_on_hold: boolean;
  bride_interest: string | null;
  groom_interest: string | null;
  initiated_by: string | null;
  rejected_by: string | null;
  created_at: string;
  bride: { full_name: string; profile_id: string; gender: string } | null;
  groom: { full_name: string; profile_id: string; gender: string } | null;
}

interface ProfileMatchHistoryProps {
  profileId: string;
  matches: MatchWithProfiles[];
}



export function ProfileMatchHistory({ profileId, matches }: ProfileMatchHistoryProps) {
  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-[var(--gray-400)]" />
            <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">Match History</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--gray-400)] text-center py-4">No match history yet</p>
        </CardContent>
      </Card>
    );
  }

  const outgoing = matches.filter((m) => {
    if (m.initiated_by === 'groom' && profileId === m.groom_profile_id) return true;
    if (m.initiated_by === 'bride' && profileId === m.bride_profile_id) return true;
    return false;
  });

  const incoming = matches.filter((m) => !outgoing.includes(m));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-[var(--gold)]" />
          <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">Match History</h3>
          <span className="text-xs text-[var(--gray-400)] ml-auto">{matches.length} total</span>
        </div>
      </CardHeader>
      <CardContent>
        {outgoing.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider mb-2">Shared to Others</p>
            <div className="space-y-2">
              {outgoing.map((match) => {
                const otherProfile = match.bride_profile_id === profileId ? match.groom : match.bride;
                return (
                  <MatchRow key={match.id} match={match} otherProfile={otherProfile} />
                );
              })}
            </div>
          </div>
        )}

        {incoming.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider mb-2">Shared to This Profile</p>
            <div className="space-y-2">
              {incoming.map((match) => {
                const isBride = profileId === match.bride_profile_id;
                const otherProfile = isBride ? match.groom : match.bride;
                return (
                  <MatchRow key={match.id} match={match} otherProfile={otherProfile} />
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MatchRow({ match, otherProfile }: { match: MatchWithProfiles; otherProfile: { full_name: string; profile_id: string } | null }) {
  const { current, total } = getStageProgress(match.stage);
  const isTerminal = match.stage === 'rejected' || match.stage === 'cancelled';
  const percent = isTerminal ? 0 : Math.round((current / total) * 100);

  return (
    <Link
      href={`/admin/matches/${match.id}`}
      className="block rounded-xl border border-[var(--gray-100)] p-3 hover:border-[var(--gold)]/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium text-[var(--brown)] truncate">
            {otherProfile?.full_name || 'Unknown'}
          </p>
          <Badge variant={stageBadgeVariant[match.stage] || 'default'}>
            {stageLabel(match.stage || 'shared')}
          </Badge>
          {match.is_on_hold && (
            <Pause className="w-3 h-3 text-amber-500" />
          )}
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-[var(--gray-400)] shrink-0" />
      </div>
      <div className="w-full h-1.5 bg-[var(--gray-100)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isTerminal ? 'bg-red-300' : percent >= 100 ? 'bg-[var(--green)]' : 'bg-[var(--gold)]'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-[var(--gray-400)] mt-1.5">
        {otherProfile?.profile_id}
      </p>
    </Link>
  );
}

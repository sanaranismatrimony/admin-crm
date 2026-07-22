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
            <HeartHandshake className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>Match History</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No match history yet</p>
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
          <HeartHandshake className="w-4 h-4" style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>Match History</h3>
          <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{matches.length} total</span>
        </div>
      </CardHeader>
      <CardContent>
        {outgoing.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Shared to Others</p>
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
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Shared to This Profile</p>
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
      className="block rounded-xl border p-3 transition-all"
      style={{ borderColor: 'var(--border-default)' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {otherProfile?.full_name || 'Unknown'}
          </p>
          <Badge variant={stageBadgeVariant[match.stage] || 'default'}>
            {stageLabel(match.stage || 'shared')}
          </Badge>
          {match.is_on_hold && (
            <Pause className="w-3 h-3" style={{ color: 'var(--amber)' }} />
          )}
        </div>
        <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--gray-100)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percent}%`,
            background: isTerminal ? 'var(--red)' : percent >= 100 ? 'var(--green)' : 'var(--gold)',
          }}
        />
      </div>
      <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
        {otherProfile?.profile_id}
      </p>
    </Link>
  );
}

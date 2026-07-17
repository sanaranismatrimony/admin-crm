import { createServerSupabase } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MatchActions } from '@/components/admin/MatchActions';
import { formatDate, stageLabel, stageBadgeVariant } from '@/lib/utils/format';
import { MatchFilters } from './MatchFilters';
import { getStageProgress } from '@/lib/utils/format';
import { Pause, Users } from 'lucide-react';
import Link from 'next/link';

const STAGE_SORT_ORDER: Record<string, number> = {
  shared: 0,
  responded: 1,
  both_shared: 2,
  both_responded: 3,
  contact_shared: 4,
  family_communication: 5,
  first_meeting: 6,
  second_meeting: 7,
  final_meeting: 8,
  match_fixed: 9,
  payment_pending: 10,
  completed: 11,
  rejected: -1,
  cancelled: -2,
};

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; search?: string }>;
}) {
  const { stage, search } = await searchParams;
  const supabase = await createServerSupabase();

  let query = supabase
    .from('matches')
    .select('*, bride:profiles!matches_bride_profile_id_fkey(id, full_name, profile_id), groom:profiles!matches_groom_profile_id_fkey(id, full_name, profile_id)')
    .order('created_at', { ascending: false });

  if (stage && stage !== 'all') {
    if (stage === 'on_hold') {
      query = query.eq('is_on_hold', true);
    } else {
      query = query.eq('stage', stage);
    }
  }

  const { data: matches } = await query;

  let filteredMatches = matches || [];

  if (search) {
    const q = search.toLowerCase();
    filteredMatches = filteredMatches.filter((m) =>
      m.bride?.full_name?.toLowerCase().includes(q) ||
      m.groom?.full_name?.toLowerCase().includes(q) ||
      m.bride?.profile_id?.toLowerCase().includes(q) ||
      m.groom?.profile_id?.toLowerCase().includes(q)
    );
  }

  filteredMatches.sort((a, b) => {
    const aRank = STAGE_SORT_ORDER[a.stage || 'shared'] ?? 0;
    const bRank = STAGE_SORT_ORDER[b.stage || 'shared'] ?? 0;
    if (aRank !== bRank) return aRank - bRank;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--gray-400)]">{filteredMatches.length} matches</p>
      </div>

      <MatchFilters currentStage={stage || ''} currentSearch={search || ''} />

      <div className="grid gap-3">
        {filteredMatches.length > 0 ? filteredMatches.map((match) => {
          const { current, total } = getStageProgress(match.stage || 'shared');
          const isTerminal = match.stage === 'rejected' || match.stage === 'cancelled';
          const progressPercent = isTerminal ? 0 : Math.round((current / total) * 100);

          return (
            <a
              key={match.id}
              href={`/admin/matches/${match.id}`}
              className="block"
            >
              <Card className="hover:border-[var(--gold)]/30 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-[var(--brown)] truncate">
                          {match.bride?.full_name || 'Bride'} &amp; {match.groom?.full_name || 'Groom'}
                        </h3>
                        <Badge variant={stageBadgeVariant[match.stage] || 'default'}>
                          {stageLabel(match.stage || 'shared')}
                        </Badge>
                        {match.is_on_hold && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-600">
                            <Pause className="w-2.5 h-2.5" /> Hold
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--gray-400)] mt-1">
                        {match.bride?.profile_id} &amp; {match.groom?.profile_id}
                        {match.match_fixed_date ? ` · Fixed ${formatDate(match.match_fixed_date)}` : ''}
                      </p>
                      <div className="mt-2 w-full max-w-xs h-1.5 bg-[var(--gray-100)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isTerminal ? 'bg-red-300' : progressPercent >= 100 ? 'bg-[var(--green)]' : 'bg-[var(--gold)]'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <MatchActions match={match} />
                    </div>
                  </div>
                  {match.admin_notes && (
                    <p className="text-xs text-[var(--gray-500)] mt-2 pt-2 border-t border-[var(--gray-100)]">{match.admin_notes}</p>
                  )}
                </CardContent>
              </Card>
            </a>
          );
        }) : (
          <div className="text-center py-12 space-y-4">
            <p className="text-[var(--gray-400)]">No matches found{search ? ` for \u201c${search}\u201d` : ''}.</p>
            {!search && (
              <Link
                href="/admin/profiles"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--gold)] text-white text-sm hover:opacity-90 transition-opacity"
              >
                <Users className="w-4 h-4" />
                Browse Profiles
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

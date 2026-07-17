import { createServerSupabase } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Users, Share2, HeartHandshake, Wallet, Activity, Pause, UserCheck } from 'lucide-react';
import { stageLabel, stageBadgeVariant } from '@/lib/utils/format';

export default async function DashboardPage() {
  const supabase = await createServerSupabase();

  const activeStages = [
    'shared', 'responded', 'both_shared', 'both_responded',
    'contact_shared', 'family_communication',
    'first_meeting', 'second_meeting', 'final_meeting',
  ];

  const meetingStages = ['first_meeting', 'second_meeting', 'final_meeting'];

  const [
    profileCount,
    shareCount,
    matchFixedCount,
    paymentPendingCount,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profile_shares').select('id', { count: 'exact', head: true }),
    supabase.from('matches').select('id', { count: 'exact', head: true }).eq('stage', 'match_fixed'),
    supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  // Count active matches (all pre-fixed stages)
  const { count: activeMatchesCount } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .in('stage', activeStages);

  // Count on-hold matches
  const { count: onHoldCount } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .eq('is_on_hold', true);

  // Count in-meeting matches
  const { count: meetingCount } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .in('stage', meetingStages);

  const stats = [
    { label: 'Total Profiles', value: profileCount.count || 0, icon: Users, color: 'text-[var(--gold)]', bg: 'bg-[var(--gold)]/10' },
    { label: 'Active Matches', value: activeMatchesCount || 0, icon: Activity, color: 'text-[var(--amber)]', bg: 'bg-amber-50' },
    { label: 'In Meetings', value: meetingCount || 0, icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Match Fixed', value: matchFixedCount.count || 0, icon: HeartHandshake, color: 'text-[var(--green)]', bg: 'bg-green-50' },
    { label: 'On Hold', value: onHoldCount || 0, icon: Pause, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Pending Payments', value: paymentPendingCount.count || 0, icon: Wallet, color: 'text-[var(--red)]', bg: 'bg-red-50' },
  ];

  const { data: recentProfiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: activeMatches } = await supabase
    .from('matches')
    .select('*, bride:profiles!matches_bride_profile_id_fkey(full_name, profile_id, gender), groom:profiles!matches_groom_profile_id_fkey(full_name, profile_id, gender)')
    .in('stage', activeStages)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--gray-400)]">{stat.label}</p>
                  <p className="text-2xl font-semibold text-[var(--brown)] mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[var(--brown)]">Active Matches</h3>
              <Link href="/admin/matches" className="text-xs text-[var(--gold-dark)] hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {activeMatches?.map((m) => (
                <Link
                  key={m.id}
                  href={`/admin/matches/${m.id}`}
                  className="flex items-center justify-between py-2 border-b border-[var(--gray-100)] last:border-0 hover:bg-[var(--cream)]/50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-sm text-[var(--brown)]">
                      {m.bride?.full_name || 'Bride'} &amp; {m.groom?.full_name || 'Groom'}
                    </p>
                    <p className="text-xs text-[var(--gray-400)]">{m.bride?.profile_id} &amp; {m.groom?.profile_id}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {m.is_on_hold && <Pause className="w-3 h-3 text-amber-500" />}
                    <Badge variant={stageBadgeVariant[m.stage] || 'default'}>
                      {stageLabel(m.stage)}
                    </Badge>
                  </div>
                </Link>
              ))}
              {(!activeMatches || activeMatches.length === 0) && (
                <p className="text-sm text-[var(--gray-400)]">No active matches</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[var(--brown)]">Recent Profiles</h3>
              <Link href="/admin/profiles" className="text-xs text-[var(--gold-dark)] hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {recentProfiles?.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--gray-100)] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[var(--brown)]">{p.full_name}</p>
                    <p className="text-xs text-[var(--gray-400)]">{p.profile_id}</p>
                  </div>
                  <Badge variant={p.status === 'active' ? 'success' : 'default'}>{p.status}</Badge>
                </div>
              ))}
              {(!recentProfiles || recentProfiles.length === 0) && (
                <p className="text-sm text-[var(--gray-400)]">No profiles yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

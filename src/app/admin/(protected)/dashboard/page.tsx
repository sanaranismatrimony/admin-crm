import { createServerSupabase } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Users, Share2, HeartHandshake, Wallet, Activity, Pause, UserCheck } from 'lucide-react';
import { stageLabel, stageBadgeVariant } from '@/lib/utils/format';
import { StatsGrid } from './StatsGrid';
import { DashboardLists } from './DashboardLists';

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

  const { count: activeMatchesCount } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .in('stage', activeStages);

  const { count: onHoldCount } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .eq('is_on_hold', true);

  const { count: meetingCount } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .in('stage', meetingStages);

  const stats = [
    { label: 'Total Profiles', value: profileCount.count || 0, icon: Users, color: 'var(--gold)', bg: 'rgba(212,168,83,0.12)' },
    { label: 'Active Matches', value: activeMatchesCount || 0, icon: Activity, color: 'var(--amber)', bg: 'rgba(217,119,6,0.12)' },
    { label: 'In Meetings', value: meetingCount || 0, icon: UserCheck, color: 'var(--blue)', bg: 'rgba(37,99,235,0.12)' },
    { label: 'Match Fixed', value: matchFixedCount.count || 0, icon: HeartHandshake, color: 'var(--green)', bg: 'rgba(22,163,74,0.12)' },
    { label: 'On Hold', value: onHoldCount || 0, icon: Pause, color: 'var(--amber)', bg: 'rgba(217,119,6,0.12)' },
    { label: 'Pending Payments', value: paymentPendingCount.count || 0, icon: Wallet, color: 'var(--red)', bg: 'rgba(220,38,38,0.12)' },
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
      <StatsGrid stats={stats} />

      <DashboardLists activeMatches={activeMatches} recentProfiles={recentProfiles} />
    </div>
  );
}

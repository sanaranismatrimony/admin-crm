'use client';

import { motion } from 'framer-motion';
import { Pause } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { stageLabel, stageBadgeVariant } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/format';

interface Match {
  id: string;
  stage: string;
  is_on_hold: boolean;
  bride?: { full_name: string; profile_id: string };
  groom?: { full_name: string; profile_id: string };
}

interface Profile {
  id: string;
  full_name: string;
  profile_id: string;
  status: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

export function DashboardLists({ activeMatches, recentProfiles }: { activeMatches: Match[] | null; recentProfiles: Profile[] | null }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Active Matches</h3>
            <Link href="/admin/matches" className="text-xs font-medium hover:underline" style={{ color: 'var(--gold-dark)' }}>View all</Link>
          </div>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {activeMatches?.map((m) => (
              <motion.div key={m.id} variants={item}>
                <Link
                  href={`/admin/matches/${m.id}`}
                  className="flex items-center justify-between py-2.5 border-b last:border-0 -mx-2 px-2 rounded-lg transition-colors"
                  style={{ borderColor: 'var(--border-default)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {m.bride?.full_name || 'Bride'} &amp; {m.groom?.full_name || 'Groom'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.bride?.profile_id} &amp; {m.groom?.profile_id}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {m.is_on_hold && <Pause className="w-3 h-3" style={{ color: 'var(--amber)' }} />}
                    <Badge variant={stageBadgeVariant[m.stage] || 'default'}>
                      {stageLabel(m.stage)}
                    </Badge>
                  </div>
                </Link>
              </motion.div>
            ))}
            {(!activeMatches || activeMatches.length === 0) && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No active matches</p>
            )}
          </motion.div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Profiles</h3>
            <Link href="/admin/profiles" className="text-xs font-medium hover:underline" style={{ color: 'var(--gold-dark)' }}>View all</Link>
          </div>
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {recentProfiles?.map((p) => (
              <motion.div key={p.id} variants={item}>
                <Link
                  href={`/admin/profiles/${p.id}`}
                  className="flex items-center justify-between py-2.5 border-b last:border-0 -mx-2 px-2 rounded-lg transition-colors"
                  style={{ borderColor: 'var(--border-default)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.full_name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.profile_id}</p>
                  </div>
                  <Badge variant={p.status === 'active' ? 'success' : 'default'}>{p.status}</Badge>
                </Link>
              </motion.div>
            ))}
            {(!recentProfiles || recentProfiles.length === 0) && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No profiles yet</p>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}

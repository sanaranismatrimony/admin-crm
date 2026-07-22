import { createServerSupabase } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/format';
import { Share2, Users } from 'lucide-react';
import Link from 'next/link';

export default async function SharesPage() {
  const supabase = await createServerSupabase();
  const { data: shares } = await supabase
    .from('profile_shares')
    .select('*, profiles:profile_id(full_name, profile_id)')
    .order('shared_date', { ascending: false });

  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{shares?.length || 0} total shares</p>

      <div className="grid gap-4">
        {shares && shares.length > 0 ? shares.map((share) => (
          <Card key={share.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {(share as any).profiles?.full_name || 'Unknown Profile'}
                    </h3>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{(share as any).profiles?.profile_id}</span>
                  </div>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Shared with {share.recipient_name || share.recipient_phone}
                    {share.view_count ? ` \u00B7 ${share.view_count} views` : ''}
                    {share.viewed_at ? ` \u00B7 Last viewed ${formatDate(share.viewed_at)}` : ''}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Shared {formatDate(share.shared_date)}</p>
                </div>
                <Badge variant={share.interest_status === 'interested' ? 'success' : share.interest_status === 'not_interested' ? 'danger' : 'default'}>
                  {share.interest_status || 'Pending'}
                </Badge>
              </div>
              {share.notes && (
                <p className="text-sm mt-2 pt-2" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>{share.notes}</p>
              )}
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-20">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(212,168,83,0.1)' }}
            >
              <Share2 className="w-8 h-8" style={{ color: 'var(--gold)' }} />
            </div>
            <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No shares yet</p>
            <p className="text-sm mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Share a profile to get started</p>
            <Link
              href="/admin/profiles"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity"
              style={{ background: 'var(--gold)' }}
            >
              <Users className="w-4 h-4" /> Browse Profiles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

import { createServerSupabase } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/format';

export default async function SharesPage() {
  const supabase = await createServerSupabase();
  const { data: shares } = await supabase
    .from('profile_shares')
    .select('*, profiles:profile_id(full_name, profile_id)')
    .order('shared_date', { ascending: false });

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--gray-400)]">{shares?.length || 0} total shares</p>

      <div className="grid gap-4">
        {shares && shares.length > 0 ? shares.map((share) => (
          <Card key={share.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--brown)] truncate">
                      {(share as any).profiles?.full_name || 'Unknown Profile'}
                    </h3>
                    <span className="text-xs text-[var(--gray-400)]">{(share as any).profiles?.profile_id}</span>
                  </div>
                  <p className="text-sm text-[var(--gray-400)] mt-0.5">
                    Shared with {share.recipient_name || share.recipient_phone}
                    {share.view_count ? ` · ${share.view_count} views` : ''}
                    {share.viewed_at ? ` · Last viewed ${formatDate(share.viewed_at)}` : ''}
                  </p>
                  <p className="text-xs text-[var(--gray-400)]">Shared {formatDate(share.shared_date)}</p>
                </div>
                <Badge variant={share.interest_status === 'interested' ? 'success' : share.interest_status === 'not_interested' ? 'danger' : 'default'}>
                  {share.interest_status || 'Pending'}
                </Badge>
              </div>
              {share.notes && (
                <p className="text-sm text-[var(--gray-500)] mt-2 pt-2 border-t border-[var(--gray-100)]">{share.notes}</p>
              )}
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-12">
            <p className="text-[var(--gray-400)]">No shares yet. Share a profile to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

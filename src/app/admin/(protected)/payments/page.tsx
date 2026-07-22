import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Wallet } from 'lucide-react';
import { PaymentActions } from '@/components/admin/PaymentActions';
import { formatDate, formatCurrency, paymentStatusLabel } from '@/lib/utils/format';

export default async function PaymentsPage() {
  const supabase = await createServerSupabase();
  const { data: payments } = await supabase
    .from('payments')
    .select('*, match:matches!inner(id, bride_profile_id, groom_profile_id, bride:profiles!matches_bride_profile_id_fkey(full_name, profile_id), groom:profiles!matches_groom_profile_id_fkey(full_name, profile_id))')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{payments?.length || 0} payments</p>

      <div className="grid gap-4">
        {payments && payments.length > 0 ? payments.map((payment: any) => (
          <Card key={payment.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/matches/${payment.match?.id}`} className="group inline-flex items-center gap-1">
                      <h3 className="font-medium transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {payment.match?.bride?.full_name || 'Bride'} &amp; {payment.match?.groom?.full_name || 'Groom'}
                      </h3>
                      <ExternalLink className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    </Link>
                    <Badge variant={payment.status === 'paid' ? 'success' : 'warning'}>
                      {paymentStatusLabel(payment.status)}
                    </Badge>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {payment.match?.bride?.profile_id} &amp; {payment.match?.groom?.profile_id}
                    {payment.amount ? ` \u00B7 ${formatCurrency(payment.amount)}` : ''}
                  </p>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Created {formatDate(payment.created_at)}
                    {payment.paid_date ? ` \u00B7 Paid ${formatDate(payment.paid_date)}` : ''}
                  </div>
                </div>
                <PaymentActions payment={payment} />
              </div>
              {payment.notes && (
                <p className="text-sm mt-3 pt-3" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>{payment.notes}</p>
              )}
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-20">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(212,168,83,0.1)' }}
            >
              <Wallet className="w-8 h-8" style={{ color: 'var(--gold)' }} />
            </div>
            <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No payments recorded yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Payments will appear here once matches progress to payment stages</p>
          </div>
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ExternalLink } from 'lucide-react';
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
      <p className="text-sm text-[var(--gray-400)]">{payments?.length || 0} payments</p>

      <div className="grid gap-4">
        {payments && payments.length > 0 ? payments.map((payment: any) => (
          <Card key={payment.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/matches/${payment.match?.id}`} className="group inline-flex items-center gap-1">
                      <h3 className="font-medium text-[var(--brown)] group-hover:text-[var(--gold-dark)] transition-colors">
                        {payment.match?.bride?.full_name || 'Bride'} &amp; {payment.match?.groom?.full_name || 'Groom'}
                      </h3>
                      <ExternalLink className="w-3 h-3 text-[var(--gray-400)] group-hover:text-[var(--gold-dark)]" />
                    </Link>
                    <Badge variant={payment.status === 'paid' ? 'success' : 'warning'}>
                      {paymentStatusLabel(payment.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--gray-400)] mt-1">
                    {payment.match?.bride?.profile_id} &amp; {payment.match?.groom?.profile_id}
                    {payment.amount ? ` · ${formatCurrency(payment.amount)}` : ''}
                  </p>
                  <div className="text-xs text-[var(--gray-400)] mt-0.5">
                    Created {formatDate(payment.created_at)}
                    {payment.paid_date ? ` · Paid ${formatDate(payment.paid_date)}` : ''}
                  </div>
                </div>
                <PaymentActions payment={payment} />
              </div>
              {payment.notes && (
                <p className="text-sm text-[var(--gray-500)] mt-3 pt-3 border-t border-[var(--gray-100)]">{payment.notes}</p>
              )}
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-12">
            <p className="text-[var(--gray-400)]">No payments recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

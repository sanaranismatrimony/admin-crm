'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { updatePaymentStatus } from '@/lib/db/payments';

interface PaymentActionsProps {
  payment: any;
}

export function PaymentActions({ payment }: PaymentActionsProps) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(status: 'pending' | 'paid') {
    setLoading(true);
    try {
      await updatePaymentStatus(payment.id, status);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {payment.status === 'pending' && (
        <Button variant="primary" size="sm" loading={loading} onClick={() => handleStatusChange('paid')}>
          Mark as Paid
        </Button>
      )}
      {payment.status === 'paid' && (
        <Button variant="outline" size="sm" loading={loading} onClick={() => handleStatusChange('pending')}>
          Revert to Pending
        </Button>
      )}
    </div>
  );
}

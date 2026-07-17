'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import type { Payment } from '@/types';

async function db() {
  return createServerSupabase();
}

export async function getPayments() {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('payments')
    .select('*, match:matches!inner(bride_profile_id, groom_profile_id, bride:profiles!matches_bride_profile_id_fkey(full_name, profile_id), groom:profiles!matches_groom_profile_id_fkey(full_name, profile_id))')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createPayment(matchId: string, amount: number, paymentFor?: string) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('payments')
    .insert({ match_id: matchId, amount, status: 'pending', payment_for: paymentFor || '' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Payment;
}

export async function getPaymentsForMatch(matchId: string) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Payment[];
}

export async function createPaymentsForMatch(matchId: string, brideProfileName?: string, groomProfileName?: string) {
  await requireAdmin();
  const supabase = await db();
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('match_id', matchId);

  if (existing && existing.length > 0) return existing;

  const payments = [
    {
      match_id: matchId,
      amount: 20000,
      status: 'pending' as const,
      payment_for: 'groom',
      notes: `Groom family payment${groomProfileName ? ` — ${groomProfileName}` : ''}`,
    },
    {
      match_id: matchId,
      amount: 10000,
      status: 'pending' as const,
      payment_for: 'bride',
      notes: `Bride family payment${brideProfileName ? ` — ${brideProfileName}` : ''}`,
    },
  ];

  const { data, error } = await supabase
    .from('payments')
    .insert(payments)
    .select();
  if (error) throw new Error(error.message);
  return data as Payment[];
}

export async function updatePayment(id: string, updates: { amount?: number; notes?: string }) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Payment;
}

export async function updatePaymentStatus(id: string, status: 'pending' | 'paid') {
  await requireAdmin();
  const supabase = await db();
  const updates: Partial<Payment> = { status };
  if (status === 'paid') updates.paid_date = new Date().toISOString();

  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Payment;
}

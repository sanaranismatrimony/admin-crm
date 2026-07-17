'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import type { Family } from '@/types';

export async function getFamilies() {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('families').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Family[];
}

export async function getFamily(id: string) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('families').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data as Family;
}

export async function createFamily(name: string, phone: string, email: string, notes?: string) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('families')
    .insert({ name, phone, email, notes: notes || '' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Family;
}

export async function updateFamily(id: string, updates: Partial<Family>) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('families').update(updates).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data as Family;
}

export async function deleteFamily(id: string) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('families').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

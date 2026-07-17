'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import type { ProfileShare, ProfileView } from '@/types';
import { v4 as uuidv4 } from 'uuid';

async function db() {
  return createServerSupabase();
}

export async function createShare(
  profileId: string,
  recipientName: string,
  recipientPhone: string,
  notes?: string,
  matchId?: string
) {
  await requireAdmin();
  const supabase = await db();

  const share: Record<string, any> = {
    profile_id: profileId,
    share_token: uuidv4(),
    recipient_name: recipientName,
    recipient_phone: recipientPhone,
    view_count: 0,
    notes: notes || '',
    can_view_contact: false,
    can_view_location: true,
    is_revoked: false,
  };

  if (matchId) {
    share.match_id = matchId;
  }

  const { data, error } = await supabase.from('profile_shares').insert(share).select().single();
  if (error) throw new Error(error.message);
  return data as ProfileShare;
}

export async function getShares(profileId?: string) {
  await requireAdmin();
  const supabase = await db();
  let query = supabase
    .from('profile_shares')
    .select('*, profiles(full_name, profile_id)')
    .order('shared_date', { ascending: false });

  if (profileId) query = query.eq('profile_id', profileId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getShareByToken(token: string) {
  const supabase = await db();
  const { data, error } = await supabase
    .from('profile_shares')
    .select('*, profiles(*)')
    .eq('share_token', token)
    .single();
  if (error) return null;

  if (data?.is_revoked) return null;

  return data;
}

export async function getSharesForMatch(matchId: string) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('profile_shares')
    .select('*, profiles(full_name, profile_id, gender)')
    .eq('match_id', matchId)
    .order('shared_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function updateInterest(shareId: string, status: 'interested' | 'not_interested') {
  const supabase = await db();
  const { data, error } = await supabase
    .from('profile_shares')
    .update({ interest_status: status })
    .eq('id', shareId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ProfileShare;
}

export async function updateShareVisibility(
  shareId: string,
  updates: { can_view_contact?: boolean; can_view_location?: boolean }
) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('profile_shares')
    .update(updates)
    .eq('id', shareId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ProfileShare;
}

export async function revokeAllSharesForMatch(matchId: string) {
  const supabase = await db();
  const { error } = await supabase
    .from('profile_shares')
    .update({
      is_revoked: true,
      revoked_at: new Date().toISOString(),
    })
    .eq('match_id', matchId);
  if (error) throw new Error(error.message);
}

export async function revokeShare(shareId: string) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('profile_shares')
    .update({
      is_revoked: true,
      revoked_at: new Date().toISOString(),
    })
    .eq('id', shareId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ProfileShare;
}

export async function restoreShare(shareId: string) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('profile_shares')
    .update({
      is_revoked: false,
      revoked_at: null,
    })
    .eq('id', shareId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ProfileShare;
}

export async function logView(shareToken: string, profileId: string, ipAddress: string, userAgent: string) {
  const supabase = await db();

  const view = {
    share_token: shareToken,
    profile_id: profileId,
    ip_address: ipAddress,
    user_agent: userAgent,
  };

  const { error } = await supabase.from('profile_views').insert(view);
  if (error) return;

  const { data: nextCount } = await supabase.rpc('increment_view_count', { share_token_param: shareToken });

  await supabase
    .from('profile_shares')
    .update({
      viewed_at: new Date().toISOString(),
      view_count: typeof nextCount === 'number' ? nextCount : undefined,
    })
    .eq('share_token', shareToken);
}

export async function getProfileViews(shareToken: string) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('profile_views')
    .select('*')
    .eq('share_token', shareToken)
    .order('viewed_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as ProfileView[];
}

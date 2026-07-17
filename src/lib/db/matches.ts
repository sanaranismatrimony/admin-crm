'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { createShare, revokeAllSharesForMatch } from '@/lib/db/shares';
import { requireAdmin } from '@/lib/auth/require-admin';
import type { Match, MatchStage, InterestStatus, InitiatedBy } from '@/types';

type MatchUpdate = Record<string, string | boolean | number | null | undefined>;
type MatchJoinRow = Match & {
  bride?: { full_name: string; profile_id: string; [k: string]: unknown };
  groom?: { full_name: string; profile_id: string; [k: string]: unknown };
};

async function db() {
  return createServerSupabase();
}

const MATCH_SELECT = `
  *,
  bride:profiles!matches_bride_profile_id_fkey(id, full_name, profile_id, photo_urls, age, city, gender, profile_type, phone, whatsapp, caste, education, career, father_name, mother_name),
  groom:profiles!matches_groom_profile_id_fkey(id, full_name, profile_id, photo_urls, age, city, gender, profile_type, phone, whatsapp, caste, education, career, father_name, mother_name)
`;

// ─── Queries ────────────────────────────────────────────

export async function getMatches(params?: { stage?: string; search?: string }) {
  await requireAdmin();
  const supabase = await db();
  let query = supabase
    .from('matches')
    .select(MATCH_SELECT)
    .order('created_at', { ascending: false });

  if (params?.stage && params.stage !== 'all') {
    if (params.stage === 'on_hold') {
      query = query.eq('is_on_hold', true);
    } else {
      query = query.eq('stage', params.stage);
    }
  }

  // Server-side name search
  if (params?.search) {
    // Supabase doesn't support cross-table ilike in .or() for joined tables,
    // so we fetch all and filter. For scale, add a search RPC.
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    const q = params.search.toLowerCase();
    return (data || []).filter((m: MatchJoinRow) =>
      m.bride?.full_name?.toLowerCase().includes(q) ||
      m.groom?.full_name?.toLowerCase().includes(q) ||
      m.bride?.profile_id?.toLowerCase().includes(q) ||
      m.groom?.profile_id?.toLowerCase().includes(q)
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getMatch(id: string) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getMatchesForProfile(profileId: string) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
    .or(`bride_profile_id.eq.${profileId},groom_profile_id.eq.${profileId}`)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// ─── Create Match ───────────────────────────────────────

export async function createMatch(
  brideProfileId: string,
  groomProfileId: string,
  initiatedBy: InitiatedBy
) {
  await requireAdmin();
  const supabase = await db();

  // Duplicate prevention: check for existing active match between same pair
  const { data: existing } = await supabase
    .from('matches')
    .select('id, stage')
    .eq('bride_profile_id', brideProfileId)
    .eq('groom_profile_id', groomProfileId)
    .not('stage', 'in', ['rejected', 'cancelled'])
    .limit(1);

  if (existing && existing.length > 0) {
    throw new Error('An active match already exists between these profiles');
  }

  const matchData: MatchUpdate = {
    bride_profile_id: brideProfileId,
    groom_profile_id: groomProfileId,
    status: 'potential',
    stage: 'shared',
    initiated_by: initiatedBy,
    is_on_hold: false,
  };

  if (initiatedBy === 'groom') {
    matchData.shared_to_bride_at = new Date().toISOString();
  } else {
    matchData.shared_to_groom_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('matches')
    .insert(matchData)
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Create a share link tied to this match
  try {
    const brideProfile = await supabase.from('profiles').select('full_name, phone').eq('id', brideProfileId).single();
    const groomProfile = await supabase.from('profiles').select('full_name, phone').eq('id', groomProfileId).single();

    if (initiatedBy === 'groom') {
      // Sharing groom's profile to bride's family
      await createShare(
        groomProfileId,
        brideProfile.data?.full_name || 'Bride',
        brideProfile.data?.phone || '',
        `Match: ${groomProfile.data?.full_name || 'Groom'} shared to ${brideProfile.data?.full_name || 'Bride'}`,
        data.id // match_id
      );
    } else {
      // Sharing bride's profile to groom's family
      await createShare(
        brideProfileId,
        groomProfile.data?.full_name || 'Groom',
        groomProfile.data?.phone || '',
        `Match: ${brideProfile.data?.full_name || 'Bride'} shared to ${groomProfile.data?.full_name || 'Groom'}`,
        data.id // match_id
      );
    }
  } catch (err) {
    console.error('Failed to create share link:', err);
  }

  return data as Match;
}

// ─── Interest Recording ─────────────────────────────────

export async function recordInterest(
  id: string,
  side: 'bride' | 'groom',
  interest: InterestStatus
) {
  await requireAdmin();
  const supabase = await db();
  const { data: match } = await supabase.from('matches').select('*').eq('id', id).single();
  if (!match) throw new Error('Match not found');
  if (match.is_on_hold) throw new Error('Cannot record interest while match is on hold');

  const interestField = side === 'bride' ? 'bride_interest' : 'groom_interest';
  const updates: MatchUpdate = { [interestField]: interest };

  if (interest === 'not_interested') {
    updates.stage = 'rejected';
    updates.rejected_by = side;
    updates.rejected_at = new Date().toISOString();
  } else if (interest === 'need_more_time') {
    // Stage stays the same — just record the interest status
  } else if (interest === 'interested') {
    const currentStage = match.stage as MatchStage;
    if (currentStage === 'shared') {
      // Only the recipient can express interest at this stage
      if (side === match.initiated_by) throw new Error('Cannot record interest for the sender at this stage');
      updates.stage = 'responded';
    } else if (currentStage === 'both_shared') {
      // Only the original initiator can confirm interest at this stage
      if (side !== match.initiated_by) throw new Error('Cannot record interest for the recipient at this stage');
      updates.stage = 'both_responded';
    }
  }

  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Match;
}

// ─── Share Back ─────────────────────────────────────────

export async function recordShareBack(id: string, initiatedBy: InitiatedBy) {
  await requireAdmin();
  const supabase = await db();
  const { data: match } = await supabase.from('matches').select('*').eq('id', id).single();
  if (!match) throw new Error('Match not found');
  if (match.is_on_hold) throw new Error('Cannot share back while match is on hold');

  const updates: MatchUpdate = { stage: 'both_shared' };

  if (initiatedBy === 'groom') {
    // Original was groom→bride. Now sharing bride→groom.
    updates.shared_to_groom_at = new Date().toISOString();
  } else {
    // Original was bride→groom. Now sharing groom→bride.
    updates.shared_to_bride_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Create share link for the second profile
  try {
    const brideProfile = await supabase.from('profiles').select('full_name, phone').eq('id', match.bride_profile_id).single();
    const groomProfile = await supabase.from('profiles').select('full_name, phone').eq('id', match.groom_profile_id).single();

    if (initiatedBy === 'groom') {
      // Sharing bride's profile to groom
      await createShare(
        match.bride_profile_id,
        groomProfile.data?.full_name || 'Groom',
        groomProfile.data?.phone || '',
        `Match: ${brideProfile.data?.full_name || 'Bride'} shared to ${groomProfile.data?.full_name || 'Groom'}`,
        id // match_id
      );
    } else {
      // Sharing groom's profile to bride
      await createShare(
        match.groom_profile_id,
        brideProfile.data?.full_name || 'Bride',
        brideProfile.data?.phone || '',
        `Match: ${groomProfile.data?.full_name || 'Groom'} shared to ${brideProfile.data?.full_name || 'Bride'}`,
        id // match_id
      );
    }
  } catch (err) {
    console.error('Failed to create share link:', err);
  }

  return data as Match;
}

// ─── Stage Advancement ──────────────────────────────────

export async function advanceStage(id: string, targetStage: MatchStage) {
  await requireAdmin();
  const supabase = await db();
  const { data: match } = await supabase.from('matches').select('is_on_hold').eq('id', id).single();
  if (!match) throw new Error('Match not found');
  if (match.is_on_hold) throw new Error('Cannot advance stage while match is on hold');
  const updates: MatchUpdate = { stage: targetStage };

  // Set timestamps based on target stage
  const now = new Date().toISOString();
  switch (targetStage) {
    case 'contact_shared':
      updates.contact_shared_at = now;
      break;
    case 'family_communication':
      updates.family_communication_at = now;
      break;
    case 'first_meeting':
      updates.first_meeting_date = now;
      break;
    case 'second_meeting':
      updates.second_meeting_date = now;
      break;
    case 'final_meeting':
      updates.final_meeting_date = now;
      break;
    case 'match_fixed':
      updates.match_fixed_date = now;
      updates.status = 'confirmed'; // DB compat
      break;
    case 'payment_pending':
      updates.payment_pending_at = now;
      break;
    case 'completed':
      updates.confirmed_date = now;
      updates.status = 'confirmed'; // DB compat
      break;
  }

  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Match;
}

/** Record meeting notes for a specific meeting stage */
export async function recordMeetingNotes(id: string, meetingStage: 'first_meeting' | 'second_meeting' | 'final_meeting', notes: string) {
  await requireAdmin();
  const supabase = await db();
  const notesField = `${meetingStage}_notes`;
  const { data, error } = await supabase
    .from('matches')
    .update({ [notesField]: notes })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Match;
}

// ─── Fix Match ──────────────────────────────────────────

export async function fixMatch(id: string) {
  await requireAdmin();
  const supabase = await db();
  const { data: match } = await supabase.from('matches').select('is_on_hold').eq('id', id).single();
  if (!match) throw new Error('Match not found');
  if (match.is_on_hold) throw new Error('Cannot fix match while match is on hold');

  const { data, error } = await supabase
    .from('matches')
    .update({
      stage: 'match_fixed',
      status: 'confirmed', // DB compat
      match_fixed_date: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Match;
}

// ─── Cancel / Reject ────────────────────────────────────

export async function cancelMatch(id: string, reason?: string) {
  await requireAdmin();
  const supabase = await db();
  const updates: MatchUpdate = {
    stage: 'cancelled',
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
  };
  if (reason) updates.cancel_reason = reason;

  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Revoke all associated share links for privacy
  try { await revokeAllSharesForMatch(id); } catch { /* non-blocking */ }

  return data as Match;
}

export async function rejectMatch(id: string, rejectedBy: 'bride' | 'groom', reason?: string) {
  await requireAdmin();
  const supabase = await db();
  const updates: MatchUpdate = {
    stage: 'rejected',
    status: 'cancelled',
    rejected_by: rejectedBy,
    rejected_at: new Date().toISOString(),
  };
  if (reason) updates.cancel_reason = reason;

  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Revoke all associated share links for privacy
  try { await revokeAllSharesForMatch(id); } catch { /* non-blocking */ }

  return data as Match;
}

// ─── On Hold ────────────────────────────────────────────

export async function holdMatch(id: string, reason?: string) {
  await requireAdmin();
  const supabase = await db();
  const updates: MatchUpdate = {
    is_on_hold: true,
    on_hold_at: new Date().toISOString(),
  };
  if (reason) updates.on_hold_reason = reason;

  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Match;
}

export async function resumeMatch(id: string) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('matches')
    .update({
      is_on_hold: false,
      on_hold_at: null,
      on_hold_reason: '',
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Match;
}

// ─── Wedding Completion ─────────────────────────────────

export async function completeWedding(id: string, weddingDate?: string, successStory?: string) {
  await requireAdmin();
  const supabase = await db();
  const { data: match } = await supabase.from('matches').select('is_on_hold').eq('id', id).single();
  if (!match) throw new Error('Match not found');
  if (match.is_on_hold) throw new Error('Cannot complete wedding while match is on hold');

  const updates: MatchUpdate = {
    stage: 'completed',
    status: 'confirmed',
    confirmed_date: new Date().toISOString(),
  };
  if (weddingDate) updates.wedding_date = weddingDate;
  if (successStory) updates.success_story = successStory;

  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Match;
}

// ─── Admin Notes ────────────────────────────────────────

export async function updateAdminNotes(id: string, notes: string) {
  await requireAdmin();
  const supabase = await db();
  const { data, error } = await supabase
    .from('matches')
    .update({ admin_notes: notes })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Match;
}

// ─── Search Profiles for Matching ───────────────────────

export async function searchProfilesForMatch(query: string, gender: string) {
  await requireAdmin();
  const supabase = await db();
  const q = query.replace(/[%_]/g, '');
  const { data, error } = await supabase
    .from('profiles')
    .select('id, profile_id, full_name, gender, age, city')
    .eq('gender', gender)
    .or(`full_name.ilike.%${q}%,profile_id.ilike.%${q}%`)
    .limit(10);
  if (error) throw new Error(error.message);
  return data;
}

// ─── Get Share Links for Match ──────────────────────────

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

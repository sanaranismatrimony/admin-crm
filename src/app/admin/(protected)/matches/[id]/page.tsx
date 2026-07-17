import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Calendar, FileText } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase/server';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MatchTimeline } from '@/components/admin/MatchTimeline';
import { MatchDetailActions } from '@/components/admin/MatchDetailActions';
import { formatDate, stageLabel, stageBadgeVariant } from '@/lib/utils/format';
import { EditableAdminNotes } from './EditableAdminNotes';

const interestColors: Record<string, string> = {
  interested: 'text-[var(--green)] bg-green-50',
  not_interested: 'text-red-600 bg-red-50',
  need_more_time: 'text-amber-600 bg-amber-50',
  pending: 'text-[var(--gray-400)] bg-[var(--gray-100)]',
};

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      bride:profiles!matches_bride_profile_id_fkey(id, full_name, profile_id, photo_urls, age, city, gender, profile_type, phone, whatsapp, caste, education, career, father_name, mother_name),
      groom:profiles!matches_groom_profile_id_fkey(id, full_name, profile_id, photo_urls, age, city, gender, profile_type, phone, whatsapp, caste, education, career, father_name, mother_name)
    `)
    .eq('id', id)
    .single();

  if (!match) notFound();

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('match_id', id)
    .order('created_at', { ascending: false });

  // Get share links for this match
  const { data: shareLinks } = await supabase
    .from('profile_shares')
    .select('*, profiles(full_name, profile_id, gender)')
    .eq('match_id', id)
    .order('shared_date', { ascending: false });

  const initiatedBy = match.initiated_by || 'groom';
  const isRejected = match.stage === 'rejected';
  const isCancelled = match.stage === 'cancelled';
  const isOnHold = match.is_on_hold;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back link */}
      <Link
        href="/admin/matches"
        className="inline-flex items-center gap-2 text-sm text-[var(--gray-400)] hover:text-[var(--brown)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Matches
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--brown)]">
              {match.bride?.full_name || 'Bride'} &amp; {match.groom?.full_name || 'Groom'}
            </h1>
            {!isRejected && !isCancelled && (
              <Badge variant={stageBadgeVariant[match.stage] || 'default'}>
                {stageLabel(match.stage)}
              </Badge>
            )}
            {isRejected && <Badge variant="danger">Rejected</Badge>}
            {isCancelled && <Badge variant="danger">Cancelled</Badge>}
            {isOnHold && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-600">
                On Hold
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--gray-400)] mt-1">
            Match created {formatDate(match.created_at)}
            {match.match_fixed_date ? ` · Fixed ${formatDate(match.match_fixed_date)}` : ''}
            {match.wedding_date ? ` · Wedding ${formatDate(match.wedding_date)}` : ''}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile Cards + Timeline */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProfileMiniCard
              profile={match.bride}
              label="Bride"
              interest={match.bride_interest}
              sharedDate={match.shared_to_bride_at}
            />
            <ProfileMiniCard
              profile={match.groom}
              label="Groom"
              interest={match.groom_interest}
              sharedDate={match.shared_to_groom_at}
            />
          </div>

          {/* Pipeline Timeline */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">Pipeline</h3>
            </CardHeader>
            <CardContent>
              <MatchTimeline
                currentStage={match.stage || 'shared'}
                initiatedBy={initiatedBy}
                isOnHold={isOnHold}
                isRejected={isRejected}
                rejectedBy={match.rejected_by}
                isCancelled={isCancelled}
              />
            </CardContent>
          </Card>

          {/* Meeting Notes (if any exist) */}
          {(match.first_meeting_notes || match.second_meeting_notes || match.final_meeting_notes) && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">Meeting Notes</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {match.first_meeting_notes && (
                  <div>
                    <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">First Meeting</p>
                    <p className="text-sm text-[var(--gray-500)] mt-1">{match.first_meeting_notes}</p>
                  </div>
                )}
                {match.second_meeting_notes && (
                  <div>
                    <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">Second Meeting</p>
                    <p className="text-sm text-[var(--gray-500)] mt-1">{match.second_meeting_notes}</p>
                  </div>
                )}
                {match.final_meeting_notes && (
                  <div>
                    <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">Final Meeting</p>
                    <p className="text-sm text-[var(--gray-500)] mt-1">{match.final_meeting_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Wedding Details (if completed) */}
          {match.stage === 'completed' && (match.wedding_date || match.success_story) && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">Wedding Details</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {match.wedding_date && (
                  <p className="text-sm text-[var(--gray-500)]">
                    <span className="text-[var(--gray-400)]">Date:</span> {formatDate(match.wedding_date)}
                  </p>
                )}
                {match.success_story && (
                  <p className="text-sm text-[var(--gray-500)]">{match.success_story}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Actions + Info */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">Actions</h3>
            </CardHeader>
            <CardContent>
              <MatchDetailActions
                match={match}
                payments={payments || []}
                shareLinks={shareLinks || []}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">Interest Status</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <InterestBadge label="Bride" value={match.bride_interest} />
              <InterestBadge label="Groom" value={match.groom_interest} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">Timeline</h3>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {match.shared_to_bride_at && (
                <p className="text-[var(--gray-500)]">
                  <span className="text-[var(--gray-400)]">Groom shared:</span> {formatDate(match.shared_to_bride_at)}
                </p>
              )}
              {match.shared_to_groom_at && (
                <p className="text-[var(--gray-500)]">
                  <span className="text-[var(--gray-400)]">Bride shared:</span> {formatDate(match.shared_to_groom_at)}
                </p>
              )}
              {match.contact_shared_at && (
                <p className="text-[var(--gray-500)]">
                  <span className="text-[var(--gray-400)]">Contact shared:</span> {formatDate(match.contact_shared_at)}
                </p>
              )}
              {match.family_communication_at && (
                <p className="text-[var(--gray-500)]">
                  <span className="text-[var(--gray-400)]">Communication:</span> {formatDate(match.family_communication_at)}
                </p>
              )}
              {match.first_meeting_date && (
                <p className="text-[var(--gray-500)]">
                  <span className="text-[var(--gray-400)]">First meeting:</span> {formatDate(match.first_meeting_date)}
                </p>
              )}
              {match.second_meeting_date && (
                <p className="text-[var(--gray-500)]">
                  <span className="text-[var(--gray-400)]">Second meeting:</span> {formatDate(match.second_meeting_date)}
                </p>
              )}
              {match.final_meeting_date && (
                <p className="text-[var(--gray-500)]">
                  <span className="text-[var(--gray-400)]">Final meeting:</span> {formatDate(match.final_meeting_date)}
                </p>
              )}
              {match.match_fixed_date && (
                <p className="text-[var(--gray-500)]">
                  <span className="text-[var(--gray-400)]">Match fixed:</span> {formatDate(match.match_fixed_date)}
                </p>
              )}
              {match.wedding_date && (
                <p className="text-[var(--gray-500)]">
                  <span className="text-[var(--gray-400)]">Wedding:</span> {formatDate(match.wedding_date)}
                </p>
              )}
              {match.rejected_at && (
                <p className="text-red-500">
                  <span className="text-[var(--gray-400)]">Rejected:</span> {formatDate(match.rejected_at)}
                </p>
              )}
              {match.cancelled_at && (
                <p className="text-red-500">
                  <span className="text-[var(--gray-400)]">Cancelled:</span> {formatDate(match.cancelled_at)}
                </p>
              )}
              {match.on_hold_at && match.is_on_hold && (
                <p className="text-amber-600">
                  <span className="text-[var(--gray-400)]">On hold since:</span> {formatDate(match.on_hold_at)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Admin Notes (editable) */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-[var(--brown)] tracking-wide">Admin Notes</h3>
            </CardHeader>
            <CardContent>
              <EditableAdminNotes matchId={match.id} initialNotes={match.admin_notes || ''} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileMiniCard({ profile, label, interest, sharedDate }: {
  profile: any;
  label: string;
  interest: string | null;
  sharedDate: string | null;
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gray-400)]">{label}</span>
          {interest && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${interestColors[interest] || interestColors.pending}`}>
              {interest === 'interested' ? 'Interested' : interest === 'not_interested' ? 'Not Interested' : interest === 'need_more_time' ? 'Need Time' : 'Pending'}
            </span>
          )}
        </div>
        <div>
          <Link href={`/admin/profiles/${profile?.id || '#'}`} className="group inline-flex items-center gap-1">
            <p className="text-sm font-medium text-[var(--brown)] group-hover:text-[var(--gold-dark)] transition-colors">
              {profile?.full_name || 'Unknown'}
            </p>
            <ExternalLink className="w-3 h-3 text-[var(--gray-400)] group-hover:text-[var(--gold-dark)]" />
          </Link>
          {sharedDate && (
            <p className="text-xs text-[var(--gray-400)] mt-0.5">Shared {formatDate(sharedDate)}</p>
          )}
        </div>
        <div className="text-xs text-[var(--gray-400)] space-y-0.5">
          {profile?.age && <p>{profile.age} yrs</p>}
          {profile?.city && <p>{profile.city}</p>}
          {profile?.education && <p>{profile.education}</p>}
          {profile?.caste && <p>{profile.caste}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function InterestBadge({ label, value }: { label: string; value: string | null }) {
  const color = value === 'interested' ? 'text-[var(--green)]' : value === 'not_interested' ? 'text-red-600' : value === 'need_more_time' ? 'text-amber-600' : 'text-[var(--gray-400)]';
  const bg = value === 'interested' ? 'bg-green-50' : value === 'not_interested' ? 'bg-red-50' : value === 'need_more_time' ? 'bg-amber-50' : 'bg-[var(--gray-100)]';
  const display = value === 'interested' ? 'Interested' : value === 'not_interested' ? 'Not Interested' : value === 'need_more_time' ? 'Need More Time' : 'Awaiting Response';

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--gray-500)]">{label}</span>
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${color} ${bg}`}>
        {display}
      </span>
    </div>
  );
}

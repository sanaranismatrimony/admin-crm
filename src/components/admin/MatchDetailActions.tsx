'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, X, ArrowRight, CreditCard, Pause, Play, Phone,
  MessageCircle, Users, Calendar, Heart, Copy, Eye, EyeOff,
  Link2, LinkIcon, Shield, ShieldOff,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  recordInterest,
  recordShareBack,
  advanceStage,
  fixMatch,
  cancelMatch,
  rejectMatch,
  holdMatch,
  resumeMatch,
  completeWedding,
  updateAdminNotes,
  recordMeetingNotes,
} from '@/lib/db/matches';
import {
  createPaymentsForMatch,
  updatePaymentStatus,
  updatePayment,
} from '@/lib/db/payments';
import {
  updateShareVisibility,
  revokeShare,
  restoreShare,
} from '@/lib/db/shares';
import type { MatchStage, InitiatedBy, InterestStatus } from '@/types';

interface MatchDetailActionsProps {
  match: any;
  payments?: any[];
  shareLinks?: any[];
}

export function MatchDetailActions({ match, payments = [], shareLinks = [] }: MatchDetailActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showMeetingNotesModal, setShowMeetingNotesModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [successStory, setSuccessStory] = useState('');
  const [error, setError] = useState('');

  const stage = match.stage as MatchStage;
  const initiatedBy = match.initiated_by as InitiatedBy;
  const isOnHold = match.is_on_hold;
  const isRejected = stage === 'rejected';
  const isCancelled = stage === 'cancelled';
  const isTerminal = isRejected || isCancelled;
  const hasPayments = payments.length > 0;
  const allPaid = payments.length > 0 && payments.every((p: any) => p.status === 'paid');

  async function handleAction(action: string, actionFn: () => Promise<any>) {
    setLoading(action);
    setError('');
    try {
      await actionFn();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  }

  // ─── Interest Actions ──────────────────────

  async function handleInterest(side: 'bride' | 'groom', interest: InterestStatus) {
    await handleAction(`interest_${side}_${interest}`, () =>
      recordInterest(match.id, side, interest)
    );
  }

  // ─── Share Back ────────────────────────────

  async function handleShareBack() {
    await handleAction('share_back', () =>
      recordShareBack(match.id, initiatedBy)
    );
  }

  // ─── Stage Advancement ─────────────────────

  async function handleAdvance(targetStage: MatchStage) {
    await handleAction(`advance_${targetStage}`, () =>
      advanceStage(match.id, targetStage)
    );
  }

  // ─── Fix Match ─────────────────────────────

  async function handleFixMatch() {
    await handleAction('fix', async () => {
      await fixMatch(match.id);
      try {
        await createPaymentsForMatch(
          match.id,
          match.bride?.full_name,
          match.groom?.full_name
        );
      } catch (e) {
        console.error('Failed to create payments:', e);
      }
    });
  }

  // ─── Cancel / Reject ──────────────────────

  async function handleCancel() {
    await handleAction('cancel', () =>
      cancelMatch(match.id, cancelReason || undefined)
    );
    setShowCancelModal(false);
    setCancelReason('');
  }

  // ─── On Hold ──────────────────────────────

  async function handleHold() {
    await handleAction('hold', () =>
      holdMatch(match.id, holdReason || undefined)
    );
    setShowHoldModal(false);
    setHoldReason('');
  }

  async function handleResume() {
    await handleAction('resume', () => resumeMatch(match.id));
  }

  // ─── Meeting Notes ────────────────────────

  async function handleSaveMeetingNotes() {
    if (!showMeetingNotesModal) return;
    await handleAction('meeting_notes', () =>
      recordMeetingNotes(match.id, showMeetingNotesModal as any, meetingNotes)
    );
    setShowMeetingNotesModal(null);
    setMeetingNotes('');
  }

  // ─── Completion ───────────────────────────

  async function handleComplete() {
    await handleAction('complete', () =>
      completeWedding(match.id, weddingDate || undefined, successStory || undefined)
    );
    setShowCompletionModal(false);
  }

  // ─── Payment ──────────────────────────────

  async function handlePaymentStatus(paymentId: string, status: 'pending' | 'paid') {
    await handleAction(`payment_${paymentId}`, () =>
      updatePaymentStatus(paymentId, status)
    );
  }

  async function handleUpdatePaymentAmount(paymentId: string, amount: number) {
    await handleAction(`payment_amt_${paymentId}`, () =>
      updatePayment(paymentId, { amount })
    );
  }

  // ─── Share Link Controls ──────────────────

  async function handleToggleContact(shareId: string, current: boolean) {
    await handleAction(`share_contact_${shareId}`, () =>
      updateShareVisibility(shareId, { can_view_contact: !current })
    );
  }

  async function handleToggleLocation(shareId: string, current: boolean) {
    await handleAction(`share_location_${shareId}`, () =>
      updateShareVisibility(shareId, { can_view_location: !current })
    );
  }

  async function handleRevokeShare(shareId: string) {
    await handleAction(`revoke_${shareId}`, () => revokeShare(shareId));
  }

  async function handleRestoreShare(shareId: string) {
    await handleAction(`restore_${shareId}`, () => restoreShare(shareId));
  }

  // Helper: which side is the "first recipient"
  const firstRecipientSide = initiatedBy === 'groom' ? 'bride' : 'groom';
  const secondPartyLabel = initiatedBy === 'groom' ? 'Groom' : 'Bride';
  const firstRecipientLabel = initiatedBy === 'groom' ? 'Bride' : 'Groom';

  // ─── Terminal State Banner ──────────────────────────────

  function TerminalBanner() {
    if (!isTerminal) return null;
    return (
      <div className="space-y-3 mb-4">
        {isRejected && (
          <div className="p-3 rounded-xl bg-red-50 text-sm text-red-600">
            Rejected by {match.rejected_by === 'bride' ? "Bride's family" : "Groom's family"}
            {match.cancel_reason && <> — {match.cancel_reason}</>}
          </div>
        )}
        {isCancelled && match.cancel_reason && (
          <div className="p-3 rounded-xl bg-red-50 text-sm text-red-600">
            Cancelled: {match.cancel_reason}
          </div>
        )}
      </div>
    );
  }

  // ─── Share Link Management (show in all states including terminal) ──

  function ShareLinksSection() {
    if (shareLinks.length === 0) return null;
    return (
      <div className="pt-3 border-t border-[var(--gray-100)]">
        <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider mb-2">
          Share Links
        </p>
        <div className="space-y-2">
          {shareLinks.map((share: any) => (
            <ShareLinkCard
              key={share.id}
              share={share}
              loading={loading}
              onToggleContact={() => handleToggleContact(share.id, share.can_view_contact)}
              onToggleLocation={() => handleToggleLocation(share.id, share.can_view_location)}
              onRevoke={() => handleRevokeShare(share.id)}
              onRestore={() => handleRestoreShare(share.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isTerminal) {
    return (
      <div className="space-y-4">
        <TerminalBanner />
        <ShareLinksSection />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-sm text-[var(--red)]">{error}</div>
      )}

      {/* On Hold Banner */}
      {isOnHold && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">⏸ On Hold</p>
              {match.on_hold_reason && (
                <p className="text-xs text-amber-600 mt-0.5">{match.on_hold_reason}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              loading={loading === 'resume'}
              onClick={handleResume}
            >
              <Play className="w-4 h-4" /> Resume
            </Button>
          </div>
        </div>
      )}

      {/* ── Stage: SHARED ── */}
      {stage === 'shared' && !isOnHold && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">
            {firstRecipientLabel}&apos;s Response
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={loading?.startsWith('interest')}
              onClick={() => handleInterest(firstRecipientSide, 'interested')}
            >
              <Check className="w-4 h-4" /> Interested
            </Button>
            <Button
              variant="outline"
              size="sm"
              loading={loading?.startsWith('interest')}
              onClick={() => handleInterest(firstRecipientSide, 'need_more_time')}
            >
              <Pause className="w-4 h-4" /> Need Time
            </Button>
            <Button
              variant="ghost"
              size="sm"
              loading={loading?.startsWith('interest')}
              onClick={() => handleInterest(firstRecipientSide, 'not_interested')}
            >
              <X className="w-4 h-4" /> Not Interested
            </Button>
          </div>
        </div>
      )}

      {/* ── Stage: RESPONDED ── */}
      {stage === 'responded' && !isOnHold && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">
            Share {firstRecipientLabel === 'Bride' ? 'Bride' : 'Groom'}&apos;s Profile Back
          </p>
          <Button
            variant="primary"
            size="sm"
            loading={loading === 'share_back'}
            onClick={handleShareBack}
          >
            <ArrowRight className="w-4 h-4" /> Share Profile Now
          </Button>
        </div>
      )}

      {/* ── Stage: BOTH_SHARED ── */}
      {stage === 'both_shared' && !isOnHold && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">
            {secondPartyLabel}&apos;s Response
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={loading?.startsWith('interest')}
              onClick={() => handleInterest(initiatedBy === 'groom' ? 'groom' : 'bride', 'interested')}
            >
              <Check className="w-4 h-4" /> Interested
            </Button>
            <Button
              variant="outline"
              size="sm"
              loading={loading?.startsWith('interest')}
              onClick={() => handleInterest(initiatedBy === 'groom' ? 'groom' : 'bride', 'need_more_time')}
            >
              <Pause className="w-4 h-4" /> Need Time
            </Button>
            <Button
              variant="ghost"
              size="sm"
              loading={loading?.startsWith('interest')}
              onClick={() => handleInterest(initiatedBy === 'groom' ? 'groom' : 'bride', 'not_interested')}
            >
              <X className="w-4 h-4" /> Not Interested
            </Button>
          </div>
        </div>
      )}

      {/* ── Stage: BOTH_RESPONDED (Mutual Interest) ── */}
      {stage === 'both_responded' && !isOnHold && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">
            Both families interested — share contact details
          </p>
          <Button
            variant="primary"
            size="sm"
            loading={loading === 'advance_contact_shared'}
            onClick={() => handleAdvance('contact_shared')}
          >
            <Phone className="w-4 h-4" /> Share Contact Details
          </Button>
        </div>
      )}

      {/* ── Stage: CONTACT_SHARED ── */}
      {stage === 'contact_shared' && !isOnHold && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">
            Arrange family communication
          </p>
          <Button
            variant="primary"
            size="sm"
            loading={loading === 'advance_family_communication'}
            onClick={() => handleAdvance('family_communication')}
          >
            <MessageCircle className="w-4 h-4" /> Communication Established
          </Button>
        </div>
      )}

      {/* ── Stage: FAMILY_COMMUNICATION ── */}
      {stage === 'family_communication' && !isOnHold && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">
            Next: Schedule meeting or fix match
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={loading === 'advance_first_meeting'}
              onClick={() => handleAdvance('first_meeting')}
            >
              <Users className="w-4 h-4" /> Record First Meeting
            </Button>
            <Button
              variant="outline"
              size="sm"
              loading={loading === 'fix'}
              onClick={handleFixMatch}
            >
              <Heart className="w-4 h-4" /> Skip to Match Fixed
            </Button>
          </div>
        </div>
      )}

      {/* ── Stage: FIRST_MEETING ── */}
      {stage === 'first_meeting' && !isOnHold && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">
            First meeting completed — next step
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={loading === 'advance_second_meeting'}
              onClick={() => handleAdvance('second_meeting')}
            >
              <Users className="w-4 h-4" /> Record Second Meeting
            </Button>
            <Button
              variant="outline"
              size="sm"
              loading={loading === 'fix'}
              onClick={handleFixMatch}
            >
              <Heart className="w-4 h-4" /> Skip to Match Fixed
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowMeetingNotesModal('first_meeting'); setMeetingNotes(match.first_meeting_notes || ''); }}
          >
            <Calendar className="w-4 h-4" /> Add Meeting Notes
          </Button>
        </div>
      )}

      {/* ── Stage: SECOND_MEETING ── */}
      {stage === 'second_meeting' && !isOnHold && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">
            Second meeting completed — next step
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={loading === 'advance_final_meeting'}
              onClick={() => handleAdvance('final_meeting')}
            >
              <Users className="w-4 h-4" /> Record Final Meeting
            </Button>
            <Button
              variant="outline"
              size="sm"
              loading={loading === 'fix'}
              onClick={handleFixMatch}
            >
              <Heart className="w-4 h-4" /> Skip to Match Fixed
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowMeetingNotesModal('second_meeting'); setMeetingNotes(match.second_meeting_notes || ''); }}
          >
            <Calendar className="w-4 h-4" /> Add Meeting Notes
          </Button>
        </div>
      )}

      {/* ── Stage: FINAL_MEETING ── */}
      {stage === 'final_meeting' && !isOnHold && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">
            Final meeting completed — fix the match
          </p>
          <Button
            variant="primary"
            size="sm"
            loading={loading === 'fix'}
            onClick={handleFixMatch}
          >
            <Heart className="w-4 h-4" /> Fix Match
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowMeetingNotesModal('final_meeting'); setMeetingNotes(match.final_meeting_notes || ''); }}
          >
            <Calendar className="w-4 h-4" /> Add Meeting Notes
          </Button>
        </div>
      )}

      {/* ── Stage: MATCH_FIXED ── */}
      {stage === 'match_fixed' && !isOnHold && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">
            {hasPayments ? 'Collect payments from families' : 'Create payment records'}
          </p>
          {!hasPayments && (
            <Button
              variant="primary"
              size="sm"
              loading={loading === 'create_payments'}
              onClick={() => handleAction('create_payments', async () => {
                await createPaymentsForMatch(match.id, match.bride?.full_name, match.groom?.full_name);
              })}
            >
              <CreditCard className="w-4 h-4" /> Create Payments
            </Button>
          )}
          {hasPayments && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPaymentModal(true)}
            >
              <CreditCard className="w-4 h-4" /> Manage Payments
            </Button>
          )}
          {hasPayments && allPaid && (
            <Button
              variant="primary"
              size="sm"
              loading={loading === 'advance_payment_pending'}
              onClick={() => handleAdvance('payment_pending')}
            >
              <Check className="w-4 h-4" /> Move to Payment Pending
            </Button>
          )}
        </div>
      )}

      {/* ── Stage: PAYMENT_PENDING ── */}
      {stage === 'payment_pending' && !isOnHold && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--gray-400)] uppercase tracking-wider">
            Payment stage — mark as completed when wedding is done
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCompletionModal(true)}
          >
            <Check className="w-4 h-4" /> Mark Completed
          </Button>
        </div>
      )}

      {/* ── Payment view for post-match stages ── */}
      {(stage === 'payment_pending' || stage === 'completed') && hasPayments && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPaymentModal(true)}
        >
          <CreditCard className="w-4 h-4" /> View Payments
        </Button>
      )}

      <ShareLinksSection />

      {/* ── Hold / Cancel (always available) ── */}
      {!isOnHold && stage !== 'completed' && (
        <div className="pt-4 border-t border-[var(--gray-100)] flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowHoldModal(true)}>
            <Pause className="w-4 h-4" /> Put on Hold
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowCancelModal(true)}>
            <X className="w-4 h-4" /> Cancel Match
          </Button>
        </div>
      )}

      {/* ── Cancel Modal ── */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Match" maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--gray-500)]">Are you sure you want to cancel this match?</p>
          <Textarea
            name="reason"
            label="Reason (optional)"
            value={cancelReason}
            onChange={(e: any) => setCancelReason(e.target.value)}
            placeholder="Why is this match being cancelled?"
          />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowCancelModal(false)}>Keep Match</Button>
            <Button variant="primary" loading={loading === 'cancel'} onClick={handleCancel}>
              Yes, Cancel Match
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Hold Modal ── */}
      <Modal isOpen={showHoldModal} onClose={() => setShowHoldModal(false)} title="Put on Hold" maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--gray-500)]">This match will be paused. You can resume it anytime.</p>
          <Textarea
            name="hold_reason"
            label="Reason (optional)"
            value={holdReason}
            onChange={(e: any) => setHoldReason(e.target.value)}
            placeholder="Why is this being put on hold?"
          />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowHoldModal(false)}>Cancel</Button>
            <Button variant="primary" loading={loading === 'hold'} onClick={handleHold}>
              Put on Hold
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Meeting Notes Modal ── */}
      <Modal
        isOpen={!!showMeetingNotesModal}
        onClose={() => setShowMeetingNotesModal(null)}
        title={`${showMeetingNotesModal === 'first_meeting' ? 'First' : showMeetingNotesModal === 'second_meeting' ? 'Second' : 'Final'} Meeting Notes`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <Textarea
            name="meeting_notes"
            label="Notes"
            value={meetingNotes}
            onChange={(e: any) => setMeetingNotes(e.target.value)}
            placeholder="How did the meeting go? Any observations..."
          />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowMeetingNotesModal(null)}>Cancel</Button>
            <Button variant="primary" loading={loading === 'meeting_notes'} onClick={handleSaveMeetingNotes}>
              Save Notes
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Completion Modal ── */}
      <Modal isOpen={showCompletionModal} onClose={() => setShowCompletionModal(false)} title="Mark as Completed" maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--gray-500)]">Congratulations! Record the wedding details.</p>
          <Input
            name="wedding_date"
            label="Wedding Date (optional)"
            type="date"
            value={weddingDate}
            onChange={(e: any) => setWeddingDate(e.target.value)}
          />
          <Textarea
            name="success_story"
            label="Success Story (optional)"
            value={successStory}
            onChange={(e: any) => setSuccessStory(e.target.value)}
            placeholder="A brief story about this successful match..."
          />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowCompletionModal(false)}>Cancel</Button>
            <Button variant="primary" loading={loading === 'complete'} onClick={handleComplete}>
              Mark Completed
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Payment Modal ── */}
      {hasPayments && (
        <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Payments" maxWidth="max-w-sm">
          <div className="space-y-4">
            {payments.map((payment: any) => (
              <div key={payment.id} className="rounded-xl border border-[var(--gray-100)] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--brown)]">
                    {payment.payment_for === 'groom' ? "Groom's Family" : payment.payment_for === 'bride' ? "Bride's Family" : payment.notes || 'Payment'}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    payment.status === 'paid' ? 'bg-green-50 text-[var(--green)]' : 'bg-amber-50 text-[var(--amber)]'
                  }`}>
                    {payment.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={payment.amount}
                    className="w-28 rounded-lg border border-[var(--gray-200)] px-3 py-1.5 text-sm text-[var(--brown)]"
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (val && val !== payment.amount) {
                        handleUpdatePaymentAmount(payment.id, val);
                      }
                    }}
                  />
                  {payment.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      loading={loading === `payment_${payment.id}`}
                      onClick={() => handlePaymentStatus(payment.id, 'paid')}
                    >
                      Mark Paid
                    </Button>
                  )}
                  {payment.status === 'paid' && (
                    <Button
                      variant="outline"
                      size="sm"
                      loading={loading === `payment_${payment.id}`}
                      onClick={() => handlePaymentStatus(payment.id, 'pending')}
                    >
                      Revert
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => setShowPaymentModal(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Share Link Card Component ──────────────────────────

function ShareLinkCard({ share, loading, onToggleContact, onToggleLocation, onRevoke, onRestore }: {
  share: any;
  loading: string | null;
  onToggleContact: () => void;
  onToggleLocation: () => void;
  onRevoke: () => void;
  onRestore: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/view/${share.share_token}`;
  const profileName = share.profiles?.full_name || 'Profile';
  const isRevoked = share.is_revoked;

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`rounded-xl border p-3 ${isRevoked ? 'border-red-200 bg-red-50/30' : 'border-[var(--gray-100)]'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <LinkIcon className={`w-3.5 h-3.5 shrink-0 ${isRevoked ? 'text-red-400' : 'text-[var(--gold)]'}`} />
          <span className="text-sm font-medium text-[var(--brown)] truncate">{profileName}</span>
          {isRevoked && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-500 font-medium">Revoked</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyLink}
            className="p-1.5 rounded-lg hover:bg-[var(--gray-100)] transition-colors"
            title="Copy link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--green)]" /> : <Copy className="w-3.5 h-3.5 text-[var(--gray-400)]" />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        <button
          onClick={onToggleContact}
          disabled={isRevoked}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
            share.can_view_contact
              ? 'bg-green-50 text-green-600 hover:bg-green-100'
              : 'bg-[var(--gray-100)] text-[var(--gray-400)] hover:bg-[var(--gray-200)]'
          } disabled:opacity-50`}
          title={share.can_view_contact ? 'Contact visible — click to hide' : 'Contact hidden — click to show'}
        >
          {share.can_view_contact ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          Contact
        </button>
        <button
          onClick={onToggleLocation}
          disabled={isRevoked}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
            share.can_view_location
              ? 'bg-green-50 text-green-600 hover:bg-green-100'
              : 'bg-[var(--gray-100)] text-[var(--gray-400)] hover:bg-[var(--gray-200)]'
          } disabled:opacity-50`}
          title={share.can_view_location ? 'Location visible — click to hide' : 'Location hidden — click to show'}
        >
          {share.can_view_location ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          Location
        </button>
        {isRevoked ? (
          <button
            onClick={onRestore}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
          >
            <Shield className="w-3 h-3" /> Restore
          </button>
        ) : (
          <button
            onClick={onRevoke}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
          >
            <ShieldOff className="w-3 h-3" /> Revoke
          </button>
        )}
      </div>

      {share.view_count > 0 && (
        <p className="text-[10px] text-[var(--gray-400)] mt-2">
          Viewed {share.view_count} time{share.view_count !== 1 ? 's' : ''}
          {share.viewed_at && ` · Last: ${new Date(share.viewed_at).toLocaleDateString('en-IN')}`}
        </p>
      )}
    </div>
  );
}

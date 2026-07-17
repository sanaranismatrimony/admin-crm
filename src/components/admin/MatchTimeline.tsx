'use client';

import { Check, X, Pause, Clock } from 'lucide-react';
import { STAGE_INDEX } from '@/lib/utils/format';
import type { MatchStage, InitiatedBy } from '@/types';

interface TimelineStep {
  stage: MatchStage;
  label: string;
  description: string;
  optional?: boolean;
}

function getSteps(initiatedBy: InitiatedBy): TimelineStep[] {
  return [
    {
      stage: 'shared',
      label: initiatedBy === 'groom' ? 'Groom Shared to Bride' : 'Bride Shared to Groom',
      description: 'Biodata sent to the other family',
    },
    {
      stage: 'responded',
      label: initiatedBy === 'groom' ? 'Bride Responded' : 'Groom Responded',
      description: 'Recipient expressed interest',
    },
    {
      stage: 'both_shared',
      label: initiatedBy === 'groom' ? 'Bride Shared to Groom' : 'Groom Shared to Bride',
      description: 'Second biodata shared back',
    },
    {
      stage: 'both_responded',
      label: 'Mutual Interest',
      description: 'Both families interested',
    },
    {
      stage: 'contact_shared',
      label: 'Contact Details Shared',
      description: 'Phone, WhatsApp, address disclosed',
    },
    {
      stage: 'family_communication',
      label: 'Family Communication',
      description: 'Conference call / families talking',
    },
    {
      stage: 'first_meeting',
      label: 'First Meeting',
      description: 'Groom\'s family visits bride',
      optional: true,
    },
    {
      stage: 'second_meeting',
      label: 'Second Meeting',
      description: 'Bride\'s family visits groom',
      optional: true,
    },
    {
      stage: 'final_meeting',
      label: 'Final Meeting',
      description: 'Alliance discussion',
      optional: true,
    },
    {
      stage: 'match_fixed',
      label: 'Match Fixed',
      description: 'Marriage alliance confirmed',
    },
    {
      stage: 'payment_pending',
      label: 'Payment Pending',
      description: 'Awaiting payment collection',
    },
    {
      stage: 'completed',
      label: 'Completed',
      description: 'Marriage completed',
    },
  ];
}

interface MatchTimelineProps {
  currentStage: MatchStage;
  initiatedBy: InitiatedBy;
  isOnHold?: boolean;
  isRejected?: boolean;
  rejectedBy?: string | null;
  isCancelled?: boolean;
}

export function MatchTimeline({
  currentStage,
  initiatedBy,
  isOnHold,
  isRejected,
  rejectedBy,
  isCancelled,
}: MatchTimelineProps) {
  const steps = getSteps(initiatedBy);
  const currentIndex = STAGE_INDEX[currentStage] ?? -1;
  const isTerminal = isRejected || isCancelled;

  // For terminal states, show steps up to where it stopped + the terminal badge
  const visibleSteps = isTerminal
    ? steps.slice(0, Math.max(currentIndex + 1, 1))
    : steps;

  return (
    <div className="relative">
      {visibleSteps.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isSkipped = step.optional && isCompleted && !isCurrent;

        return (
          <div key={step.stage} className="flex items-start gap-4 pb-6 last:pb-0 relative">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10 ${
                  isCompleted
                    ? 'bg-[var(--green)] border-[var(--green)] text-white'
                    : isCurrent && isOnHold
                    ? 'bg-amber-50 border-amber-400 text-amber-500'
                    : isCurrent && isTerminal
                    ? 'bg-red-50 border-red-300 text-red-500'
                    : isCurrent
                    ? 'bg-[var(--gold)]/10 border-[var(--gold)] text-[var(--gold)]'
                    : 'bg-[var(--gray-50)] border-[var(--gray-200)] text-[var(--gray-300)]'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent && isOnHold ? (
                  <Pause className="w-4 h-4" />
                ) : isCurrent && isTerminal ? (
                  <X className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{i + 1}</span>
                )}
              </div>
              {i < visibleSteps.length - 1 && (
                <div
                  className={`w-0.5 h-full absolute top-8 ${
                    isCompleted ? 'bg-[var(--green)]' : 'bg-[var(--gray-200)]'
                  }`}
                />
              )}
            </div>
            <div className={`pt-1.5 ${isTerminal && isCurrent ? 'opacity-60' : ''}`}>
              <p
                className={`text-sm font-medium ${
                  isCompleted || isCurrent ? 'text-[var(--brown)]' : 'text-[var(--gray-400)]'
                }`}
              >
                {isCurrent && !isTerminal && !isOnHold ? (
                  <span className="inline-flex items-center gap-2">
                    {step.label}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--gold)]/10 text-[var(--gold-dark)] animate-pulse">
                      Active
                    </span>
                  </span>
                ) : isCurrent && isOnHold ? (
                  <span className="inline-flex items-center gap-2">
                    {step.label}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-600">
                      On Hold
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    {step.label}
                    {step.optional && !isCompleted && !isCurrent && (
                      <span className="text-[10px] text-[var(--gray-300)] font-normal">(optional)</span>
                    )}
                  </span>
                )}
              </p>
              <p className="text-xs text-[var(--gray-400)] mt-0.5">{step.description}</p>
            </div>
          </div>
        );
      })}

      {/* Terminal state badge */}
      {isRejected && (
        <div className="flex items-start gap-4 pt-2">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-red-300 bg-red-50 text-red-500 z-10">
              <X className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1.5">
            <p className="text-sm font-medium text-red-500">
              Rejected by {rejectedBy === 'bride' ? 'Bride\'s Family' : 'Groom\'s Family'}
            </p>
            <p className="text-xs text-[var(--gray-400)] mt-0.5">Proposal was declined</p>
          </div>
        </div>
      )}

      {isCancelled && !isRejected && (
        <div className="flex items-start gap-4 pt-2">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-red-300 bg-red-50 text-red-500 z-10">
              <X className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1.5">
            <p className="text-sm font-medium text-red-500">Cancelled</p>
            <p className="text-xs text-[var(--gray-400)] mt-0.5">Match was cancelled by admin</p>
          </div>
        </div>
      )}
    </div>
  );
}



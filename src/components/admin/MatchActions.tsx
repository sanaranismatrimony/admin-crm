'use client';

import { useRouter } from 'next/navigation';
import { X, Pause } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cancelMatch } from '@/lib/db/matches';
import { stageLabel } from '@/lib/utils/format';

interface MatchActionsProps {
  match: any;
}

const NEXT_ACTION_LABEL: Record<string, string> = {
  shared: 'Awaiting Response',
  responded: 'Share Back',
  both_shared: 'Awaiting Response',
  both_responded: 'Share Contact',
  contact_shared: 'Arrange Call',
  family_communication: 'Schedule Meeting',
  first_meeting: 'Next Meeting',
  second_meeting: 'Next Meeting',
  final_meeting: 'Fix Match',
  match_fixed: 'Collect Payment',
  payment_pending: 'Complete',
};

export function MatchActions({ match }: MatchActionsProps) {
  const router = useRouter();

  async function handleCancel(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Cancel this match?')) return;
    await cancelMatch(match.id);
    router.refresh();
  }

  const isTerminal = match.stage === 'cancelled' || match.stage === 'rejected';

  if (isTerminal) {
    return null;
  }

  const nextAction = NEXT_ACTION_LABEL[match.stage];

  return (
    <div className="flex items-center gap-2">
      {match.is_on_hold && (
        <Pause className="w-3.5 h-3.5 text-amber-500" />
      )}
      {nextAction && !match.is_on_hold && (
        <span className="text-[10px] text-[var(--gray-400)] font-medium whitespace-nowrap">
          {nextAction}
        </span>
      )}
      {match.stage !== 'completed' && (
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

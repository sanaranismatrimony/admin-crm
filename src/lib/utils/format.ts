export function formatDate(date: string): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(date: string): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function genderLabel(gender: string): string {
  return gender === 'male' ? 'Male' : 'Female';
}

export function profileTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    bride: 'Bride',
    groom: 'Groom',
    second_marriage_bride: 'Second Marriage Bride',
    second_marriage_groom: 'Second Marriage Groom',
    other_caste_bride: 'Other Caste Bride',
    other_caste_groom: 'Other Caste Groom',
  };
  return labels[type] || type;
}

export function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    shared: 'Profile Shared',
    responded: 'Recipient Interested',
    both_shared: 'Shared Back',
    both_responded: 'Mutual Interest',
    contact_shared: 'Contact Shared',
    family_communication: 'Families Communicating',
    first_meeting: 'First Meeting',
    second_meeting: 'Second Meeting',
    final_meeting: 'Final Meeting',
    match_fixed: 'Match Fixed',
    payment_pending: 'Payment Pending',
    completed: 'Completed',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  };
  return labels[stage] || stage;
}

export function paymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
  };
  return labels[status] || status;
}

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'default' | 'info';

export const stageBadgeVariant: Record<string, BadgeVariant> = {
  shared: 'info',
  responded: 'info',
  both_shared: 'info',
  both_responded: 'warning',
  contact_shared: 'warning',
  family_communication: 'warning',
  first_meeting: 'warning',
  second_meeting: 'warning',
  final_meeting: 'warning',
  match_fixed: 'success',
  payment_pending: 'warning',
  completed: 'success',
  rejected: 'danger',
  cancelled: 'danger',
};

export const STAGE_INDEX: Record<string, number> = {
  shared: 0,
  responded: 1,
  both_shared: 2,
  both_responded: 3,
  contact_shared: 4,
  family_communication: 5,
  first_meeting: 6,
  second_meeting: 7,
  final_meeting: 8,
  match_fixed: 9,
  payment_pending: 10,
  completed: 11,
};

export function getStageProgress(stage: string): { current: number; total: number } {
  const idx = STAGE_INDEX[stage];
  if (idx === undefined) return { current: 0, total: 11 };
  return { current: idx, total: 11 };
}

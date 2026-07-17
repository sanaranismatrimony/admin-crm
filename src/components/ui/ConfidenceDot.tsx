import type { ConfidenceLevel } from '@/types';

const colors: Record<ConfidenceLevel, string> = {
  high: 'bg-green-400',
  medium: 'bg-amber-400',
  low: 'bg-red-400',
};

export function ConfidenceDot({ level }: { level: ConfidenceLevel }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colors[level]} shrink-0 ml-1.5`}
      title={`${level} confidence`}
    />
  );
}

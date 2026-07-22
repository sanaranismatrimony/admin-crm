interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variants: Record<string, { bg: string; color: string }> = {
  default: { bg: 'var(--gray-100)', color: 'var(--text-secondary)' },
  success: { bg: 'rgba(22,163,74,0.1)', color: 'var(--green)' },
  warning: { bg: 'rgba(217,119,6,0.1)', color: 'var(--amber)' },
  danger: { bg: 'rgba(220,38,38,0.1)', color: 'var(--red)' },
  info: { bg: 'rgba(37,99,235,0.1)', color: 'var(--blue)' },
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const v = variants[variant];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ background: v.bg, color: v.color }}
    >
      {children}
    </span>
  );
}

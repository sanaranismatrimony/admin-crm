interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variants = {
  default: 'bg-[var(--gray-100)] text-[var(--gray-600)]',
  success: 'bg-green-50 text-[var(--green)]',
  warning: 'bg-amber-50 text-[var(--amber)]',
  danger: 'bg-red-50 text-[var(--red)]',
  info: 'bg-blue-50 text-[var(--blue)]',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

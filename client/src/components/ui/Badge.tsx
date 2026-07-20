import { cn, getStatusClass, getStatusLabel } from '../../lib/utils';

interface BadgeProps {
  status?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'status';
}

export function Badge({ status, children, className, variant = 'default' }: BadgeProps) {
  if (variant === 'status' && status) {
    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getStatusClass(status),
        className
      )}>
        {getStatusLabel(status)}
      </span>
    );
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variant === 'outline'
        ? 'border border-primary/40 text-primary bg-primary/10'
        : 'bg-primary/20 text-primary',
      className
    )}>
      {children}
    </span>
  );
}

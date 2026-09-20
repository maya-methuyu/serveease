import { cn, getInitials, avatarColor } from '@/lib/utils';
import type { ReactNode } from 'react';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', sizeMap[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-semibold shrink-0',
        avatarColor(name || '?'),
        sizeMap[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

const badgeVariantMap = {
  primary: 'bg-primary-100 text-primary-700',
  secondary: 'bg-secondary-100 text-secondary-700',
  accent: 'bg-accent-100 text-accent-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  neutral: 'bg-neutral-100 text-neutral-700',
};

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span className={cn('badge', badgeVariantMap[variant], className)}>
      {children}
    </span>
  );
}

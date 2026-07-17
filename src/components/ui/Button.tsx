'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'accent';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-sm hover:shadow-[var(--shadow-primary)]',
  secondary: 'bg-[var(--card-elevated)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--card-hover)] hover:border-[var(--border-strong)]',
  ghost:     'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)]',
  danger:    'bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)] shadow-sm',
  outline:   'bg-transparent text-[var(--primary)] border border-[var(--primary)] hover:bg-[var(--primary-subtle)]',
  accent:    'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-3 text-xs rounded-lg gap-1.5',
  sm: 'h-9 px-4 text-sm rounded-lg gap-2',
  md: 'h-10 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-7 text-base rounded-xl gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-semibold transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
        'active:scale-[0.97] select-none cursor-pointer',
        'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        // Variant
        variantStyles[variant],
        // Size
        sizeStyles[size],
        // Full width
        fullWidth ? 'w-full' : '',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'lg' ? 18 : 15} className="animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}

      {children && (
        <span className={loading ? 'ml-1' : ''}>
          {children}
        </span>
      )}

      {rightIcon && !loading && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
export { Button };

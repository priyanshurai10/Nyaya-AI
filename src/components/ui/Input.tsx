'use client';

import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  success,
  leftIcon,
  rightIcon,
  type,
  inputSize = 'md',
  wrapperClassName,
  className,
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const sizeClasses = {
    sm: 'h-9 text-xs px-3 rounded-lg',
    md: 'h-11 text-sm px-4 rounded-xl',
    lg: 'h-13 text-base px-5 rounded-xl',
  };

  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide"
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={cn(
            'w-full font-medium',
            'bg-[var(--card)] border-[1.5px] border-[var(--border)]',
            'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            'outline-none transition-all duration-150',
            'hover:border-[var(--border-strong)]',
            'focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-subtle)] focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--card-elevated)]',
            // Size
            sizeClasses[inputSize],
            // Icon padding
            leftIcon ? 'pl-10' : '',
            (rightIcon || isPassword) ? 'pr-11' : '',
            // States
            error ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger-subtle)]' : '',
            success ? 'border-[var(--success)] focus:border-[var(--success)] focus:ring-[var(--success-subtle)]' : '',
            className
          )}
          {...props}
        />

        {/* Right: password toggle or custom icon */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        ) : rightIcon ? (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            {rightIcon}
          </div>
        ) : null}
      </div>

      {/* Error / Success / Hint */}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--danger)] font-medium">
          <AlertCircle size={12} className="shrink-0" />
          {error}
        </p>
      )}
      {success && !error && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--success)] font-medium">
          <CheckCircle size={12} className="shrink-0" />
          {success}
        </p>
      )}
      {hint && !error && !success && (
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
export { Input };

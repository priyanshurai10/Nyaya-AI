import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-colors disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800",
            {
              'border-red-500 focus:ring-red-500': error,
            },
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Route Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-[#FF9933]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">Something went wrong</h2>
      <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-md">
        An unexpected error occurred while rendering this legal view.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-md"
        >
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--text-primary)] font-bold rounded-xl text-sm transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

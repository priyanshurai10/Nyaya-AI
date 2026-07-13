'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] flex flex-col items-center justify-center p-6 text-center transition-colors">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong!</h2>
          <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-8 max-w-md mx-auto">
            We apologize for the inconvenience. An unexpected error occurred.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-slate-900 dark:bg-[#111827] text-white dark:text-slate-900 dark:text-white font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 dark:bg-[#1F2937] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-full flex items-center justify-center mb-6">
        <span className="text-2xl font-black text-[#FF9933]">404</span>
      </div>
      <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">Page Not Found</h2>
      <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-md">
        The requested legal resource or section could not be found.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-2.5 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-md"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

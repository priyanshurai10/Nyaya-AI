'use client';

import Logo from "@/components/Logo";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] flex items-center justify-center p-6 transition-colors">
      <div className="flex flex-col items-center gap-4">
        <Logo size={64} animated={true} />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">
          Loading Nyaya AI...
        </p>
      </div>
    </div>
  );
}

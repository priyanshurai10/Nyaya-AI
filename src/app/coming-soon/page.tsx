'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Rocket } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#020813] text-white overflow-hidden relative pb-20 flex flex-col justify-between font-sans">
      {/* Background gradients */}
      <div className="absolute w-[600px] h-[600px] rounded-full opacity-10 blur-[150px] bg-gradient-to-br from-[#FF9933] via-transparent to-[#138808] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-5 blur-[120px] bg-[#00d2ff] bottom-0 right-0 pointer-events-none" />

      {/* Header Link */}
      <div className="container mx-auto px-6 pt-10 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 flex flex-col items-center justify-center text-center space-y-6 max-w-3xl relative z-10 my-auto">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white dark:bg-[#111827]/[0.02] border border-white/10 shadow-2xl mb-4">
          <Rocket className="text-[#FF9933] w-12 h-12 animate-pulse" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent">
          Feature Coming Soon!
        </h1>
        <p className="text-base text-gray-400 dark:text-white/40 max-w-lg leading-relaxed">
          We are currently building this specialized AI agent integration. This feature will be rolled out in the next platform release.
        </p>
        
        <Link
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-[#FF9933] to-[#138808] hover:from-[#e88a2e] hover:to-[#107007] text-[#020813] font-extrabold rounded-xl text-xs transition-all shadow-md shadow-amber-500/10"
        >
          Return to Console
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-gray-500 dark:text-white/50 select-none pb-6">
        © 2026 Nyaya AI Operating System. Powered by Indian Legal Knowledge Base.
      </div>
    </div>
  );
}

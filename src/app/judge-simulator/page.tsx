'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Gavel, Rocket, ShieldCheck, Scale, BrainCircuit, CheckCircle2, 
  HelpCircle, ArrowRight, PhoneCall, FileText, Sparkles 
} from 'lucide-react';

export default function JudgeSimulatorUpcomingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8 text-[var(--text-primary)] font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Prominent Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-slate-800 p-6 sm:p-10 shadow-xl text-center space-y-4">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-extrabold uppercase tracking-widest mx-auto">
            <Rocket className="w-4 h-4 animate-bounce text-purple-400" /> UPCOMING FEATURE • AI PRECEDENT & BAIL SIMULATOR
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight max-w-4xl mx-auto">
            AI Judicial Precedent & Bail Likelihood Predictor
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Analyze historical High Court and Supreme Court rulings to estimate bail eligibility, procedural timelines, and judicial precedents under Bharatiya Nagarik Suraksha Sanhita (BNSS) Sections 479 & 480.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/consultation"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF9933] to-orange-600 text-white font-bold text-sm shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" /> Consult Senior Specialist
            </Link>
            <Link 
              href="/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-semibold text-sm transition-all"
            >
              Back to Home Dashboard
            </Link>
          </div>
        </div>

        {/* Detailed Feature Explanation */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">How the AI Judge Simulator Works</h2>
            <p className="text-xs text-[var(--text-muted)]">Data-driven legal analytics based on verified Indian case laws</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[var(--text-primary)]">1. Precedent Pattern Analysis</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Scans thousands of landmark judgments across Supreme Court & State High Courts to identify relevant judicial ratios and binding precedents matching your case parameters.
              </p>
            </div>

            <div className="bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[var(--text-primary)]">2. BNSS Bail Eligibility Check</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Evaluates maximum period of custody served under BNSS 479 (first-time offender half-sentence rule) and grounds for anticipatory bail under BNSS 482.
              </p>
            </div>

            <div className="bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                <Gavel className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[var(--text-primary)]">3. Bench Tendency Analytics</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Provides objective statistical breakdown of historical bail grant ratios, typical bond conditions imposed, and arguments most cited by defense counsel.
              </p>
            </div>

          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-2">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Educational Simulation Disclaimer
          </h4>
          <p className="leading-relaxed">
            The AI Judge Simulator is an academic legal research tool intended to assist advocates and law students in examining historical case statistics. Judicial decisions remain strictly within the sole discretion of the presiding judicial magistrate or judge.
          </p>
        </div>

      </div>
    </div>
  );
}
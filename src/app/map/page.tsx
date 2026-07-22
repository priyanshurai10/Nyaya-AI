'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MapPin, Landmark, ShieldAlert, Flame, Scale, Rocket, CheckCircle2, 
  PhoneCall, Navigation, Clock, Building, Compass, ArrowRight, ShieldCheck 
} from 'lucide-react';

export default function CourtMapUpcomingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8 text-[var(--text-primary)] font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Prominent Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-10 shadow-xl text-center space-y-4">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest mx-auto">
            <Rocket className="w-4 h-4 animate-bounce text-amber-400" /> UPCOMING FEATURE • ACTIVE INFRASTRUCTURE MAPPING
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight max-w-4xl mx-auto">
            Court & Emergency Infrastructure Finder
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            We are actively mapping courts, police stations, fire stations, and legal aid desks across all districts of India to provide real-time distance calculations, staff directory contacts, and turn-by-turn navigation.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/emergency"
              className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 animate-pulse" /> Emergency Police & SOS Help
            </Link>
            <Link 
              href="/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-semibold text-sm transition-all"
            >
              Back to Home Dashboard
            </Link>
          </div>
        </div>

        {/* Core Infrastructure Mapping Breakdown */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Planned Infrastructure Discovery Features</h2>
            <p className="text-xs text-[var(--text-muted)]">Calculate exact distances and contact office staff directly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Lower & District Courts */}
            <div className="bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">Lower & District Courts</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Find nearest Magistrate Courts, District & Sessions Courts, Civil Courts, Family Forums, and Commercial Courts sorted by distance from your PIN code.
              </p>
            </div>

            {/* High Courts & Supreme Court */}
            <div className="bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">High Courts & Supreme Court</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Map State High Court benches, circuit benches, and Supreme Court jurisdiction, complete with registrar phone lines and filing office hours.
              </p>
            </div>

            {/* Police & Fire Stations */}
            <div className="bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">Police & Fire Stations</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Locate your jurisdictional Police Station, Women's Cell, Traffic HQ, and Fire Brigade stations for rapid emergency assistance.
              </p>
            </div>

            {/* Legal Aid Desks */}
            <div className="bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)]">Free Legal Aid Desks</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Connect with District Legal Services Authority (DLSA) and State Legal Services Authority (SLSA) offices for free legal counsel.
              </p>
            </div>

          </div>
        </div>

        {/* Feature Roadmap & Contact Details Preview */}
        <div className="bg-[var(--card)] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Direct Office & Staff Contact Integration</h3>
              <p className="text-xs text-[var(--text-muted)]">Real-time data synchronization with eCourts and official directories</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-[#FF9933]" /> Registrar Phone Directory
              </h4>
              <p className="text-[var(--text-muted)]">Direct phone lines to court filing counters, cause list inquiry desks, and office superintendents.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" /> Working Hours & Holidays
              </h4>
              <p className="text-[var(--text-muted)]">Verified court working schedules, lunch timings, filing deadlines, and official judicial calendars.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-indigo-500" /> GPS Distance & Route
              </h4>
              <p className="text-[var(--text-muted)]">Calculates exact road distance in km from your current location to the nearest court complex entrance.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

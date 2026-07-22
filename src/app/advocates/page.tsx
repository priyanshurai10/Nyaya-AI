'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, Award, Rocket, CheckCircle2, ShieldCheck, MapPin, Scale, Clock, 
  Sparkles, ArrowRight, PhoneCall, Send, Building, FileCheck, HelpCircle 
} from 'lucide-react';

export default function AdvocatesUpcomingPage() {
  const [onboardSubmitted, setOnboardSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    barNumber: '',
    state: 'Delhi',
    specialization: 'Criminal & Property Dispute'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8 text-[var(--text-primary)] font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Prominent Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-10 shadow-xl text-center space-y-4">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest mx-auto">
            <Rocket className="w-4 h-4 animate-bounce text-amber-400" /> UPCOMING FEATURE • UNDER ACTIVE ONBOARDING
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight max-w-4xl mx-auto">
            Verified Advocates Directory & Legal Network
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            We are actively approaching, verifying, and onboarding Bar Council registered advocates across High Courts, District Courts, and Municipalities all over India to connect citizens with verified legal experts.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/consultation"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF9933] to-orange-600 text-white font-bold text-sm shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" /> Consult Senior Legal Specialist Now
            </Link>
            <Link 
              href="/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-semibold text-sm transition-all"
            >
              Back to Home Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Breakdown Cards */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">What to Expect When Launched</h2>
            <p className="text-xs text-[var(--text-muted)]">Building a 100% transparent and verified legal counsel network</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[var(--text-primary)]">PIN Code Proximity Match</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Find practicing advocates within your specific district or municipal PIN code, with distance calculations from your local District Court or High Court bench.
              </p>
            </div>

            <div className="bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[var(--text-primary)]">State Bar Verification</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Every listed advocate undergoes credential verification including State Bar Enrollment Numbers, active practice standing, and specializations audit.
              </p>
            </div>

            <div className="bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-[var(--text-primary)]">Direct Appointment Booking</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Book confidential 1-on-1 consultation calls, schedule chamber meetings, and share legal evidence packages securely before your hearing date.
              </p>
            </div>
          </div>
        </div>

        {/* Advocate Onboarding Form Section */}
        <div className="bg-[var(--card)] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <Users className="w-3.5 h-3.5" /> For Legal Professionals
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Are you a Bar Council Verified Advocate?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Join India's fastest growing digital legal platform. Expand your practice reach and assist citizens seeking specialized legal counsel in your district.
            </p>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verified badge & public profile listing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Direct client appointment scheduling</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero listing fees for active Bar Council members</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            {onboardSubmitted ? (
              <div className="text-center p-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
                <h3 className="font-bold text-lg text-[var(--text-primary)]">Registration Application Received!</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Our verification team will review your Bar Enrollment details and contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-base text-[var(--text-primary)] mb-2">Apply for Advocate Onboarding</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Full Advocate Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="Adv. Priyanshu Rai"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[var(--card)] border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-[#FF9933]/50 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Email Address</label>
                    <input 
                      type="email"
                      required
                      placeholder="advocate@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[var(--card)] border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-[#FF9933]/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Bar Enrollment No.</label>
                    <input 
                      type="text"
                      required
                      placeholder="D/1234/2020"
                      value={formData.barNumber}
                      onChange={(e) => setFormData({ ...formData, barNumber: e.target.value })}
                      className="w-full p-3 rounded-xl bg-[var(--card)] border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-[#FF9933]/50 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#FF9933] hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Onboarding Request
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

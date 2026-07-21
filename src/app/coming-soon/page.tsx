'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Rocket, Clock, MapPin, Video, Brain, Shield, Smartphone, Globe, Zap, Star, ChevronRight } from 'lucide-react';

const upcomingFeatures = [
  {
    icon: Video,
    title: "Live Video Consultation",
    description: "Connect with verified advocates via encrypted video calls directly from the Nyaya AI platform. Pay-per-session with instant confirmation.",
    badge: "v2.1",
    color: "from-blue-500 to-indigo-600",
    eta: "Q3 2026",
    status: "In Development"
  },
  {
    icon: MapPin,
    title: "Verified Court Map (Live Data)",
    description: "Real-time court status, cause lists, daily hearing schedules pulled from eCourts API. Navigate directly to any court complex with directions.",
    badge: "v2.1",
    color: "from-emerald-500 to-teal-600",
    eta: "Q3 2026",
    status: "In Development"
  },
  {
    icon: Brain,
    title: "AI Judgment Prediction",
    description: "Deep-learning model trained on 50,000+ Indian court judgments to predict likely outcomes based on facts, precedents, and case strength.",
    badge: "v2.2",
    color: "from-purple-500 to-pink-600",
    eta: "Q4 2026",
    status: "Research Phase"
  },
  {
    icon: Globe,
    title: "Google Calendar Sync",
    description: "Automatically sync court hearing dates and RTI deadlines to Google Calendar. Get smart reminders via email, SMS, and WhatsApp.",
    badge: "v2.1",
    color: "from-orange-500 to-red-500",
    eta: "Q3 2026",
    status: "Planned"
  },
  {
    icon: Shield,
    title: "End-to-End Encrypted Evidence Vault",
    description: "AES-256 encryption with zero-knowledge key management. Your documents are mathematically inaccessible even to Nyaya AI servers.",
    badge: "v2.2",
    color: "from-slate-600 to-slate-800",
    eta: "Q4 2026",
    status: "Planned"
  },
  {
    icon: Smartphone,
    title: "Nyaya AI Mobile App",
    description: "Native iOS and Android app with offline access to your saved cases, evidence vault, and document drafts. Push notifications for hearing dates.",
    badge: "v3.0",
    color: "from-amber-500 to-orange-600",
    eta: "Q1 2027",
    status: "Roadmap"
  },
  {
    icon: Zap,
    title: "Instant FIR E-Filing",
    description: "Direct integration with the Crime and Criminal Tracking Network & Systems (CCTNS) for online FIR registration without visiting a police station.",
    badge: "v2.2",
    color: "from-yellow-400 to-amber-500",
    eta: "Q4 2026",
    status: "Regulatory Approval Pending"
  },
  {
    icon: Star,
    title: "Find Verified Advocates (Expanded Network)",
    description: "Pan-India advocate database with verified Bar Council numbers, practice area specializations, court appearances, client reviews, and direct WhatsApp booking.",
    badge: "v2.1",
    color: "from-teal-500 to-emerald-600",
    eta: "Q3 2026",
    status: "In Development"
  },
];

const STATUS_COLORS: Record<string, string> = {
  "In Development": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Research Phase": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Planned": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Roadmap": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "Regulatory Approval Pending": "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export default function ComingSoonPage() {
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notified, setNotified] = useState(false);

  return (
    <div className="min-h-screen bg-[#020813] text-white overflow-hidden relative pb-20 font-sans">
      {/* Background gradients */}
      <div className="absolute w-[600px] h-[600px] rounded-full opacity-10 blur-[150px] bg-gradient-to-br from-[#FF9933] via-transparent to-[#138808] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-8 blur-[120px] bg-purple-600 bottom-0 right-0 pointer-events-none" />

      {/* Back button */}
      <div className="container mx-auto px-6 pt-10 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 text-center relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-[#FF9933] mb-6">
          <Rocket size={14} className="animate-bounce" />
          Platform Roadmap — Nyaya AI v2.0
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent mb-6">
          What's Coming Next
        </h1>
        <p className="text-base text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Nyaya AI is building India's most comprehensive legal technology platform. These features are under active development and will be rolled out in upcoming releases.
        </p>

        {/* Notify box */}
        <div className="max-w-md mx-auto">
          {notified ? (
            <div className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 font-semibold text-sm">
              ✓ You'll be notified when these features launch!
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={notifyEmail}
                onChange={e => setNotifyEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50"
              />
              <button
                onClick={() => { if (notifyEmail.includes('@')) setNotified(true); }}
                className="px-5 py-3 bg-gradient-to-r from-[#FF9933] to-orange-600 text-white font-bold rounded-xl text-sm hover:from-orange-600 hover:to-red-500 transition-all whitespace-nowrap"
              >
                Notify Me
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/15 rounded-3xl p-6 transition-all duration-300 relative overflow-hidden"
              >
                {/* Subtle gradient glow on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.color} opacity-5 pointer-events-none`} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-white/60">
                        {feature.badge}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[feature.status] || "bg-white/5 text-white/40 border-white/10"}`}>
                        {feature.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FF9933] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expected: {feature.eta}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Footer */}
      <div className="container mx-auto px-6 pt-16 pb-6 text-center relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF9933] to-[#138808] hover:from-[#e88a2e] hover:to-[#107007] text-white font-extrabold rounded-2xl text-sm transition-all shadow-xl shadow-amber-500/10"
        >
          Return to Dashboard
          <ChevronRight size={16} />
        </Link>
        <p className="mt-6 text-[11px] text-gray-600">
          © 2026 Nyaya AI Operating System · Powered by Indian Legal Knowledge Base · Groq LLaMA-3 AI
        </p>
      </div>
    </div>
  );
}

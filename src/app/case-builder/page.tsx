'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type: 'evidence' | 'action' | 'hearing';
}

interface Evidence {
  name: string;
  type: string;
  icon: string;
  relevance: 'high' | 'medium' | 'low';
  status: 'uploaded' | 'analyzed';
}

const mockTimeline: TimelineEvent[] = [
  { date: '2024-01-15', title: 'Rental Agreement Signed', description: 'Original rental agreement signed between parties for 11 months at ₹25,000/month', type: 'evidence' },
  { date: '2024-06-01', title: 'First Complaint Filed', description: 'Written complaint about maintenance issues sent to landlord via registered post', type: 'action' },
  { date: '2024-07-10', title: 'Eviction Notice Received', description: 'Landlord issues eviction notice without proper legal grounds', type: 'action' },
  { date: '2024-08-05', title: 'Legal Notice Sent', description: 'Legal notice sent to landlord demanding compliance with Rent Control Act', type: 'action' },
  { date: '2024-09-15', title: 'Mediation Attempted', description: 'Failed mediation attempt at local Rent Authority office', type: 'hearing' },
  { date: '2024-10-20', title: 'Case Filed in Rent Court', description: 'Petition filed under Rent Control Act in Metropolitan Magistrate Court', type: 'hearing' },
];

const mockEvidence: Evidence[] = [
  { name: 'Rental Agreement', type: 'Document', icon: '📄', relevance: 'high', status: 'analyzed' },
  { name: 'Rent Receipts (6 months)', type: 'Financial', icon: '🧾', relevance: 'high', status: 'analyzed' },
  { name: 'Eviction Notice', type: 'Legal Notice', icon: '📋', relevance: 'high', status: 'analyzed' },
  { name: 'Maintenance Photos', type: 'Photo Evidence', icon: '📸', relevance: 'medium', status: 'uploaded' },
  { name: 'WhatsApp Chats', type: 'Communication', icon: '💬', relevance: 'medium', status: 'analyzed' },
  { name: 'Registered Post Receipt', type: 'Proof of Delivery', icon: '📮', relevance: 'low', status: 'uploaded' },
];

const roadmapSteps = [
  { title: 'Document Collection', desc: 'Gather all agreements, receipts, and communications', time: '1-2 weeks' },
  { title: 'Legal Notice', desc: 'Send formal legal notice to opposing party', time: '2-3 weeks' },
  { title: 'Mediation Attempt', desc: 'Attempt resolution through Rent Authority mediation', time: '3-4 weeks' },
  { title: 'Case Filing', desc: 'File petition in Rent Court with all documents', time: '1-2 weeks' },
  { title: 'Hearings & Arguments', desc: 'Attend court hearings and present evidence', time: '3-6 months' },
  { title: 'Final Order', desc: 'Court passes final order on the dispute', time: '1-2 months' },
];

function CaseStrengthGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#138808' : score >= 40 ? '#FF9933' : '#ef4444';
  const label = score >= 70 ? 'Strong' : score >= 40 ? 'Moderate' : 'Weak';

  return (
    <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm text-center">
      <h3 className="text-lg font-bold text-[#FF9933] mb-6">📊 Case Strength Meter</h3>
      <div className="relative inline-flex items-center justify-center">
        <svg width="180" height="180" className="-rotate-90">
          <circle cx="90" cy="90" r="70" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
          <circle
            cx="90" cy="90" r="70"
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-400 dark:text-white/40 mt-1">{label}</span>
        </div>
      </div>
      <p className="text-gray-400 dark:text-white/40 text-sm mt-4">Based on evidence strength, legal precedents, and case complexity</p>
    </div>
  );
}

function CaseTimeline({ events }: { events: TimelineEvent[] }) {
  const typeColors: Record<string, string> = {
    evidence: 'bg-blue-500',
    action: 'bg-[#FF9933]',
    hearing: 'bg-[#138808]',
  };
  const typeBadgeColors: Record<string, string> = {
    evidence: 'bg-blue-500/20 text-blue-400',
    action: 'bg-[#FF9933]/20 text-[#FF9933]',
    hearing: 'bg-[#138808]/20 text-[#138808]',
  };

  return (
    <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-[#FF9933] mb-6">📅 Case Timeline</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-white dark:bg-[#111827]/10 transform sm:-translate-x-0.5" />

        <div className="space-y-8">
          {events.map((event, i) => (
            <div key={i} className={`relative flex items-start gap-4 sm:gap-8 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
              {/* Content */}
              <div className={`flex-1 ml-10 sm:ml-0 ${i % 2 === 0 ? 'sm:text-right' : 'sm:text-left'}`}>
                <div className={`bg-white dark:bg-[#111827]/5 border border-white/10 rounded-xl p-4 inline-block ${i % 2 === 0 ? 'sm:ml-auto' : 'sm:mr-auto'}`}>
                  <div className="text-xs text-gray-500 dark:text-white/50 mb-1">{event.date}</div>
                  <div className="font-semibold text-white text-sm">{event.title}</div>
                  <div className="text-xs text-gray-400 dark:text-white/40 mt-1">{event.description}</div>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${typeBadgeColors[event.type]}`}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                </div>
              </div>

              {/* Dot */}
              <div className="absolute left-4 sm:left-1/2 transform -translate-x-1/2 mt-2">
                <div className={`w-3 h-3 rounded-full ${typeColors[event.type]} ring-4 ring-[#0A1628]`} />
              </div>

              {/* Spacer for other side */}
              <div className="hidden sm:block flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CaseBuilderPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'tenant-dispute',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-[#0A1628]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#111827]/10 hover:bg-white dark:bg-[#111827]/20 flex items-center justify-center transition-colors"
          >
            ←
          </Link>
          <h1 className="text-xl font-bold">
            📁 Case Builder & <span className="text-[#FF9933]">Strategy</span>
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {!submitted ? (
          /* Case Information Form */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold text-[#FF9933] mb-6">📋 Case Information</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Case Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Tenant vs. Landlord - Illegal Eviction"
                    className="w-full bg-white dark:bg-[#111827]/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF9933]/50 focus:ring-1 focus:ring-[#FF9933]/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Case Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-white dark:bg-[#111827]/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF9933]/50 focus:ring-1 focus:ring-[#FF9933]/30 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="tenant-dispute" className="bg-[#0A1628]">Tenant Dispute</option>
                    <option value="property" className="bg-[#0A1628]">Property Dispute</option>
                    <option value="consumer" className="bg-[#0A1628]">Consumer Complaint</option>
                    <option value="employment" className="bg-[#0A1628]">Employment Issue</option>
                    <option value="family" className="bg-[#0A1628]">Family Law</option>
                    <option value="criminal" className="bg-[#0A1628]">Criminal Matter</option>
                    <option value="other" className="bg-[#0A1628]">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Case Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    placeholder="Describe your case in detail — what happened, when, who is involved..."
                    className="w-full bg-white dark:bg-[#111827]/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF9933]/50 focus:ring-1 focus:ring-[#FF9933]/30 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#FF9933] to-[#FF8800] hover:from-[#FFaa44] hover:to-[#FF9933] text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-[#FF9933]/20 hover:shadow-[#FF9933]/40 active:scale-[0.98]"
                >
                  🔍 Build Case Strategy →
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {formData.title || 'Tenant vs. Landlord — Illegal Eviction'}
                </h2>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-1">AI-generated case analysis based on Indian legal framework</p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 bg-white dark:bg-[#111827]/10 hover:bg-white dark:bg-[#111827]/20 rounded-xl text-sm transition-colors"
              >
                New Case
              </button>
            </div>

            {/* Case Strength */}
            <CaseStrengthGauge score={72} />

            {/* Case Timeline */}
            <CaseTimeline events={mockTimeline} />

            {/* Legal Roadmap */}
            <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-[#FF9933] mb-6">🗺️ Legal Roadmap</h3>
              <div className="space-y-4">
                {roadmapSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    {/* Step Number */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${ i < 3 ? 'bg-[#138808]/20 text-[#138808]' : 'bg-white dark:bg-[#111827]/10 text-gray-400 dark:text-white/40' }`}>
                        {i < 3 ? '✓' : i + 1}
                      </div>
                      {i < roadmapSteps.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${i < 2 ? 'bg-[#138808]/30' : 'bg-white dark:bg-[#111827]/10'}`} />
                      )}
                    </div>
                    {/* Step Content */}
                    <div className={`flex-1 bg-white dark:bg-[#111827]/5 border rounded-xl p-4 ${i < 3 ? 'border-[#138808]/20' : 'border-white/10'}`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white text-sm">{step.title}</h4>
                        <span className="text-xs text-gray-500 dark:text-white/50 bg-white dark:bg-[#111827]/5 px-2 py-1 rounded-lg">{step.time}</span>
                      </div>
                      <p className="text-gray-400 dark:text-white/40 text-xs mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Analysis */}
            <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-[#FF9933] mb-6">🔬 Evidence Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockEvidence.map((ev) => {
                  const relevanceColors: Record<string, string> = {
                    high: 'bg-[#138808]/20 text-[#138808]',
                    medium: 'bg-[#FF9933]/20 text-[#FF9933]',
                    low: 'bg-gray-500/20 text-gray-400',
                  };
                  return (
                    <div key={ev.name} className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <span className="text-2xl">{ev.icon}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${relevanceColors[ev.relevance]}`}>
                          {ev.relevance.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-white text-sm mt-2">{ev.name}</h4>
                      <p className="text-gray-500 dark:text-white/50 text-xs mt-0.5">{ev.type}</p>
                      <div className="mt-3 flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${ev.status === 'analyzed' ? 'bg-[#138808]' : 'bg-[#FF9933]'}`} />
                        <span className="text-xs text-gray-400 dark:text-white/40 capitalize">{ev.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cost & Time Estimates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm text-center">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="text-sm font-semibold text-gray-400 dark:text-white/40">Estimated Cost</h3>
                <div className="text-2xl font-bold text-[#FF9933] mt-2">₹15,000 — ₹50,000</div>
                <p className="text-xs text-gray-500 dark:text-white/50 mt-2">Includes court fees, lawyer fees, and documentation</p>
              </div>
              <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm text-center">
                <div className="text-3xl mb-2">⏱️</div>
                <h3 className="text-sm font-semibold text-gray-400 dark:text-white/40">Estimated Duration</h3>
                <div className="text-2xl font-bold text-[#FF9933] mt-2">6 — 12 Months</div>
                <p className="text-xs text-gray-500 dark:text-white/50 mt-2">Includes filing, hearings, and final order</p>
              </div>
            </div>

            {/* Risk Analysis */}
            <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-[#FF9933] mb-6">⚖️ Risk Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#138808]/10 border border-[#138808]/30 rounded-xl p-5">
                  <h4 className="font-bold text-[#138808] text-sm mb-2">🟢 Best Case</h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Court orders landlord to restore possession with compensation for damages. Landlord pays ₹2-3 lakh in compensation plus all legal costs. Timeline: 4-6 months.
                  </p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
                  <h4 className="font-bold text-amber-400 text-sm mb-2">🟡 Most Likely</h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Mediation leads to settlement — landlord provides 3 months notice and returns full security deposit. Both parties agree to terms. Timeline: 6-8 months.
                  </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                  <h4 className="font-bold text-red-400 text-sm mb-2">🔴 Worst Case</h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    Prolonged litigation with appeals. Court orders mutual termination with partial deposit return. Significant legal costs incurred. Timeline: 12-18 months.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


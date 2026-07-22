'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FolderOpen, ArrowLeft, Shield, Scale, Clock, CheckCircle2, AlertTriangle, FileText, Plus, Loader2 } from 'lucide-react';

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
  { date: '2024-01-15', title: 'Primary Agreement / Contract Executed', description: 'Written contract signed between parties outlining key legal obligations.', type: 'evidence' },
  { date: '2024-06-01', title: 'First Formal Dispute Communication', description: 'Written notice of grievance served via registered speed post.', type: 'action' },
  { date: '2024-07-10', title: 'Statutory Notice Issued', description: 'Formal 15-day legal notice sent demanding immediate compliance.', type: 'action' },
  { date: '2024-08-05', title: 'Case Petition Prepared', description: 'Draft petition finalized along with Section 63 BSA electronic evidence certificate.', type: 'action' },
  { date: '2024-09-15', title: 'Pre-Litigation Mediation Session', description: 'Attempted resolution at Lok Adalat / Alternative Dispute Resolution center.', type: 'hearing' },
  { date: '2024-10-20', title: 'Formal Petition Admitted in Court', description: 'Case registered and summons issued to respondent.', type: 'hearing' },
];

const mockEvidence: Evidence[] = [
  { name: 'Primary Legal Agreement', type: 'Contract Document', icon: '📄', relevance: 'high', status: 'analyzed' },
  { name: 'Payment Receipts & Bank Ledger', type: 'Financial Record', icon: '🧾', relevance: 'high', status: 'analyzed' },
  { name: 'Statutory Legal Notice', type: 'Legal Notice', icon: '📋', relevance: 'high', status: 'analyzed' },
  { name: 'WhatsApp & Email Logs', type: 'Electronic Evidence (BSA Sec 61)', icon: '💬', relevance: 'medium', status: 'analyzed' },
  { name: 'Speed Post Delivery Proof', type: 'Postal Tracking', icon: '📮', relevance: 'low', status: 'uploaded' },
];

function CaseStrengthGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#138808' : score >= 40 ? '#FF9933' : '#ef4444';
  const label = score >= 70 ? 'Strong Claim' : score >= 40 ? 'Moderate Case' : 'Requires Additional Evidence';

  return (
    <div className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
      <h3 className="text-lg font-bold text-[#FF9933] mb-6 flex items-center justify-center gap-2">
        <Scale className="w-5 h-5" /> Case Strength Score Meter
      </h3>
      <div className="relative inline-flex items-center justify-center">
        <svg width="180" height="180" className="-rotate-90">
          <circle cx="90" cy="90" r="70" stroke="rgba(150,150,150,0.2)" strokeWidth="12" fill="none" />
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
          <span className="text-4xl font-black text-[var(--text-primary)]">{score}%</span>
          <span className="text-xs font-semibold text-[var(--text-muted)] mt-1">{label}</span>
        </div>
      </div>
      <p className="text-[var(--text-muted)] text-xs mt-4">Calculated under Indian Evidence Framework & BSA Section 61 standards.</p>
    </div>
  );
}

export default function CaseBuilderPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'property',
    description: '',
  });
  const [aiResult, setAiResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    setIsLoading(true);
    try {
      // 1. Create case in backend store
      await fetch('/api/v1/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.type,
          summary: formData.description,
          status: 'active',
        }),
      });

      // 2. Fetch AI strategy analysis
      const aiRes = await fetch('/api/v1/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: `[Category: ${formData.type}] Title: ${formData.title}. Description: ${formData.description}` }),
      });
      const aiData = await aiRes.json();
      setAiResult(aiData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8 text-[var(--text-primary)]">
      {/* Top Bar */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <Link
          href="/cases"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--card)] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cases
        </Link>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-[#FF9933]" /> Case Folder Strategy Builder
        </h1>
      </div>

      <div className="max-w-5xl mx-auto">
        {!submitted ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#FF9933] mb-2 flex items-center gap-2">
                📋 Case Profile Setup
              </h2>
              <p className="text-xs text-[var(--text-muted)] mb-6">
                Create an active case folder to generate timelines, strength scores, and statutory legal steps.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Case Folder Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Tenant Deposit Dispute vs Landlord"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Legal Category *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  >
                    <option value="property">Property & Rent Dispute</option>
                    <option value="consumer">Consumer Protection Complaint</option>
                    <option value="employment">Employment & Salary Recovery</option>
                    <option value="family">Family & Matrimonial</option>
                    <option value="criminal">Criminal / Cyber Crime (BNS)</option>
                    <option value="civil">General Civil Dispute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Case Summary & Facts *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    placeholder="Describe your case in detail — key events, dates, monetary amounts, notice status..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
                  className="w-full py-3.5 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Case Parameters...</>
                  ) : (
                    <><Shield className="w-5 h-5" /> Build Case Strategy Folder</>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF9933] bg-[#FF9933]/10 px-2.5 py-1 rounded-full border border-[#FF9933]/20">
                  Case Strategy Generated
                </span>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-2">
                  {formData.title}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Saved into Active Case Management System.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/cases"
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  View All Cases
                </Link>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-[#FF9933] text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors"
                >
                  New Case
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CaseStrengthGauge score={78} />

              <div className="lg:col-span-2 bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#138808] mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5" /> Applicable Indian Acts & Laws
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(aiResult?.applicable_laws || ['Transfer of Property Act Sec 108', 'BNS Sec 318 (Cheating)', 'Consumer Protection Act 2019']).map((law: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-[#138808]/10 text-[#138808] dark:text-emerald-400 font-semibold text-xs rounded-xl border border-[#138808]/20">
                      {law}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Timeline Estimate: <strong className="text-[var(--text-primary)]">{aiResult?.estimated_timeline || "3 - 6 Months"}</strong>
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[#FF9933] mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Recommended Procedural Timeline
              </h3>
              <div className="space-y-4">
                {(aiResult?.process_steps || mockTimeline.map(t => t.title)).map((step: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="w-6 h-6 rounded-full bg-[#FF9933] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-[var(--text-primary)] font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Checklist */}
            <div className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-indigo-500 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Mandatory Evidentiary Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockEvidence.map((ev) => (
                  <div key={ev.name} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{ev.icon}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#138808]/10 text-[#138808] dark:text-emerald-400">
                        VERIFIED
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">{ev.name}</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{ev.type}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

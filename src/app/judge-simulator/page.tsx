'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Gavel,
  Scale,
  ShieldAlert,
  FileText,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  BookOpen,
  UserCheck,
  Building2,
  Clock,
} from 'lucide-react';

interface SimulationScenario {
  id: string;
  title: string;
  category: string;
  statute: string;
  facts: string;
  prosecutionArgument: string;
  defenseArgument: string;
  legalQuestion: string;
  verdictOptions: {
    label: string;
    verdictType: 'CONVICTED' | 'ACQUITTED' | 'BAIL_GRANTED' | 'PARTIAL_RELIEF';
    reasoning: string;
    sectionsCited: string[];
    isCorrectVerdict: boolean;
  }[];
}

const scenarios: SimulationScenario[] = [
  {
    id: 'snatching-bns-304',
    title: 'Chain Snatching on Public Highway (BNS Sec 304)',
    category: 'Criminal Law',
    statute: 'Bharatiya Nyaya Sanhita (BNS 2023) Section 304 & BNSS Sec 479',
    facts: 'Accused Rakesh was apprehended by public witnesses after snatching a gold chain worth ₹1,20,000 from a commuter at Saket Metro Station. Police seized the chain on the spot. Rakesh claims it was a case of simple pickpocketing without force.',
    prosecutionArgument: 'The act involved sudden force and intimidation while victim was moving, meeting all parameters of Section 304 BNS (Snatching). Rigorous imprisonment of 3 years is demanded.',
    defenseArgument: 'No weapon was used and no physical injury was caused to victim. Accused is a first-time offender and should be granted bail under BNSS Section 479.',
    legalQuestion: 'Does snatching a chain forcibly from a victim while in motion constitute Snatching under Sec 304 BNS, and is the accused eligible for immediate bail?',
    verdictOptions: [
      {
        label: 'Option A: Convict under Section 304 BNS & Deny Immediate Unconditional Bail',
        verdictType: 'CONVICTED',
        reasoning: 'Snatching under BNS Section 304 explicitly covers forcible taking of movable property from a victim in motion. Given recovery of gold chain on spot, prima facie offence is established. Bail is denied at preliminary stage due to non-bailable nature of Sec 304.',
        sectionsCited: ['BNS 2023 Section 304', 'BNSS 2023 Section 173', 'BSA 2023 Section 63'],
        isCorrectVerdict: true,
      },
      {
        label: 'Option B: Reclassify as Simple Theft under BNS Sec 303 & Grant Instant Bail',
        verdictType: 'BAIL_GRANTED',
        reasoning: 'Without weapon usage, theft cannot be classified as snatching.',
        sectionsCited: ['BNS Section 303'],
        isCorrectVerdict: false,
      },
    ],
  },
  {
    id: 'tenant-deposit-eviction',
    title: 'Landlord Deposit Forfeiture & Summary Suit (CPC Order 37)',
    category: 'Civil & Tenancy Law',
    statute: 'Model Tenancy Act & CPC Order 37 Summary Suit',
    facts: 'Tenant Priya vacated apartment after 11-month lease expired with 30-day written notice. Landlord refused to refund ₹85,000 security deposit alleging non-existent wall paint wear-and-tear.',
    prosecutionArgument: 'Normal wear and tear cannot be deducted from security deposit per Model Tenancy Act Sec 13. Summary suit under CPC Order 37 with 18% interest is prayed.',
    defenseArgument: 'Landlord claims verbal agreement allowed him to deduct repainting costs.',
    legalQuestion: 'Can a landlord unilaterally forfeit security deposit for normal wear and tear without itemized invoices?',
    verdictOptions: [
      {
        label: 'Option A: Order Full Security Deposit Refund with 9% Interest',
        verdictType: 'PARTIAL_RELIEF',
        reasoning: 'Under Model Tenancy Act principles, security deposit must be refunded within 30 days of vacation. Normal wear and tear is not deductible without written invoice proof. Landlord ordered to pay ₹85,000 plus interest.',
        sectionsCited: ['Model Tenancy Act 2021 Sec 13', 'CPC 1908 Order 37'],
        isCorrectVerdict: true,
      },
      {
        label: 'Option B: Dismiss Tenant Petition',
        verdictType: 'ACQUITTED',
        reasoning: 'Verbal agreements supersede lease terms.',
        sectionsCited: ['Indian Contract Act 1872 Sec 92'],
        isCorrectVerdict: false,
      },
    ],
  },
];

export default function JudgeSimulatorPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0].id);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isDeliveringVerdict, setIsDeliveringVerdict] = useState(false);
  const [verdictDelivered, setVerdictDelivered] = useState(false);

  const scenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
  const activeOption = selectedOptionIndex !== null ? scenario.verdictOptions[selectedOptionIndex] : null;

  const handleDeliverVerdict = () => {
    if (selectedOptionIndex === null) return;
    setIsDeliveringVerdict(true);
    setTimeout(() => {
      setIsDeliveringVerdict(false);
      setVerdictDelivered(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8 text-[var(--text-primary)] font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              <Gavel className="w-3.5 h-3.5" /> AI Judge Bench Simulator
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Preside as Judge: Indian Legal Simulation
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Step into the bench of an Indian court. Review case facts, weigh prosecution and defense arguments, and pronounce judicial verdicts grounded in BNS, BNSS, and Indian Case Law.
            </p>
          </div>
        </div>

        {/* Case Selection Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedScenarioId(sc.id);
                setSelectedOptionIndex(null);
                setVerdictDelivered(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                selectedScenarioId === sc.id
                  ? 'bg-[#FF9933] text-white border-[#FF9933] shadow-md'
                  : 'bg-[var(--card)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--card-elevated)]'
              }`}
            >
              {sc.title}
            </button>
          ))}
        </div>

        {/* Bench Hearing Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fact Sheet & Arguments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Overview */}
            <div className="bg-[var(--card)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9933]">
                    {scenario.category}
                  </span>
                  <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                    {scenario.title}
                  </h2>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-[var(--border)]">
                  {scenario.statute}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Proven Case Facts
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-[var(--border)]">
                  {scenario.facts}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                  <h5 className="text-xs font-extrabold text-rose-500 uppercase tracking-wider">
                    State / Prosecution Submission
                  </h5>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                    {scenario.prosecutionArgument}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-1">
                  <h5 className="text-xs font-extrabold text-sky-500 uppercase tracking-wider">
                    Defense Counsel Submission
                  </h5>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                    {scenario.defenseArgument}
                  </p>
                </div>
              </div>
            </div>

            {/* Verdict Selection Options */}
            <div className="bg-[var(--card)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#FF9933]" /> Formulate Judicial Decision
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {scenario.legalQuestion}
              </p>

              <div className="space-y-3 pt-2">
                {scenario.verdictOptions.map((opt, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedOptionIndex(idx);
                        setVerdictDelivered(false);
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm font-semibold ${
                        isSelected
                          ? 'bg-[#FF9933]/15 border-[#FF9933] text-[var(--text-primary)] shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900/40 border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--card-elevated)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleDeliverVerdict}
                  disabled={selectedOptionIndex === null || isDeliveringVerdict}
                  className="w-full py-3 bg-[#FF9933] hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Gavel className="w-4 h-4" />
                  {isDeliveringVerdict ? 'Pronouncing Verdict...' : 'Pronounce Judicial Verdict'}
                </button>
              </div>
            </div>
          </div>

          {/* Judicial Order Sheet Output */}
          <div className="space-y-6">
            <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF9933]" /> Court Order Sheet
              </h3>

              {!verdictDelivered || !activeOption ? (
                <div className="p-8 text-center border-2 border-dashed border-[var(--border)] rounded-2xl space-y-3 text-[var(--text-muted)]">
                  <Gavel className="w-10 h-10 mx-auto text-slate-400 opacity-50" />
                  <p className="text-xs font-semibold">
                    Select a verdict option and click "Pronounce Judicial Verdict" to render court judgment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-[var(--border)] animate-fade-in">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                      VERDICT: {activeOption.verdictType}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      Bench Order #2026-SIM
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-[#FF9933] uppercase tracking-wider mb-1">
                      Judicial Reasoning & Ratio Decidendi
                    </h5>
                    <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                      {activeOption.reasoning}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-1">
                      Statutes & Penal Sections Cited
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {activeOption.sectionsCited.map((sec, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-500 border border-sky-500/20 text-[10px] font-mono font-bold"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {activeOption.isCorrectVerdict ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Sound Judicial Precedent: Verdict aligns with High Court benchmarks.</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Review Required: Higher appellate court may overturn this interpretation.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

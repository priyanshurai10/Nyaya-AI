"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Gavel, Scale, FileText, CheckCircle, ArrowRight, Loader2, Calendar, ShieldCheck, FolderPlus } from "lucide-react";

interface StrategyResponse {
  possible_issues: string[];
  applicable_laws: string[];
  process_steps: string[];
  documents_required: string[];
  estimated_timeline: string;
  next_steps: string[];
}

const CASE_TYPES = [
  "Property Dispute",
  "Labour & Employment",
  "Consumer Complaint",
  "Criminal / Cyber Crime",
  "Family & Matrimonial",
  "Contract Dispute",
  "RTI / Administrative",
];

export default function StrategyPage() {
  const router = useRouter();
  const [caseType, setCaseType] = useState("Property Dispute");
  const [position, setPosition] = useState("Complainant / Victim");
  const [description, setDescription] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [strategy, setStrategy] = useState<StrategyResponse | null>(null);
  const [error, setError] = useState("");
  const [isSavingCase, setIsSavingCase] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const handleBuildStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsLoading(true);
    setError("");
    setSaveSuccessMsg("");
    setStrategy(null);

    const fullSituation = `[Case Type: ${caseType}] [Position: ${position}] [Desired Outcome: ${desiredOutcome || "Fair resolution"}] Details: ${description}`;

    try {
      const res = await fetch("/api/v1/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: fullSituation }),
      });

      if (!res.ok) throw new Error("Failed to generate legal strategy.");
      const data = await res.json();
      setStrategy(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToVault = async () => {
    if (!strategy) return;
    setIsSavingCase(true);
    setSaveSuccessMsg("");

    try {
      const res = await fetch("/api/v1/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${caseType} - Strategy Blueprint`,
          category: caseType,
          summary: description,
          actSections: strategy.applicable_laws.join(", "),
          status: "PRE_LITIGATION",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccessMsg("Saved to Litigation Cases Vault!");
        setTimeout(() => {
          router.push(`/cases/${data.data.caseId}`);
        }, 1200);
      } else {
        throw new Error(data.detail || "Failed to save case.");
      }
    } catch (err: any) {
      setError(err.message || "Could not save to cases vault.");
    } finally {
      setIsSavingCase(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <Brain className="w-8 h-8 text-[#FF9933]" />
            AI Legal Strategy Builder
          </h1>
          <p className="text-[var(--text-muted)] mt-2 max-w-2xl">
            Input your case parameters to generate a structured multi-phase litigation and negotiation strategy tailored to Indian legal procedures.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <form onSubmit={handleBuildStrategy} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Category / Case Type
                </label>
                <select
                  value={caseType}
                  onChange={e => setCaseType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[#FF9933]"
                >
                  {CASE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Your Standing / Position
                </label>
                <select
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[#FF9933]"
                >
                  <option value="Complainant / Victim">Complainant / Plaintiff (Aggrieved Party)</option>
                  <option value="Respondent / Defendant">Respondent / Defendant (Accused Party)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Case Facts & Summary
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="Detail key facts, dates, monetary involvement, and communications exchanged so far..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Desired Outcome (Optional)
              </label>
              <input
                type="text"
                value={desiredOutcome}
                onChange={e => setDesiredOutcome(e.target.value)}
                placeholder="e.g. Full refund with compensation, property possession, FIR quashing"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !description.trim()}
              className="w-full py-3 bg-gradient-to-r from-[#FF9933] to-orange-600 text-white font-bold rounded-xl hover:opacity-95 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Synthesizing Strategy Plan...</>
              ) : (
                <><Gavel className="w-5 h-5" /> Generate Actionable Strategy</>
              )}
            </button>
          </form>
        </div>

        {/* Generated Strategy Roadmap */}
        {strategy && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-[#FF9933]/30 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF9933] bg-[#FF9933]/10 px-2.5 py-1 rounded-full border border-[#FF9933]/20">
                    Strategy Blueprint
                  </span>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mt-2">
                    {caseType} Roadmap
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--card)] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <Calendar className="w-4 h-4 text-[#138808]" />
                    Estimated Timeline: <strong className="text-[var(--text-primary)]">{strategy.estimated_timeline}</strong>
                  </div>

                  <button
                    onClick={handleSaveToVault}
                    disabled={isSavingCase}
                    className="px-4 py-2 bg-[#138808] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isSavingCase ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FolderPlus className="w-4 h-4" />
                    )}
                    Save to Litigation Vault
                  </button>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  {saveSuccessMsg}
                </div>
              )}
            </div>

            {/* Applicable Statutes */}
            <div className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 mb-3">
                <Scale className="w-5 h-5 text-[#138808]" /> Governing Indian Statutory Provisions
              </h3>
              <div className="flex flex-wrap gap-2">
                {strategy.applicable_laws.map((law, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-[#138808]/10 text-[#138808] dark:text-emerald-400 font-semibold text-xs rounded-xl border border-[#138808]/20">
                    {law}
                  </span>
                ))}
              </div>
            </div>

            {/* Multi-Phase Strategy Timeline */}
            <div className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-indigo-500" /> Chronological Action Blueprint
              </h3>

              <div className="relative border-l-2 border-indigo-500/20 dark:border-indigo-500/40 ml-4 space-y-8">
                {/* Phase 1 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-md">
                    1
                  </div>
                  <h4 className="font-bold text-base text-[var(--text-primary)] mb-1">
                    Phase 1: Evidence Compilation & Audit
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mb-3">Gather and preserve all primary records required to establish your claim.</p>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-2 border border-slate-200/60 dark:border-slate-700/60">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase">Essential Documents:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {strategy.documents_required.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-primary)]">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {doc}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-[#FF9933] text-white flex items-center justify-center text-xs font-black shadow-md">
                    2
                  </div>
                  <h4 className="font-bold text-base text-[var(--text-primary)] mb-1">
                    Phase 2: Legal Notice & Out-of-Court Settlement
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mb-3">Issue a formal statutory legal notice giving 15-30 days time to comply.</p>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    {strategy.process_steps.slice(0, 3).map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-primary)]">
                        <span className="text-[#FF9933] shrink-0 font-bold">•</span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="relative pl-6">
                  <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-[#138808] text-white flex items-center justify-center text-xs font-black shadow-md">
                    3
                  </div>
                  <h4 className="font-bold text-base text-[var(--text-primary)] mb-1">
                    Phase 3: Formal Litigation & Court Filings
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mb-3">File complaint or petition in competent jurisdiction if notice is ignored.</p>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    {strategy.process_steps.slice(3).map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-primary)]">
                        <span className="text-[#138808] shrink-0 font-bold">•</span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Advice & Next Steps */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-indigo-300">
                <ShieldCheck className="w-5 h-5 text-indigo-400" /> Immediate Tactical Advice
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {strategy.next_steps.map((next, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-200 bg-white/5 p-3 rounded-xl border border-white/10">
                    <ArrowRight className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
                    {next}
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
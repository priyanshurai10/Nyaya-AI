"use client";

import React, { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, Clock, ArrowRight, Loader2, BookOpen, FileText, Scale } from "lucide-react";

interface InsightResponse {
  possible_issues: string[];
  applicable_laws: string[];
  process_steps: string[];
  documents_required: string[];
  estimated_timeline: string;
  next_steps: string[];
}

const QUICK_SCENARIOS = [
  "Property encroachment by neighbor",
  "Employer not paying salary",
  "Online shopping fraud / scam",
  "Landlord refusing to return security deposit",
  "Consumer received defective product",
  "Bank account fraudulently debited",
];

function getRiskLevel(issues: string[]): "LOW" | "MEDIUM" | "HIGH" {
  const text = issues.join(" ").toLowerCase();
  if (text.includes("criminal") || text.includes("fraud") || text.includes("violence") || text.includes("eviction") || text.includes("harassment")) return "HIGH";
  if (issues.length > 3) return "MEDIUM";
  return "LOW";
}

export default function RiskPage() {
  const [situation, setSituation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim()) return;
    setIsLoading(true);
    setError("");
    setInsights(null);
    try {
      const res = await fetch("/api/v1/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation }),
      });
      if (!res.ok) throw new Error("Failed to analyze. Please try again.");
      const data = await res.json();
      setInsights(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const risk = insights ? getRiskLevel(insights.possible_issues) : null;
  const riskConfig = {
    LOW: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", meter: "bg-emerald-500", width: "w-1/3", label: "LOW RISK" },
    MEDIUM: { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", meter: "bg-amber-500", width: "w-2/3", label: "MEDIUM RISK" },
    HIGH: { color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", meter: "bg-red-500", width: "w-full", label: "HIGH RISK" },
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#FF9933]" />
            AI Legal Risk Analyzer
          </h1>
          <p className="text-[var(--text-muted)] mt-2 max-w-2xl">
            Describe your legal situation and get an instant AI-powered risk assessment with applicable Indian laws and recommended actions.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Describe your legal situation
              </label>
              <textarea
                value={situation}
                onChange={e => setSituation(e.target.value)}
                rows={5}
                placeholder="Example: My landlord has locked my flat and is refusing to return my security deposit of ₹50,000 after I vacated. He is threatening me and not allowing me to take my belongings."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933] resize-none"
              />
            </div>

            {/* Quick scenarios */}
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Quick Examples</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_SCENARIOS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSituation(s)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)] rounded-lg hover:bg-[#FF9933]/10 hover:text-[#FF9933] hover:border-[#FF9933]/30 border border-transparent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !situation.trim()}
              className="w-full py-3 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing with AI...</>
              ) : (
                <><Shield className="w-5 h-5" /> Analyze Risk Now</>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {insights && risk && (
          <div className="space-y-6">
            {/* Risk Meter */}
            <div className={`${riskConfig[risk].bg} border ${riskConfig[risk].border} rounded-2xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-6 h-6 ${riskConfig[risk].color}`} />
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Risk Assessment</p>
                    <p className={`text-2xl font-black ${riskConfig[risk].color}`}>{riskConfig[risk].label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--text-muted)]">Timeline</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{insights.estimated_timeline}</p>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${riskConfig[risk].meter} ${riskConfig[risk].width} transition-all duration-1000`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Legal Issues */}
              {insights.possible_issues.length > 0 && (
                <div className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-[#FF9933]" /> Legal Issues Identified
                  </h3>
                  <ul className="space-y-2">
                    {insights.possible_issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                        <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Applicable Laws */}
              {insights.applicable_laws.length > 0 && (
                <div className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                    <Scale className="w-4 h-4 text-[#138808]" /> Applicable Indian Laws
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {insights.applicable_laws.map((law, i) => (
                      <span key={i} className="px-3 py-1.5 text-xs font-semibold bg-[#138808]/10 text-[#138808] dark:text-emerald-400 border border-[#138808]/20 rounded-lg">
                        {law}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Process Steps */}
              {insights.process_steps.length > 0 && (
                <div className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                    <ArrowRight className="w-4 h-4 text-blue-500" /> Steps to Resolve
                  </h3>
                  <ol className="space-y-2">
                    {insights.process_steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-primary)]">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Documents Required */}
              {insights.documents_required.length > 0 && (
                <div className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                  <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-purple-500" /> Documents Required
                  </h3>
                  <ul className="space-y-2">
                    {insights.documents_required.map((doc, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                        <CheckCircle className="w-4 h-4 text-[#138808] shrink-0 mt-0.5" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Next Steps */}
            {insights.next_steps.length > 0 && (
              <div className="bg-gradient-to-r from-[#FF9933]/10 to-[#138808]/10 border border-[#FF9933]/20 rounded-2xl p-6">
                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-[#FF9933]" /> Immediate Next Steps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.next_steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                      <span className="text-[#FF9933] shrink-0">→</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
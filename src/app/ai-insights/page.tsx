'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Scale, 
  BookOpen, 
  ListChecks, 
  FileText, 
  Clock, 
  ArrowRight,
  Send,
  Loader2
} from 'lucide-react';

interface InsightResponse {
  possible_issues: string[];
  applicable_laws: string[];
  process_steps: string[];
  documents_required: string[];
  estimated_timeline: string;
  next_steps: string[];
}

export default function AIInsightsPage() {
  const [situation, setSituation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim()) return;

    setIsLoading(true);
    setError('');
    setInsights(null);

    try {
      const response = await fetch('/api/v1/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights. Please try again.');
      }

      const data = await response.json();
      setInsights(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-full mb-4">
            <Scale className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
            AI Legal Insights <span className="text-sm font-medium px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full align-middle ml-2">Beta</span>
          </h1>
          <p className="text-gray-400 dark:text-white/40 max-w-2xl mx-auto text-lg">
            Describe your legal situation in plain English, and our AI will analyze it to provide preliminary insights, applicable laws, and recommended next steps.
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-400 font-semibold text-lg">Important Disclaimer</h3>
            <p className="text-red-300/80 mt-1">
              This is an AI-generated educational assessment and not legal advice. It does not predict court outcomes or guarantee legal results. Always consult a qualified legal professional for advice tailored to your specific circumstances.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label htmlFor="situation" className="block text-sm font-medium text-gray-300">
              Describe your legal situation
            </label>
            <div className="relative">
              <textarea
                id="situation"
                rows={5}
                className="block w-full rounded-xl bg-[#1F2937] border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-amber-500 focus:border-amber-500 resize-none p-4 shadow-inner"
                placeholder="E.g., I signed a contract with a vendor to deliver materials by last month, but they haven't delivered yet and I've lost money because of it..."
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !situation.trim()}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-gray-900 dark:text-white bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Situation...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Generate Insights
                  </>
                )}
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-4 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Insights Results */}
        {insights && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Possible Issues */}
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-amber-500/30 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Scale className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100">Possible Issues</h3>
                </div>
                <ul className="space-y-3">
                  {insights.possible_issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-400 mr-2 mt-1">•</span>
                      <span className="text-gray-300">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Applicable Laws */}
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-amber-500/30 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <BookOpen className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100">Applicable Laws</h3>
                </div>
                <ul className="space-y-3">
                  {insights.applicable_laws.map((law, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-indigo-400 mr-2 mt-1">•</span>
                      <span className="text-gray-300">{law}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Process Steps */}
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-amber-500/30 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <ListChecks className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100">Process Steps</h3>
                </div>
                <ul className="space-y-3">
                  {insights.process_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-emerald-400 mr-2 font-bold">{idx + 1}.</span>
                      <span className="text-gray-300">{step.replace(/^\d+\.\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Documents Required */}
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-amber-500/30 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <FileText className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100">Documents Required</h3>
                </div>
                <ul className="space-y-3">
                  {insights.documents_required.map((doc, idx) => (
                    <li key={idx} className="flex items-start">
                      <FileText className="w-4 h-4 text-gray-500 dark:text-white/50 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-300">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Estimated Timeline */}
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-amber-500/30 transition-colors md:col-span-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100">Estimated Timeline</h3>
                </div>
                <p className="text-gray-300 text-lg">{insights.estimated_timeline}</p>
              </div>

              {/* Next Steps */}
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-amber-500/30 transition-colors md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-rose-500/10 rounded-lg">
                    <ArrowRight className="w-6 h-6 text-rose-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100">Recommended Next Steps</h3>
                </div>
                <div className="space-y-4">
                  {insights.next_steps.map((step, idx) => (
                    <div key={idx} className="flex items-start p-3 bg-[#1F2937] rounded-xl border border-gray-700/50">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-rose-500/20 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-rose-400 text-sm font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-gray-200">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

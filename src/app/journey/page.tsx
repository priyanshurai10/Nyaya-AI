'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface JourneyStep {
  step: number;
  name: string;
  desc: string;
}

interface JourneyDetails {
  title: string;
  start_court: string;
  first_instance: string;
  hierarchy: JourneyStep[];
  documents: string[];
  timeline: string;
}

function LitigationJourneyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryParam = searchParams.get('category');
  
  const categories = [
    { id: 'property', label: 'Property Law', emoji: '🏠' },
    { id: 'labour', label: 'Employment Law', emoji: '🛠️' },
    { id: 'family', label: 'Family Law', emoji: '💑' },
    { id: 'civil', label: 'Civil Cases', emoji: '📋' },
    { id: 'criminal', label: 'Criminal Cases', emoji: '👮' },
  ];
  
  const defaultCat = categoryParam && categories.some(c => c.id === categoryParam) ? categoryParam : 'property';
  
  const [activeCategory, setActiveCategory] = useState<string>(defaultCat);
  const [data, setData] = useState<JourneyDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<JourneyStep | null>(null);

  useEffect(() => {
    if (categoryParam && categories.some(c => c.id === categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData(null);
      setSelectedStep(null);
      
      try {
        const res = await fetch(`/api/v1/guides?category=${activeCategory}`);
        if (!res.ok) throw new Error('Failed to load guide data');
        const json = await res.json();
        
        if (!json || !json.hierarchy || json.hierarchy.length === 0) {
          throw new Error('Guide data is empty or invalid');
        }
        
        setData(json);
        setSelectedStep(json.hierarchy[0]);
      } catch (e: any) {
        setError(e.message || 'An error occurred while loading the guide.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeCategory]);

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id);
    router.push(`?category=${id}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-white flex flex-col font-sans relative">
      {/* Background radial gradient */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#1E2D3D]/30 to-transparent pointer-events-none" />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8 flex flex-col z-10">
        
        {/* Title Block */}
        <div className="space-y-2 text-center max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent tracking-tight">
            ⚖️ Legal Guides & Pathways
          </h1>
          <p className="text-sm text-white/60 leading-relaxed">
            Explore step-by-step procedures, dispute resolution timelines, and required documentation for common legal matters.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-5 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${ activeCategory === cat.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white shadow-md shadow-blue-500/15' : 'bg-[var(--card)]/5 border-white/10 text-white/60 hover:bg-[var(--card)]/10 hover:text-white' }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="max-w-3xl mx-auto w-full p-6 rounded-2xl bg-[var(--danger-subtle)] border border-red-500/30 shadow-lg text-center mt-8">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Guide</h3>
            <p className="text-red-200/80">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors border border-red-500/30"
            >
              Try Again
            </button>
          </div>
        )}

        {loading && !data && (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Content Grid */}
        {!loading && data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
            
            {/* Left Column: Timeline / Steps */}
            <div className="lg:col-span-7 bg-[var(--card)]/[0.02] border border-white/5 shadow-xl rounded-2xl p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{data.title}</h2>
                <div className="text-sm text-white/50 flex flex-wrap gap-4">
                  <span className="flex items-center gap-1.5"><span className="text-blue-400">🏛️</span> First Instance: {data.start_court}</span>
                  <span className="flex items-center gap-1.5"><span className="text-green-400">⏱️</span> Timeline: {data.timeline}</span>
                </div>
              </div>

              <div className="relative pl-6 border-l-2 border-white/10 space-y-6">
                {data.hierarchy.map((step, idx) => {
                  const isSelected = selectedStep?.step === step.step;
                  return (
                    <div 
                      key={step.step}
                      onClick={() => setSelectedStep(step)}
                      className="relative cursor-pointer group transition-all duration-300"
                    >
                      {/* Node point */}
                      <div className={`absolute -left-[35px] top-4 w-7 h-7 rounded-full border-[3px] transition-all duration-300 flex items-center justify-center text-[12px] font-bold z-10 ${isSelected ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110' : 'bg-[#0A1628] border-white/20 text-white/50 group-hover:border-blue-500/50 group-hover:text-blue-400' }`}
                      >
                        {idx + 1}
                      </div>

                      {/* Card */}
                      <div className={`p-5 rounded-2xl border transition-all duration-300 ${isSelected ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5' : 'bg-[var(--card)]/[0.02] border-white/5 hover:bg-[var(--card)]/[0.04] hover:border-white/10' }`}
                      >
                        <h3 className={`text-lg font-bold transition-colors ${isSelected ? 'text-blue-400' : 'text-white/90 group-hover:text-white'}`}>
                          {step.name}
                        </h3>
                        <p className="text-sm text-white/70 mt-2 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Details & Documents */}
            <div className="lg:col-span-5 space-y-6 sticky top-8">
              {selectedStep && (
                <div className="bg-[var(--card)]/[0.03] border border-blue-500/20 shadow-2xl rounded-2xl p-6 md:p-8 animate-fadeIn">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-400">Step {selectedStep.step}:</span> {selectedStep.name}
                  </h3>
                  
                  <div className="bg-[var(--card)]/[0.01] border border-white/5 rounded-xl p-5 mb-6 text-sm text-white/80 leading-relaxed">
                    {selectedStep.desc}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-extrabold text-white/90 uppercase tracking-wider flex items-center gap-2">
                      📋 Required Documents
                    </h4>
                    <ul className="space-y-3 bg-[var(--card)]/[0.01] border border-white/5 rounded-xl p-5">
                      {data.documents.map((doc, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-white/70 leading-normal">
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function LitigationJourneyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A1628] flex items-center justify-center text-white/50">Loading Guide...</div>}>
      <LitigationJourneyContent />
    </Suspense>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Scale, Calendar, MapPin, Users, Info, Bookmark, Search, Filter, AlertTriangle } from "lucide-react";

export default function LandmarkJudgmentsPage() {
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [judgments, setJudgments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch("/api/v1/judgments")
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setJudgments(data.data.map((j: any) => ({
            id: j.id,
            name: j.title || j.case_name || "Unknown Case",
            court: j.court || "Supreme Court of India",
            date: j.date || "Unknown",
            bench: j.bench || "Unknown Bench",
            issue: j.legal_issue,
            decision: j.decision,
            impact: j.citizen_impact || j.impact,
            tags: j.tags || j.related_laws || []
          })));
        } else {
          throw new Error(data.error || "No judgments found");
        }
      })
      .catch((err) => {
        console.error("API Error", err);
        setError("Failed to load judgments. Please try again later.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    judgments.forEach(j => {
      if (Array.isArray(j.tags)) {
        j.tags.forEach((tag: string) => categories.add(tag));
      }
    });
    return ["All Categories", ...Array.from(categories).sort()];
  }, [judgments]);

  const filteredJudgments = useMemo(() => {
    return judgments.filter(j => {
      const matchesSearch = 
        (j.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.issue || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.decision || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.impact || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const tags = Array.isArray(j.tags) ? j.tags : [];
      const matchesCategory = selectedCategory === "All Categories" || tags.includes(selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [judgments, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Scale className="w-8 h-8 text-[#FF9933]" />
          Landmark Judgments
        </h1>
        <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500 mt-2 max-w-2xl">
          Educational summaries of historic Supreme Court cases that shaped Indian law and directly impact citizen rights today.
        </p>
      </div>

      {error && !isLoading && (
        <div className="max-w-6xl mx-auto mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3">
          <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-500 shrink-0 mb-2" />
          <div className="text-xl font-bold text-red-800 dark:text-red-300">
            {error}
          </div>
          <p className="text-base text-red-700 dark:text-red-400 max-w-md">
            We are having trouble retrieving the landmark judgments database. Please check your connection or try again.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-800/40 dark:hover:bg-red-800/60 text-red-800 dark:text-red-200 rounded-xl transition-colors font-semibold"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Search and Filters */}
      {!error && !isLoading && (
        <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search cases, legal issues, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF9933] focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="relative md:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF9933] focus:border-transparent outline-none appearance-none transition-all"
            >
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <div className="w-12 h-12 border-4 border-slate-200 dark:border-white/5 border-t-[#FF9933] rounded-full animate-spin mb-6"></div>
            <p className="text-lg font-medium">Loading landmark judgments...</p>
          </div>
        ) : error ? null : filteredJudgments.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            No judgments found matching your search.
          </div>
        ) : filteredJudgments.map(case_ => (
          <div key={case_.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {case_.tags.map((tag: string) => (
                    <span key={tag} className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                  {case_.name}
                </h2>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {case_.court}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {case_.date}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {case_.bench}</span>
                </div>
              </div>
              
              <button 
                onClick={() => toggleBookmark(case_.id)}
                className={`shrink-0 p-3 rounded-full transition-colors ${bookmarked[case_.id] ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white'}`}
                title={bookmarked[case_.id] ? "Remove Bookmark" : "Save Bookmark"}
              >
                <Bookmark className={`w-6 h-6 ${bookmarked[case_.id] ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 dark:bg-slate-900/20">
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center text-xs">Q</span>
                    The Legal Issue
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                    {case_.issue}
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-xs">A</span>
                    The Court&apos;s Decision
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                    {case_.decision}
                  </p>
                </div>
              </div>

              <div className="bg-[#FF9933]/5 border border-[#FF9933]/20 rounded-2xl p-6 h-fit">
                <h3 className="font-bold text-[#FF9933] mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" /> Why it matters to citizens
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {case_.impact}
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

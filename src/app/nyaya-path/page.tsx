'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  Landmark,
  Building,
  Building2,
  Gavel,
  Scale,
  Users,
  AlertTriangle,
  Briefcase,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function CourtHierarchyPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Attempt to fetch from backend API
        const response = await apiClient.get<any[]>('/hierarchy/courts');
        if (response && response.length > 0) {
          setData(response);
        } else {
          throw new Error("Empty response");
        }
      } catch (err) {
        console.error("Failed to load court hierarchy.", err);
        setError("Unable to load court hierarchy data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getIcon = (id: string) => {
    switch (id) {
      case 'sc': return <Landmark className="text-[#FF9933]" size={28} />;
      case 'hc': return <Building className="text-blue-400" size={28} />;
      case 'dc': return <Building2 className="text-emerald-400" size={28} />;
      case 'sub': return <Gavel className="text-red-400" size={28} />;
      case 'special': return <Scale className="text-purple-400" size={28} />;
      default: return <Landmark className="text-white/60" size={28} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#138808]/10 via-[#0A1628]/50 to-[#0A1628] pointer-events-none" />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 space-y-12 flex flex-col z-10">
        
        {/* Header Section */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#138808]/10 border border-[#138808]/25 text-[#138808] text-[10px] font-extrabold uppercase tracking-widest">
            <Scale size={14} />
            <span>Legal Foundation</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent tracking-tight">
            Indian Court Hierarchy
          </h1>
          <p className="text-sm md:text-base text-white/60 leading-relaxed font-medium">
            Understanding the structure and jurisdiction of the Indian Judicial System, from the Apex Court to specialized tribunals.
          </p>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-white dark:bg-[#111827]/[0.02] border border-white/5 text-center max-w-3xl mx-auto w-full space-y-4 shadow-xl backdrop-blur-sm relative z-10">
            <AlertTriangle className="text-red-400/80" size={48} />
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white/90">Unable to Load Court Hierarchy</h3>
              <p className="text-white/50 text-sm max-w-md mx-auto">
                We&apos;re having trouble retrieving the court structure data at the moment. Our servers might be experiencing a temporary hiccup.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 rounded-full bg-white dark:bg-[#111827]/5 hover:bg-white dark:bg-[#111827]/10 text-white transition-colors border border-white/10 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-12 max-w-5xl mx-auto w-full pt-8">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-6 flex flex-col items-center animate-pulse">
                <div className="h-6 bg-white dark:bg-[#111827]/10 rounded-full w-40" />
                <div className="flex justify-center gap-6 flex-wrap w-full">
                  <div className="h-32 bg-white dark:bg-[#111827]/5 rounded-2xl w-full max-w-xs" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          !error && data.length > 0 && (
            <div className="max-w-5xl mx-auto w-full relative space-y-12 pt-4 pb-12">
              {/* The vertical connection line (Desktop) */}
              <div className="absolute left-1/2 top-0 bottom-12 w-px bg-gradient-to-b from-[#FF9933]/50 via-white/20 to-[#138808]/50 transform -translate-x-1/2 hidden md:block" />

              {data.map((court: any, index: number) => (
                <div key={court.id} className="relative z-10 flex flex-col items-center space-y-8">
                  
                  {/* Tier Label */}
                  <div className="px-5 py-2 rounded-full bg-[#0A1628] border border-white/15 text-white/80 text-xs font-bold uppercase tracking-widest shadow-xl ring-4 ring-[#0A1628]">
                    {court.level}
                  </div>

                  {/* Court Card */}
                  <div className="flex flex-wrap justify-center gap-6 w-full">
                    <div 
                      className="group relative flex-1 min-w-[320px] max-w-[420px] p-8 rounded-3xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 hover:border-white/25 hover:from-white/[0.05] transition-all duration-500 shadow-2xl backdrop-blur-sm"
                    >
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="flex flex-col items-center text-center space-y-5">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#111827]/[0.02] border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-white dark:bg-[#111827]/[0.04] transition-all duration-300">
                          {getIcon(court.id)}
                        </div>
                        <div className="space-y-4 w-full">
                          <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">
                            {court.name}
                          </h3>
                          <p className="text-sm text-white/60 leading-relaxed font-medium">
                            {court.description}
                          </p>
                          {(court.jurisdiction || court.location) && (
                            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-left">
                              {court.jurisdiction && (
                                <div className="space-y-1">
                                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block">Jurisdiction</span>
                                  <span className="text-xs text-white/80 font-medium block">{court.jurisdiction}</span>
                                </div>
                              )}
                              {court.location && (
                                <div className="space-y-1">
                                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block">Location</span>
                                  <span className="text-xs text-white/80 font-medium block">{court.location}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connection Dot */}
                  {index < data.length - 1 && (
                    <div className="hidden md:block w-3 h-3 rounded-full bg-[#138808]/80 border-2 border-[#0A1628] absolute -bottom-10 left-1/2 transform -translate-x-1/2 z-20 shadow-[0_0_10px_rgba(19,136,8,0.5)]" />
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}

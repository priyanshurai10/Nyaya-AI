"use client";

import React, { useState } from "react";
import { FolderOpen, Search, Filter, Plus, Calendar, Clock, FileText, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";

export default function ActiveCasesPage() {
  const [activeTab, setActiveTab] = useState("active");

  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetch("/api/v1/cases")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCases(data.data.map((c: any) => ({
            id: c.id,
            title: c.title,
            court: c.court || "Pending allocation",
            nextHearing: c.next_hearing ? new Date(c.next_hearing).toLocaleDateString() : null,
            status: c.status,
            advocate: "Self-Represented",
            type: c.type,
            progress: c.status === "closed" ? 100 : c.status === "active" ? 50 : 25,
            urgent: false
          })));
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredCases = cases.filter(c => c.status === activeTab);

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <FolderOpen className="w-8 h-8 text-[#FF9933]" />
              Case Management
            </h1>
            <p className="text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-2">
              Track your ongoing legal cases, upcoming hearings, and case documents in one place.
            </p>
          </div>
          
          <button onClick={() => alert("Opening new case form...")} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF9933] hover:bg-orange-600 text-white font-medium rounded-xl transition-colors shadow-sm w-full md:w-auto">
            <Plus className="w-5 h-5" />
            Add New Case
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex bg-[var(--card)] rounded-xl p-1 border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'active' ? 'bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)]' : 'text-slate-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-white'}`}
            >
              Active Cases
            </button>
            <button 
              onClick={() => setActiveTab('closed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'closed' ? 'bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)]' : 'text-slate-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-white'}`}
            >
              Closed
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[var(--text-muted)]" />
              <input 
                type="text" 
                placeholder="Search cases..."
                className="pl-9 pr-4 py-2 w-full bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#FF9933] outline-none dark:text-[var(--text-primary)]"
              />
            </div>
            <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-[var(--card)] text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)] hover:bg-[var(--background)] dark:hover:bg-[var(--card-elevated)]">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Case List */}
        <div className="space-y-4">
          {filteredCases.map(caseItem => (
            <div key={caseItem.id} className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-md transition-shadow group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Left: Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {caseItem.id}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 bg-[var(--primary-subtle)] text-blue-600 dark:text-[var(--primary)]">
                      {caseItem.type}
                    </span>
                    {caseItem.urgent && (
                      <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-red-50 dark:bg-[var(--danger-subtle)] text-red-600 dark:text-[var(--danger)]">
                        <AlertCircle className="w-3 h-3" /> Urgent
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[#FF9933] transition-colors cursor-pointer flex items-center gap-2">
                    {caseItem.title}
                    <ChevronRight className="w-5 h-5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> {caseItem.court}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> {caseItem.advocate}
                    </div>
                  </div>
                </div>

                {/* Right: Status & Action */}
                <div className="md:w-64 shrink-0 flex flex-col md:items-end border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                  {caseItem.nextHearing ? (
                    <div className="text-left md:text-right mb-4">
                      <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Next Hearing</p>
                      <div className="flex items-center md:justify-end gap-2 text-[var(--text-primary)] font-bold">
                        <Calendar className="w-4 h-4 text-[#FF9933]" />
                        {caseItem.nextHearing}
                      </div>
                    </div>
                  ) : (
                    <div className="text-left md:text-right mb-4">
                      <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Status</p>
                      <div className="flex items-center md:justify-end gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Disposed
                      </div>
                    </div>
                  )}

                  <div className="w-full">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[var(--text-muted)]">Preparation</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{caseItem.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${caseItem.progress === 100 ? 'bg-emerald-500' : 'bg-[#138808]'}`}
                        style={{ width: `${caseItem.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

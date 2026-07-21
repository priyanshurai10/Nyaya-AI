"use client";

import React, { useState, useEffect } from "react";
import { FolderOpen, Search, Filter, Plus, Calendar, FileText, CheckCircle2, ChevronRight, AlertCircle, X, Check } from "lucide-react";

interface Case {
  id: string;
  title: string;
  court: string;
  nextHearing: string | null;
  status: string;
  advocate: string;
  type: string;
  progress: number;
  urgent: boolean;
}

const CASE_CATEGORIES = ["civil", "criminal", "property", "family", "consumer", "labour", "cybercrime"];

export default function ActiveCasesPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", category: "civil", summary: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/cases");
      const data = await res.json();
      if (data.success && data.data) {
        setCases(data.data.map((c: any) => ({
          id: c.id,
          title: c.title,
          court: c.court || "Pending allocation",
          nextHearing: c.next_hearing ? new Date(c.next_hearing).toLocaleDateString("en-IN") : null,
          status: c.status,
          advocate: "Self-Represented",
          type: c.type || c.category,
          progress: c.status === "closed" ? 100 : c.status === "active" ? 55 : 25,
          urgent: false,
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCase = async () => {
    setAddError("");
    if (!addForm.title.trim()) {
      setAddError("Please enter a case title.");
      return;
    }
    setIsAdding(true);
    try {
      const res = await fetch("/api/v1/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: addForm.title,
          category: addForm.category,
          summary: addForm.summary,
          status: "active",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddSuccess(true);
        setAddForm({ title: "", category: "civil", summary: "" });
        await fetchCases();
        setTimeout(() => {
          setShowAddModal(false);
          setAddSuccess(false);
        }, 1400);
      } else {
        setAddError(data.detail || "Failed to create case.");
      }
    } catch (e) {
      setAddError("Network error. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const filtered = cases
    .filter(c => c.status === activeTab || (activeTab === "closed" && c.status === "closed"))
    .filter(c =>
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.court.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const activeCases = cases.filter(c => c.status === "active");
  const closedCases = cases.filter(c => c.status === "closed");

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
            <p className="text-slate-600 dark:text-[var(--text-muted)] mt-2">
              Track your ongoing legal cases, upcoming hearings, and documents in one place.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF9933] hover:bg-orange-600 text-white font-medium rounded-xl transition-colors shadow-sm w-full md:w-auto"
          >
            <Plus className="w-5 h-5" />
            Add New Case
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Cases", value: cases.length, color: "text-[var(--text-primary)]" },
          { label: "Active", value: activeCases.length, color: "text-[#FF9933]" },
          { label: "Closed", value: closedCases.length, color: "text-[#138808]" },
          { label: "Pending Hearings", value: activeCases.filter(c => c.nextHearing).length, color: "text-purple-500" },
        ].map(stat => (
          <div key={stat.label} className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex bg-[var(--card)] rounded-xl p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "active" ? "bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)]" : "text-slate-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            >
              Active Cases
            </button>
            <button
              onClick={() => setActiveTab("closed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "closed" ? "bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)]" : "text-slate-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            >
              Closed
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#FF9933] outline-none text-[var(--text-primary)]"
            />
          </div>
        </div>

        {/* Case List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9933] mx-auto mb-3" />
              <p className="text-[var(--text-muted)] text-sm">Loading your cases...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">No {activeTab} cases found</h3>
              <p className="text-[var(--text-muted)] text-sm">Click "Add New Case" to get started.</p>
            </div>
          ) : (
            filtered.map(caseItem => (
              <div key={caseItem.id} className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-md transition-shadow group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {caseItem.id}
                      </span>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 capitalize">
                        {caseItem.type}
                      </span>
                      {caseItem.urgent && (
                        <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600">
                          <AlertCircle className="w-3 h-3" /> Urgent
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[#FF9933] transition-colors cursor-pointer flex items-center gap-2">
                      {caseItem.title}
                      <ChevronRight className="w-5 h-5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-[var(--text-muted)]">
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
                          className={`h-full rounded-full ${caseItem.progress === 100 ? "bg-emerald-500" : "bg-[#138808]"}`}
                          style={{ width: `${caseItem.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Case Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-[var(--card)] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Add New Case</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {addSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <p className="font-semibold text-[var(--text-primary)]">Case Added Successfully!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Case Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Property Boundary Dispute — Plot 45B"
                    value={addForm.title}
                    onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Category *</label>
                  <select
                    value={addForm.category}
                    onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933] appearance-none capitalize"
                  >
                    {CASE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="capitalize">{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Brief Summary</label>
                  <textarea
                    placeholder="Describe the key facts and nature of the dispute..."
                    value={addForm.summary}
                    onChange={e => setAddForm(f => ({ ...f, summary: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933] resize-none"
                  />
                </div>
                {addError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {addError}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCase}
                    disabled={isAdding}
                    className="flex-1 py-3 bg-[#FF9933] hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isAdding ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? "Adding..." : "Add Case"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

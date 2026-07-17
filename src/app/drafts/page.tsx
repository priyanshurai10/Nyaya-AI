"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FileText, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Suspense } from "react";

function DraftsContent() {
  const searchParams = useSearchParams();
  const templateType = searchParams.get("template") || "";
  const router = useRouter();

  const [drafts, setDrafts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, [templateType]);

  const fetchDrafts = async () => {
    setIsLoading(true);
    try {
      const url = templateType ? `/api/v1/drafts?template_type=${templateType}` : '/api/v1/drafts';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDrafts(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = async () => {
    const title = prompt("Enter draft title:");
    if (!title) return;

    try {
      const res = await fetch("/api/v1/drafts/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_type: templateType || "custom",
          title: title
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchDrafts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    try {
      await fetch(`/api/v1/drafts/${id}`, { method: "DELETE" });
      fetchDrafts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8 text-[var(--text-primary)]">
      <div className="max-w-5xl mx-auto">
        <Link href="/document-generator" className="inline-flex items-center text-sm text-blue-600 dark:text-[var(--primary)] hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Templates
        </Link>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#FF9933]" />
            {templateType ? `${templateType.replace('_', ' ').toUpperCase()} Drafts` : "My Document Drafts"}
          </h1>
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF9933] hover:bg-orange-600 text-white rounded-xl transition-colors font-medium"
          >
            <Plus className="w-4 h-4" /> New Draft
          </button>
        </div>

        {isLoading ? (
          <div className="text-center p-12 bg-[var(--card)] rounded-xl border border-slate-200 dark:border-slate-800">
            Loading drafts...
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center p-12 bg-[var(--card)] rounded-xl border border-slate-200 dark:border-slate-800 text-[var(--text-muted)]">
            No drafts found. Click &quot;New Draft&quot; to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((d) => (
              <div key={d.id} className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-[#FF9933] transition-colors relative group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded uppercase">
                    {d.template_type.replace('_', ' ')}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${d.status === 'finalized' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {d.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 truncate" title={d.title}>{d.title}</h3>
                <p className="text-sm text-[var(--text-muted)] mb-6">Last updated: {new Date(d.updated_at).toLocaleDateString()}</p>
                
                <div className="flex justify-between items-center">
                  <button className="text-blue-600 dark:text-[var(--primary)] hover:underline flex items-center gap-1 text-sm font-medium">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="text-[var(--danger)] hover:bg-red-50 dark:hover:bg-[var(--danger-subtle)] p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DraftsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] p-6 lg:p-8 flex items-center justify-center"><div className="text-[var(--text-muted)]">Loading drafts...</div></div>}>
      <DraftsContent />
    </Suspense>
  );
}
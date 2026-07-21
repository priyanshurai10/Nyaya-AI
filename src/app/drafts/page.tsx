"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FileText, Plus, Edit, Trash2, ArrowLeft, Clock, Check } from "lucide-react";
import Link from "next/link";

const TEMPLATE_TITLES: Record<string, string> = {
  legal_notice: "Formal Legal Notice",
  rti: "Right to Information Application",
  consumer_complaint: "Consumer Court Complaint",
  police_complaint: "Police Complaint / FIR Request",
};

function DraftsContent() {
  const searchParams = useSearchParams();
  const templateType = searchParams.get("template") || "";
  const router = useRouter();

  const [drafts, setDrafts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showNewDraftModal, setShowNewDraftModal] = useState(false);
  const [newTitle, setNewTitle] = useState(
    templateType ? TEMPLATE_TITLES[templateType] || "" : ""
  );

  useEffect(() => {
    fetchDrafts();
    // If navigated with ?template=..., auto-open the create modal
    if (templateType) {
      setShowNewDraftModal(true);
    }
  }, [templateType]);

  const fetchDrafts = async () => {
    setIsLoading(true);
    try {
      const url = templateType
        ? `/api/v1/drafts?template_type=${templateType}`
        : "/api/v1/drafts";
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
    const title = newTitle.trim();
    if (!title) return;
    setIsCreating(true);
    const targetType = templateType || "custom";
    try {
      const res = await fetch("/api/v1/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_type: targetType,
          title,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.id) {
        router.push(`/drafts/${data.data.id}`);
        return;
      }
    } catch (e) {
      console.warn("Backend draft creation failed, navigating to local editor fallback:", e);
    }
    // Fallback if backend API call failed or returned empty
    const fallbackId = `draft_${targetType}_${Date.now()}`;
    router.push(`/drafts/${fallbackId}?type=${targetType}&title=${encodeURIComponent(title)}`);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    try {
      await fetch(`/api/v1/drafts/${id}`, { method: "DELETE" });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const pageTitle = templateType
    ? TEMPLATE_TITLES[templateType] || `${templateType.replace(/_/g, " ")} Drafts`
    : "My Document Drafts";

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8 text-[var(--text-primary)]">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/document-generator"
          className="inline-flex items-center text-sm text-[#FF9933] hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Templates
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#FF9933]" />
            {pageTitle}
          </h1>
          <button
            onClick={() => {
              setNewTitle(templateType ? TEMPLATE_TITLES[templateType] || "" : "");
              setShowNewDraftModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF9933] hover:bg-orange-600 text-white rounded-xl transition-colors font-medium"
          >
            <Plus className="w-4 h-4" /> New Draft
          </button>
        </div>

        {isLoading ? (
          <div className="text-center p-12 bg-[var(--card)] rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9933] mx-auto mb-3" />
            <p className="text-[var(--text-muted)]">Loading drafts...</p>
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center p-12 bg-[var(--card)] rounded-xl border border-slate-200 dark:border-slate-800 text-[var(--text-muted)]">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">No drafts yet</h3>
            <p className="text-sm mb-4">Click "New Draft" to create your first document using this template.</p>
            <button
              onClick={() => { setNewTitle(templateType ? TEMPLATE_TITLES[templateType] || "" : ""); setShowNewDraftModal(true); }}
              className="px-5 py-2.5 bg-[#FF9933] text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm"
            >
              Create First Draft
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((d) => (
              <div
                key={d.id}
                className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-[#FF9933] transition-colors relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded uppercase">
                    {d.template_type.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      d.status === "finalized"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {d.status === "finalized" ? (
                      <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Finalized</span>
                    ) : (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Draft</span>
                    )}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 truncate" title={d.title}>
                  {d.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  {d.updated_at ? `Updated: ${new Date(d.updated_at).toLocaleDateString("en-IN")}` : "Just created"}
                </p>

                <div className="flex justify-between items-center">
                  <Link
                    href={`/drafts/${d.id}`}
                    className="text-[#FF9933] hover:underline flex items-center gap-1 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" /> Open Editor
                  </Link>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Draft Modal */}
      {showNewDraftModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
          onClick={() => setShowNewDraftModal(false)}
        >
          <div
            className="bg-[var(--card)] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
              {templateType ? `Create ${TEMPLATE_TITLES[templateType] || "New Draft"}` : "Create New Draft"}
            </h2>
            <div className="space-y-4">
              {templateType && (
                <div className="px-4 py-3 bg-[#FF9933]/10 border border-[#FF9933]/20 rounded-xl text-sm text-[#FF9933] font-medium">
                  Template: {TEMPLATE_TITLES[templateType]}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Document Title *
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder={templateType ? TEMPLATE_TITLES[templateType] : "e.g. Notice to M/s XYZ Company"}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateNew()}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowNewDraftModal(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNew}
                  disabled={isCreating || !newTitle.trim()}
                  className="flex-1 py-3 bg-[#FF9933] hover:bg-orange-600 text-white rounded-xl text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {isCreating ? "Creating..." : "Create & Open Editor"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DraftsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8 flex items-center justify-center">
          <div className="text-[var(--text-muted)]">Loading drafts...</div>
        </div>
      }
    >
      <DraftsContent />
    </Suspense>
  );
}
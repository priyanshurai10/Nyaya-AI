"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Lock, Upload, Search, FileText, Trash2, Shield, UploadCloud,
  CheckCircle, X, AlertCircle, File as FileIcon, Film, Image as ImageIcon,
  Archive, Sparkles, Brain, AlertTriangle, ChevronDown, ChevronUp, Loader2
} from "lucide-react";

interface VaultFile {
  id: string;
  filename: string;
  file_type: string;
  upload_path: string;
  vault_category: string;
  file_size: number;
  created_at: string;
}

interface AIAnalysis {
  document_type: string;
  parties_involved: string[];
  key_dates: { date: string; event: string }[];
  key_clauses: string[];
  legal_issues: string[];
  action_required: string[];
  risk_assessment: string;
  summary: string;
  applicable_laws: string[];
}

const CATEGORIES = ["All", "Evidence", "Contracts", "Property", "Identity", "Medical", "Financial", "Other"];

function formatSize(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(iso: string) {
  if (!iso) return "Unknown";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return iso; }
}

function getFileIcon(fileType: string) {
  if (fileType?.startsWith("video")) return <Film className="w-5 h-5 text-blue-500" />;
  if (fileType?.startsWith("image")) return <ImageIcon className="w-5 h-5 text-emerald-500" />;
  if (fileType?.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
  if (fileType?.includes("zip") || fileType?.includes("archive")) return <Archive className="w-5 h-5 text-amber-500" />;
  return <FileIcon className="w-5 h-5 text-slate-400" />;
}

function getRiskColor(risk: string) {
  const r = (risk || "").toUpperCase();
  if (r.includes("HIGH")) return "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50";
  if (r.includes("MEDIUM")) return "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50";
  return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50";
}

export default function EvidenceVaultPage() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState("Evidence");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Analysis state
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, AIAnalysis>>({});
  const [openAnalysisId, setOpenAnalysisId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/vault");
      const data = await res.json();
      if (data.success && data.data) {
        setFiles(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);

    for (const file of Array.from(fileList)) {
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        setUploadError(`"${file.name}" is too large. Max file size is 50 MB.`);
        return;
      }
    }

    setUploadProgress("Uploading...");
    const formData = new FormData();
    formData.append("file", fileList[0]);
    formData.append("vault_category", uploadCategory);

    try {
      const res = await fetch("/api/v1/vault/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadProgress("✓ Uploaded securely!");
        await fetchFiles();
        setTimeout(() => setUploadProgress(null), 2500);
      } else {
        setUploadError(data.detail || "Upload failed. Please try again.");
        setUploadProgress(null);
      }
    } catch (e) {
      setUploadError("Upload failed — please check your connection.");
      setUploadProgress(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/vault/${id}`, { method: "DELETE" });
      setFiles(prev => prev.filter(f => f.id !== id));
      setDeleteConfirmId(null);
      if (openAnalysisId === id) setOpenAnalysisId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyze = async (file: VaultFile) => {
    // If result already exists, toggle display
    if (analysisResults[file.id]) {
      setOpenAnalysisId(prev => prev === file.id ? null : file.id);
      return;
    }

    setAnalyzingId(file.id);
    setAnalysisError(null);

    try {
      const res = await fetch(`/api/v1/vault/analyze/${file.id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResults(prev => ({ ...prev, [file.id]: data.analysis }));
        setOpenAnalysisId(file.id);
      } else {
        setAnalysisError(data.detail || "Analysis failed. Please try again.");
      }
    } catch (e) {
      setAnalysisError("AI analysis failed. Please try again.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const filtered = files.filter(f => {
    const matchesSearch = !searchQuery || f.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "All" || f.vault_category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalSizeBytes = files.reduce((acc, f) => acc + (f.file_size || 0), 0);
  const usedGb = (totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2);

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <Lock className="w-8 h-8 text-[#FF9933]" />
              AI Evidence Vault
            </h1>
            <p className="text-slate-600 dark:text-[var(--text-muted)] mt-2">
              Securely store, organize, and AI-analyze your legal evidence and documents.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933] w-52"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Zone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-[#FF9933] bg-[#FF9933]/5 scale-[1.01]"
                : "border-slate-300 dark:border-slate-700 bg-[var(--card)] hover:border-[#FF9933]/60"
            }`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleUpload(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-[var(--text-muted)] text-sm mb-4">
              PDF, DOCX, JPG, PNG, MP4, ZIP (Max 50 MB per file)
            </p>

            <div className="flex items-center justify-center gap-3 mb-4" onClick={e => e.stopPropagation()}>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Category:</label>
              <select
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-[var(--text-primary)] outline-none"
              >
                {CATEGORIES.filter(c => c !== "All").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {uploadProgress ? (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${uploadProgress.startsWith("✓") ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"}`}>
                {uploadProgress.startsWith("✓") ? <CheckCircle className="w-4 h-4" /> : <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />}
                {uploadProgress}
              </div>
            ) : (
              <span className="inline-block px-5 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                Browse Files
              </span>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.docx,.jpg,.jpeg,.png,.mp4,.mp3,.zip,.doc"
              onChange={e => handleUpload(e.target.files)}
            />
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {uploadError}
              <button onClick={() => setUploadError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}

          {analysisError && (
            <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {analysisError}
              <button onClick={() => setAnalysisError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Category filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  categoryFilter === cat
                    ? "bg-[#FF9933] text-white"
                    : "bg-[var(--card)] border border-slate-200 dark:border-slate-800 text-[var(--text-muted)] hover:border-[#FF9933] hover:text-[#FF9933]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* File List */}
          <div className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-[var(--text-primary)]">Your Files</h3>
              <span className="text-sm font-medium text-[var(--text-muted)]">{filtered.length} file{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9933] mx-auto mb-3" />
                <p className="text-[var(--text-muted)] text-sm">Loading vault...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                  {files.length === 0 ? "Your vault is empty" : "No files match filters"}
                </h3>
                <p className="text-[var(--text-muted)] text-sm">Upload documents to store them securely.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map(file => (
                  <div key={file.id}>
                    <div className="p-4 hover:bg-[var(--background)] transition-colors flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {getFileIcon(file.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{file.filename}</p>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                          <span>{formatSize(file.file_size)}</span>
                          <span>•</span>
                          <span>{formatDate(file.created_at)}</span>
                          <span>•</span>
                          <span className="capitalize">{file.vault_category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* AI Analyze Button */}
                        <button
                          onClick={() => handleAnalyze(file)}
                          disabled={analyzingId === file.id}
                          title="Analyze with AI"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            analysisResults[file.id]
                              ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600"
                          }`}
                        >
                          {analyzingId === file.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Brain className="w-3.5 h-3.5" />
                          )}
                          {analyzingId === file.id ? "Analyzing..." : analysisResults[file.id] ? "View AI" : "AI Analyze"}
                          {analysisResults[file.id] && (
                            openAnalysisId === file.id
                              ? <ChevronUp className="w-3 h-3" />
                              : <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Secure
                        </span>
                        {deleteConfirmId === file.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(file.id)}
                              className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 text-xs font-medium text-[var(--text-muted)] border border-slate-200 dark:border-slate-700 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(file.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI Analysis Panel */}
                    {openAnalysisId === file.id && analysisResults[file.id] && (
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-t border-indigo-100 dark:border-indigo-800/30 p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">AI Legal Analysis</span>
                          <span className="ml-auto text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">
                            {analysisResults[file.id].document_type}
                          </span>
                        </div>

                        {/* Summary */}
                        <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 text-sm text-[var(--text-primary)] leading-relaxed border border-indigo-100 dark:border-indigo-800/30">
                          {analysisResults[file.id].summary}
                        </div>

                        {/* Risk Assessment */}
                        {analysisResults[file.id].risk_assessment && (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${getRiskColor(analysisResults[file.id].risk_assessment)}`}>
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            Risk: {analysisResults[file.id].risk_assessment}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Legal Issues */}
                          {analysisResults[file.id].legal_issues?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Legal Issues Identified</p>
                              <ul className="space-y-1">
                                {analysisResults[file.id].legal_issues.map((issue, i) => (
                                  <li key={i} className="text-xs text-[var(--text-primary)] flex gap-2">
                                    <span className="text-amber-500 shrink-0">⚠</span>{issue}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Action Required */}
                          {analysisResults[file.id].action_required?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Actions Required</p>
                              <ul className="space-y-1">
                                {analysisResults[file.id].action_required.map((action, i) => (
                                  <li key={i} className="text-xs text-[var(--text-primary)] flex gap-2">
                                    <span className="text-[#138808] shrink-0">→</span>{action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Applicable Laws */}
                          {analysisResults[file.id].applicable_laws?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Applicable Laws</p>
                              <div className="flex flex-wrap gap-1">
                                {analysisResults[file.id].applicable_laws.map((law, i) => (
                                  <span key={i} className="text-[10px] font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg">
                                    {law}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Parties Involved */}
                          {analysisResults[file.id].parties_involved?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Parties Involved</p>
                              <ul className="space-y-1">
                                {analysisResults[file.id].parties_involved.map((party, i) => (
                                  <li key={i} className="text-xs text-[var(--text-primary)] flex gap-2">
                                    <span className="text-[#FF9933] shrink-0">👤</span>{party}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Storage Stats */}
          <div className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-[var(--text-primary)] mb-4">Vault Storage</h3>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Used: {usedGb} GB</span>
              <span className="font-medium text-[var(--text-primary)]">5.0 GB Free</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-[#138808] rounded-full transition-all"
                style={{ width: `${Math.min(parseFloat(usedGb) / 5 * 100, 100)}%` }}
              />
            </div>
            <div className="text-xs text-[var(--text-muted)] mb-4">{files.length} files stored</div>
            <button className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Upgrade Storage
            </button>
          </div>

          {/* AI OCR Feature Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-6 h-6 text-white/80" />
              <span className="font-bold text-lg">AI Document Analysis</span>
            </div>
            <p className="text-white/80 text-sm mb-4 leading-relaxed">
              Click <strong>"AI Analyze"</strong> on any uploaded file to instantly extract parties, dates, legal issues, risk assessment, and applicable Indian laws using Groq AI.
            </p>
            <div className="space-y-2">
              {["✓ Legal risk detection", "✓ Applicable law mapping", "✓ Party & date extraction", "✓ Groq AI powered"].map(f => (
                <div key={f} className="text-xs text-white/70 font-medium">{f}</div>
              ))}
            </div>
          </div>

          {/* Next Update Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black rounded-2xl p-5 text-white border border-white/5">
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">🔮 Next Update — v2.1</div>
            <h3 className="font-bold mb-2">End-to-End Encryption + OCR</h3>
            <p className="text-white/60 text-xs leading-relaxed">
              Military-grade AES-256 encryption, full PDF text OCR with Tesseract, and automated evidence tagging for court filing.
            </p>
          </div>

          {/* Security Badge */}
          <div className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">Secure Storage</p>
                <p className="text-xs text-[var(--text-muted)]">Protected by Nyaya AI</p>
              </div>
            </div>
            <ul className="space-y-2">
              {["Encrypted transit (HTTPS)", "Server-side secure storage", "Access control by user auth", "AI analysis on-demand"].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

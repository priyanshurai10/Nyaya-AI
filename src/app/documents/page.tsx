"use client";

import React, { useState } from "react";
import { FileSearch, UploadCloud, CheckCircle, AlertTriangle, FileText, ChevronRight, Download } from "lucide-react";

export default function DocumentAnalyzerPage() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await uploadAndAnalyze(file);
    }
  };

  const uploadAndAnalyze = async (file: File) => {
    setIsLoading(true);
    setError("");
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/documents/upload", {
        method: "POST",
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        setAnalysisResult(data);
      } else {
        setError(data.detail || "Failed to analyze document.");
      }
    } catch (err) {
      setError("Network error occurred while analyzing.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 bg-[var(--primary-subtle)] mb-6">
          <FileSearch className="w-8 h-8 text-blue-600 dark:text-[var(--primary)]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
          Legal Document Analyzer
        </h1>
        <p className="text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)] max-w-2xl mx-auto text-lg">
          Upload any legal contract, notice, or agreement. Our AI will instantly analyze it for hidden risks, summarize key clauses, and translate complex legalese into plain English.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Upload Zone */}
        <div 
          className={`border-2 border-dashed rounded-3xl p-12 text-center transition-colors mb-12 ${ dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-slate-300 dark:border-slate-700 bg-[var(--card)] dark:bg-[var(--card)]" }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
        >
          <UploadCloud className="w-12 h-12 text-slate-400 dark:text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Drag & Drop your legal document here
          </h3>
          <p className="text-[var(--text-muted)] dark:text-[var(--text-muted)] mb-6">
            Supports PDF, DOCX, and scanned images (Max 20MB). We do not store your documents permanently.
          </p>
          <label className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer inline-block">
            {isLoading ? "Analyzing..." : "Select Document"}
            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.jpg,.png" disabled={isLoading} />
          </label>
          {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
          {selectedFile && !error && (
            <p className="mt-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        {/* Analysis Result */}
        {analysisResult && analysisResult.analysis && (
          <div className="bg-[var(--card)] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{analysisResult.filename}</h3>
                  <p className="text-sm text-[var(--text-muted)]">Document Type: {analysisResult.document_type || "Unknown"}</p>
                </div>
              </div>
              <button 
                onClick={() => alert("Downloading PDF report...")}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>
            
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Plain English Summary */}
              <div>
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Plain English Summary
                </h4>
                <div className="prose prose-sm dark:prose-invert text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)]">
                  <p>{analysisResult.analysis.summary}</p>
                  {analysisResult.analysis.key_points && Array.isArray(analysisResult.analysis.key_points) && (
                    <ul className="mt-4 space-y-2">
                      {analysisResult.analysis.key_points.map((pt: string, idx: number) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Risk Areas */}
              <div>
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
                  Red Flags & Risks
                </h4>
                <div className="space-y-4">
                  {analysisResult.analysis.risks && analysisResult.analysis.risks.length > 0 ? (
                    analysisResult.analysis.risks.map((risk: any, idx: number) => (
                      <div key={idx} className={`p-4 rounded-xl border ${risk.risk_level === 'High' ? 'border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-500/5' : 'border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-500/5'}`}>
                        <h5 className={`font-bold text-sm mb-1 ${risk.risk_level === 'High' ? 'text-red-700 dark:text-[var(--danger)]' : 'text-amber-700 dark:text-amber-400'}`}>
                          {risk.category}
                        </h5>
                        <p className={`text-sm ${risk.risk_level === 'High' ? 'text-red-600/80 dark:text-red-300/80' : 'text-amber-600/80 dark:text-amber-300/80'}`}>
                          {risk.explanation}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">No major risks detected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

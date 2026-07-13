"use client";

import React, { useState } from "react";
import { Folder, FileText, Upload, Search, Filter, Lock, Plus, FileImage, File, Trash2, ArrowRight, Shield, UploadCloud, Image as ImageIcon, CheckCircle, Clock, Tag, MoreVertical } from "lucide-react";

export default function EvidenceVaultPage() {
  const [dragActive, setDragActive] = useState(false);

  const files = [
    { id: 1, name: "CCTV_Footage_FrontGate.mp4", type: "video", size: "124 MB", date: "Today, 10:45 AM", status: "Secure", tags: ["Property Dispute"] },
    { id: 2, name: "Signed_Agreement_Final.pdf", type: "pdf", size: "2.4 MB", date: "Yesterday", status: "Analyzed", tags: ["Contract"] },
    { id: 3, name: "WhatsApp_Screenshots.zip", type: "archive", size: "15 MB", date: "12 Oct 2023", status: "Secure", tags: ["Defamation"] }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Lock className="w-8 h-8 text-[#FF9933]" />
              AI Evidence Vault
            </h1>
            <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500 mt-2">
              Securely store, organize, and analyze your legal evidence with military-grade encryption.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Search files..."
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
              />
            </div>
            <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-[#0B1220] dark:hover:bg-slate-800">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upload Zone */}
          <div 
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${ dragActive ? "border-[#FF9933] bg-[#FF9933]/5" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-[#111827]" }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
          >
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Drag & Drop files to encrypt and upload
            </h3>
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm mb-6">
              Supports PDF, DOCX, JPG, PNG, MP4, MP3, ZIP (Max 500MB per file)
            </p>
            <label className="px-6 py-2.5 bg-slate-900 dark:bg-[#111827] text-white dark:text-slate-900 dark:text-white font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 dark:bg-[#1F2937] transition-colors cursor-pointer inline-block">
              Browse Files
              <input 
                type="file" 
                className="hidden" 
                multiple 
                accept=".pdf,.docx,.jpg,.png,.mp4,.mp3,.zip" 
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const maxSize = 500 * 1024 * 1024; // 500MB
                  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg', 'application/zip', 'application/x-zip-compressed'];
                  
                  for (const file of files) {
                    if (file.size > maxSize) {
                      alert(`File ${file.name} is too large. Max size is 500MB.`);
                      return;
                    }
                    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.zip') && !file.name.endsWith('.docx')) {
                      alert(`File ${file.name} has an invalid type.`);
                      return;
                    }
                  }
                  if (files.length > 0) {
                    alert(`Verified ${files.length} files. Ready to upload securely.`);
                  }
                }} 
              />
            </label>
          </div>

          {/* File List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Recent Uploads</h3>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">12 Files stored</span>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {files.map(file => (
                <div key={file.id} className="p-4 hover:bg-slate-50 dark:bg-[#0B1220] dark:hover:bg-slate-800/30 transition-colors flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {file.type === 'pdf' ? <FileText className="w-5 h-5 text-red-500" /> :
                     file.type === 'video' ? <PlayCircleIcon className="w-5 h-5 text-blue-500" /> :
                     <ImageIcon className="w-5 h-5 text-emerald-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {file.tags.map(tag => (
                      <span key={tag} className="hidden sm:inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> {file.status}
                    </span>
                    <button className="p-2 text-slate-400 hover:text-slate-500 dark:text-slate-400 dark:hover:text-slate-300">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Vault Storage</h3>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Used: 2.1 GB</span>
              <span className="font-medium text-slate-900 dark:text-white">5.0 GB</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-[#138808] w-[42%] rounded-full" />
            </div>
            <button onClick={() => alert("Storage plans are currently managed in the admin panel.")} className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-[#0B1220] dark:hover:bg-slate-800">
              Upgrade Storage
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <Shield className="w-8 h-8 mb-4 text-white/80" />
            <h3 className="font-bold text-lg mb-2">AI OCR Analysis</h3>
            <p className="text-white/80 text-sm mb-4">
              Nyaya AI can automatically extract text, dates, and key entities from your uploaded images and PDFs.
            </p>
            <button onClick={() => alert("AI Auto-Analysis enabled.")} className="px-4 py-2 bg-white dark:bg-slate-900 text-indigo-600 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 dark:bg-[#0B1220]">
              Enable Auto-Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Temporary icon fallback
function PlayCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
    </svg>
  );
}

"use client";

import React from "react";
import { Shield, Lock, FileText, CheckCircle, Server, Eye } from "lucide-react";

export default function TrustPrivacyPage() {
  const policies = [
    {
      title: "End-to-End Encryption",
      icon: Lock,
      desc: "All your legal documents, chat histories, and case files are encrypted at rest and in transit. No third party can access your data."
    },
    {
      title: "Strict Data Privacy",
      icon: Eye,
      desc: "Nyaya AI does not sell, share, or monetize your personal legal data. You retain 100% ownership of your information."
    },
    {
      title: "Secure Infrastructure",
      icon: Server,
      desc: "Hosted on enterprise-grade secure servers compliant with Indian data localization laws (DPDP Act 2023 readiness)."
    },
    {
      title: "Verified Legal Network",
      icon: Shield,
      desc: "All advocates and legal professionals on the platform undergo strict Bar Council ID verification."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 bg-[var(--primary-subtle)] mb-6">
            <Shield className="w-8 h-8 text-blue-600 dark:text-[var(--primary)]" />
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Trust & Privacy Center
          </h1>
          <p className="text-lg text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)] max-w-2xl mx-auto">
            At Nyaya AI, your legal privacy is our highest priority. We use military-grade encryption to protect your sensitive case files and conversations.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {policies.map((policy, idx) => (
            <div key={idx} className="bg-[var(--card)] p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
              <policy.icon className="w-8 h-8 text-[#FF9933] mb-4" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                {policy.title}
              </h3>
              <p className="text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)] leading-relaxed">
                {policy.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Legal Documents */}
        <div className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <FileText className="w-6 h-6 text-emerald-500" />
              Legal Agreements
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {[
              "Terms of Service",
              "Privacy Policy",
              "Data Processing Agreement",
              "Lawyer-Client Confidentiality Terms"
            ].map((doc, idx) => (
              <div key={idx} className="p-6 hover:bg-[var(--background)] dark:hover:bg-[var(--card-elevated)]/30 transition-colors flex items-center justify-between cursor-pointer group">
                <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#FF9933] transition-colors">
                  {doc}
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-[var(--primary)]">View Document</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

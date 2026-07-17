"use client";

import React, { useState } from "react";
import { Store, Phone, FileText, Search, Shield, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LegalMarketplacePage() {
  const [activeTab, setActiveTab] = useState("all");

  const categories = [
    { id: "all", label: "All Services" },
    { id: "consultation", label: "Consultation" },
    { id: "drafting", label: "Legal Drafting" },
    { id: "registration", label: "Registrations" }
  ];

  const services = [
    {
      id: "srv-1",
      title: "Talk to Senior Legal Specialist",
      desc: "Get an immediate callback from a verified senior advocate for expert advice on your specific legal issue.",
      price: "₹200",
      duration: "30 mins",
      category: "consultation",
      icon: Phone,
      color: "bg-blue-500",
      featured: true
    },
    {
      id: "srv-2",
      title: "Draft Legal Notice",
      desc: "Professional drafting of a legal notice for recovery of money, property disputes, or defamation.",
      price: "₹999",
      duration: "48 hours",
      category: "drafting",
      icon: FileText,
      color: "bg-emerald-500",
      featured: false
    },
    {
      id: "srv-3",
      title: "Review Rental Agreement",
      desc: "Have an expert review your rent agreement to identify risks and unfair clauses before you sign.",
      price: "₹499",
      duration: "24 hours",
      category: "drafting",
      icon: Search,
      color: "bg-amber-500",
      featured: false
    },
    {
      id: "srv-4",
      title: "Consumer Complaint Filing",
      desc: "End-to-end assistance in drafting and filing a complaint in the Consumer Forum.",
      price: "₹1,499",
      duration: "72 hours",
      category: "registration",
      icon: Shield,
      color: "bg-purple-500",
      featured: false
    }
  ];

  const filtered = services.filter(s => activeTab === "all" || s.category === activeTab);

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <Store className="w-8 h-8 text-[#FF9933]" />
              Legal Services Marketplace
            </h1>
            <p className="text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-2">
              Book consultations, order legal drafts, and get verified professional help at transparent prices.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Featured Section: Talk to Senior Specialist */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-[#0B1220] to-[#1a2942] dark:from-[#111827] dark:to-[#1a2942] rounded-3xl overflow-hidden border border-slate-800 shadow-xl relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Phone className="w-48 h-48 text-white" />
            </div>
            <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between z-10">
              <div className="text-white max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF9933]/20 text-[#FF9933] border border-[#FF9933]/30 rounded-full text-sm font-bold mb-4">
                  <StarIcon className="w-4 h-4" /> Top Requested Service
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">Talk to Senior Legal Specialist</h2>
                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                  Get a dedicated 30-minute consultation call with a verified senior advocate. Available in multiple languages. They will review your case summary and guide your next steps.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> 100% Confidential</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Bar Council Verified</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Secure Payment</span>
                </div>
              </div>
              <div className="bg-[var(--card)] p-6 rounded-2xl w-full md:w-80 shrink-0 shadow-lg text-center border border-slate-200 dark:border-slate-800">
                <p className="text-[var(--text-muted)] dark:text-[var(--text-muted)] font-medium mb-1">Fixed Price</p>
                <div className="text-4xl font-black text-[var(--text-primary)] mb-6">₹200</div>
                <Link 
                  href="/consultation"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <Phone className="w-5 h-5" /> Book Consultation
                </Link>
                <p className="text-xs text-[var(--text-muted)] mt-4">Callback within 2 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${ activeTab === cat.id ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" : "bg-[var(--card)] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-[var(--card-elevated)] border border-slate-200 dark:border-slate-800" }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(srv => (
            <div key={srv.id} className="bg-[var(--card)] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:border-[#FF9933]/50 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${srv.color} text-white shadow-sm`}>
                  <srv.icon className="w-6 h-6" />
                </div>
                <span className="font-black text-xl text-[var(--text-primary)]">{srv.price}</span>
              </div>
              
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[#FF9933] transition-colors">
                {srv.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] dark:text-[var(--text-muted)] mb-6 flex-1">
                {srv.desc}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-[var(--text-muted)] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {srv.duration}
                </span>
                
                {srv.id === "srv-1" ? (
                  <Link href="/consultation" className="flex items-center gap-1 text-sm font-bold text-[#FF9933] hover:text-orange-600 transition-colors">
                    Book Now <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button onClick={() => alert("Service added to your request queue.")} className="flex items-center gap-1 text-sm font-bold text-[var(--text-primary)] hover:text-[#FF9933] transition-colors">
                    Order Service <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StarIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

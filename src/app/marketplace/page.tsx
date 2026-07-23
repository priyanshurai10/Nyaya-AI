'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  PhoneCall,
  FileSignature,
  ShieldAlert,
  Gavel,
  Compass,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles,
  Award,
  ShieldCheck,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  price: string;
  delivery: string;
  description: string;
  icon: any;
  href: string;
  tag: string;
}

const marketplaceServices: ServiceItem[] = [
  {
    id: '1',
    title: '1-on-1 Confidential Legal Consultation',
    category: 'Consultation',
    price: '₹200',
    delivery: 'Same-Day Callback',
    description: 'Book a 1-on-1 confidential phone call with a senior legal specialist for advice under BNS, BNSS, Property, or Family Law.',
    icon: PhoneCall,
    href: '/consultation',
    tag: 'Popular',
  },
  {
    id: '2',
    title: 'FIR & Police Complaint Drafting',
    category: 'Drafting',
    price: 'Instant',
    delivery: 'Real-time AI Generation',
    description: 'Draft legal FIR complaints, cybercrime reports, or police petitions with proper penal sections under BNS & BNSS.',
    icon: FileSignature,
    href: '/document-generator',
    tag: 'Instant',
  },
  {
    id: '3',
    title: 'Contract & Rent Agreement Risk Analysis',
    category: 'Analysis',
    price: 'Free AI Scan',
    delivery: 'Immediate Report',
    description: 'Scan employment contracts, rental agreements, or legal notices using AI OCR to identify hidden liabilities and asymmetric clauses.',
    icon: ShieldAlert,
    href: '/risk',
    tag: 'AI Powered',
  },
  {
    id: '4',
    title: 'Litigation Strategy & Roadmap Generation',
    category: 'Strategy',
    price: 'Included',
    delivery: 'Interactive Flow',
    description: 'Generate step-by-step court litigation roadmaps, procedural timelines, and evidence checklists for Indian courts.',
    icon: Compass,
    href: '/strategy',
    tag: 'Roadmap',
  },
  {
    id: '5',
    title: 'Statutory Legal Notice Generator',
    category: 'Drafting',
    price: 'Instant',
    delivery: 'PDF & Text Output',
    description: 'Create formal 15-day statutory legal notices for cheque bounce (NI Act 138), landlord security deposit refund, or breach of contract.',
    icon: Gavel,
    href: '/document-generator',
    tag: 'Legal Notice',
  },
];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['ALL', 'Consultation', 'Drafting', 'Analysis', 'Strategy'];

  const filteredServices = marketplaceServices.filter((service) => {
    const matchesCategory = selectedCategory === 'ALL' || service.category === selectedCategory;
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8 text-[var(--text-primary)] font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9933]/15 border border-[#FF9933]/30 text-[#FF9933] text-xs font-semibold">
              <ShoppingBag className="w-3.5 h-3.5" /> Legal Services Marketplace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verified Legal Services & AI Tools
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Access specialist consultation calls, automated document drafting, risk scans, and litigation roadmaps under Indian Law.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#FF9933] text-white shadow-md'
                    : 'bg-[var(--card)] text-[var(--text-muted)] hover:bg-[var(--card-elevated)] border border-[var(--border)]'
                }`}
              >
                {cat === 'ALL' ? 'All Services' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search legal services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50"
            />
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center bg-[var(--card)] rounded-3xl border border-[var(--border)] text-[var(--text-muted)]">
            No legal services found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] hover:border-[#FF9933]/50 transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#FF9933]/10 text-[#FF9933] border border-[#FF9933]/20 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {service.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-[var(--text-primary)] mb-1">
                        {service.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-[var(--border)] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block">Fee</span>
                        <span className="font-extrabold text-[#FF9933]">{service.price}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[var(--text-muted)] block">Delivery</span>
                        <span className="font-semibold text-[var(--text-primary)]">{service.delivery}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--border)]">
                    <Link
                      href={service.href}
                      className="w-full py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <span>Select Service</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

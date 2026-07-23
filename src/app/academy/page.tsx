'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Scale,
  ShieldCheck,
  Award,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BookMarked,
  BrainCircuit,
  FileText,
  Gavel,
  Shield,
  HeartHandshake,
  Users,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  statute: string;
  modulesCount: number;
  duration: string;
  level: string;
  description: string;
  icon: any;
  color: string;
}

const academyCourses: Course[] = [
  {
    id: 'bns-2023',
    title: 'Bharatiya Nyaya Sanhita (BNS) 2023 Overview',
    category: 'Criminal Law',
    statute: 'BNS Act 2023 (Replaced IPC 1860)',
    modulesCount: 8,
    duration: '45 mins',
    level: 'Beginner',
    description: 'Master the new Indian Penal Code replacement: new criminal offences, snatching under Sec 304, organized crime, and terror definitions.',
    icon: Gavel,
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'bnss-2023',
    title: 'Bharatiya Nagarik Suraksha Sanhita (BNSS) & Bail',
    category: 'Criminal Procedure',
    statute: 'BNSS Act 2023 (Replaced CrPC 1973)',
    modulesCount: 10,
    duration: '60 mins',
    level: 'Intermediate',
    description: 'Understand zero FIR, electronic summons, 14-day police custody limit, first-time offender half-sentence bail rule under Sec 479.',
    icon: Scale,
    color: 'from-[#FF9933] to-amber-600',
  },
  {
    id: 'bsa-2023',
    title: 'Bharatiya Sakshya Adhiniyam (BSA) Electronic Evidence',
    category: 'Evidence Law',
    statute: 'BSA Act 2023 (Replaced Evidence Act 1872)',
    modulesCount: 6,
    duration: '35 mins',
    level: 'Intermediate',
    description: 'Comprehensive guide to Section 63 BSA electronic records certificates, cloud evidence admissibility, digital signatures, and forensics.',
    icon: ShieldCheck,
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'constitution-rights',
    title: 'Fundamental Rights & Constitutional Remedies',
    category: 'Constitutional Law',
    statute: 'Constitution of India (Articles 12-35 & 32)',
    modulesCount: 12,
    duration: '75 mins',
    level: 'Beginner',
    description: 'Learn your fundamental rights under Art 14 (Equality), Art 19 (Free Speech), Art 21 (Life & Liberty), and Art 32 Habeas Corpus writ petitions.',
    icon: BookOpen,
    color: 'from-sky-500 to-blue-600',
  },
  {
    id: 'consumer-protection',
    title: 'Consumer Rights & E-Commerce Grievance Guide',
    category: 'Civil & Commercial',
    statute: 'Consumer Protection Act 2019',
    modulesCount: 7,
    duration: '40 mins',
    level: 'Beginner',
    description: 'File complaints against defective products, unfair trade practices, misleading ads, e-commerce refund delays via National Consumer Helpline (NCH).',
    icon: HeartHandshake,
    color: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'property-rera',
    title: 'Property Purchasing, Title Verification & RERA',
    category: 'Property Law',
    statute: 'RERA Act 2016 & Transfer of Property Act 1882',
    modulesCount: 9,
    duration: '50 mins',
    level: 'Intermediate',
    description: 'Verify 30-year property title deeds, encumbrance certificates, RERA builder delays, mutation records, and buyer possession rights.',
    icon: FileText,
    color: 'from-purple-600 to-indigo-700',
  },
  {
    id: 'cyber-security',
    title: 'Cyber Crime Complaints & IT Act Offences',
    category: 'Cyber Law',
    statute: 'IT Act 2000 & Digital Personal Data Protection Act 2023',
    modulesCount: 8,
    duration: '45 mins',
    level: 'Beginner',
    description: 'Report online banking fraud, UPI scams, identity theft, sextortion, and illegal loan apps via cybercrime.gov.in (1930 Helpline).',
    icon: Shield,
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'rti-act-2005',
    title: 'Right to Information (RTI) Masterclass',
    category: 'Administrative Law',
    statute: 'RTI Act 2005',
    modulesCount: 5,
    duration: '30 mins',
    level: 'Beginner',
    description: 'Draft 30-day RTI applications, track municipal spending, road repair funds, police investigation progress, and file 1st Appeals under Sec 19.',
    icon: BookMarked,
    color: 'from-teal-600 to-emerald-700',
  },
  {
    id: 'posh-act',
    title: 'Prevention of Sexual Harassment at Workplace (POSH)',
    category: 'Labour Law',
    statute: 'POSH Act 2013 & Internal Complaints Committee (ICC)',
    modulesCount: 6,
    duration: '35 mins',
    level: 'Beginner',
    description: 'Workplace safety rights for women, filing formal complaints to ICC, 90-day inquiry timelines, conciliation rules, and employer duties.',
    icon: Users,
    color: 'from-pink-500 to-rose-600',
  },
];

export default function LegalAcademyPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['ALL', 'Criminal Law', 'Constitutional Law', 'Property Law', 'Cyber Law', 'Civil & Commercial'];

  const filteredCourses = academyCourses.filter((course) => {
    const matchesCategory = selectedCategory === 'ALL' || course.category === selectedCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.statute.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8 text-[var(--text-primary)] font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          <div className="relative z-10 space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold border border-sky-500/30">
              <GraduationCap className="w-3.5 h-3.5" /> Legal Learning Academy
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Know Your Legal Rights Under Indian Law
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Explore 14+ interactive courses on BNS 2023, BNSS 2023, BSA 2023, Constitution, Property RERA, and Cyber Crime with quizzes and certifications.
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
                {cat === 'ALL' ? 'All Courses' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search courses, BNS, Acts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50"
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const Icon = course.icon;
            return (
              <div
                key={course.id}
                className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] hover:border-[#FF9933]/60 transition-all flex flex-col justify-between shadow-sm hover:shadow-md group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-[var(--border)]">
                      {course.level}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#FF9933] block mb-1">
                      {course.statute}
                    </span>
                    <h3 className="font-extrabold text-base text-[var(--text-primary)] group-hover:text-[#FF9933] transition-colors mb-2 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-[var(--text-muted)] pt-2">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#FF9933]" /> {course.modulesCount} Modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-500" /> {course.duration}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border)]">
                  <Link
                    href={`/academy/course/${course.id}`}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <span>Start Course</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

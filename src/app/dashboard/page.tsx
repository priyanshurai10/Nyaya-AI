"use client";

import React, { useState, useEffect } from "react";
import { 
  User, CheckCircle2, BookOpen, Sparkles, Shield, Scale, FileText, ArrowRight, 
  Zap, Landmark, Search, ShieldAlert, Award, PhoneCall, ChevronRight, Gavel, 
  FolderOpen, Compass, FileSignature, MessageSquare, Star, Send, MessageCircle,
  Instagram, Linkedin, Github, MapPin, Bookmark, Users, Clock, Lightbulb, Rocket, Heart
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function UserDashboardPage() {
  const router = useRouter();
  const { selectedLang, t } = useLanguage();
  const [user, setUser] = useState<any>(null);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    // Check local storage for user
    const storedUser = localStorage.getItem("nyaya_user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    try {
      setUser(JSON.parse(storedUser));
    } catch (e) {
      setUser({ name: "Priyanshu Rai", email: "priyanshu.rai121111@gmail.com", role: "CITIZEN" });
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/user/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API error:', e);
    }
    localStorage.removeItem("nyaya_user");
    localStorage.removeItem("nyaya_token");
    document.cookie = "nyaya_token=; path=/; max-age=0";
    router.push("/");
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackText("");
    }, 4000);
  };

  if (!user) return null;

  // Genuine Active Tools (Fully working modules)
  const coreTools = [
    { id: "chat", title: "AI Legal Chat Assistant", desc: "Ask questions on Indian laws, BNS, BNSS & IPC sections in simple language", icon: MessageSquare, href: "/chat", color: "from-orange-500 to-amber-600", tag: "Interactive AI" },
    { id: "risk", title: "AI Risk Analyzer", desc: "Scan legal documents & disputes to identify risk levels and vulnerabilities", icon: ShieldAlert, href: "/risk", color: "from-amber-500 to-orange-600", tag: "Risk Engine" },
    { id: "strategy", title: "Legal Strategy Builder", desc: "Generate step-by-step legal action plans and litigation roadmaps", icon: Compass, href: "/strategy", color: "from-[#FF9933] to-amber-600", tag: "Strategy" },
    { id: "generator", title: "FIR & Legal Notice Generator", desc: "Draft complaints, RTI applications & legal notices in seconds", icon: FileSignature, href: "/document-generator", color: "from-blue-600 to-indigo-600", tag: "Drafting" },
    { id: "vault", title: "AI Evidence Vault", desc: "Upload and run OCR analysis on contracts, deeds, and legal receipts", icon: FolderOpen, href: "/evidence-vault", color: "from-purple-600 to-indigo-700", tag: "OCR Analysis" },
    { id: "academy", title: "Legal Learning Academy", desc: "Structured lessons on Constitution, BNS, BNSS, BSA & Consumer Rights", icon: BookOpen, href: "/academy", color: "from-sky-500 to-blue-600", tag: "14 Courses" },
    { id: "path", title: "Nyaya Path (Court Hierarchy)", desc: "Explore Indian court hierarchy, jurisdictions, and procedural steps", icon: Gavel, href: "/nyaya-path", color: "from-[#138808] to-emerald-700", tag: "Hierarchy" },
    { id: "research", title: "Legal Research Hub", desc: "Search through verified landmark Indian Supreme Court judgments", icon: Search, href: "/research", color: "from-teal-500 to-emerald-600", tag: "Research" }
  ];

  // Upcoming Features (Roadmap)
  const upcomingFeatures = [
    { id: "map", title: "Verified Court Map & Geolocation", desc: "Interactive GPS map for Indian District Courts, High Courts & eCourts centers", icon: MapPin, status: "In Development", release: "Q3 2026" },
    { id: "advocates", title: "Find Advocate & Bar Directory", desc: "Verified directory matching users with specialized High Court & District advocates", icon: Users, status: "In Development", release: "Q3 2026" },
    { id: "bookmarks", title: "Cloud Court Bookmarks & Case Tracker", desc: "Sync live eCourts case status notifications, hearing dates & bookmarks across devices", icon: Bookmark, status: "Planned", release: "Q4 2026" }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8 text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
          {/* Indian Tricolor Glow Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9933]/15 border border-[#FF9933]/30 text-[#FF9933] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Nyaya AI • Indic Legal Platform
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Welcome, <span className="bg-gradient-to-r from-amber-400 via-[#FF9933] to-orange-400 bg-clip-text text-transparent">{user.name || "Citizen"}</span> 👋
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Access genuine AI legal assessment, draft FIRs and notices, explore Indian court hierarchy, and learn your rights under Bharatiya Nyaya Sanhita (BNS).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/risk"
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF9933] to-orange-600 text-white font-bold text-sm shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" /> AI Risk Scan
              </Link>
              <Link
                href="/document-generator"
                className="px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-white border border-slate-700 font-semibold text-sm hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <FileSignature className="w-4 h-4 text-[#FF9933]" /> FIR & Notice Draft
              </Link>
            </div>
          </div>
        </div>

        {/* Section 1: Active Functional Legal Tools */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <Zap className="w-6 h-6 text-[#FF9933]" /> Core Legal Superpowers
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">Fully functional, production-ready legal AI features</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5" /> 8 Verified Features Live
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {coreTools.map(tool => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-[#FF9933]/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${tool.color} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {tool.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[#FF9933] transition-colors mb-1.5">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-[#FF9933]">
                    <span>Open Feature</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 2: Legal Learning Academy Featured Spotlight */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-900/40 p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold border border-sky-500/30">
                <BookOpen className="w-3.5 h-3.5" /> Interactive Legal Academy
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Learn Your Rights under BNS, BNSS, BSA & Constitution of India
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Explore structured modules covering Consumer Protection, Property Law, Cyber Security, RTI applications, Motor Vehicles Act, and POSH Act with quizzes and practical examples.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href="/academy"
                className="px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Start Learning Now
              </Link>
            </div>
          </div>
        </div>

        {/* Section 3: Upcoming Features (Roadmap on Scroll Down) */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Upcoming Features (Roadmap)</h2>
              <p className="text-xs text-[var(--text-muted)]">These modules are currently under active integration for future releases</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {upcomingFeatures.map(feat => {
              const Icon = feat.icon;
              return (
                <div 
                  key={feat.id}
                  className="bg-[var(--card)] p-6 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 relative opacity-90 hover:opacity-100 transition-opacity flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {feat.status} • {feat.release}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[var(--text-primary)] mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Coming in next version
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: User Feedback & Suggestions Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          
          {/* Feedback Form Card */}
          <div className="bg-[var(--card)] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Share Your Feedback
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Help us make Nyaya AI better by sharing your thoughts or reporting issues.</p>
            </div>

            {feedbackSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                <h4 className="font-bold text-base">Thank you for your feedback!</h4>
                <p className="text-xs">Your suggestions help shape the future of Nyaya AI.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-2">Rate your experience</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${star <= feedbackRating ? "fill-amber-400" : "text-slate-300 dark:text-slate-700"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">Your Suggestion / Feedback</label>
                  <textarea
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Write your feedback or suggestions here..."
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#FF9933] hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Feedback
                </button>
              </form>
            )}
          </div>

          {/* Contact for Suggestions & Developer Info */}
          <div className="bg-[var(--card)] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#FF9933]" /> Contact for Suggestions
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Have direct suggestions or ideas? Reach out to the developer directly:</p>
              </div>

              <div className="space-y-3 pt-2">
                
                {/* WhatsApp */}
                <a
                  href="https://wa.me/917541881152"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors text-xs font-bold"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-emerald-500" />
                    <span>WhatsApp: +91 7541881152</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com/sanchittrai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-600 dark:text-pink-400 transition-colors text-xs font-bold"
                >
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-pink-500" />
                    <span>Instagram: @sanchittrai</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/in/priyanshu-rai-2114722ab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors text-xs font-bold"
                >
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-blue-500" />
                    <span>LinkedIn: Priyanshu Rai</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/priyanshurai10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 text-slate-700 dark:text-slate-300 transition-colors text-xs font-bold"
                >
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5" />
                    <span>GitHub: @priyanshurai10</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </a>

              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Nyaya AI Citizen Portal</span>
              <button 
                onClick={handleLogout}
                className="font-semibold text-red-500 hover:underline"
              >
                Log Out
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

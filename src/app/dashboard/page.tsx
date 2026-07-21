"use client";

import React, { useState, useEffect } from "react";
import { User, Clock, CheckCircle2, AlertCircle, BookOpen, Bookmark as BookmarkIcon, Receipt, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useLanguage } from "@/context/LanguageContext";

export default function UserDashboardPage() {
  const router = useRouter();
  const { selectedLang, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"overview" | "consultations" | "transactions" | "learning">("overview");

  useEffect(() => {
    // Check local storage for user just for UI display initially
    const storedUser = localStorage.getItem("nyaya_user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const result = await apiClient.get("/user/dashboard", { redirectOnAuthError: false });
      
      if (result && result.success && result.data) {
        setData(result.data);
      } else {
        setData({ consultations: [], transactions: [], bookmarks: [], learningProgress: 0 });
      }
    } catch (err: any) {
      if (err?.status === 401) {
        localStorage.removeItem("nyaya_user");
        localStorage.removeItem("nyaya_token");
        document.cookie = "nyaya_token=; path=/; max-age=0";
        router.push("/auth");
      } else {
        // Fall back to clean zero state gracefully without showing red error banner
        setData({ consultations: [], transactions: [], bookmarks: [], learningProgress: 0 });
      }
    } finally {
      setLoading(false);
    }
  };

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          <div className="bg-[var(--card)] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 mb-6 text-center shadow-sm">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10" />
            </div>
            <h2 className="font-bold text-[var(--text-primary)]">{user.name}</h2>
            <p className="text-xs text-[var(--text-muted)] mb-4">{user.email}</p>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-full text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)]">
              {user.role}
            </span>
          </div>

          <nav className="space-y-1">
            {[
              { id: "overview", icon: <User size={18} />, label: t('dashOverview') },
              { id: "consultations", icon: <Clock size={18} />, label: t('mktMyConsultations') },
              { id: "transactions", icon: <Receipt size={18} />, label: t('mktMyPayments') },
              { id: "learning", icon: <BookOpen size={18} />, label: t('dashLearning') },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${ activeTab === tab.id ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)] hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-[var(--card-elevated)]/50" }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
          
          <button 
            onClick={handleLogout}
            className="w-full mt-6 text-sm font-semibold text-[var(--danger)] hover:text-red-600 py-3 rounded-xl border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            {t('dashLogout')}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {loading ? (
            <div className="h-64 flex items-center justify-center text-[var(--text-muted)]">
              {t('dashLoading')}
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-black text-[var(--text-primary)]">{t('dashOverview')}</h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)]">{t('mktMyConsultations')}</h3>
                        <div className="p-2 bg-blue-50 bg-[var(--primary-subtle)] text-blue-500 rounded-xl"><Clock size={20} /></div>
                      </div>
                      <p className="text-4xl font-black text-[var(--text-primary)]">{data?.consultations?.length || 0}</p>
                    </div>
                    <div className="bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)]">{t('mktMyPayments')}</h3>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl"><Receipt size={20} /></div>
                      </div>
                      <p className="text-4xl font-black text-[var(--text-primary)]">{data?.transactions?.length || 0}</p>
                    </div>
                    <div className="bg-[var(--card)] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)]">{t('sidebarBookmarks')}</h3>
                        <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-xl"><BookmarkIcon size={20} /></div>
                      </div>
                      <p className="text-4xl font-black text-[var(--text-primary)]">{data?.bookmarks?.length || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "consultations" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-black text-[var(--text-primary)]">{t('mktMyConsultations')}</h1>
                  <div className="bg-[var(--card)] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    {data?.consultations?.length > 0 ? (
                      <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {data.consultations.map((c: any) => (
                          <div key={c.id} className="p-6 hover:bg-[var(--background)] dark:hover:bg-[var(--card-elevated)]/20 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-lg text-[var(--text-primary)]">{c.category}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${ c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : c.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700' }`}>
                                {c.status}
                              </span>
                            </div>
                            <div className="text-sm text-[var(--text-muted)] mb-2">
                              {new Date(c.createdAt).toLocaleDateString()} at {c.time}
                            </div>
                            {c.summary && <p className="text-sm text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-2">{c.summary}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center text-[var(--text-muted)]">{t('dashNoConsultations')}</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "transactions" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-black text-[var(--text-primary)]">{t('mktMyPayments')}</h1>
                  <div className="bg-[var(--card)] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    {data?.transactions?.length > 0 ? (
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[var(--text-muted)] dark:text-[var(--text-muted)] text-sm">
                          <tr>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Amount</th>
                            <th className="p-4 font-semibold">UTR</th>
                            <th className="p-4 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {data.transactions.map((t: any) => (
                            <tr key={t.id} className="hover:bg-[var(--background)] dark:hover:bg-[var(--card-elevated)]/20 transition-colors">
                              <td className="p-4 text-sm text-slate-700 dark:text-slate-300">
                                {new Date(t.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4 font-bold text-[var(--text-primary)]">
                                ₹{t.amount}
                              </td>
                              <td className="p-4 font-mono text-sm text-[var(--text-muted)]">
                                {t.utr}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${ t.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : t.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700' }`}>
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-12 text-center text-[var(--text-muted)]">{t('dashNoTransactions')}</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "learning" && (
                <div className="space-y-6">
                  <h1 className="text-3xl font-black text-[var(--text-primary)]">{t('dashLearning')}</h1>
                  <div className="bg-[var(--card)] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    {data?.progress?.length > 0 ? (
                      <div className="p-6">
                        {data.progress.map((p: any) => (
                          <div key={p.id} className="mb-4 last:mb-0">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Lesson: {p.lessonId}</span>
                              <span className="text-sm text-[var(--text-muted)]">{p.progressPct}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${p.progressPct}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center text-[var(--text-muted)]">
                        <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <p>{t('dashNoLearning')}</p>
                        <Link href="/academy" className="text-indigo-500 font-bold hover:underline mt-2 inline-block">Start Learning</Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

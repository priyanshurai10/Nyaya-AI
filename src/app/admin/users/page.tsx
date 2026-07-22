"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, RefreshCw, ChevronLeft, Shield } from "lucide-react";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://nyaya-ai-production-04ba.up.railway.app";
const SUPER_ADMIN_EMAIL = "priyanshurai121111@gmail.com";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("nyaya_token") || "";
}

export default function AdminUsersPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("nyaya_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.email !== SUPER_ADMIN_EMAIL) setAccessDenied(true);
      } catch {
        setAccessDenied(true);
      }
    } else {
      setAccessDenied(true);
    }
  }, []);

  useEffect(() => {
    if (!accessDenied) fetchStats();
  }, [accessDenied]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/consultations/consultation-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.data);
      } else {
        setError(data.detail || "Failed to load user metrics");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/30 p-12 max-w-md text-center shadow-xl">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Access Denied</h1>
          <p className="text-slate-500 dark:text-slate-400">Super Admin credentials ({SUPER_ADMIN_EMAIL}) required.</p>
          <Link href="/dashboard" className="inline-block mt-6 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-[#FF9933] mb-2">
              <ChevronLeft className="w-4 h-4" /> Back to Admin Panel
            </Link>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Registered Citizens & Directory</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Platform user accounts and registration activity.</p>
          </div>
          <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 text-xs uppercase font-bold">Total Registered Citizens</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats?.total_users ?? 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 text-xs uppercase font-bold">Verified Payments</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{stats?.verified_payments ?? 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 text-xs uppercase font-bold">Super Admin Account</p>
            <p className="text-sm font-mono font-bold text-orange-500 mt-2">{SUPER_ADMIN_EMAIL}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

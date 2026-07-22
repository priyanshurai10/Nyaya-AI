"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Phone, MessageSquare, Video, CheckCircle, Search, RefreshCw, ChevronLeft } from "lucide-react";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://nyaya-ai-production-04ba.up.railway.app";
const SUPER_ADMIN_EMAIL = "priyanshurai121111@gmail.com";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("nyaya_token") || "";
}

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
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
    if (!accessDenied) fetchConsultations();
  }, [statusFilter, search, accessDenied]);

  const fetchConsultations = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`${BACKEND_URL}/api/v1/admin/consultations/consultations?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConsultations(data.data || []);
      } else {
        setError(data.detail || data.message || "Failed to load consultations");
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
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Scheduled Consultations</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage scheduled calls and track consultation progress.</p>
          </div>
          <button onClick={fetchConsultations} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="relative flex-1 min-w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, mobile, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Waiting">Waiting</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading consultations...</div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Calendar className="w-16 h-16 text-indigo-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Consultations Found</h3>
            <p className="text-slate-500 text-sm mt-1">There are no consultations matching your search filter.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Legal Issue</th>
                    <th className="p-4">Schedule</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {consultations.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white">{c.full_name}</p>
                        <p className="text-xs text-slate-500">{c.email} · {c.mobile}</p>
                        <p className="text-xs font-mono text-slate-400">{c.consultation_id || c.id}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{c.legal_issue}</p>
                        <p className="text-xs text-slate-400">{c.preferred_language}</p>
                      </td>
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        {c.scheduled_date ? `${c.scheduled_date} at ${c.scheduled_time}` : "Awaiting Schedule"}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                          {c.meeting_mode === "PHONE" && <Phone className="w-3.5 h-3.5 text-blue-500" />}
                          {c.meeting_mode === "WHATSAPP" && <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />}
                          {c.meeting_mode === "GOOGLE_MEET" && <Video className="w-3.5 h-3.5 text-red-500" />}
                          {c.meeting_mode || "PHONE"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

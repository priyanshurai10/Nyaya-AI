"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, Search, RefreshCw, ChevronLeft } from "lucide-react";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://nyaya-ai-production-04ba.up.railway.app";
const SUPER_ADMIN_EMAIL = "priyanshurai121111@gmail.com";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("nyaya_token") || "";
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [declineReason, setDeclineReason] = useState("");
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState("");
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
    if (!accessDenied) fetchPayments();
  }, [statusFilter, search, accessDenied]);

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`${BACKEND_URL}/api/v1/admin/consultations/payments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPayments(data.data || []);
      } else {
        setError(data.detail || data.message || "Failed to load payments");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId: string) => {
    setActionLoading(paymentId);
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/consultations/payments/${paymentId}/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Payment verified successfully! Email notification sent to user.");
        fetchPayments();
      } else {
        setError(data.detail || data.message || "Verification failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setActionLoading("");
    }
  };

  const handleDecline = async (paymentId: string) => {
    if (!declineReason.trim()) return;
    setActionLoading(paymentId);
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("reason", declineReason);
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/consultations/payments/${paymentId}/decline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Payment declined. Email notification sent to user.");
        setDecliningId(null);
        setDeclineReason("");
        fetchPayments();
      } else {
        setError(data.detail || data.message || "Decline failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setActionLoading("");
    }
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/30 p-12 max-w-md text-center shadow-xl">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Access Denied</h1>
          <p className="text-slate-500 dark:text-slate-400">Super Admin credentials ({SUPER_ADMIN_EMAIL}) required to access Payment Ledger.</p>
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
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Payment Ledger</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Review, verify, or decline consultation payment requests.</p>
          </div>
          <button onClick={fetchPayments} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 font-medium text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 text-emerald-600 rounded-xl flex items-center gap-2 font-medium text-sm">
            <CheckCircle className="w-5 h-5 shrink-0" /> {success}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 flex-wrap bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="relative flex-1 min-w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, mobile, UTR, payment ID..."
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
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="verified">Verified</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading payment ledger...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Payments Found</h3>
            <p className="text-slate-500 text-sm mt-1">There are no payment records matching your search.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Legal Issue</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">UTR Number</th>
                    <th className="p-4">Screenshot</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.map(p => (
                    <tr key={p.payment_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white">{p.user_name}</p>
                        <p className="text-xs text-slate-500">{p.user_email} · {p.user_mobile}</p>
                        <p className="text-xs font-mono text-slate-400">{p.payment_id}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{p.legal_issue}</p>
                      </td>
                      <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">
                        ₹{p.amount}
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {p.utr_number || "—"}
                      </td>
                      <td className="p-4">
                        {p.screenshot_url ? (
                          <a href={`${BACKEND_URL}${p.screenshot_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                            <Eye className="w-4 h-4" /> View
                          </a>
                        ) : "—"}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.status === "verified" ? "bg-emerald-100 text-emerald-700" :
                          p.status === "declined" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        {p.status !== "verified" && p.status !== "declined" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleVerify(p.payment_id)}
                              disabled={actionLoading === p.payment_id}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs"
                            >
                              Verify
                            </button>
                            {decliningId !== p.payment_id ? (
                              <button
                                onClick={() => setDecliningId(p.payment_id)}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-xs"
                              >
                                Reject
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  placeholder="Reason..."
                                  value={declineReason}
                                  onChange={e => setDeclineReason(e.target.value)}
                                  className="px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                                <button
                                  onClick={() => handleDecline(p.payment_id)}
                                  disabled={!declineReason.trim()}
                                  className="px-2 py-1 bg-red-600 text-white font-bold rounded text-xs disabled:opacity-50"
                                >
                                  Confirm
                                </button>
                              </div>
                            )}
                          </div>
                        )}
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

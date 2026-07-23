"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Users, CreditCard, Calendar, CheckCircle2, XCircle,
  Clock, Search, Bell, ChevronDown, Eye, AlertCircle, BarChart2,
  TrendingUp, IndianRupee, RefreshCw, Filter, X, Phone, MessageSquare,
  Video, FileText, Activity, Shield
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://nyaya-ai-production-04ba.up.railway.app";
const SUPER_ADMIN_EMAIL = "priyanshurai121111@gmail.com";

type TabKey = "overview" | "payments" | "consultations" | "audit";
type PaymentStatus = "ALL" | "pending" | "under_review" | "verified" | "declined";
type ConsultStatus = "ALL" | "Waiting" | "Scheduled" | "Completed" | "Declined";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("nyaya_token") || "";
}

const isSuperAdminEmail = (email?: string) => {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return clean.includes("priyanshurai121111") || clean === "priyanshurai121111@gmail.com" || clean === "priyanshurai1211111@gmail.com";
};

async function apiCall(path: string, opts: RequestInit = {}) {
  const token = getToken();
  try {
    const res = await fetch(path, {
      ...opts,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(opts.headers || {}),
      },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const resBackend = await fetch(`${BACKEND_URL}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
  const dataBackend = await resBackend.json();
  if (!resBackend.ok) throw new Error(dataBackend.detail || dataBackend.message || "Request failed");
  return dataBackend;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, sub }: { label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <div className={`relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -mr-8 -mt-8 ${color}`} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>{icon}</div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Payment Row ──────────────────────────────────────────────────────────────
function PaymentRow({ payment, onAction, loading }: { payment: any; onAction: (id: string, action: "verify" | "decline", payload?: any) => void; loading: string }) {
  const [reason, setReason] = useState("");
  const [showDecline, setShowDecline] = useState(false);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    under_review: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    verified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    declined: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">{payment.user_name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{payment.user_email} · {payment.user_mobile}</p>
          <p className="text-xs font-mono text-slate-400">{payment.payment_id}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹{payment.amount}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[payment.status] || "bg-slate-100 text-slate-700"}`}>
            {payment.status.replace("_", " ").toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-400 font-medium">Legal Issue</p>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{payment.legal_issue}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">UTR Number</p>
          <p className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs inline-block text-slate-800 dark:text-slate-200">
            {payment.utr_number || "Not provided"}
          </p>
        </div>
      </div>

      {payment.screenshot_url && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <a
            href={payment.screenshot_url.startsWith("http") ? payment.screenshot_url : `${BACKEND_URL}${payment.screenshot_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Eye className="w-3.5 h-3.5" /> View Payment Screenshot
          </a>
        </div>
      )}

      {payment.status !== "verified" && payment.status !== "declined" && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAction(payment.payment_id, "verify")}
              disabled={loading === payment.payment_id}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" /> Verify Payment
            </button>
            <button
              onClick={() => setShowDecline(!showDecline)}
              className="py-2 px-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>

          {showDecline && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl space-y-2 border border-red-200 dark:border-red-900/30">
              <input
                type="text"
                placeholder="Enter rejection reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowDecline(false)} className="px-3 py-1 text-xs text-slate-500 font-bold">Cancel</button>
                <button
                  onClick={() => onAction(payment.payment_id, "decline", { reason })}
                  disabled={!reason.trim() || loading === payment.payment_id}
                  className="px-4 py-1 bg-red-600 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Consultation Row ─────────────────────────────────────────────────────────
function ConsultationRow({
  consultation,
  onSchedule,
  onComplete,
  loading,
}: {
  consultation: any;
  onSchedule: (id: string, payload: any) => void;
  onComplete: (id: string) => void;
  loading: string;
}) {
  const isScheduled = consultation.status?.includes("Scheduled");
  const isCompleted = consultation.status?.includes("Completed");

  const [showSchedule, setShowSchedule] = useState(false);
  const [schedDate, setSchedDate] = useState(consultation.scheduled_date || "");
  const [schedTime, setSchedTime] = useState(consultation.scheduled_time || "10:00 AM");
  const [meetMode, setMeetMode] = useState(consultation.meeting_mode || "PHONE");

  const cid = consultation.consultation_id || consultation.id;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">{consultation.full_name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{consultation.email} · {consultation.mobile}</p>
          <p className="text-xs font-mono text-slate-400">{cid}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          isCompleted ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
          isScheduled ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" :
          "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
        }`}>
          {consultation.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-400 font-medium">Issue Category</p>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{consultation.legal_issue}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Scheduled Date & Time</p>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {consultation.scheduled_date ? `${consultation.scheduled_date} @ ${consultation.scheduled_time}` : "Not Scheduled"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Meeting Mode</p>
          <p className="font-semibold text-slate-800 dark:text-slate-200">{consultation.meeting_mode || "—"}</p>
        </div>
      </div>

      {!isCompleted && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Calendar className="w-4 h-4" /> {isScheduled ? "Reschedule" : "Schedule Consultation"}
            </button>
            {isScheduled && (
              <button
                onClick={() => onComplete(cid)}
                disabled={loading === cid}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Completed
              </button>
            )}
          </div>

          {showSchedule && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl space-y-3 border border-indigo-200 dark:border-indigo-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Time (IST)</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Meeting Mode</label>
                  <select
                    value={meetMode}
                    onChange={(e) => setMeetMode(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="PHONE">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="GOOGLE_MEET">Google Meet</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowSchedule(false)} className="px-3 py-1 text-xs text-slate-500 font-bold">Cancel</button>
                <button
                  onClick={() => {
                    onSchedule(cid, { scheduled_date: schedDate, scheduled_time: schedTime, meeting_mode: meetMode });
                    setShowSchedule(false);
                  }}
                  disabled={!schedDate || !schedTime || loading === cid}
                  className="px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                >
                  Confirm Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus>("ALL");
  const [consultStatusFilter, setConsultStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("nyaya_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
        if (!isSuperAdminEmail(u.email) && u.role !== "ADMIN" && !u.is_admin) setAccessDenied(true);
      } catch {
        setAccessDenied(true);
      }
    } else {
      setAccessDenied(true);
    }
  }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), 5000);
  };

  const loadStats = useCallback(async () => {
    try {
      const data = await apiCall("/api/v1/admin/consultations/consultation-stats");
      setStats(data.data);
    } catch (e: any) {
      showError(e.message);
    }
  }, []);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (paymentStatusFilter !== "ALL") params.set("status", paymentStatusFilter);
      if (search) params.set("search", search);
      const data = await apiCall(`/api/v1/admin/consultations/payments?${params}`);
      setPayments(data.data || []);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  }, [paymentStatusFilter, search]);

  const loadConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (consultStatusFilter !== "ALL") params.set("status", consultStatusFilter);
      if (search) params.set("search", search);
      const data = await apiCall(`/api/v1/admin/consultations/consultations?${params}`);
      setConsultations(data.data || []);
    } catch (e: any) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  }, [consultStatusFilter, search]);

  const loadAuditLogs = useCallback(async () => {
    try {
      const data = await apiCall("/api/v1/admin/consultations/audit-trail");
      setAuditLogs(data.data || []);
    } catch (e: any) {
      showError(e.message);
    }
  }, []);

  useEffect(() => {
    if (accessDenied) return;
    loadStats();
    if (activeTab === "payments") loadPayments();
    if (activeTab === "consultations") loadConsultations();
    if (activeTab === "audit") loadAuditLogs();
  }, [activeTab, accessDenied, loadStats, loadPayments, loadConsultations, loadAuditLogs]);

  const handlePaymentAction = async (paymentId: string, action: "verify" | "decline", payload?: any) => {
    setActionLoading(paymentId);
    try {
      const formData = new FormData();
      if (action === "decline" && payload?.reason) formData.append("reason", payload.reason);
      await apiCall(`/api/v1/admin/consultations/payments/${paymentId}/${action}`, {
        method: "POST",
        body: formData,
      });
      showSuccess(`Payment ${action === "verify" ? "verified" : "declined"} successfully. User notified via email.`);
      loadPayments();
      loadStats();
    } catch (e: any) {
      showError(e.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleSchedule = async (consultId: string, scheduleData: any) => {
    setActionLoading(consultId);
    try {
      const formData = new FormData();
      formData.append("scheduled_date", scheduleData.scheduled_date);
      formData.append("scheduled_time", scheduleData.scheduled_time);
      formData.append("meeting_mode", scheduleData.meeting_mode);
      await apiCall(`/api/v1/admin/consultations/consultations/${consultId}/schedule`, {
        method: "POST",
        body: formData,
      });
      showSuccess("Consultation scheduled! User notified via email.");
      loadConsultations();
      loadStats();
    } catch (e: any) {
      showError(e.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleComplete = async (consultId: string) => {
    setActionLoading(consultId);
    try {
      const formData = new FormData();
      await apiCall(`/api/v1/admin/consultations/consultations/${consultId}/complete`, {
        method: "POST",
        body: formData,
      });
      showSuccess("Consultation marked complete. User notified.");
      loadConsultations();
      loadStats();
    } catch (e: any) {
      showError(e.message);
    } finally {
      setActionLoading("");
    }
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/30 p-12 max-w-md text-center shadow-xl">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Access Denied</h1>
          <p className="text-slate-500 dark:text-slate-400">This area is restricted to the Super Admin only. Unauthorized access attempts are logged and monitored.</p>
          <a href="/dashboard" className="inline-block mt-6 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl">Return to Dashboard</a>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "payments", label: "Payments", icon: <CreditCard className="w-4 h-4" /> },
    { key: "consultations", label: "Consultations", icon: <Calendar className="w-4 h-4" /> },
    { key: "audit", label: "Audit Trail", icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl text-slate-900 dark:text-white">Admin Control Center</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Super Admin · {SUPER_ADMIN_EMAIL}</p>
            </div>
          </div>
          <button onClick={() => { loadStats(); loadPayments(); loadConsultations(); }} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl text-sm transition-all">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Alerts */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl text-emerald-700 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" /> {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-700 dark:text-red-400 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-[#FF9933] text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard label="Total Users" value={stats?.total_users ?? "—"} icon={<Users className="w-5 h-5 text-white" />} color="bg-blue-500" />
              <StatCard label="Total Revenue" value={`₹${((stats?.total_revenue ?? 0) / 1000).toFixed(1)}K`} icon={<IndianRupee className="w-5 h-5 text-white" />} color="bg-emerald-500" sub={`From ${stats?.verified_payments ?? 0} verified`} />
              <StatCard label="Pending Payments" value={stats?.pending_payments ?? "—"} icon={<Clock className="w-5 h-5 text-white" />} color="bg-amber-500" />
              <StatCard label="Scheduled" value={stats?.scheduled_consultations ?? "—"} icon={<Calendar className="w-5 h-5 text-white" />} color="bg-indigo-500" />
              <StatCard label="Completed" value={stats?.completed_consultations ?? "—"} icon={<CheckCircle2 className="w-5 h-5 text-white" />} color="bg-teal-500" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="All Payments" value={stats?.total_payments ?? "—"} icon={<CreditCard className="w-5 h-5 text-white" />} color="bg-slate-700" />
              <StatCard label="Verified" value={stats?.verified_payments ?? "—"} icon={<CheckCircle2 className="w-5 h-5 text-white" />} color="bg-green-600" />
              <StatCard label="Declined" value={stats?.declined_payments ?? "—"} icon={<XCircle className="w-5 h-5 text-white" />} color="bg-red-600" />
              <StatCard label="All Consultations" value={stats?.total_consultations ?? "—"} icon={<FileText className="w-5 h-5 text-white" />} color="bg-purple-600" />
            </div>

            {/* Signups Chart */}
            {stats?.signups_chart && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#FF9933]" /> New User Signups (Last 7 Days)
                </h3>
                <div className="flex items-end gap-3 h-32">
                  {stats.signups_chart.map((d: any) => {
                    const max = Math.max(...stats.signups_chart.map((x: any) => x.count), 1);
                    const heightPct = d.count === 0 ? 4 : (d.count / max) * 100;
                    return (
                      <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{d.count}</span>
                        <div className="w-full bg-[#FF9933] rounded-t-lg transition-all" style={{ height: `${heightPct}%`, minHeight: "4px" }} />
                        <span className="text-xs text-slate-400">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PAYMENTS TAB ─────────────────────────────────────── */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, mobile, UTR..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                />
              </div>
              <select
                value={paymentStatusFilter}
                onChange={e => setPaymentStatusFilter(e.target.value as PaymentStatus)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF9933] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="verified">Verified</option>
                <option value="declined">Declined</option>
              </select>
              <button onClick={loadPayments} className="px-4 py-2.5 bg-[#FF9933] text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition-all">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mr-3" /> Loading payments...
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No payments found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">{payments.length} payment{payments.length !== 1 ? "s" : ""} found</p>
                {payments.map(p => (
                  <PaymentRow key={p.payment_id} payment={p} onAction={handlePaymentAction} loading={actionLoading} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CONSULTATIONS TAB ────────────────────────────────── */}
        {activeTab === "consultations" && (
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, mobile, ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                />
              </div>
              <select
                value={consultStatusFilter}
                onChange={e => setConsultStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF9933] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Waiting">Waiting</option>
                <option value="Verified">Verified – Awaiting Schedule</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Declined">Declined</option>
              </select>
              <button onClick={loadConsultations} className="px-4 py-2.5 bg-[#FF9933] text-white font-bold rounded-xl text-sm hover:bg-orange-600">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mr-3" /> Loading consultations...
              </div>
            ) : consultations.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No consultations found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">{consultations.length} consultation{consultations.length !== 1 ? "s" : ""} found</p>
                {consultations.map(c => (
                  <ConsultationRow key={c.id} consultation={c} onSchedule={handleSchedule} onComplete={handleComplete} loading={actionLoading} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── AUDIT TRAIL TAB ──────────────────────────────────── */}
        {activeTab === "audit" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#FF9933]" /> Full Audit Trail
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All admin actions are logged immutably.</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="text-center py-12 text-slate-400">No audit logs found.</p>
              ) : auditLogs.map((log, i) => (
                <div key={log.id || i} className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{log.action}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{log.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{log.admin} · {log.timestamp ? new Date(log.timestamp).toLocaleString("en-IN") : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

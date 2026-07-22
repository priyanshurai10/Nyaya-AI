"use client";

import React, { useState, useEffect } from "react";
import {
  User as UserIcon, Shield, Lock, CreditCard, Calendar, Bell, FileText,
  MessageSquare, Clock, CheckCircle2, AlertCircle, Edit3, Save, Eye,
  EyeOff, MapPin, Activity, ChevronRight, RefreshCw, Key
} from "lucide-react";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://nyaya-ai-production-04ba.up.railway.app";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("nyaya_token") || "";
}

export default function UserProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    marital_status: "",
    blood_group: "",
    occupation: "",
    education: "",
    aadhaar: "",
    pan: "",
    avatar_url: "",
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed to load profile");

      const p = json.data;
      setProfile(p);
      setFormData({
        name: p.personal_information?.name || "",
        dob: p.personal_information?.dob || "",
        gender: p.personal_information?.gender || "",
        marital_status: p.personal_information?.marital_status || "",
        blood_group: p.personal_information?.blood_group || "",
        occupation: p.personal_information?.occupation || "",
        education: p.personal_information?.education || "",
        aadhaar: "",
        pan: "",
        avatar_url: p.personal_information?.avatar_url || "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/user/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed to update profile");

      setSuccess("Profile updated successfully!");
      setEditMode(false);
      fetchProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
          <RefreshCw className="w-6 h-6 animate-spin text-[#FF9933]" /> Loading your profile...
        </div>
      </div>
    );
  }

  const pInfo = profile?.personal_information || {};
  const sIdent = profile?.sensitive_identity || {};
  const payments = profile?.payment_history || [];
  const consultations = profile?.consultation_history || [];
  const notifications = profile?.notifications || [];
  const documents = profile?.documents || [];
  const chats = profile?.ai_chat_history || [];
  const timeline = profile?.activity_timeline || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Back navigation */}
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#FF9933] transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
        </Link>

        {/* Header card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0">
              {pInfo.avatar_url ? (
                <img src={pInfo.avatar_url} alt={pInfo.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                pInfo.name ? pInfo.name.charAt(0).toUpperCase() : "U"
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                {pInfo.name}
                {pInfo.is_admin && <span className="px-2.5 py-0.5 bg-orange-500/10 text-[#FF9933] border border-orange-500/20 rounded-full text-xs font-bold">Admin</span>}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{pInfo.email} · {pInfo.mobile}</p>
              {pInfo.location?.city && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF9933]" /> {pInfo.location.city}, {pInfo.location.state}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-md"
          >
            <Edit3 className="w-4 h-4" /> {editMode ? "Cancel Editing" : "Edit Profile"}
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

        {/* Edit Form */}
        {editMode && (
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#FF9933]" /> Edit Personal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Date of Birth</label>
                <input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Gender</label>
                <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Marital Status</label>
                <select value={formData.marital_status} onChange={e => setFormData({ ...formData, marital_status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]">
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Blood Group</label>
                <input type="text" placeholder="e.g., O+, A+, B-" value={formData.blood_group} onChange={e => setFormData({ ...formData, blood_group: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Occupation</label>
                <input type="text" placeholder="e.g., Software Engineer" value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Education</label>
                <input type="text" placeholder="e.g., Graduate" value={formData.education} onChange={e => setFormData({ ...formData, education: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Aadhaar Number (AES-256 Encrypted)</label>
                <input type="text" placeholder="12-digit Aadhaar" value={formData.aadhaar} onChange={e => setFormData({ ...formData, aadhaar: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933] font-mono" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">PAN Number (AES-256 Encrypted)</label>
                <input type="text" placeholder="10-digit PAN" value={formData.pan} onChange={e => setFormData({ ...formData, pan: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933] font-mono uppercase" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setEditMode(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-md disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Personal Info Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-[#FF9933]" /> Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm divide-y divide-slate-100 dark:divide-slate-800">
              <div className="pt-2"><span className="text-slate-400 block text-xs">DOB</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.dob || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">Gender</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.gender || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">Marital Status</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.marital_status || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">Blood Group</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.blood_group || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">Occupation</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.occupation || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">Education</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.education || "Not set"}</span></div>
            </div>
          </div>

          {/* Encrypted Identity Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-500" /> Encrypted Identity Vault (AES-256)
              </h3>
              <button onClick={() => setShowSensitive(!showSensitive)} className="text-xs text-[#FF9933] font-bold hover:underline flex items-center gap-1">
                {showSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showSensitive ? "Hide" : "Reveal"}
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Aadhaar Card</p>
                  <p className="font-mono text-slate-900 dark:text-white font-bold mt-0.5">{sIdent.aadhaar_masked || "Not Uploaded"}</p>
                </div>
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">PAN Card</p>
                  <p className="font-mono text-slate-900 dark:text-white font-bold mt-0.5">{sIdent.pan_masked || "Not Uploaded"}</p>
                </div>
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* History Tabs / Sections */}
        <div className="space-y-6">

          {/* Consultation History */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Consultation History ({consultations.length})
            </h3>
            {consultations.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No consultation requests yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {consultations.map((c: any) => (
                  <div key={c.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{c.service_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{c.legal_issue} · {c.consultation_id}</p>
                      {c.scheduled_date && (
                        <p className="text-xs text-indigo-500 font-semibold mt-0.5">Scheduled: {c.scheduled_date} at {c.scheduled_time} ({c.meeting_mode})</p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" /> Payment History ({payments.length})
            </h3>
            {payments.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No payments recorded.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((p: any) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">₹{p.amount}</p>
                      <p className="text-xs font-mono text-slate-400">UTR: {p.utr_number || "Pending"}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === "verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" /> System Notifications ({notifications.length})
            </h3>
            {notifications.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No notifications.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((n: any) => (
                  <div key={n.id} className="py-3">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" /> Activity Timeline ({timeline.length})
            </h3>
            {timeline.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No recent activity.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {timeline.map((a: any, i: number) => (
                  <div key={a.id || i} className="py-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#FF9933] mt-2 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{a.action}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

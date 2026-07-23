"use client";

import React, { useState, useEffect } from "react";
import {
  User as UserIcon, Shield, Lock, CreditCard, Calendar, Edit3, Save, Eye,
  EyeOff, MapPin, CheckCircle2, AlertCircle, RefreshCw, ChevronRight, Phone, Mail, Globe
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

  // 15 Profile Fields Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    blood_group: "",
    marital_status: "",
    occupation: "",
    education: "",
    address: "",
    state: "",
    district: "",
    pincode: "",
    preferred_language: "en",
    avatar_url: "",
    aadhaar: "",
    pan: "",
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      let res = await fetch("/api/v1/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        res = await fetch(`${BACKEND_URL}/api/v1/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      const json = await res.json();
      if (res.ok && (json.data || json.user)) {
        const p = json.data || json;
        const u = json.user || p.personal_information || {};
        const pInfo = p.personal_information || {};

        setProfile(p);
        setFormData({
          name: pInfo.name || u.name || "",
          email: pInfo.email || u.email || "",
          phone: pInfo.phone || u.phone || "",
          dob: pInfo.dob || "",
          gender: pInfo.gender || "",
          marital_status: pInfo.marital_status || "",
          blood_group: pInfo.blood_group || "",
          occupation: pInfo.occupation || "",
          education: pInfo.education || "",
          address: pInfo.address || "",
          state: pInfo.state || "",
          district: pInfo.district || "",
          pincode: pInfo.pincode || "",
          preferred_language: pInfo.preferred_language || "en",
          avatar_url: pInfo.avatar_url || "",
          aadhaar: "",
          pan: "",
        });
      } else {
        setError(json.message || "Failed to load profile from database.");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading database profile.");
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
      let res = await fetch("/api/v1/user/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        res = await fetch(`${BACKEND_URL}/api/v1/user/profile/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
      }

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccess("Profile updated and saved to database successfully!");
        setEditMode(false);
        await fetchProfile(); // Re-fetch clean database state
      } else {
        setError(json.message || "Failed to save profile updates.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
          <RefreshCw className="w-6 h-6 animate-spin text-[#FF9933]" /> Loading profile from Supabase PostgreSQL...
        </div>
      </div>
    );
  }

  const pInfo = profile?.personal_information || {};
  const sIdent = profile?.sensitive_identity || {};
  const payments = profile?.payment_history || [];
  const consultations = profile?.consultation_history || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Back navigation */}
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#FF9933] transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
        </Link>

        {/* Header Card */}
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
                {pInfo.name || "User Profile"}
                {pInfo.is_admin && <span className="px-2.5 py-0.5 bg-orange-500/10 text-[#FF9933] border border-orange-500/20 rounded-full text-xs font-bold">Admin</span>}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#FF9933]" /> {pInfo.email}</span>
                {pInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#FF9933]" /> {pInfo.phone}</span>}
              </p>
              {(pInfo.district || pInfo.state || pInfo.pincode) && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF9933]" /> {[pInfo.address, pInfo.district, pInfo.state, pInfo.pincode].filter(Boolean).join(", ")}
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

        {/* Status Alerts */}
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

        {/* 15 Fields Edit Form */}
        {editMode && (
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#FF9933]" /> Edit Personal & Identity Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address *</label>
                <input type="email" disabled value={formData.email} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Mobile Number</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 9876543210" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
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
                <input type="text" placeholder="e.g., Engineer / Business / Student" value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Education Qualification</label>
                <input type="text" placeholder="e.g., Graduate / Post Graduate" value={formData.education} onChange={e => setFormData({ ...formData, education: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Residential Address</label>
                <input type="text" placeholder="House/Flat No., Street" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">District / City</label>
                <input type="text" placeholder="e.g., New Delhi" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">State</label>
                <input type="text" placeholder="e.g., Delhi / Maharashtra" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Pincode</label>
                <input type="text" maxLength={6} placeholder="e.g., 110001" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Preferred Language</label>
                <select value={formData.preferred_language} onChange={e => setFormData({ ...formData, preferred_language: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1220] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]">
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="gu">Gujarati (ગુજરાતી)</option>
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                  <option value="ml">Malayalam (മലയാളം)</option>
                  <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setEditMode(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-md disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? "Saving to Database..." : "Save Profile"}
              </button>
            </div>
          </form>
        )}

        {/* Display Grid */}
        <div className="max-w-3xl mx-auto">
          {/* Personal Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
              <UserIcon className="w-5 h-5 text-[#FF9933]" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm divide-y divide-slate-100 dark:divide-slate-800">
              <div className="pt-2"><span className="text-slate-400 block text-xs">Date of Birth</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.dob || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">Gender</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.gender || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">Marital Status</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.marital_status || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">Blood Group</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.blood_group || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">Occupation</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.occupation || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">Education</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.education || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">Address</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.address || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">District / City</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.district || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">State</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.state || "Not set"}</span></div>
              <div className="pt-2"><span className="text-slate-400 block text-xs">Pincode</span><span className="font-semibold text-slate-800 dark:text-slate-200">{pInfo.pincode || "Not set"}</span></div>
              <div className="pt-2 sm:col-span-2"><span className="text-slate-400 block text-xs">Preferred Language</span><span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{pInfo.preferred_language || "EN"}</span></div>
            </div>
          </div>
        </div>

        {/* Records */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Consultation History */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Consultation History ({consultations.length})
            </h3>
            {consultations.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No consultation requests recorded in database.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {consultations.map((c: any) => (
                  <div key={c.id || c.consultation_id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{c.service_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{c.legal_issue} · {c.consultation_id}</p>
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
              <p className="text-slate-400 text-sm text-center py-6">No payments recorded in database.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((p: any) => (
                  <div key={p.id || p.payment_id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">₹{p.amount}</p>
                      <p className="text-xs font-mono text-slate-400">UTR: {p.utr_number || "Pending"}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === "verified" || p.status === "VERIFIED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {p.status.toUpperCase()}
                    </span>
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

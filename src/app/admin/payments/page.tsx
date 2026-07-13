"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, Search } from "lucide-react";
import Image from "next/image";

interface Consultation {
  id: string;
  name: string;
  mobile: string;
  time: string;
  category: string;
  utr: string;
  screenshotUrl: string;
  createdAt: string;
  user: { name: string; email: string; };
}

export default function AdminPaymentsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/v1/admin/payments");
      const data = await res.json();
      if (res.ok && data.success) {
        setConsultations(data.data);
      } else {
        setError(data.message || "Failed to load payments");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;
    
    try {
      const res = await fetch("/api/v1/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId: id, status })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setConsultations(c => c.filter(item => item.id !== id));
      } else {
        alert(data.message || "Action failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Payment Verifications</h1>
        <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-8">Review and approve pending UPI payments for consultations.</p>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-500 dark:text-slate-400">Loading pending payments...</div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">There are no pending payments to verify.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm">
                  <tr>
                    <th className="p-4 font-semibold">User Details</th>
                    <th className="p-4 font-semibold">Service</th>
                    <th className="p-4 font-semibold">UTR Number</th>
                    <th className="p-4 font-semibold">Screenshot</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {consultations.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:bg-[#0B1220] dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{c.mobile}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">{new Date(c.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{c.category}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {c.time}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm text-slate-700 dark:text-slate-300">
                          {c.utr}
                        </span>
                      </td>
                      <td className="p-4">
                        {c.screenshotUrl && (
                          <button 
                            onClick={() => setSelectedScreenshot(c.screenshotUrl)}
                            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-sm"
                          >
                            <Eye className="w-4 h-4" /> View Receipt
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleAction(c.id, "APPROVED")}
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleAction(c.id, "REJECTED")}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedScreenshot(null)}>
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-4">
            <button className="absolute top-4 right-4 bg-white dark:bg-[#111827]/10 p-2 rounded-full text-white hover:bg-white dark:bg-[#111827]/20 transition-colors z-10">
              <XCircle className="w-6 h-6" />
            </button>
            <div className="relative w-full h-[70vh]">
              <Image src={selectedScreenshot} alt="Payment Receipt" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

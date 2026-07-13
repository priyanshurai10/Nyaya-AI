"use client";

import React, { useState } from "react";
import { Store, Plus, Search, Filter, CheckCircle, Edit, Trash2, XCircle } from "lucide-react";

export default function AdminMarketplacePage() {
  const [activeTab, setActiveTab] = useState("active");

  const services = [
    { id: 1, title: "Talk to Senior Legal Specialist", category: "Consultation", price: "₹200", status: "active", orders: 1240 },
    { id: 2, title: "Legal Notice Drafting", category: "Drafting", price: "₹999", status: "active", orders: 856 },
    { id: 3, title: "Property Title Verification", category: "Property", price: "₹2,500", status: "active", orders: 312 },
    { id: 4, title: "Startup Incorporation", category: "Corporate", price: "₹5,000", status: "inactive", orders: 0 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-bold text-2xl text-slate-900 dark:text-white flex items-center gap-3">
            <Store className="text-[#FF9933] w-7 h-7" />
            Marketplace Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Manage legal services, pricing, and availability.</p>
        </div>
        
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#FF9933] hover:bg-orange-600 text-white font-medium rounded-xl transition-colors">
          <Plus className="w-5 h-5" />
          Add New Service
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'active' ? 'bg-white dark:bg-slate-900 text-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500'}`}
            >
              Active Services
            </button>
            <button 
              onClick={() => setActiveTab('inactive')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'inactive' ? 'bg-white dark:bg-slate-900 text-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-400 dark:text-slate-500'}`}
            >
              Inactive
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Search services..." 
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#FF9933] dark:text-white"
              />
            </div>
            <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-[#0B1220] text-slate-600 dark:text-slate-400 dark:text-slate-500">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 dark:text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Service Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Total Orders</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {services.filter(s => s.status === activeTab).map(service => (
                <tr key={service.id} className="hover:bg-slate-50 dark:bg-[#0B1220] dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{service.title}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 dark:text-slate-500">{service.category}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{service.price}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 dark:text-slate-500">{service.orders}</td>
                  <td className="px-6 py-4">
                    {service.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500">
                        <XCircle className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.filter(s => s.status === activeTab).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No {activeTab} services found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

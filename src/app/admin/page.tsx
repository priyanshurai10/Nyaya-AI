"use client";

import React from "react";
import { LayoutDashboard, Users, CreditCard, Activity, Search, Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function AdminPage() {
  const stats = [
    { title: "Total Users", value: "24,592", change: "+12%", trend: "up" },
    { title: "Active Cases", value: "1,204", change: "+5%", trend: "up" },
    { title: "Consultations Today", value: "48", change: "-2%", trend: "down" },
    { title: "Revenue (Monthly)", value: "₹4.2L", change: "+18%", trend: "up" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-6">
      {/* Admin Navbar */}
      <div className="flex items-center justify-between mb-8 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-[#FF9933] w-6 h-6" />
          <h1 className="font-bold text-xl text-slate-900 dark:text-white">Admin Control Center</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10" />
            <Input 
              type="text" 
              placeholder="Search users or cases..." 
              className="pl-9 bg-slate-50 dark:bg-[#0B1220]"
            />
          </div>
          <button className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-white dark:hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                <span className={`text-sm font-bold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> System Activity
            </CardTitle>
            <button className="text-sm font-medium text-blue-600 hover:underline">View All</button>
          </CardHeader>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:bg-[#0B1220] dark:hover:bg-slate-800/30">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">New advocate registration (ID: ADV-{900+i})</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{i * 10} minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <button className="w-full text-left px-4 py-3 bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-[#FF9933] transition-colors">
              Verify Advocate Profiles (12 Pending)
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-[#FF9933] transition-colors">
              Review Dispute Flags (3 New)
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-[#FF9933] transition-colors">
              System Configuration
            </button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

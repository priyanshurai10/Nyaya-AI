"use client";

import React, { useState } from "react";
import { Bell, FileText, Landmark, MessageSquare, Scale, Calendar, ShieldAlert } from "lucide-react";

export default function NotificationCenterPage() {
  const [activeTab, setActiveTab] = useState("all");

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/v1/notifications");
        const data = await res.json();
        if (data.success && data.data) {
          setNotifications(data.data.map((n: any) => ({
            id: n.id,
            category: n.category || "system",
            title: n.title,
            desc: n.message,
            date: n.created_at ? new Date(n.created_at).toLocaleDateString() : "Just now",
            read: n.is_read
          })));
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const toggleRead = async (id: string | number, currentReadStatus: boolean) => {
    // optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
    try {
      if (!currentReadStatus) {
        await fetch(`/api/v1/notifications/${id}/read`, { method: "PUT" });
      }
    } catch (err) {
      // revert on failure
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: currentReadStatus } : n));
    }
  };

  const filtered = activeTab === "all" ? notifications : notifications.filter(n => n.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Bell className="w-8 h-8 text-[#FF9933]" />
          Notification Center
        </h1>
        <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500 mt-2">
          Stay updated with the latest laws, court hearings, and system alerts.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide">
          {[
            { id: "all", label: "All Updates" },
            { id: "laws", label: "Latest Laws" },
            { id: "cases", label: "Hearing Reminders" },
            { id: "judgments", label: "SC/HC Judgments" },
            { id: "system", label: "Nyaya AI Alerts" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${ activeTab === tab.id ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800" }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading notifications...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                No notifications in this category.
              </div>
            ) : (
              filtered.map(notification => {
                let Icon = MessageSquare;
                let colorClass = "text-purple-500 bg-purple-50 dark:bg-purple-500/10";
                
                if (notification.category === "laws") {
                  Icon = FileText;
                  colorClass = "text-blue-500 bg-blue-50 dark:bg-blue-500/10";
                } else if (notification.category === "cases") {
                  Icon = Calendar;
                  colorClass = "text-[#FF9933] bg-orange-50 dark:bg-orange-500/10";
                } else if (notification.category === "judgments") {
                  Icon = Scale;
                  colorClass = "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10";
                }

                return (
                  <div key={notification.id} className={`p-6 flex gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${!notification.read ? 'bg-slate-50/50 dark:bg-slate-800/10' : ''}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h3 className={`font-bold ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{notification.date}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500 text-sm leading-relaxed">
                        {notification.desc}
                      </p>
                    </div>
                    {!notification.read ? (
                      <button onClick={() => toggleRead(notification.id, false)} className="w-2.5 h-2.5 bg-[#FF9933] rounded-full shrink-0 mt-2 hover:scale-125 transition-transform" title="Mark as Read"></button>
                    ) : (
                      <button onClick={() => toggleRead(notification.id, true)} className="text-xs text-slate-400 hover:text-slate-500 dark:text-slate-400 dark:hover:text-slate-300 transition-colors h-fit mt-1">Undo</button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookIcon(props: any) {
  return <FileText {...props} />;
}

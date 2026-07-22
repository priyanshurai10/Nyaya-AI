"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Video, User, Plus, ChevronLeft, ChevronRight, AlertCircle, X, Check, Trash2, BellRing, MessageSquare } from "lucide-react";

const EVENT_COLORS: Record<string, string> = {
  hearing: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800",
  filing: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  notice_deadline: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  rti_deadline: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800",
  consultation: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
};

const EVENT_LABELS: Record<string, string> = {
  hearing: "Court Hearing",
  filing: "Filing Deadline",
  notice_deadline: "Notice Deadline",
  rti_deadline: "RTI Deadline",
  consultation: "Advocate Consultation",
};

function formatDateLabel(dateStr: string) {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function getDaysUntil(dateStr: string) {
  try {
    const target = new Date(dateStr + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff < 0) return `${Math.abs(diff)}d ago`;
    return `In ${diff} days`;
  } catch {
    return "";
  }
}

function getDayOfMonth(dateStr: string) {
  try {
    return new Date(dateStr + "T00:00:00").getDate();
  } catch {
    return "?";
  }
}

function getMonthYear(dateStr: string) {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { month: "short", year: "numeric" }).toUpperCase();
  } catch {
    return "";
  }
}

export default function LitigationCalendarPage() {
  const [view, setView] = useState("upcoming");
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", event_type: "hearing", event_date: "", court: "", notes: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/calendar");
      const data = await res.json();
      if (data.success && data.data) {
        setEvents(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch calendar events:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = async () => {
    setAddError("");
    if (!addForm.title.trim() || !addForm.event_date) {
      setAddError("Please provide an Event Title and Date.");
      return;
    }
    setIsAdding(true);
    try {
      const res = await fetch("/api/v1/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm)
      });
      const data = await res.json();
      if (data.success) {
        setAddSuccess(true);
        const addedTitle = addForm.title;
        const addedDate = addForm.event_date;

        setAddForm({ title: "", event_type: "hearing", event_date: "", court: "", notes: "" });
        await fetchEvents();

        // Trigger live in-app notification & alert confirmation
        setNotificationMsg(`🔔 Event Scheduled & Reminder Activated: "${addedTitle}" on ${addedDate}`);
        setTimeout(() => setNotificationMsg(null), 5000);

        setTimeout(() => {
          setShowAddModal(false);
          setAddSuccess(false);
        }, 1200);
      } else {
        setAddError(data.detail || "Failed to add event.");
      }
    } catch (e) {
      setAddError("Network error. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await fetch(`/api/v1/calendar/${id}`, { method: "DELETE" });
      setEvents(prev => prev.filter(e => e.id !== id));
      setNotificationMsg("Event removed from calendar.");
      setTimeout(() => setNotificationMsg(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const sendWhatsAppReminder = (eventTitle: string, eventDate: string) => {
    const text = encodeURIComponent(`Hi Priyanshu (@priyanshu.rai18), please activate WhatsApp court hearing alert for my event: "${eventTitle}" scheduled on ${eventDate}.`);
    window.open(`https://wa.me/917541881152?text=${text}`, "_blank");
  };

  const now = new Date();
  const filteredEvents = events.filter(e => {
    const d = new Date(e.date + "T00:00:00");
    return view === "upcoming" ? d >= new Date(now.toDateString()) : d < new Date(now.toDateString());
  });

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const monthName = new Date(calYear, calMonth, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const eventDates = new Set(events.map(e => {
    const d = new Date(e.date + "T00:00:00");
    return d.getFullYear() === calYear && d.getMonth() === calMonth ? d.getDate() : -1;
  }));

  const todayDay = today.getFullYear() === calYear && today.getMonth() === calMonth ? today.getDate() : -1;

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8">
      {/* Active Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <BellRing className="w-5 h-5" />
          <span className="text-sm font-semibold">{notificationMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-[#FF9933]" />
              Court & Litigation Agenda Calendar
            </h1>
            <p className="text-slate-600 dark:text-[var(--text-muted)] mt-2">
              Track court hearings, statutory filing deadlines, RTI replies, and advocate consultations with live WhatsApp & system reminders.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF9933] hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-sm w-full md:w-auto"
          >
            <Plus className="w-5 h-5" />
            Add Court Event
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <div className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--text-primary)] text-sm">{monthName}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
                <button
                  onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold mb-2 text-[var(--text-muted)]">
              {["S","M","T","W","T","F","S"].map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {[...Array(firstDayOfMonth)].map((_, i) => <div key={`e-${i}`} />)}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const isToday = day === todayDay;
                const hasEvent = eventDates.has(day);
                return (
                  <div
                    key={day}
                    className={`py-1.5 rounded-lg text-xs relative cursor-default ${
                      isToday
                        ? "bg-[#FF9933] text-white font-bold"
                        : hasEvent
                        ? "bg-[#138808]/15 text-[#138808] dark:text-emerald-400 font-bold border border-[#138808]/30"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {day}
                    {hasEvent && !isToday && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#138808] dark:bg-emerald-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Direct Reminders Widget */}
          <div className="bg-gradient-to-br from-[#138808] to-emerald-700 rounded-2xl p-6 text-white shadow-md">
            <MessageSquare className="w-8 h-8 mb-3 text-white/90" />
            <h3 className="font-bold text-lg mb-1">WhatsApp Instant Alerts</h3>
            <p className="text-white/90 text-xs leading-relaxed mb-4">
              Connect your events to WhatsApp: <strong>@priyanshu.rai18</strong> (+91 7541881152) to receive automated 24-hour hearing intimation alerts.
            </p>
            <button
              onClick={() => window.open("https://wa.me/917541881152?text=Hi%20Priyanshu%20(@priyanshu.rai18),%20I%20want%20to%20enable%20WhatsApp%20Court%20Hearing%20Reminders%20for%20my%20Nyaya%20AI%20Calendar.", "_blank")}
              className="px-4 py-2.5 bg-white text-emerald-800 text-xs font-black rounded-xl shadow hover:bg-emerald-50 w-full transition-colors flex items-center justify-center gap-2"
            >
              💬 Connect WhatsApp Alerts
            </button>
          </div>
        </div>

        {/* Agenda List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex bg-[var(--card)] rounded-xl p-1 border border-slate-200 dark:border-slate-800 w-fit mb-2">
            <button
              onClick={() => setView("upcoming")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "upcoming" ? "bg-[#FF9933] text-white font-bold" : "text-slate-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            >
              Upcoming Hearings & Deadlines
            </button>
            <button
              onClick={() => setView("past")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "past" ? "bg-slate-200 dark:bg-slate-800 text-[var(--text-primary)] font-bold" : "text-slate-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            >
              Past Events
            </button>
          </div>

          {isLoading ? (
            <div className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9933] mx-auto mb-3" />
              <p className="text-[var(--text-muted)] text-sm">Loading calendar schedule...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">No {view} events found</h3>
              <p className="text-[var(--text-muted)] text-sm">Click "Add Court Event" above to schedule your court date or legal notice deadline.</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md transition-shadow flex gap-4 group">
                {/* Date Box */}
                <div className="hidden sm:flex flex-col items-center justify-center w-20 shrink-0 border-r border-slate-100 dark:border-slate-800 pr-4 text-center">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
                    {getMonthYear(event.date).split(" ")[0]}
                  </span>
                  <span className="text-3xl font-black text-[var(--text-primary)] leading-none my-1">
                    {getDayOfMonth(event.date)}
                  </span>
                  <span className="text-[10px] text-[#FF9933] font-bold">
                    {getDaysUntil(event.date)}
                  </span>
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${EVENT_COLORS[event.type] || "bg-slate-100 text-slate-600"}`}>
                      {EVENT_LABELS[event.type] || event.type}
                    </span>
                    {event.court && (
                      <span className="text-xs text-[var(--text-muted)] font-medium">
                        📍 {event.court}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1 leading-snug">{event.title}</h3>
                  {event.notes && (
                    <p className="text-xs text-[var(--text-muted)] mb-3">{event.notes}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#FF9933]" />
                      <span>{formatDateLabel(event.date)}</span>
                    </div>
                    <button
                      onClick={() => sendWhatsAppReminder(event.title, event.date)}
                      className="text-xs font-bold text-[#138808] dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      💬 Send to WhatsApp (@priyanshu.rai18)
                    </button>
                  </div>
                </div>
                {/* Delete */}
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all self-start"
                  title="Remove Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-[var(--card)] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Add Court Hearing / Event</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {addSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <p className="font-bold text-[var(--text-primary)]">Event & Reminders Scheduled!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Event Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Property Dispute Hearing — Delhi Court"
                    value={addForm.title}
                    onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Event Category *</label>
                  <select
                    value={addForm.event_type}
                    onChange={e => setAddForm(f => ({ ...f, event_type: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933] appearance-none"
                  >
                    <option value="hearing">Court Hearing</option>
                    <option value="filing">Filing Deadline (Rejoinder/Affidavit)</option>
                    <option value="notice_deadline">Legal Notice 15-Day Deadline</option>
                    <option value="rti_deadline">RTI Appeal Deadline</option>
                    <option value="consultation">Advocate Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Court / Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi High Court, Courtroom 5"
                    value={addForm.court}
                    onChange={e => setAddForm(f => ({ ...f, court: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Event Date *</label>
                  <input
                    type="date"
                    value={addForm.event_date}
                    onChange={e => setAddForm(f => ({ ...f, event_date: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  />
                </div>
                {addError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {addError}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEvent}
                    disabled={isAdding}
                    className="flex-1 py-3 bg-[#FF9933] hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isAdding ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? "Adding..." : "Add Event"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

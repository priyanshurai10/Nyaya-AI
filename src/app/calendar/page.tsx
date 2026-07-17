"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Video, User, Plus, Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

export default function LitigationCalendarPage() {
  const [view, setView] = useState("upcoming");

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    fetch("/api/v1/calendar")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setEvents(data.data.map((e: any) => ({
            id: e.id,
            title: e.title,
            date: e.date ? new Date(e.date).toLocaleString() : "TBD",
            type: e.type || "Event",
            mode: "Physical",
            location: e.location || "TBD",
            advocate: "Self-Represented",
            urgent: false
          })));
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);
  return (
    <div className="min-h-screen bg-[var(--background)] p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-[#FF9933]" />
              Agenda Calendar
            </h1>
            <p className="text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-2">
              Keep track of court hearings, filing deadlines, RTI replies, and legal consultations.
            </p>
          </div>
          
          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF9933] hover:bg-orange-600 text-white font-medium rounded-xl transition-colors shadow-sm w-full md:w-auto">
            <Plus className="w-5 h-5" />
            Add Event
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Mini Calendar / Sidebar */}
        <div className="space-y-6">
          <div className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--text-primary)]">November 2023</h3>
              <div className="flex gap-2">
                <button className="p-1 hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-[var(--card-elevated)] rounded"><ChevronLeft className="w-5 h-5" /></button>
                <button className="p-1 hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-[var(--card-elevated)] rounded"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            
            {/* Extremely simple calendar grid placeholder */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium mb-2 text-[var(--text-muted)]">
              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {[...Array(30)].map((_, i) => (
                <div 
                  key={i} 
                  className={`py-1.5 rounded-lg cursor-pointer ${ i === 10 ? "bg-[#FF9933] text-white font-bold" : (i === 11 || i === 14) ? "bg-slate-100 dark:bg-slate-800 text-[#FF9933]" : "text-slate-700 dark:text-slate-300 hover:bg-[var(--background)] dark:hover:bg-[var(--card-elevated)]" }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#138808] to-green-700 rounded-2xl p-6 text-white shadow-md">
            <Clock className="w-8 h-8 mb-4 text-white/80" />
            <h3 className="font-bold text-lg mb-1">WhatsApp Reminders</h3>
            <p className="text-white/80 text-sm mb-4">
              Get notified 24 hours before your next court hearing directly on WhatsApp.
            </p>
            <button className="px-4 py-2 bg-[var(--card)] text-green-700 text-sm font-bold rounded-lg shadow-sm hover:bg-[var(--background)] w-full">
              Enable Reminders
            </button>
          </div>
        </div>

        {/* Agenda List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex bg-[var(--card)] rounded-xl p-1 border border-slate-200 dark:border-slate-800 w-fit mb-2">
            <button 
              onClick={() => setView('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'upcoming' ? 'bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)]' : 'text-slate-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-white'}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setView('past')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'past' ? 'bg-slate-100 dark:bg-slate-800 text-[var(--text-primary)]' : 'text-slate-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-white'}`}
            >
              Past Events
            </button>
          </div>

          {isLoading ? (
            <div className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-[var(--text-muted)]">
              Loading calendar events...
            </div>
          ) : events.length === 0 ? (
            <div className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-[var(--text-muted)]">
              No events found.
            </div>
          ) : events.map((event) => (
            <div key={event.id} className="bg-[var(--card)] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md transition-shadow flex gap-4">
              
              {/* Date Box */}
              <div className="hidden sm:flex flex-col items-center justify-center w-20 shrink-0 border-r border-slate-100 dark:border-slate-800 pr-4">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase">NOV</span>
                <span className="text-2xl font-black text-[var(--text-primary)]">{event.date.includes("Tomorrow") ? "11" : event.date.split(" ")[0]}</span>
              </div>

              {/* Event Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${ event.type === 'Hearing' ? 'bg-red-50 dark:bg-[var(--danger-subtle)] text-red-600 dark:text-[var(--danger)]' : event.type === 'Meeting' ? 'bg-blue-50 bg-[var(--primary-subtle)] text-blue-600 dark:text-[var(--primary)]' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' }`}>
                    {event.type}
                  </span>
                  {event.urgent && (
                    <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                      <AlertCircle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{event.title}</h3>
                
                <div className="space-y-1.5 text-sm text-slate-600 dark:text-[var(--text-muted)] dark:text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 dark:text-[var(--text-muted)]" /> {event.date}
                  </div>
                  <div className="flex items-center gap-2">
                    {event.mode === 'Virtual' ? <Video className="w-4 h-4 text-slate-400 dark:text-[var(--text-muted)]" /> : <MapPin className="w-4 h-4 text-slate-400 dark:text-[var(--text-muted)]" />}
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 dark:text-[var(--text-muted)]" />
                    {event.advocate}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

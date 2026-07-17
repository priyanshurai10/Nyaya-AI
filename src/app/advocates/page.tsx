'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import PincodeSearch from '@/components/PincodeSearch';
import { apiClient } from '@/lib/api-client';
import { translations } from '@/lib/translations';
import {
  Award,
  Calendar,
  Clock,
  Briefcase,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  Phone,
  Bookmark,
  ChevronRight,
  BookOpen,
  X,
} from 'lucide-react';

interface Advocate {
  id: number;
  name: string;
  experience_years: number;
  practice_areas: string; // JSON string in DB
  languages: string; // JSON string in DB
  phone_number: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  rating: number;
  reviews_count: number;
  court_association: string;
  chamber_address: string;
  office_address: string;
  consultation_fees: number;
  availability_status: string;
}

export default function VerifiedAdvocatesPage() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyState, setEmptyState] = useState(false);
  const [selectedAdvocate, setSelectedAdvocate] = useState<Advocate | null>(null);

  // Booking states
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'confirming' | 'pending' | 'success'>('idle');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const searchAbortControllerRef = useRef<AbortController | null>(null);

  // Sync language selection
  React.useEffect(() => {
    const savedLang = localStorage.getItem('nyaya_lang') || 'en';
    setSelectedLang(savedLang);

    const handleLangChange = () => {
      setSelectedLang(localStorage.getItem('nyaya_lang') || 'en');
    };
    window.addEventListener('nyaya_lang_changed', handleLangChange);
    return () => window.removeEventListener('nyaya_lang_changed', handleLangChange);
  }, []);

  const t = useCallback((key: string): string => {
    const entry = (translations as Record<string, Record<string, string>>)[key];
    return entry?.[selectedLang] || entry?.['en'] || key;
  }, [selectedLang]);

  const fetchDiscoveryData = async (loc?: any) => {
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    searchAbortControllerRef.current = controller;
    
    setLoading(true);
    setError(null);
    setEmptyState(false);
    setSelectedAdvocate(null);
    setAdvocates([]);
    
    try {
      // Use location coordinates for nearby advocate search
      const data = await apiClient.post<any>('/advocates/nearby', {
        latitude: loc?.latitude || null,
        longitude: loc?.longitude || null,
        state: loc?.state || null,
        pincode: loc?.pincode || null,
      }, {
        signal: controller.signal,
      });
      
      const results = data?.advocates || data || [];
      if (!Array.isArray(results) || results.length === 0) {
        setEmptyState(true);
      } else {
        setAdvocates(results);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      setError(err.message || 'Failed to load advocates for this location.');
    } finally {
      if (searchAbortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  };

  // Sync location selection on mount and when it changes
  useEffect(() => {
    const handleLocChange = () => {
      const storedLoc = localStorage.getItem('nyaya_location');
      if (storedLoc) {
        try {
          const parsed = JSON.parse(storedLoc);
          fetchDiscoveryData(parsed);
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener('nyaya_location_changed', handleLocChange);
    // Call immediately on mount!
    handleLocChange();

    return () => window.removeEventListener('nyaya_location_changed', handleLocChange);
  }, []);

  const handleLocationResolved = (loc: any) => {
    fetchDiscoveryData(loc);
  };

  const parseJsonStr = (str: string): string[] => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  const startBooking = (adv: Advocate) => {
    setSelectedAdvocate(adv);
    setBookingStatus('confirming');
    setBookingDate('');
    setBookingTime('');
  };

  const submitBooking = async () => {
    if (!selectedAdvocate || !bookingDate || !bookingTime) {
      setError('Please select a valid date and time for consultation.');
      return;
    }
    try {
      setBookingStatus('pending');
      await apiClient.post('/advocates/book', {
        advocate_id: selectedAdvocate.id,
        date: bookingDate,
        time: bookingTime,
        fees: selectedAdvocate.consultation_fees,
        consent_given: true,
      });
      setBookingStatus('success');
    } catch (err: any) {
      setError(err.message || 'Failed to book consultation.');
      setBookingStatus('confirming');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-12 px-4 sm:px-6 transition-colors duration-200 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[var(--primary-subtle)]0/10 text-[var(--primary)] dark:text-[var(--primary)] border border-indigo-500/20 tracking-wider">
              💼 Legal Directory
            </span>
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">
            Verified Advocates Near You
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Find and book consultations with verified legal professionals in your district by entering your PIN code.
          </p>
        </div>

        {/* Pincode Search component */}
        <PincodeSearch
          onLocationResolved={handleLocationResolved}
          storageKey="nyaya_location_key"
        />

        {/* Error message */}
        {error && (
          <div className="max-w-4xl mx-auto mt-4 p-4 bg-red-50 dark:bg-[var(--danger-subtle)] text-red-700 dark:text-[var(--danger)] border border-red-200 dark:border-[var(--danger-subtle)] rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-semibold">{error}</div>
          </div>
        )}

        {/* Empty State */}
        {emptyState && (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto space-y-4">
            <AlertCircle className="w-12 h-12 text-slate-400 dark:text-white/20 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No verified advocates found</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              No verified advocate is currently registered for your selected location pincode. Try PINs like 110001 (Delhi), 400001 (Mumbai), or 560001 (Bengaluru).
            </p>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)] space-y-3">
            <Loader2 className="animate-spin h-8 w-8 text-[var(--primary)] dark:text-blue-500" />
            <p className="text-xs font-semibold">Searching verified database...</p>
          </div>
        )}

        {/* Advocates Listings Grid */}
        {!loading && advocates.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {advocates.map((adv) => (
              <div
                key={adv.id}
                className="bg-[var(--card)] rounded-2xl shadow-sm border border-[var(--border)] p-6 flex flex-col justify-between hover-lift transition-all duration-200"
              >
                <div>
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-[var(--card)]/5 overflow-hidden flex-shrink-0">
                      {adv.photo_url ? (
                        <img src={adv.photo_url} alt={adv.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-white/20 font-bold">
                          {adv.name[0]}
                        </div>
                      )}
                    </div>
                    {/* Details */}
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                        {adv.name}
                        <span className="text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-green-500/10 text-[var(--success)]">
                          Verified
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-white/40 font-medium">
                        ⚖️ {adv.court_association}
                      </p>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500 stroke-none" />
                        {adv.rating.toFixed(1)} <span className="text-slate-400 dark:text-[var(--text-muted)] font-medium">({adv.reviews_count} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Briefcase className="w-4 h-4 text-slate-400 dark:text-[var(--text-muted)]" />
                      <span>{adv.experience_years} Years Experience</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <Clock className="w-4 h-4 text-slate-400 dark:text-[var(--text-muted)]" />
                      <span className="text-green-500">{adv.availability_status}</span>
                    </div>
                  </div>

                  {/* Practice Areas */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {parseJsonStr(adv.practice_areas).map((area, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-extrabold text-indigo-600 dark:text-[var(--primary)] bg-[var(--primary-subtle)] bg-[var(--primary-subtle)] px-2 py-0.5 rounded-md border border-indigo-100 dark:border-blue-500/20 uppercase tracking-wide"
                      >
                        {area}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[var(--border)] space-y-1.5 text-xs text-slate-500 dark:text-white/40">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 dark:text-[var(--text-muted)] mt-0.5 shrink-0" />
                      <span>Office: {adv.office_address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400 dark:text-[var(--text-muted)] mt-0.5 shrink-0" />
                      <span>Languages: {parseJsonStr(adv.languages).join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-[var(--border)] pt-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-[var(--text-muted)]">Consultation Fee</span>
                    <span className="text-lg font-black text-[var(--text-primary)]">
                      ₹{adv.consultation_fees}
                    </span>
                  </div>
                  <button
                    onClick={() => startBooking(adv)}
                    className="px-5 py-2.5 bg-indigo-650 hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/10 flex items-center gap-1.5"
                  >
                    <span>Book Session</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Dialog Modal */}
        {bookingStatus !== 'idle' && selectedAdvocate && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[var(--border)] pb-3">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {bookingStatus === 'success' ? 'Consultation Booked' : 'Confirm Consultation'}
                </h3>
                <button
                  onClick={() => setBookingStatus('idle')}
                  className="p-1 rounded-lg hover:bg-[var(--card-elevated)] text-slate-400 dark:text-[var(--text-muted)]"
                >
                  <X size={16} />
                </button>
              </div>

              {bookingStatus === 'confirming' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-[var(--card)]/5 overflow-hidden">
                      <img src={selectedAdvocate.photo_url} alt="" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedAdvocate.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-[var(--text-muted)]">{selectedAdvocate.court_association}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-[var(--text-muted)] uppercase">Select Date</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-[var(--card)]/[0.02] border border-slate-250 dark:border-[var(--border)] rounded-xl text-[var(--text-primary)] text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-[var(--text-muted)] uppercase">Select Time Slot</label>
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-[var(--card)]/[0.02] border border-slate-250 dark:border-[var(--border)] rounded-xl text-[var(--text-primary)] text-xs font-semibold focus:outline-none"
                      >
                        <option value="">Choose a slot...</option>
                        <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                        <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                        <option value="02:30 PM - 03:00 PM">02:30 PM - 03:00 PM</option>
                        <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-[var(--border)] pt-4 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-[var(--text-muted)]">Total Consultation Fee</span>
                      <span className="text-base font-black text-[var(--text-primary)]">
                        ₹{selectedAdvocate.consultation_fees}
                      </span>
                    </div>
                    <button
                      onClick={submitBooking}
                      disabled={!bookingDate || !bookingTime}
                      className="px-5 py-2.5 bg-indigo-650 hover:bg-[var(--primary-hover)] disabled:bg-slate-200 dark:disabled:bg-slate-800 dark:bg-[var(--card)]/5 text-white text-xs font-bold rounded-xl transition-all shadow"
                    >
                      Confirm Book
                    </button>
                  </div>
                </div>
              )}

              {bookingStatus === 'pending' && (
                <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)] space-y-3">
                  <Loader2 className="animate-spin h-8 w-8 text-[var(--primary)] dark:text-blue-500" />
                  <p className="text-xs font-semibold">Processing booking request...</p>
                </div>
              )}

              {bookingStatus === 'success' && (
                <div className="text-center py-6 space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2 animate-bounce" />
                  <h3 className="text-lg font-black text-[var(--text-primary)]">Request Sent Successfully</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">
                    Your consultation request is pending confirmation from <strong>{selectedAdvocate.name}</strong>. You will be notified once it is accepted.
                  </p>
                  <button
                    onClick={() => setBookingStatus('idle')}
                    className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[var(--card)]/5 dark:hover:bg-[var(--card-elevated)] text-slate-700 dark:text-white/80 rounded-xl text-xs font-bold transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

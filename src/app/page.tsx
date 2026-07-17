'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { translations, LanguageCode } from '@/lib/translations';
import { useLanguage } from '@/context/LanguageContext';
import Logo from '@/components/Logo';
import {
  MessageSquare,
  Upload,
  FileSignature,
  FileCode,
  Scale,
  Shield,
  Layers,
  Award,
  ShieldAlert,
  ArrowRight,
  Compass,
  Briefcase,
  Bookmark,
  ChevronRight,
  Landmark,
  MapPin,
  Users,
  GitCommit,
  CheckCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface SavedCase {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
}

interface BookmarkedCourt {
  court_id: string;
  name: string;
  court_type: string;
  address: string;
}

const localTranslations = {
  welcomeSubtitle: {
    en: "Welcome to India's multilingual legal operating system. Explore legal notice drafting, analyze documents, and receive step-by-step litigation roadmap navigation.",
    hi: "भारत के बहुभाषी कानूनी ऑपरेटिंग सिस्टम में आपका स्वागत है। कानूनी नोटिस का मसौदा तैयार करें, दस्तावेजों का विश्लेषण करें और मुकदमेबाजी यात्राओं का पता लगाएं।",
    bn: "ভারতের বহুভাষিক আইনি অপারেটিং সিস্টেমে আপনাকে স্বাগতম। আইনি নোটিশের খসড়া তৈরি করুন, নথি বিশ্লেষণ করুন এবং মামলা মোকদ্দমার পথ অন্বেষণ করুন।",
    ta: "இந்தியாவின் பன்மொழி சட்ட இயக்க முறைமைக்கு உங்களை வரவேற்கிறோம். சட்ட அறிவிப்பு வரைவுகளை உருவாக்கவும், ஆவணங்களை பகுப்பாய்வு செய்யவும், வழக்கு பயணங்களை ஆராயவும்.",
    te: "భారతదేశపు బహుభాషా న్యాయ ఆపరేటింగ్ సిస్టమ్‌కు స్వాగతం. చట్టపరమైన నోటీసు డ్రాఫ్ట్‌లను రూపొందించండి, పత్రాలను విశ్లేషించండి మరియు వ్యాజ్య మార్గాలను అన్వేషించండి.",
    mr: "भारताच्या बहुभाषिक कायदेशीर ऑपरेटिंग सिस्टममध्ये आपले स्वागत आहे। कायदेशीर नोटीस मसुदा तयार करा, दस्तऐवजांचे विश्लेषण करा आणि कायदेशीर खटल्यांचे टप्पे समजून घ्या।",
    gu: "ભારતના બહુભાષી કાનૂની ઓપરેટિંગ સિસ્ટમમાં આપનું સ્વાગત છે. કાનૂની નોટિસનો ડ્રાફ્ટ બનાવો, દસ્તાવેજોનું વિશ્લેષણ કરો અને મુકદ્દમાના માર્ગો શોધો.",
    kn: "ಭಾರತದ ಬಹುಭಾಷಾ ಕಾನೂನು ಆಪರೇಟಿಂಗ್ ಸಿಸ್ಟಮ್‌ಗೆ ಸುಸ್ವಾಗತ. ಕಾನೂನು ನೋಟಿಸ್ ಕರಡುಗಳನ್ನು ರಚಿಸಿ, ದಾಖಲೆಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ಮೊಕದ್ದಮೆ ಮಾರ್ಗಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
    ml: "ഇന്ത്യയിലെ ബഹുഭാഷാ നിയമ ഓപ്പറേറ്റിംഗ് സിസ്റ്റത്തിലേക്ക് സ്വാഗതം. നിയമപരമായ നോട്ടീസ് ഡ്രാഫ്റ്റുകൾ നിർമ്മിക്കുക, രേഖകൾ വിശകലനം ചെയ്യുക, നിയമവഴികൾ പരിശോധിക്കുക.",
    pa: "ਭਾਰਤ ਦੇ ਬਹੁ-ਭਾਸ਼ਾਈ ਕਾਨੂੰਨੀ ਓਪਰੇਟਿੰਗ ਸਿਸਟਮ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਕਾਨੂੰਨੀ ਨੋਟਿਸ ਡਰਾਫਟ ਤਿਆਰ ਕਰੋ, ਦਸਤਾਵੇਜ਼ਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ ਅਤੇ ਮੁਕੱਦਮੇਬਾਜ਼ੀ ਯਾਤਰਾਵਾਂ ਦੀ ਖੋਜ ਕਰੋ।",
  },
  guestTitle: {
    en: "Explore Legal Cockpit",
    hi: "कानूनी कॉकपिट का अन्वेषण करें",
    bn: "আইনি ককপিট অন্বেষণ করুন",
    ta: "சட்ட காக்பிட்டை ஆராயுங்கள்",
    te: "న్యాయ కాక్‌పిట్‌ను అన్వేషించండి",
    mr: "कायदेशीर कॉकपिट एक्सप्लोर करा",
    gu: "કાનૂની કૉકપિટનું અન્વેષણ કરો",
    kn: "ಕಾನೂನು ಕಾಕ್‌ಪಿಟ್ ಅನ್ವೇಷಿಸಿ",
    ml: "നിയമ കോക്ക്പിറ്റ് പരിശോധിക്കുക",
    pa: "ਕਾਨੂੰਨੀ ਕਾਕਪਿਟ ਦੀ ਖੋਜ ਕਰੋ",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { selectedLang, t } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);

  // User Session
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('Citizen');
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [bookmarkedCourts, setBookmarkedCourts] = useState<BookmarkedCourt[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Sync splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Fetch authenticated user dashboard data
  useEffect(() => {
    const userDataStr = localStorage.getItem('nyaya_user');
    // token is an HttpOnly cookie now, so we can't check it here

    if (userDataStr) {
      setIsAuthenticated(true);
      try {
        const userData = JSON.parse(userDataStr);
        setUsername(userData.name || 'Citizen');
        fetchUserData();
      } catch (e) {
        console.error('Failed to parse user session context', e);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [showSplash]);

  const fetchUserData = async () => {
    setStatsLoading(true);
    try {
      const casesRes = await apiClient.get('/user/cases', { redirectOnAuthError: false });
      if (casesRes && Array.isArray(casesRes)) {
        setSavedCases(casesRes);
      } else if (casesRes && casesRes.success) {
        setSavedCases(casesRes.data);
      }

      const bookmarksRes = await apiClient.get('/user/bookmarks', { redirectOnAuthError: false });
      if (bookmarksRes && Array.isArray(bookmarksRes)) {
        setBookmarkedCourts(bookmarksRes);
      } else if (bookmarksRes && bookmarksRes.success) {
        setBookmarkedCourts(bookmarksRes.data);
      }
    } catch (e) {
      console.warn('Could not fetch user profile details:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nyaya_token');
    localStorage.removeItem('nyaya_user');
    setIsAuthenticated(false);
    setSavedCases([]);
    setBookmarkedCourts([]);
    router.push('/auth');
  };

  const lt = (key: keyof typeof localTranslations) => {
    return localTranslations[key]?.[selectedLang] || localTranslations[key]?.['en'] || key;
  };

  // Splash Screen Layout
  if (showSplash) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col items-center justify-center space-y-6 font-sans relative overflow-hidden">
        <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-[#138808]/10 via-white/5 to-[#FF9933]/10 blur-[80px] animate-pulse" />
        <div className="relative flex flex-col items-center text-center space-y-4">
          <Logo animated={true} size={100} />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent">
            {t('brandName')}
          </h1>
          <p className="text-xs text-[var(--text-muted)] max-w-xs leading-normal">{t('brandSubtitle')}</p>
        </div>
        <div className="absolute bottom-10 flex flex-col items-center space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-450 dark:text-[var(--text-muted)] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Digital India Initiative</span>
          </div>
          <p className="text-[9px] text-slate-400 dark:text-[var(--text-muted)]">Loading localized workspace directories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] px-4 py-8 sm:px-6 space-y-10 relative overflow-hidden font-sans select-none">
      
      {/* Background glowing orbs */}
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.02] blur-[120px] bg-gradient-to-tr from-[#FF9933] to-[#138808] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.02] blur-[100px] bg-[#00d2ff] -bottom-20 -right-20 pointer-events-none" />

      {/* Dynamic Welcome Header Banner */}
      <div className="premium-card p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF9933]/5 to-[#138808]/5 opacity-30" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isAuthenticated ? `Namaste, ${username}!` : lt('guestTitle')}
          </h2>
          <p className="text-xs text-slate-600 dark:text-[var(--text-muted)] leading-relaxed max-w-3xl">{lt('welcomeSubtitle')}</p>
        </div>
        <div className="relative z-10 shrink-0">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-[var(--danger-subtle)] hover:bg-red-500/20 text-red-650 dark:text-[var(--danger)] text-xs border border-[var(--danger-subtle)] rounded-xl font-bold transition-all"
            >
              Log Out Session
            </button>
          ) : (
            <Link
              href="/auth"
              className="px-5 py-3 bg-[#0F172A] dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-lg transition-all inline-block hover:scale-[1.02]"
            >
              🔐 Citizen Login / Register
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-12">
        
        {/* Section A: Functional Legal Cockpit */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933]" />
            <h3 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider">
              ⚖️ Fully Functional Tools
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Link href="/chat" className="premium-card premium-card-hover p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <MessageSquare size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  AI Legal Chat
                </h4>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                  Interact with our multilingual Indic AI lawyer to get instant guidance on laws, sections, and disputes.
                </p>
              </div>
            </Link>

            <Link href="/consultation" className="premium-card premium-card-hover p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Briefcase size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  Consult Senior Specialist
                </h4>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                  Book a confidential 30-minute consultation call with a Bar Council verified senior advocate.
                </p>
              </div>
            </Link>

            <Link href="/documents" className="premium-card premium-card-hover p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Upload size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  Document Analyzer
                </h4>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                  Upload legal notices, rent agreements, or property deeds for instant contract risk classification.
                </p>
              </div>
            </Link>

            <Link href="/drafts?template=police_complaint" className="premium-card premium-card-hover p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <FileSignature size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  Complaint Generator
                </h4>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                  Generate formatted citizen complaint drafts for local police cells, cyber units, or consumer cells.
                </p>
              </div>
            </Link>

            <Link href="/drafts?template=legal_notice" className="premium-card premium-card-hover p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <FileCode size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  Legal Notice Generator
                </h4>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                  Draft professional legal notice letters for recovery of dues, breaches, tenancy issues, and disputes.
                </p>
              </div>
            </Link>

            <Link href="/chat?mode=fir" className="premium-card premium-card-hover p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-[var(--primary)]">
                <Scale size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  FIR Assistant
                </h4>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                  Structure details for First Information Reports to ensure clear timelines, witness logs, and legal codes.
                </p>
              </div>
            </Link>

            <Link href="/chat?mode=rights" className="premium-card premium-card-hover p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Shield size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  Legal Rights Guide
                </h4>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                  Quickly discover your constitutional rights, basic legal remedies, police detention protections, and bail rules.
                </p>
              </div>
            </Link>

          </div>
        </section>

        {/* Section B: Upcoming Features Roadmap */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h3 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider">
              🚀 Upcoming Features (Coming Soon)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Verified Courts Card */}
            <div className="premium-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-[var(--primary)]"><Landmark size={18} /></div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Verified Courts</h4>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-blue-500/10 text-blue-600 dark:text-[var(--primary)] border border-blue-500/20">Roadmap</span>
                </div>
                <div className="space-y-2 text-xs">
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong className="text-[var(--text-primary)]">What users will get:</strong> Find nearby local courts automatically including District, Sessions, High, Supreme, Consumer, Family, Labour, and Commercial courts. Access interactive route directions, office timings, websites, judge bios, and jurisdiction limits.
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    <strong className="text-slate-700 dark:text-slate-200">How it works:</strong> Fully geocoded searches matching input PIN Codes and active GPS location. Applies intelligent filters based on government datasets.
                  </p>
                </div>
              </div>
            </div>

            {/* Verified Advocates Card */}
            <div className="premium-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[var(--primary-subtle)]0/10 text-[var(--primary)]"><Award size={18} /></div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Verified Advocates</h4>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-[var(--primary-subtle)]0/10 text-[var(--primary)] border border-indigo-500/20">Roadmap</span>
                </div>
                <div className="space-y-2 text-xs">
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong className="text-[var(--text-primary)]">What users will get:</strong> Discover vetted advocates in your municipality. Filter by practice experience, practice areas (criminal, title partition, consumer disputes), spoken languages, citizen ratings, and consultation fees.
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    <strong className="text-slate-700 dark:text-slate-200">How it works:</strong> Book consultations directly, schedule secure video consult calls, upload document packages for legal reviews, and track appointments.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section C: Our On-Ground Implementation Plan */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider">
              🏛️ Building India&apos;s Largest Legal Assistance Network
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Police Integration */}
            <div className="premium-card p-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl"><ShieldAlert size={16} /></div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Police Integration</h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-300 leading-relaxed">
                Partnering with local Police Stations, District Police HQ, Women&apos;s Protection Cells, Cyber Crime Divisions, and Traffic Police Units. Verification modules allow station heads to verify contacts, manage citizen FIR helper drafts, and guide citizens.
              </p>
            </div>

            {/* Bar Association Verification */}
            <div className="premium-card p-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl"><Users size={16} /></div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Advocate Verification</h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-300 leading-relaxed">
                Working with State Bar Councils, District Bar Associations, and High Court Bar Associations. All advocate listings must pass registration credential checks, identity verification, office location confirmation, and active practice audits.
              </p>
            </div>

          </div>

          {/* Citizen Workflow Chart */}
          <div className="premium-card p-6 space-y-6">
            <h4 className="text-xs font-bold text-[var(--text-primary)] text-center">Citizen Journey Workflow</h4>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 max-w-4xl mx-auto">
              {[
                { step: '1', title: 'Citizen Input', desc: 'Describe Legal Problem' },
                { step: '2', title: 'AI Engine', desc: 'Structure Analysis' },
                { step: '3', title: 'Rights Mapping', desc: 'Suggest Legal Rights' },
                { step: '4', title: 'Verified Expert', desc: 'Connect to Advocate' },
                { step: '5', title: 'Police Help', desc: 'Station Sync' },
                { step: '6', title: 'Console Tracking', desc: 'Monitor Progress' }
              ].map((item, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center text-center space-y-1.5 z-10 bg-slate-100 dark:bg-[var(--card)] border border-slate-200/50 dark:border-[var(--border)] px-3 py-2.5 rounded-xl relative">
                    <span className="w-6 h-6 rounded-full bg-[var(--primary-subtle)]0/10 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-[var(--primary)]">
                      {item.step}
                    </span>
                    <h5 className="text-[10px] font-bold text-[var(--text-primary)]">{item.title}</h5>
                    <p className="text-[9px] text-[var(--text-muted)] leading-normal max-w-[120px]">{item.desc}</p>
                  </div>
                  {idx < 5 && (
                    <div className="hidden md:block flex-1 h-[2px] bg-gradient-to-r from-indigo-500/25 to-indigo-500/5 min-w-[30px]" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Section D: Personal Area (Synced Cases & Bookmarks) */}
        {isAuthenticated && (savedCases.length > 0 || bookmarkedCourts.length > 0) && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider">
                {t('dashPersonalArea')}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Saved Cases */}
              {savedCases.length > 0 && (
                <div className="premium-card p-6 space-y-4">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border)] pb-2.5">
                    <Briefcase size={14} className="text-[#FF9933]" />
                    {t('sidebarSavedCases')} ({savedCases.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {savedCases.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-[var(--card)] border border-slate-200/50 dark:border-[var(--border)] flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-200">{c.title}</h5>
                          <p className="text-[9px] text-[var(--text-muted)] uppercase">{c.category}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] uppercase font-bold">
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookmarked Courts */}
              {bookmarkedCourts.length > 0 && (
                <div className="premium-card p-6 space-y-4">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border)] pb-2.5">
                    <Bookmark size={14} className="text-[#138808]" />
                    {t('sidebarBookmarks')} ({bookmarkedCourts.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {bookmarkedCourts.map((b) => (
                      <div key={b.court_id} className="p-3 rounded-xl bg-slate-50 dark:bg-[var(--card)] border border-slate-200/50 dark:border-[var(--border)] flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-200">{b.name}</h5>
                          <p className="text-[9px] text-[var(--text-muted)] truncate max-w-xs">{b.address}</p>
                        </div>
                        <span className="text-slate-500 dark:text-white/30 font-bold uppercase tracking-wider text-[8px]">Saved</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Section E: Nationwide Expansion Banner */}
        <section className="pt-4">
          <div className="premium-card p-6 sm:p-8 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-subtle)]0/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <div className="p-1 bg-[#138808]/15 text-[#138808] rounded">
                <Compass size={15} className="animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">🌍 Nationwide Expansion</h4>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
              Nyaya AI is actively building India&apos;s largest verified legal assistance platform. Our goal is to connect citizens with verified legal institutions and counsel in every village, town, and district of India.
            </p>

            <div className="space-y-2">
              <h5 className="text-[10px] font-black text-slate-450 dark:text-[var(--text-muted)] uppercase tracking-widest">Upcoming Release Integrations:</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-[10px] text-slate-600 dark:text-[var(--text-muted)] font-semibold">
                {[
                  'Verified Courts Search',
                  'Verified Advocates Registry',
                  'Nearby Police Stations',
                  'Legal Aid Centers',
                  'Government Services',
                  'GPS Discovery Map',
                  'Real-time Case Tracker',
                  'Emergency SOS Triggers',
                  'Online Legal Consultation',
                  'Video Consultation Hub',
                  'Court Directions & Maps',
                  'Universal Indic Support',
                  'AI Case Precedent Finder',
                  'Identity & Bar Verification'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[var(--primary-subtle)]0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-white/40 italic pt-2 border-t border-[var(--border)]">
              We are working closely with bar councils, legal aid cells, police departments, and judicial institutions to build a secure, verified, and completely trustworthy legal support network for every citizen.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}

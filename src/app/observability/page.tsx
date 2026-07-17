'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { translations, LanguageCode } from '@/lib/translations';
import Header from '@/components/Header';
import { apiClient } from '@/lib/api';

/* ─── Observability specific localization ─── */
const obsTranslations = {
  title: {
    en: "Security & Quality Observability Control Center",
    hi: "सुरक्षा एवं गुणवत्ता निगरानी नियंत्रण केंद्र",
    bn: "নিরাপত্তা ও গুণমান পর্যবেক্ষণ নিয়ন্ত্রণ কেন্দ্র",
    ta: "பாதுகாப்பு மற்றும் தர கண்காணிப்பு கட்டுப்பாட்டு மையம்",
    te: "భద్రత & నాణ్యత పర్యవేక్షణ నియంత్రణ కేంద్రం",
    mr: "सुरक्षा आणि गुणवत्ता नियंत्रण केंद्र",
    gu: "સુરક્ષા અને ગુણવત્તા દેખરેખ નિયંત્રણ કેન્દ્ર",
    kn: "ಭದ್ರತೆ ಮತ್ತು ಗುಣಮಟ್ಟ ವೀಕ್ಷಣೆ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ",
    ml: "സുരക്ഷാ & ഗുണനിലവാര നിരീക്ഷണ നിയന്ത്രണ കേന്ദ്രം",
    pa: "ਸੁਰੱਖਿਆ ਅਤੇ ਗੁਣਵੱਤਾ ਨਿਗਰਾਨੀ ਕੰਟਰੋਲ ਕੇਂਦਰ"
  },
  subtitle: {
    en: "Real-time production security firewall logs, agent evaluation parameters, and compliance audit trail.",
    hi: "वास्तविक समय सुरक्षा फ़ायरवॉल लॉग, एजेंट मूल्यांकन पैरामीटर, और अनुपालन ऑडिट ट्रेल।",
    bn: "রিয়েল-টাইম সুরক্ষা ফায়ারওয়াল লগ, এজেন্ট মূল্যায়ন পরামিতি এবং সম্মতি অডিট ট্রেল।",
    ta: "நிகழ்நேர பாதுகாப்பு ஃபயர்வால் பதிவுகள், முகவர் மதிப்பீட்டு அளவுருக்கள் மற்றும் இணக்க தணிக்கை தடம்.",
    te: "రియల్ టైమ్ సెక్యూరిటీ ఫైర్‌వాల్ లాగ్‌లు, ఏజెంట్ మూల్యాంకన పారామితులు మరియు వర్తింపు ఆడిట్ ట్రైల్.",
    mr: "रिअल-टाइम सुरक्षा फायरवॉल लॉग, एजंट मूल्यमापन मापदंड आणि अनुपालन ऑडिट ट्रेल.",
    gu: "રીઅલ-ટાઇમ સુરક્ષા ફાયરવોલ લોગ, એજન્ટ મૂલ્યાંકન પરિમાણો અને પાલન ઓડિટ ટ્રેઇલ.",
    kn: "ನೈಜ-ಸಮಯದ ಭದ್ರತಾ ಫೈರ್‌ವಾಲ್ ಲಾಗ್‌ಗಳು, ಏಜೆಂಟ್ ಮೌಲ್ಯಮಾಪನ ನಿಯತಾಂಕಗಳು ಮತ್ತು ಅನುಸರಣೆ ಆಡಿಟ್ ಟ್ರಯಲ್.",
    ml: "തത്സമയ സുരക്ഷാ ഫയർവാൾ ലോഗുകൾ, ഏജന്റ് മൂല്യനിർണ്ണയ പാരാമീറ്ററുകൾ, അനുസരണ ഓഡിറ്റ് ട്രയൽ.",
    pa: "ਰੀਅਲ-ਟਾਈਮ ਸੁਰੱਖਿਆ ਫਾਇਰਵਾਲ ਲੌਗ, ਏਜੰਟ ਮੁਲਾਂਕਣ ਮਾਪਦੰਡ, ਅਤੇ ਪਾਲਣਾ ਆਡਿਟ ਟ੍ਰੇਲ।"
  },
  secFirewall: {
    en: "Security Firewall Alerts", hi: "सुरक्षा फ़ायरवॉल अलर्ट", bn: "নিরাপত্তা ফায়ারওয়াল সতর্কতা", ta: "பாதுகாப்பு ஃபயர்வால் எச்சரிக்கைகள்", te: "సెక్యూరిటీ ఫైర్‌వాల్ హెచ్చరికలు", mr: "सुरक्षा फायरवॉल इशारे", gu: "સુરક્ષા ફાયરવોલ ચેતવણીઓ", kn: "ಭದ್ರತಾ ಫೈರ್‌ವಾಲ್ ಎಚ್ಚರಿಕೆಗಳು", ml: "സുരക്ഷാ ഫയർവാൾ അലേർട്ടുകൾ", pa: "ਸੁਰੱਖਿਆ ਫਾਇਰਵਾਲ ਅਲਰਟ"
  },
  blockedInjections: {
    en: "Blocked Prompt Injections", hi: "अवरुद्ध प्रॉम्प्ट इंजेक्शन", bn: "অবরুদ্ধ প্রম্পট ইনজেকশন", ta: "தடுக்கப்பட்ட ப்ராம்ட் உட்செலுத்தல்கள்", te: "బ్లాక్ చేయబడిన ప్రాంప్ట్ ఇంజెక్షన్లు", mr: "अवरोधित प्रॉम्प्ट इंजेक्शन्स", gu: "બ્લોક કરેલ પ્રોમ્પ્ટ ઇન્જેક્શન", kn: "ನಿರ್ಬಂಧಿಸಲಾದ ಪ್ರಾಂಪ್ಟ್ ಇಂಜೆಕ್ಷನ್‌ಗಳು", ml: "ബ്ലോക്ക് ചെയ്ത പ്രോംപ്റ്റ് ഇഞ്ചക്ഷനുകൾ", pa: "ਬਲੌਕ ਕੀਤੇ ਪ੍ਰੋਂਪਟ ਇੰਜੈਕਸ਼ਨ"
  },
  integrityViolations: {
    en: "Integrity Scan Blocked Uploads", hi: "अखंडता स्कैन अवरुद्ध अपलोड", bn: "অখণ্ডতা স্ক্যান অবরুদ্ধ আপলোড", ta: "ஒருமைப்பாடு ஸ்கேன் தடுக்கப்பட்ட பதிவேற்றங்கள்", te: "ఇంటిగ్రిటీ స్కాన్ బ్లాక్ చేయబడిన అప్‌లోడ్‌లు", mr: "अखंडता स्कॅन अवरोधित अपलोड", gu: "અખંડિતતા સ્કેન બ્લોક કરેલ અપલોડ", kn: "ಸಮಗ್ರತೆ ಸ್ಕ್ಯಾನ್ ನಿರ್ಬಂಧಿತ ಅಪ್‌ಲೋಡ್‌ಗಳು", ml: "ഇന്റഗ്രിറ്റി സ്കാൻ തടഞ്ഞ അപ്‌ലോഡുകൾ", pa: "ਅਖੰਡਤਾ ਸਕੈਨ ਬਲੌਕ ਕੀਤੇ ਅਪਲੋਡ"
  },
  totalAlerts: {
    en: "Total Shield Interventions", hi: "कुल ढाल हस्तक्षेप", bn: "মোট ঢাল হস্তক্ষেপ", ta: "மொத்த கேடய தலையீடுகள்", te: "మొత్తం షీల్డ్ జోక్యాలు", mr: "एकूण शील्ड हस्तक्षेप", gu: "કુલ કવચ હસ્તક્ષેપ", kn: "ಒಟ್ಟು ಶೀಲ್ಡ್ ಹಸ್ತಕ್ಷೇಪಗಳು", ml: "ആകെ ഷീൽഡ് ഇടപെടലുകൾ", pa: "ਕੁੱਲ ਸ਼ੀਲਡ ਦਖਲਅੰਦਾਜ਼ੀ"
  },
  qualityScorecard: {
    en: "Agent Quality Scorecard (7 Parameters)", hi: "एजेंट गुणवत्ता स्कोरकार्ड (7 पैरामीटर)", bn: "এজেন্ট গুণমান স্কোরকার্ড (৭টি পরামিতি)", ta: "முகவர் தர ஸ்கோர்கார்டு (7 அளவுருக்கள்)", te: "ఏజెంట్ నాణ్యత స్కోర్‌కార్డ్ (7 పారామితులు)", mr: "एजंट गुणवत्ता स्कोअरकार्ड (७ मापदंड)", gu: "એજન્ટ ગુણવत्ता સ્કોરકાર્ડ (૭ પરિમાણો)", kn: "ಏಜೆಂಟ್ ಗುಣಮಟ್ಟದ ಸ್ಕೋರ್‌ಕಾರ್ಡ್ (7 ನಿಯತಾಂಕಗಳು)", ml: "ഏജന്റ് ക്വാളിറ്റി സ്കോർകാർഡ് (7 പാരാമീറ്ററുകൾ)", pa: "ਏਜੰਟ ਗੁਣਵੱਤਾ ਸਕੋਰਕਾਰਡ (7 ਪੈਰਾਮੀਟਰ)"
  },
  auditTrail: {
    en: "Compliance Audit Trail (Latest Events)", hi: "अनुपालन ऑडिट ट्रेल (नवीनतम घटनाएं)", bn: "সম্মতি অডিট ট্রেল (সর্বশেষ ঘটনা)", ta: "இணக்க தணிக்கை தடம் (சமீபத்திய நிகழ்வுகள்)", te: "వర్తింపు ఆడిట్ ట్రైల్ (ఇటీవలి సంఘటనలు)", mr: "अनुपालन ऑडिट ट्रेल (नवीनतम घटना)", gu: "પાલન ઓડિટ ટ્રેઇલ (નવીનતમ ઘટનાઓ)", kn: "ಅನುಸರಣೆ ಆಡಿಟ್ ಟ್ರಯಲ್ (ಇತ್ತೀಚಿನ ಈವೆಂಟ್‌ಗಳು)", ml: "അനുസരണ ഓഡിറ്റ് ട്രയൽ (അവസാന സംഭവങ്ങൾ)", pa: "ਪਾਲਣਾ ਆਡਿਟ ਟ੍ਰੇਲ (ਨਵੀਨਤਮ ਘਟਨਾਵਾਂ)"
  },
  refresh: {
    en: "Refresh Control Panel", hi: "नियंत्रण कक्ष रीफ़्रेश करें", bn: "নিয়ন্ত্রণ প্যানেল রিফ্রেশ করুন", ta: "கட்டுப்பாட்டுப் பலகத்தைப் புதுப்பி", te: "నియంత్రణ ప్యానెల్‌ను రిఫ్రెష్ చేయండి", mr: "नियंत्रण पॅनेल रीफ्रेश करा", gu: "નિયંત્રણ પેનલ તાજું કરો", kn: "ನಿಯಂತ್ರಣ ಫಲಕವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ", ml: "നിയന്ത്രണ പാനൽ പുതുക്കുക", pa: "ਕੰਟਰੋਲ ਪੈਨਲ ਰਿਫ੍ਰੈਸ਼ ਕਰੋ"
  },
  thTimestamp: {
    en: "Timestamp", hi: "समय संकेत", bn: "টাইমস্ট্যাম্প", ta: "நேரமுத்திரை", te: "టైమ్‌స్టాంప్", mr: "वेळ", gu: "સમયસૂચક", kn: "ಸಮಯದ ಗುರುತು", ml: "സമയമുദ്ര", pa: "ਸਮਾਂ-ਮੋਹਰ"
  },
  thAgent: {
    en: "Agent Used", hi: "उपयोग किया गया एजेंट", bn: "ব্যবহৃত এজেন্ট", ta: "பயன்படுத்தப்பட்ட முகவர்", te: "ఉపయోగించిన ఏజెంట్", mr: "वापरलेला एजंट", gu: "વપરાયેલ એજન્ટ", kn: "ಬಳಸಿದ ಏಜೆಂಟ್", ml: "ഉപയോഗിച്ച ഏജന്റ്", pa: "ਵਰਤਿਆ ਗਿਆ ਏਜੰਟ"
  },
  thAction: {
    en: "Action", hi: "कार्रवाई", bn: "পদক্ষেপ", ta: "செயல்பாடு", te: "చర్య", mr: "कृती", gu: "કાર્યવાહી", kn: "ಕಾರ್ಯ", ml: "നടപടി", pa: "ਕਾਰਵਾਈ"
  },
  thStatus: {
    en: "Status", hi: "स्थिति", bn: "স্থিতি", ta: "நிலை", te: "స్థితి", mr: "स्थिती", gu: "સ્થિતિ", kn: "ಸ್ಥಿತಿ", ml: "നില", pa: "ਸਥਿਤੀ"
  },
  thIP: {
    en: "Client IP (Hashed)", hi: "क्लाइंट आईपी (हैश किया हुआ)", bn: "ক্লায়েন্ট আইপি (হ্যাশ করা)", ta: "கிளையண்ட் ஐபி (ஹாஷ் செய்யப்பட்டது)", te: "క్లయింట్ ఐపి (హాష్ చేయబడిన)", mr: "क्लायंट आयपी (हॅश केलेला)", gu: "ક્લાયન્ટ આઈપી (હેશ કરેલ)", kn: "ಕ್ಲೈಂಟ್ ಐಪಿ (ಹ್ಯಾಶ್ ಮಾಡಿದ)", ml: "ക്ലയന്റ് ഐപി (ഹാഷ് ചെയ്തത്)", pa: "ਕਲਾਇੰਟ ਆਈਪੀ (ਹੈਸ਼ਡ)"
  },
  backToChat: {
    en: "Back to Chat Terminal", hi: "चैट टर्मिनल पर वापस जाएं", bn: "চ্যাট টার্মিনালে ফিরে যান", ta: "அரட்டை முனையத்திற்குத் திரும்பு", te: "చాట్ టెర్మినల్ కు తిరిగి వెళ్ళండి", mr: "चॅट टर्मिनलवर परत जा", gu: "ચેટ ટર્મિનલ પર પાછા જાઓ", kn: "ಚಾಟ್ ಟರ್ಮಿನಲ್‌ಗೆ ಹಿಂತಿರುಗಿ", ml: "ചാറ്റ് ടെർമിനലിലേക്ക് മടങ്ങുക", pa: "ਚੈਟ ਟਰਮੀਨਲ ਤੇ ਵਾਪਸ ਜਾਓ"
  }
};

interface SecurityStats {
  blocked_prompt_injections: number;
  blocked_file_integrity_violations: number;
  total_security_alerts: number;
}

interface ActivityStats {
  total_chats_processed: number;
  total_documents_analyzed: number;
  total_drafts_approved: number;
  agent_utilization: Record<string, number>;
}

interface ObservabilityData {
  security: SecurityStats;
  activity: ActivityStats;
}

interface EvalsData {
  intent_satisfaction: number;
  functional_correctness: number;
  language_accuracy: number;
  translation_quality: number;
  doc_analysis_quality: number;
  risk_detection_quality: number;
  explanation_clarity: number;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  session_id: string;
  user_id: string;
  agent_used: string;
  action_type: string;
  action_description: string;
  result_status: string;
  client_ip_hash: string;
}

export default function ObservabilityPage() {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('en');
  const [stats, setStats] = useState<ObservabilityData | null>(null);
  const [evals, setEvals] = useState<EvalsData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync language selection with local storage
  useEffect(() => {
    const savedLang = localStorage.getItem('nyaya_lang') as LanguageCode;
    if (savedLang) {
      setSelectedLang(savedLang);
    }

    const handleLangChange = () => {
      const updatedLang = localStorage.getItem('nyaya_lang') as LanguageCode;
      if (updatedLang) {
        setSelectedLang(updatedLang);
      }
    };

    window.addEventListener('nyaya_lang_changed', handleLangChange);
    return () => window.removeEventListener('nyaya_lang_changed', handleLangChange);
  }, []);

  const t = (key: string) => {
    return (translations as any)[key]?.[selectedLang] || (translations as any)[key]?.['en'] || key;
  };

  const ot = (key: keyof typeof obsTranslations) => {
    return obsTranslations[key]?.[selectedLang] || obsTranslations[key]?.['en'] || key;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Stats
      const statsData = await apiClient.get<any>('/observability/stats');
      setStats(statsData);

      // 2. Fetch Evaluations
      const evalsData = await apiClient.get<any>('/observability/evals');
      setEvals(evalsData);

      // 3. Fetch Audit Logs
      const auditData = await apiClient.get<any>('/observability/audit');
      setAuditLogs(auditData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Connection failure to observability API backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1628] text-white flex flex-col font-sans">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#FF9933] to-[#138808] bg-clip-text text-transparent">
              {ot('title')}
            </h1>
            <p className="text-xs text-white/50 max-w-3xl">
              {ot('subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-white dark:bg-[#111827]/5 hover:bg-white dark:bg-[#111827]/10 text-xs border border-white/10 rounded-lg transition-all"
            >
              🔄 {ot('refresh')}
            </button>
            <Link
              href="/chat"
              className="px-4 py-2 bg-gradient-to-r from-[#FF9933] to-[#E8850B] text-xs font-semibold rounded-lg transition-all shadow-md shadow-[#FF9933]/15"
            >
              💬 {ot('backToChat')}
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            ⚠️ **API Error:** {error}. Please verify that the FastAPI backend server is running on port 8000.
          </div>
        )}

        {/* 3-Column Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Blocked Prompt Injections */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827]/[0.03] backdrop-blur-md border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 font-medium">{ot('blockedInjections')}</span>
              <span className="text-xl">🛡️</span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl md:text-4xl font-extrabold text-orange-400">
                {stats?.security.blocked_prompt_injections ?? 0}
              </span>
              <p className="text-[10px] text-white/40">Active firewall patterns matching system override attempts.</p>
            </div>
          </div>

          {/* Card 2: Integrity Violations */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827]/[0.03] backdrop-blur-md border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 font-medium">{ot('integrityViolations')}</span>
              <span className="text-xl">📁</span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl md:text-4xl font-extrabold text-amber-500">
                {stats?.security.blocked_file_integrity_violations ?? 0}
              </span>
              <p className="text-[10px] text-white/40">Rejected file uploads violating magic byte signature scans.</p>
            </div>
          </div>

          {/* Card 3: Total Shield Alerts */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-md border border-red-500/20 space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-300 font-bold">{ot('totalAlerts')}</span>
              <span className="text-xl">🚨</span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl md:text-4xl font-extrabold text-red-500">
                {stats?.security.total_security_alerts ?? 0}
              </span>
              <p className="text-[10px] text-red-300/50">Total automated containment interventions triggered.</p>
            </div>
          </div>
        </div>

        {/* Evaluation scorecard and utilization charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quality Scorecard Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827]/[0.03] border border-white/5 space-y-6">
            <h2 className="text-sm font-bold text-white/80 border-b border-white/5 pb-3">
              🎯 {ot('qualityScorecard')}
            </h2>
            <div className="space-y-4">
              {[
                { label: "Intent Satisfaction", val: evals?.intent_satisfaction ?? 1.0, color: "bg-indigo-500" },
                { label: "Functional Correctness", val: evals?.functional_correctness ?? 1.0, color: "bg-blue-500" },
                { label: "Language Script Accuracy", val: evals?.language_accuracy ?? 1.0, color: "bg-teal-500" },
                { label: "Translation Quality", val: evals?.translation_quality ?? 1.0, color: "bg-green-500" },
                { label: "Document Analysis Quality", val: evals?.doc_analysis_quality ?? 1.0, color: "bg-saffron-500" },
                { label: "Risk Detection Quality", val: evals?.risk_detection_quality ?? 1.0, color: "bg-orange-500" },
                { label: "Explanation Clarity", val: evals?.explanation_clarity ?? 1.0, color: "bg-purple-500" }
              ].map((metric) => (
                <div key={metric.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">{metric.label}</span>
                    <span className="font-bold text-white">{(metric.val * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white dark:bg-[#111827]/5 overflow-hidden">
                    <div
                      className={`h-full ${metric.color} transition-all duration-1000`}
                      style={{ width: `${metric.val * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Utilization & Usage distribution */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111827]/[0.03] border border-white/5 space-y-6">
            <h2 className="text-sm font-bold text-white/80 border-b border-white/5 pb-3">
              📊 System Activity & Agent Load
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-[#111827]/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] text-white/40 font-medium">Chats Processed</span>
                <p className="text-xl font-bold">{stats?.activity.total_chats_processed ?? 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#111827]/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] text-white/40 font-medium">Documents Scanned</span>
                <p className="text-xl font-bold">{stats?.activity.total_documents_analyzed ?? 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#111827]/[0.02] border border-white/5 space-y-2">
                <span className="text-[10px] text-white/40 font-medium">Drafts Generated</span>
                <p className="text-xl font-bold">{stats?.activity.total_drafts_approved ?? 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#138808]/10 border border-[#138808]/20 space-y-2">
                <span className="text-[10px] text-green-300 font-medium">Drafts Approved (HITL)</span>
                <p className="text-xl font-bold text-green-400">{stats?.activity.total_drafts_approved ?? 0}</p>
              </div>
            </div>

            <div className="space-y-3 pt-3">
              <span className="text-xs text-white/60 font-semibold">Sandbox Agent Utilization Rates</span>
              <div className="space-y-2">
                {Object.entries(stats?.activity.agent_utilization || {}).map(([agent, count]) => (
                  <div key={agent} className="flex items-center justify-between text-xs">
                    <span className="text-white/50">{agent}</span>
                    <span className="font-bold text-[#FF9933] bg-[#FF9933]/15 px-2 py-0.5 rounded text-[10px]">
                      {count} calls
                    </span>
                  </div>
                ))}
                {(!stats?.activity.agent_utilization || Object.keys(stats.activity.agent_utilization).length === 0) && (
                  <p className="text-[11px] text-white/30 italic">No agent actions recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log Query Grid */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827]/[0.03] border border-white/5 space-y-4">
          <h2 className="text-sm font-bold text-white/80 border-b border-white/5 pb-3">
            📋 {ot('auditTrail')}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/50 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">{ot('thTimestamp')}</th>
                  <th className="py-3 px-4">{ot('thAgent')}</th>
                  <th className="py-3 px-4">{ot('thAction')}</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">{ot('thStatus')}</th>
                  <th className="py-3 px-4">{ot('thIP')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white dark:bg-[#111827]/[0.02] transition-colors">
                    <td className="py-3 px-4 text-white/60 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white/80">{log.agent_used || 'system'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-white dark:bg-[#111827]/5 rounded text-[10px] uppercase border border-white/10">
                        {log.action_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs text-white/70 truncate" title={log.action_description}>
                      {log.action_description}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${ log.result_status === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : log.result_status === 'blocked' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/20' }`}
                      >
                        {log.result_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[10px] font-mono text-white/40">{log.client_ip_hash || 'unknown'}</td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-white/30 italic">
                      No compliance audit entries recorded in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

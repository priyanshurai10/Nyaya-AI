'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  House,
  MessageSquare,
  Award,
  Route,
  FileText,
  MapPin,
  FilePenLine,
  ShoppingBag,
  Shield,
  Scale,
  FileCode,
  FolderOpen,
  ShieldAlert,
  Building,
  Briefcase,
  Heart,
  Calendar,
  Archive,
  ShieldCheck,
  GraduationCap,
  Bookmark,
  BookOpen,
  Bell,
  X,
  type LucideIcon,
} from 'lucide-react';
import { translations } from '@/lib/translations';

import { useLanguage } from '@/context/LanguageContext';
import { useEffect } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  isDemo?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface UserData {
  is_admin?: boolean;
  email?: string;
  name?: string;
  mobile?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { selectedLang, t } = useLanguage();
  const [userData, setUserData] = useState<UserData | null>(null);

  // Sync user session
  useEffect(() => {
    try {
      const user = localStorage.getItem('nyaya_user');
      if (user) {
        setUserData(JSON.parse(user));
      }
    } catch (e) {
      console.error('Failed to parse user data in Sidebar', e);
    }

    const handleUserChange = () => {
      try {
        const user = localStorage.getItem('nyaya_user');
        setUserData(user ? JSON.parse(user) : null);
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('nyaya_user_changed', handleUserChange);
    // Also listen to storage changes
    window.addEventListener('storage', handleUserChange);

    return () => {
      window.removeEventListener('nyaya_user_changed', handleUserChange);
      window.removeEventListener('storage', handleUserChange);
    };
  }, []);


  // ── Custom labels for certain routes ─────────────────────────────────────

  const getCustomLabel = (path: string): string => {
    if (path === '/journey') {
      return selectedLang === 'hi'
        ? 'अदालत पदानुक्रम'
        : selectedLang === 'bn'
          ? 'আদালতের শ্রেণিবিন্যাস'
          : selectedLang === 'ta'
            ? 'நீதிமன்ற படிநிலை'
            : selectedLang === 'te'
              ? 'కోర్టు సోపానక్రమం'
              : 'Court Hierarchy';
    }

    if (path === '/judges') {
      return selectedLang === 'hi'
        ? 'न्यायाधीश निर्देशिका'
        : selectedLang === 'bn'
          ? 'বিচারকদের তথ্য'
          : selectedLang === 'ta'
            ? 'நீதிபதி அடைவு'
            : selectedLang === 'te'
              ? 'న్యాయమూర్తుల డైరెక్టరీ'
              : 'Judge Directory';
    }

    if (path === '/nyaya-path') {
      return selectedLang === 'hi'
        ? 'न्याय पथ™ नेविगेटर'
        : selectedLang === 'bn'
          ? 'ন্যায় পথ™ নেভিগেটর'
          : selectedLang === 'ta'
            ? 'நியாயா பாதை™ நேவிகேட்டர்'
            : selectedLang === 'te'
              ? 'న్యాయ మార్గం™ నావిగేటర్'
              : 'NYAYA PATH™ Navigator';
    }

    if (path === '/evidence-vault') {
      return selectedLang === 'hi'
        ? 'एआई साक्ष्य तिजोरी'
        : selectedLang === 'bn'
          ? 'এআই প্রমাণ ভল্ট'
          : selectedLang === 'ta'
            ? 'ஏஐ சான்று பெட்டகம்'
            : selectedLang === 'te'
              ? 'ఏఐ साक్ష్యాల వాల్ట్'
              : 'AI Evidence Vault';
    }

    if (path === '/academy') {
      return selectedLang === 'hi'
        ? 'कानूनी शिक्षा अकादमी'
        : selectedLang === 'bn'
          ? 'আইনি শিক্ষা একাডেমি'
          : selectedLang === 'ta'
            ? 'சட்டக் கல்வி அகாடமி'
            : selectedLang === 'te'
              ? 'న్యాయ విద్యా అకాడమీ'
              : 'Legal Learning Academy';
    }

    if (path === '/admin') {
      return 'Admin Control Panel';
    }

    if (path === '/advocates') {
      return selectedLang === 'hi'
        ? 'वकील खोजें और बुक करें'
        : selectedLang === 'bn'
          ? 'উকিল খুঁজুন'
          : selectedLang === 'ta'
            ? 'வழக்கறிஞரைத் தேடுங்கள்'
            : selectedLang === 'te'
              ? 'న్యాయవాదిని కనుగొనండి'
              : 'Find & Book Advocate';
    }

    if (path === '/cases') {
      return selectedLang === 'hi'
        ? 'केस फ़ोल्डर्स'
        : selectedLang === 'bn'
          ? 'কেস ফোল্ডার'
          : selectedLang === 'ta'
            ? 'வழக்கு கோப்புகள்'
            : selectedLang === 'te'
              ? 'కేసు ఫోల్డర్లు'
              : 'Case Management';
    }

    if (path === '/calendar') {
      return selectedLang === 'hi'
        ? 'एजेंडा कैलेंडर'
        : selectedLang === 'bn'
          ? 'এজেন্ডা ক্যালেন্ডার'
          : selectedLang === 'ta'
            ? 'அஜண்டா நாட்காட்டி'
            : selectedLang === 'te'
              ? 'ఎజెండా క్యాలెండర్'
              : 'Agenda Calendar';
    }

    if (path === '/document-generator') {
      return selectedLang === 'hi'
        ? 'दस्तावेज जनरेटर'
        : selectedLang === 'bn'
          ? 'নথি জেনারেটর'
          : selectedLang === 'ta'
            ? 'ஆவண ஜெனரேட்டர்'
            : selectedLang === 'te'
              ? 'డాక్యుమెంట్ జనరేటర్'
              : 'Document Drafting Hub';
    }

    if (path === '/trust-privacy') {
      return selectedLang === 'hi'
        ? 'गोपनीयता और विश्वास केंद्र'
        : selectedLang === 'bn'
          ? 'विश्वास ও গোপনীয়তা'
          : selectedLang === 'ta'
            ? 'நம்பிக்கை & தனியுரிமை'
            : selectedLang === 'te'
              ? 'ట్రస్ట్ & గోప్యత'
              : 'Trust & Privacy';
    }

    if (path === '/marketplace') {
      return selectedLang === 'hi'
        ? 'कानूनी सेवा बाजार'
        : selectedLang === 'bn'
          ? 'আইনি পরিষেবা বাজার'
          : selectedLang === 'ta'
            ? 'சட்ட சேவைகள் சந்தை'
            : selectedLang === 'te'
              ? 'న్యాయ సేవల మార్కెట్'
              : 'Services Marketplace';
    }

    if (path === '/admin/marketplace') {
      return selectedLang === 'hi'
        ? 'भुगतान और परामर्श प्रबंधन'
        : selectedLang === 'bn'
          ? 'পেমেন্ট ও পরামর্শ পরিচালক'
          : selectedLang === 'ta'
            ? 'கட்டணம் & ஆலோசனை மேலாளர்'
            : selectedLang === 'te'
              ? 'చెల్లింపులు & సంప్రదింపుల మేనేజర్'
              : 'Payments & Consultations';
    }

    if (path === '/knowledge') {
      return selectedLang === 'hi'
        ? 'कानूनी ज्ञान केंद्र'
        : selectedLang === 'bn'
          ? 'আইন জ্ঞান কেন্দ্র'
          : selectedLang === 'ta'
            ? 'சட்ட அறிவு மையம்'
            : selectedLang === 'te'
              ? 'న్యాయ జ్ఞాన కేంద్రం'
              : 'Knowledge Center';
    }

    if (path === '/judgments') {
      return selectedLang === 'hi'
        ? 'ऐतिहासिक फैसले'
        : selectedLang === 'bn'
          ? 'ঐতিহাসিক রায়'
          : selectedLang === 'ta'
            ? 'முக்கிய தீர்ப்புகள்'
            : selectedLang === 'te'
              ? 'చారిత్రక తీర్పులు'
              : 'Landmark Judgments';
    }

    if (path === '/notifications') {
      return selectedLang === 'hi'
        ? 'सूचना केंद्र'
        : selectedLang === 'bn'
          ? 'বিজ্ঞপ্তি কেন্দ্র'
          : selectedLang === 'ta'
            ? 'அறிவிப்பு மையம்'
            : selectedLang === 'te'
              ? 'నోటిఫికేషన్ సెంటర్'
              : 'Notification Center';
    }

    return '';
  };

  // ── Navigation groups ────────────────────────────────────────────────────

  const navGroups: NavGroup[] = [
    {
      title: 'Core Console',
      items: [
        { path: '/', label: t('sidebarHome'), icon: House },
        { path: '/chat', label: t('sidebarChat'), icon: MessageSquare },
        { path: '/advocates', label: 'Verified Advocates', icon: Award, isDemo: true },
        { path: '/nyaya-path', label: getCustomLabel('/nyaya-path'), icon: Route },
        { path: '/documents', label: t('sidebarDoc'), icon: FileText },
        { path: '/map', label: 'Verified Courts', icon: MapPin, isDemo: true },
        { path: '/document-generator', label: getCustomLabel('/document-generator'), icon: FilePenLine },
        { path: '/marketplace', label: getCustomLabel('/marketplace'), icon: ShoppingBag },
      ],
    },
    {
      title: 'Legal Aid & Drafts',
      items: [
        { path: '/knowledge', label: getCustomLabel('/knowledge'), icon: BookOpen },
        { path: '/chat?mode=rights', label: t('sidebarRights'), icon: Shield },
        { path: '/drafts?template=police_complaint', label: t('sidebarComplaintGen'), icon: FilePenLine },
        { path: '/chat?mode=fir', label: t('sidebarFIR'), icon: Scale },
        { path: '/drafts?template=legal_notice', label: t('sidebarNoticeGen'), icon: FileCode },
        { path: '/drafts?template=rti', label: t('sidebarRTI'), icon: FolderOpen },
        { path: '/emergency', label: 'Nearby Police', icon: ShieldAlert, isDemo: true },
        { path: '/drafts?template=consumer_complaint', label: t('sidebarConsumer'), icon: ShoppingBag },
      ],
    },
    {
      title: 'Litigation Pathways',
      items: [
        { path: '/journey', label: getCustomLabel('/journey'), icon: Scale },
        { path: '/judges', label: getCustomLabel('/judges'), icon: Award },
        { path: '/judgments', label: getCustomLabel('/judgments'), icon: Bookmark },
        { path: '/journey?category=property', label: t('sidebarProperty'), icon: Building },
        { path: '/journey?category=labour', label: t('sidebarLabour'), icon: Briefcase },
        { path: '/journey?category=family', label: t('sidebarFamily'), icon: Heart },
      ],
    },
    {
      title: 'Personal Workspace',
      items: [
        { path: '/cases', label: getCustomLabel('/cases'), icon: FolderOpen },
        { path: '/calendar', label: getCustomLabel('/calendar'), icon: Calendar },
        { path: '/evidence-vault', label: getCustomLabel('/evidence-vault'), icon: Archive },
        { path: '/notifications', label: getCustomLabel('/notifications'), icon: Bell },
        { path: '/trust-privacy', label: getCustomLabel('/trust-privacy'), icon: ShieldCheck },
        { path: '/academy', label: getCustomLabel('/academy'), icon: GraduationCap },
        { path: '/map?bookmarks=true', label: t('sidebarBookmarks'), icon: Bookmark, isDemo: true },
      ],
    },
  ];

  // ── Admin section (conditional) ──────────────────────────────────────────

  if (userData && (userData.is_admin || userData.email === 'admin@nyaya.ai')) {
    navGroups.push({
      title: 'Administration',
      items: [
        { path: '/admin', label: getCustomLabel('/admin'), icon: ShieldCheck },
        { path: '/admin/marketplace', label: getCustomLabel('/admin/marketplace'), icon: ShieldCheck },
      ],
    });
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/40 dark:bg-[#020813]/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 backdrop-blur-md flex flex-col transition-all duration-300 ease-in-out lg:static lg:h-screen overflow-hidden ${isOpen ? 'w-64 translate-x-0 border-r' : 'w-0 -translate-x-full lg:translate-x-0 border-r-0'}`}
      >
        <div className="w-64 min-w-[16rem] h-full flex flex-col">
          {/* Mobile header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/5 lg:hidden">
            <span className="font-extrabold bg-gradient-to-r from-[#FF9933] to-[#138808] bg-clip-text text-transparent text-sm">
            ⚖️ MENU
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-[#111827]/5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable nav area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/5">
          {navGroups.map(group => ({
            ...group,
            items: group.items.filter(item => !item.isDemo)
          })).filter(group => group.items.length > 0).map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              {/* Group title */}
              <h4 className="px-3 text-[9px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">
                {group.title}
              </h4>

              {/* Nav items */}
              <ul className="space-y-1">
                {group.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.path ||
                    (item.path !== '/' && pathname.startsWith(item.path));

                  return (
                    <li key={iIdx}>
                      <Link
                        href={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`group px-3 py-2 rounded-xl text-xs flex items-center justify-between font-semibold transition-all duration-200 ${ isActive ? 'bg-indigo-50 dark:bg-indigo-900/15 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-slate-600 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white dark:bg-[#111827]/[0.03] border-transparent' }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Icon
                            size={15}
                            className={`transition-colors duration-200 ${ isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400' }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.isDemo && (
                          <span className="ml-2 shrink-0 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                            DEMO
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        </div>
      </aside>
    </>
  );
}
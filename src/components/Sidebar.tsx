'use client';

import { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { translations } from '@/lib/translations';
import { useLanguage } from '@/context/LanguageContext';
import Logo from '@/components/Logo';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'success' | 'primary' | 'warning';
}

interface NavGroup {
  title: string;
  icon?: LucideIcon;
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
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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
    window.addEventListener('storage', handleUserChange);

    return () => {
      window.removeEventListener('nyaya_user_changed', handleUserChange);
      window.removeEventListener('storage', handleUserChange);
    };
  }, []);

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll on mobile/tablet when sidebar is open overlay drawer style
  useEffect(() => {
    const handleResizeAndScroll = () => {
      if (isOpen && window.innerWidth < 1024) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };

    handleResizeAndScroll();
    window.addEventListener('resize', handleResizeAndScroll);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('resize', handleResizeAndScroll);
    };
  }, [isOpen]);

  // Close sidebar on Escape key press (mobile/tablet only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Focus trap on mobile/tablet when open
  useEffect(() => {
    if (!isOpen || window.innerWidth >= 1024) return;

    const focusableElements = sidebarRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus the first element inside the drawer
    firstElement.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);


  // ── Custom labels ─────────────────────────────────────────
  const getLabel = (key: string): string => {
    const labels: Record<string, Record<string, string>> = {
      '/journey': { hi: 'अदालत पदानुक्रम', bn: 'আদালতের শ্রেণিবিন্যাস', ta: 'நீதிமன்ற படிநிலை', te: 'కోర్టు సోపానక్రమం', en: 'Court Hierarchy' },
      '/judges': { hi: 'न्यायाधीश निर्देशिका', bn: 'বিচারকদের তথ্য', ta: 'நீதிபதி அடைவு', te: 'న్యాయమూర్తుల డైరెక్టరీ', en: 'Judge Directory' },
      '/nyaya-path': { hi: 'न्याय पथ™ नेविगेटर', bn: 'ন্যায় পথ™', ta: 'நியாயா பாதை™', te: 'న్యాయ మార్గం™', en: 'NYAYA PATH™ Navigator' },
      '/evidence-vault': { hi: 'एआई साक्ष्य तिजोरी', bn: 'এআই প্রমাণ ভল্ট', ta: 'ஏஐ சான்று பெட்டகம்', te: 'ఏఐ साक్ష్యాల వాల్ట్', en: 'AI Evidence Vault' },
      '/academy': { hi: 'कानूनी शिक्षा अकादमी', bn: 'আইনি শিক্ষা একাডেমি', ta: 'சட்டக் கல்வி அகாடமி', te: 'న్యాయ విద్యా అకాడమీ', en: 'Legal Academy' },
      '/advocates': { hi: 'वकील खोजें', bn: 'উকিল খুঁজুন', ta: 'வழக்கறிஞரை தேடுங்கள்', te: 'న్యాయవాది కనుగొనండి', en: 'Find Advocates' },
      '/cases': { hi: 'केस फ़ोल्डर्स', bn: 'কেস ফোল্ডার', ta: 'வழக்கு கோப்புகள்', te: 'కేసు ఫోల్డర్లు', en: 'Case Management' },
      '/calendar': { hi: 'एजेंडा कैलेंडर', bn: 'এজেন্ডা ক্যালেন্ডার', ta: 'அஜண்டா நாட்காட்டி', te: 'ఎజెండా క్యాలెండర్', en: 'Agenda Calendar' },
      '/document-generator': { hi: 'दस्तावेज जनरेटर', bn: 'নথি জেনারেটর', ta: 'ஆவண ஜெனரேட்டர்', te: 'డాక్యుమెంట్ జనరేటర్', en: 'Document Drafting Hub' },
      '/trust-privacy': { hi: 'गोपनीयता केंद्र', bn: 'গোপনীয়তা কেন্দ্র', ta: 'தனியுரிமை மையம்', te: 'గోప్యత కేంద్రం', en: 'Privacy & Trust' },
      '/marketplace': { hi: 'सेवाएं बाज़ार', bn: 'পরিষেবা বাজার', ta: 'சேவைகள் சந்தை', te: 'సేవలు మార్కెట్', en: 'Services Marketplace' },
      '/knowledge': { hi: 'ज्ञान केंद्र', bn: 'জ্ঞান কেন্দ্র', ta: 'அறிவு மையம்', te: 'జ్ఞాన కేంద్రం', en: 'Knowledge Center' },
      '/judgments': { hi: 'ऐतिहासिक निर्णय', bn: 'ঐতিহাসিক রায়', ta: 'முக்கிய தீர்ப்புகள்', te: 'చారిత్రక తీర్పులు', en: 'Landmark Judgments' },
      '/notifications': { hi: 'सूचना केंद्र', bn: 'বিজ্ঞপ্তি কেন্দ্র', ta: 'அறிவிப்பு மையம்', te: 'నోటిఫికేషన్ సెంటర్', en: 'Notifications' },
    };
    const lang = selectedLang || 'en';
    return labels[key]?.[lang] || labels[key]?.['en'] || key;
  };

  // ── Navigation groups ────────────────────────────────────
  const navGroups: NavGroup[] = [
    {
      title: 'Core Console',
      items: [
        { path: '/', label: t('sidebarHome') || 'Home Dashboard', icon: House },
        { path: '/chat', label: t('sidebarChat') || 'AI Legal Assistant', icon: MessageSquare, badge: 'AI', badgeType: 'primary' },
        { path: '/advocates', label: getLabel('/advocates'), icon: Award },
        { path: '/nyaya-path', label: getLabel('/nyaya-path'), icon: Route },
        { path: '/documents', label: t('sidebarDoc') || 'Document Analyzer', icon: FileText },
        { path: '/map', label: 'Verified Courts Map', icon: MapPin },
        { path: '/document-generator', label: getLabel('/document-generator'), icon: FilePenLine },
        { path: '/marketplace', label: getLabel('/marketplace'), icon: ShoppingBag },
      ],
    },
    {
      title: 'Legal Aid & Drafts',
      items: [
        { path: '/knowledge', label: getLabel('/knowledge'), icon: BookOpen },
        { path: '/chat?mode=rights', label: t('sidebarRights') || 'Legal Rights Guide', icon: Shield },
        { path: '/drafts?template=police_complaint', label: t('sidebarComplaintGen') || 'Complaint Generator', icon: FilePenLine },
        { path: '/chat?mode=fir', label: t('sidebarFIR') || 'FIR Assistant', icon: Scale },
        { path: '/drafts?template=legal_notice', label: t('sidebarNoticeGen') || 'Legal Notice', icon: FileCode },
        { path: '/drafts?template=rti', label: t('sidebarRTI') || 'RTI Assistant', icon: FolderOpen },
        { path: '/emergency', label: 'Nearby Police & SOS', icon: ShieldAlert, badge: 'SOS', badgeType: 'warning' },
        { path: '/drafts?template=consumer_complaint', label: t('sidebarConsumer') || 'Consumer Complaint', icon: ShoppingBag },
      ],
    },
    {
      title: 'Litigation Pathways',
      items: [
        { path: '/journey', label: getLabel('/journey'), icon: Scale },
        { path: '/judges', label: getLabel('/judges'), icon: Award },
        { path: '/judgments', label: getLabel('/judgments'), icon: Bookmark },
        { path: '/journey?category=property', label: t('sidebarProperty') || 'Property Disputes', icon: Building },
        { path: '/journey?category=labour', label: t('sidebarLabour') || 'Labour Rights', icon: Briefcase },
        { path: '/journey?category=family', label: t('sidebarFamily') || 'Family Law', icon: Heart },
      ],
    },
    {
      title: 'Personal Workspace',
      items: [
        { path: '/cases', label: getLabel('/cases'), icon: FolderOpen },
        { path: '/calendar', label: getLabel('/calendar'), icon: Calendar },
        { path: '/evidence-vault', label: getLabel('/evidence-vault'), icon: Archive },
        { path: '/notifications', label: getLabel('/notifications'), icon: Bell },
        { path: '/trust-privacy', label: getLabel('/trust-privacy'), icon: ShieldCheck },
        { path: '/academy', label: getLabel('/academy'), icon: GraduationCap },
        { path: '/map?bookmarks=true', label: t('sidebarBookmarks') || 'Saved Courts', icon: Bookmark },
      ],
    },
  ];

  if (userData && (userData.is_admin || userData.email === 'admin@nyaya.ai')) {
    navGroups.push({
      title: 'Administration',
      items: [
        { path: '/admin', label: 'Admin Control Panel', icon: ShieldCheck, badge: 'Admin', badgeType: 'warning' },
        { path: '/admin/marketplace', label: 'Marketplace Admin', icon: ShoppingBag },
      ],
    });
  }

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const isActive = (path: string) =>
    pathname === path || (path !== '/' && pathname.startsWith(path.split('?')[0]));

  // ── Render ───────────────────────────────────────────────

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-45 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        role="navigation"
        aria-label="Sidebar Navigation"
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col
          bg-[var(--surface)] border-r transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
          lg:static lg:h-screen
          ${isOpen
            ? 'w-64 translate-x-0 opacity-100 border-[var(--border)]'
            : 'w-0 -translate-x-full lg:w-0 lg:-translate-x-full opacity-0 pointer-events-none border-transparent'
          }
        `}
        style={{ boxShadow: isOpen ? 'var(--shadow-xl)' : 'none' }}
      >
        <div className="w-64 min-w-[16rem] h-full flex flex-col overflow-hidden">

          {/* ── Brand Header ────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)] shrink-0">
            <div className="flex items-center gap-2.5">
              <Logo size={34} animated={false} />
              <div>
                <p className="font-extrabold text-sm tracking-tight text-[var(--text-primary)] leading-none">
                  Nyaya AI
                </p>
                <p className="text-[9px] text-[var(--text-muted)] mt-0.5 font-medium tracking-wider uppercase">
                  Justice Made Simple
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--card-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Close Sidebar"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Navigation ──────────────────────────────────────── */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 no-scrollbar">
            {navGroups.map((group) => {
              const collapsed = collapsedGroups.has(group.title);
              return (
                <div key={group.title} className="mb-2">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-3 py-1.5 mb-1 group"
                  >
                    <span className="text-[9.5px] font-black uppercase tracking-widest text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                      {group.title}
                    </span>
                    <ChevronDown
                      size={10}
                      className={`text-[var(--text-muted)] transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
                    />
                  </button>

                  {/* Group Items */}
                  {!collapsed && (
                    <ul className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                          <li key={item.path}>
                            <Link
                              href={item.path}
                              onClick={() => {
                                if (window.innerWidth < 1024) {
                                  setIsOpen(false);
                                }
                              }}
                              className={`
                                flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-medium
                                transition-all duration-150 relative group
                                ${active
                                  ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold'
                                  : 'text-[var(--text-secondary)] hover:bg-[var(--card-elevated)] hover:text-[var(--text-primary)]'
                                }
                              `}
                            >
                              {/* Active indicator bar */}
                              {active && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--primary)] rounded-r-full" />
                              )}

                              <div className="flex items-center gap-2.5 truncate">
                                <Icon
                                  size={14}
                                  className={`shrink-0 transition-colors ${
                                    active
                                      ? 'text-[var(--primary)]'
                                      : 'text-[var(--text-muted)] group-hover:text-[var(--primary)]'
                                  }`}
                                />
                                <span className="truncate">{item.label}</span>
                              </div>

                              {/* Badge */}
                              {item.badge && (
                                <span className={`
                                  shrink-0 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider
                                  ${item.badgeType === 'primary' ? 'bg-[var(--primary-subtle)] text-[var(--primary)]' : ''}
                                  ${item.badgeType === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400' : ''}
                                  ${item.badgeType === 'success' ? 'bg-[var(--success-subtle)] text-[var(--success)]' : ''}
                                `}>
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </nav>

          {/* ── Footer ──────────────────────────────────────────── */}
          <div className="shrink-0 px-3 py-3 border-t border-[var(--border)]">
            {userData ? (
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-[var(--card-elevated)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary-subtle)] flex items-center justify-center text-[var(--primary)] font-black text-xs shrink-0">
                  {(userData.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate leading-tight">
                    {userData.name || 'Citizen'}
                  </p>
                  <p className="text-[9px] text-[var(--text-muted)] truncate mt-0.5">
                    {userData.email || userData.mobile || ''}
                  </p>
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                className="flex items-center justify-center gap-2 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-hover)] transition-colors"
              >
                Login / Register
              </Link>
            )}
          </div>

        </div>
      </aside>
    </>
  );
}
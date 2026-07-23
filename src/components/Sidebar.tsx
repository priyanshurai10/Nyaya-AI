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
  Gavel,
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
  district?: string;
  state?: string;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { selectedLang, t } = useLanguage();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const sidebarRef = useRef<HTMLElement>(null);

  // Lock body scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Load User Data
  useEffect(() => {
    const storedUser = localStorage.getItem('nyaya_user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user session context', e);
      }
    }
  }, [pathname]);

  // Dynamic Navigation Groups
  const navGroups: NavGroup[] = [
    {
      title: t('catCore') || 'Core Console',
      items: [
        { path: '/dashboard', label: t('navHome') || 'Home Dashboard', icon: House },
        { path: '/chat', label: t('navChat') || 'AI Legal Chat', icon: MessageSquare, badge: 'AI', badgeType: 'primary' },
        { path: '/advocates', label: t('navAdvocates') || 'Find Advocates', icon: Award, badge: 'Soon', badgeType: 'warning' },
        { path: '/nyaya-path', label: t('navNyayaPath') || 'NYAYA PATH™ Navigator', icon: Route },
        { path: '/risk', label: t('navRisk') || 'AI Risk Analyzer', icon: ShieldAlert, badge: 'AI', badgeType: 'primary' },
        { path: '/map', label: t('navMap') || 'Court & Emergency Finder', icon: MapPin, badge: 'Soon', badgeType: 'warning' },
        { path: '/document-generator', label: t('navDocGen') || 'Document Drafting Hub', icon: FilePenLine },
        { path: '/marketplace', label: t('navMarketplace') || 'Services Marketplace', icon: ShoppingBag },
      ],
    },
    {
      title: t('catAid') || 'Legal Aid & Drafts',
      items: [
        { path: '/knowledge', label: t('navKnowledge') || 'Knowledge Center', icon: Scale },
        { path: '/journey', label: t('navJourney') || 'Legal Rights Guide', icon: Shield },
        { path: '/strategy', label: t('navStrategy') || 'Strategy Engine', icon: ShieldCheck },
        { path: '/judge-simulator', label: t('navJudge') || 'Judge Simulator', icon: Gavel },
        { path: '/drafts', label: t('navDrafts') || 'Draft Generation', icon: FileCode },
        { path: '/emergency', label: t('navEmergency') || 'Emergency Help', icon: Heart, badge: 'SOS', badgeType: 'warning' },
      ],
    },
    {
      title: t('catCase') || 'Case Management',
      items: [
        { path: '/cases', label: t('navCases') || 'Case Folders', icon: Briefcase },
        { path: '/evidence-vault', label: t('navVault') || 'Evidence Vault', icon: FolderOpen },
        { path: '/calendar', label: t('navCalendar') || 'Court Calendar', icon: Calendar },
        { path: '/documents', label: t('navDocuments') || 'Document Vault', icon: Archive },
      ],
    },
    {
      title: t('catEdu') || 'Education & Community',
      items: [
        { path: '/academy', label: t('navAcademy') || 'Legal Learning Academy', icon: BookOpen },
        { path: '/judgments', label: t('navJudgments') || 'Landmark Judgments', icon: Bookmark },
      ],
    },
    {
      title: t('catSystem') || 'System',
      items: [
        { path: '/trust-privacy', label: t('navTrust') || 'Trust & Privacy', icon: ShieldCheck },
        { path: '/observability', label: t('navObservability') || 'System Observability', icon: Building },
      ],
    },
  ];

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const isActive = (path: string) =>
    pathname === path || (path !== '/' && pathname.startsWith(path.split('?')[0]));

  return (
    <>
      {/* Backdrop overlay for both mobile and desktop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        ref={sidebarRef}
        role="navigation"
        aria-label="Sidebar Navigation"
        className="fixed top-0 bottom-0 left-0 z-50 flex flex-col h-full w-64 bg-[var(--surface)] border-r border-[var(--border)] overflow-hidden shadow-2xl"
        style={{
          transform: isOpen ? 'translateX(0%)' : 'translateX(-100%)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'transform 300ms ease-in-out, opacity 300ms ease-in-out, visibility 300ms ease-in-out',
        }}
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
              className="p-1.5 rounded-lg hover:bg-[var(--card-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Close Sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Navigation List ────────────────────────────────── */}
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
                              onClick={() => setIsOpen(false)}
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

                              {item.badge && (
                                <span
                                  className={`
                                    px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase rounded-md shrink-0 border
                                    ${item.badgeType === 'warning'
                                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                      : item.badgeType === 'success'
                                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                      : 'bg-[var(--primary-subtle)] text-[var(--primary)] border-[var(--primary-subtle)]'
                                    }
                                  `}
                                >
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

          {/* ── User Footer ────────────────────────────────────── */}
          {userData && (
            <div className="p-3 border-t border-[var(--border)] bg-[var(--card)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FF9933] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {userData.name ? userData.name[0].toUpperCase() : 'U'}
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {userData.name || 'Citizen'}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate">
                    {userData.email || 'Nyaya User'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </aside>
    </>
  );
}
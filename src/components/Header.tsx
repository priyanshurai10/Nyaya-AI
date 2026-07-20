'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocation, ResolvedLocation } from '@/context/LocationContext';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/lib/api-client';
import { translations } from '@/lib/translations';
import Logo from '@/components/Logo';
import {
  Menu,
  MapPin,
  Globe,
  Moon,
  Sun,
  Bell,
  User,
  LogOut,
  X,
  AlertCircle,
  Loader2,
  Search,
  BookOpen,
  Scale,
  GraduationCap,
  Landmark,
} from 'lucide-react';

interface Language {
  code: string;
  label: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

interface HeaderProps {
  onToggleSidebar?: () => void;
  motherMode?: boolean;
  onMotherModeToggle?: () => void;
  onLanguageChange?: (lang: any) => void;
}

export default function Header({
  onToggleSidebar = () => {},
  motherMode = false,
  onMotherModeToggle = () => {},
  onLanguageChange
}: HeaderProps) {
  const router = useRouter();
  const { selectedLang, changeLanguage: globalChangeLanguage, t } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [theme, setTheme] = useState<string>('dark');
  const { location, setLocation } = useLocation();
  const [cityListOpen, setCityListOpen] = useState(false);
  const [pincodeVal, setPincodeVal] = useState('');
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Dropdowns
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync theme and user session
  useEffect(() => {
    const savedTheme = localStorage.getItem('nyaya_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    try {
      const user = localStorage.getItem('nyaya_user');
      if (user) {
        setUserData(JSON.parse(user));
      }
    } catch (e) {
      console.error('Failed to parse user data', e);
    }

    const handleThemeChange = () => {
      setTheme(localStorage.getItem('nyaya_theme') || 'dark');
    };

    window.addEventListener('nyaya_theme_changed', handleThemeChange);

    return () => {
      window.removeEventListener('nyaya_theme_changed', handleThemeChange);
    };
  }, []);

  // Search effect with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/v1/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
            setSearchOpen(true);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setSearchOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle outside click for search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  const handlePincodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincodeVal.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setPincodeError('Please enter a valid 6-digit Indian PIN Code.');
      return;
    }
    setPincodeLoading(true);
    setPincodeError(null);
    try {
      // Use the nationwide offline PIN code service — works for ALL of India
      const data = await apiClient.post<any>('/location/search-pincode', { pincode: cleanPin });
      if (data && data.success && data.data) {
        const loc = data.data;
        const resolved: ResolvedLocation = {
          latitude: loc.latitude ?? 20.5937,
          longitude: loc.longitude ?? 78.9629,
          city: loc.city || loc.district || loc.town || `PIN ${cleanPin}`,
          district: loc.district || '',
          state: loc.state || '',
          pincode: loc.pincode || cleanPin,
          village: loc.village || '',
          town: loc.town || '',
          display_name: `${loc.city || loc.district || loc.town || `PIN ${cleanPin}`}, ${loc.state || ''}`,
        };
        localStorage.setItem('nyaya_location', JSON.stringify(resolved));
        if (loc.latitude) localStorage.setItem('nyaya_lat', String(loc.latitude));
        if (loc.longitude) localStorage.setItem('nyaya_lon', String(loc.longitude));
        setLocation(resolved);
        window.dispatchEvent(new Event('nyaya_location_changed'));
        
        // Persist to user profile if logged in
        if (userData) {
          apiClient.post('/user/location', { location: resolved }).catch(err => {
            console.error('Failed to save location to profile:', err);
          });
        }
        
        setCityListOpen(false);
        setPincodeVal('');
      } else {
        setPincodeError(data?.error || 'This PIN Code was not found.');
      }
    } catch (err) {
      setPincodeError('This PIN Code was not found.');
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleClearLocation = () => {
    setLocation(null);
    window.dispatchEvent(new Event('nyaya_location_changed'));
    setCityListOpen(false);
  };

  const [notifications] = useState([
    { id: 1, text: '🔒 System Alert: Security Firewall active.', time: 'Just now' },
    { id: 2, text: '📝 Notice Draft created successfully.', time: '10 mins ago' },
    { id: 3, text: '🏛️ Court Proximity search active.', time: '1 hour ago' },
  ]);

  const changeLanguage = (lang: string) => {
    globalChangeLanguage(lang as any);
    setLangOpen(false);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('nyaya_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    window.dispatchEvent(new Event('nyaya_theme_changed'));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/user/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API error:', e);
    }
    localStorage.removeItem('nyaya_token');
    localStorage.removeItem('nyaya_user');
    localStorage.removeItem('nyaya_state');
    localStorage.removeItem('nyaya_lat');
    localStorage.removeItem('nyaya_lon');
    localStorage.removeItem('nyaya_village');
    localStorage.removeItem('nyaya_town');
    localStorage.removeItem('nyaya_city');
    localStorage.removeItem('nyaya_district');
    localStorage.removeItem('nyaya_state_val');
    localStorage.removeItem('nyaya_pincode');
    localStorage.removeItem('nyaya_location');
    document.cookie = "nyaya_token=; path=/; max-age=0";
    setUserData(null);
    setProfileOpen(false);
    router.push('/auth');
  };

  const currentLang = languages.find((l) => l.code === selectedLang) || languages[0];

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'knowledge': return <BookOpen size={14} className="text-blue-500" />;
      case 'judgment': return <Scale size={14} className="text-amber-500" />;
      case 'course': return <GraduationCap size={14} className="text-green-500" />;
      case 'court': return <Landmark size={14} className="text-purple-500" />;
      default: return <Search size={14} className="text-slate-500 dark:text-slate-400" />;
    }
  };

  const getResultLink = (type: string, id: string) => {
    switch (type) {
      case 'knowledge': return `/knowledge/${id}`;
      case 'judgment': return `/judgments/${id}`;
      case 'course': return `/academy/course/${id}`;
      case 'court': return `/courts/${id}`;
      default: return '#';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)]/90 backdrop-blur-xl border-b border-[var(--border)] px-3 sm:px-4 lg:px-6 py-2.5 transition-colors duration-200">
      <div className="flex items-center gap-2 min-w-0">
        {/* Left Section: Brand & Sidebar toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg hover:bg-[var(--card-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
          
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} animated={false} />
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-sm tracking-tight text-[var(--text-primary)] leading-none">
                {t('brandName')}
              </span>
              <span className="text-[9px] text-[var(--text-muted)] hidden md:block mt-0.5 font-medium">
                {t('brandSubtitle')}
              </span>
            </div>
          </Link>
        </div>


        {/* Middle Section: Global Search — shrinks on small screens */}
        <div className="flex-1 min-w-0 mx-2 sm:mx-3 lg:mx-4 max-w-xl" ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-450 dark:text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-xl bg-[var(--card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-subtle)] focus:border-[var(--primary)] text-sm transition-all"
              placeholder="Search laws, judgments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { 
                if (searchQuery.length >= 2) setSearchOpen(true); 
                setCityListOpen(false);
              }}
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Loader2 size={14} className="animate-spin text-indigo-500" />
              </div>
            )}
            
            {/* Search Results Dropdown */}
            {searchOpen && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto animate-scale-in">
                {searchResults.length > 0 ? (
                  <ul className="py-2">
                    {searchResults.map((result, idx) => (
                      <li key={idx}>
                        <Link
                          href={getResultLink(result.type, result.id)}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--card-elevated)] transition-colors border-b border-[var(--border)] last:border-0"
                        >
                          <div className="mt-0.5 p-1.5 bg-[var(--card-elevated)] rounded-lg shrink-0">
                            {getResultIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                              {result.title}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5">
                              {result.summary}
                            </p>
                          </div>
                          <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider bg-[var(--card-elevated)] px-2 py-1 rounded-md shrink-0">
                            {result.type}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
                    {isSearching ? 'Searching...' : 'No results found.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


        {/* Right Section: Pincode, Language, Theme, Notifications, Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Pincode Location display */}
          <div className="relative">
            {location ? (
              <div className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)] text-left">
                <div className="text-[var(--primary)] shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="hidden md:flex flex-col text-[10px] leading-tight select-none">
                  <span className="font-bold text-[var(--text-primary)] text-xs truncate max-w-[80px]">
                    {location.city}
                  </span>
                  <span className="font-bold text-[var(--primary)]">
                    PIN: {location.pincode}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCityListOpen(!cityListOpen);
                    setPincodeError(null);
                  }}
                  className="ml-1 p-1 rounded-lg hover:bg-[var(--card-hover)] text-[var(--text-muted)]"
                  aria-label="Change PIN"
                >
                  <MapPin size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCityListOpen(!cityListOpen);
                  setPincodeError(null);
                  setSearchOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-subtle)] transition-colors text-xs font-semibold"
              >
                <MapPin size={15} />
                <span className="hidden xl:inline">Set PIN</span>
              </button>
            )}

            {/* Pincode Search Dialog */}
            {cityListOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-2xl z-50 animate-scale-in">
                <h4 className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border)] pb-2 mb-3">
                  Update Active Pincode
                </h4>
                <form onSubmit={handlePincodeSearch} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      disabled={pincodeLoading}
                      placeholder="Enter 6-digit Pincode"
                      value={pincodeVal}
                      onChange={(e) => setPincodeVal(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-3 py-2 bg-[var(--card-elevated)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--primary-subtle)] focus:border-[var(--primary)]"
                    />
                    {pincodeVal && (
                      <button
                        type="button"
                        onClick={() => setPincodeVal('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {pincodeError && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--danger)] font-semibold bg-[var(--danger-subtle)] p-2 rounded-lg">
                      <AlertCircle size={12} className="shrink-0" />
                      <span>{pincodeError}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={pincodeLoading || pincodeVal.length !== 6}
                      className="flex-1 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-[var(--card-elevated)] disabled:text-[var(--text-muted)] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      {pincodeLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        'Search PIN'
                      )}
                    </button>
                    {location && (
                      <button
                        type="button"
                        onClick={handleClearLocation}
                        className="px-3 py-2 border border-[var(--border)] hover:bg-[var(--card-elevated)] text-[var(--text-muted)] rounded-xl text-xs font-bold transition-all"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-[var(--card-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setLangOpen(!langOpen);
                setNotifOpen(false);
                setProfileOpen(false);
                setCityListOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[var(--card-elevated)] text-[var(--text-secondary)] text-xs font-semibold transition-colors"
            >
              <Globe size={16} />
              <span className="uppercase hidden sm:inline">{currentLang.code}</span>
            </button>

            {langOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-2xl py-2 shadow-2xl z-50 animate-scale-in">
                <div className="grid grid-cols-2 gap-0.5 p-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex items-center justify-start gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-all ${
                        selectedLang === lang.code
                          ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold'
                          : 'hover:bg-[var(--card-elevated)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setLangOpen(false);
                setProfileOpen(false);
                setCityListOpen(false);
              }}
              className="p-2 rounded-xl hover:bg-[var(--card-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors relative"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--danger)] rounded-full" />
            </button>

            {notifOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-2xl z-50 animate-scale-in">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-3">
                  <h4 className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    Notifications
                  </h4>
                  <span className="text-[9px] font-extrabold text-[var(--primary)] bg-[var(--primary-subtle)] px-1.5 py-0.5 rounded">
                    3 New
                  </span>
                </div>
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="text-left">
                      <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                        {n.text}
                      </p>
                      <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                        {n.time}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--border)] text-center">
                  <Link href="/notifications" onClick={() => setNotifOpen(false)} className="text-xs font-bold text-[var(--primary)] hover:underline">
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setLangOpen(false);
                setNotifOpen(false);
                setCityListOpen(false);
              }}
              className="p-2 rounded-xl hover:bg-[var(--card-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <User size={18} />
            </button>

            {profileOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-2xl z-50 animate-scale-in text-left">
                {userData ? (
                  <div className="space-y-3">
                    <div className="border-b border-[var(--border)] pb-2">
                      <div className="font-bold text-[var(--text-primary)] text-xs">
                        {userData.name || 'Citizen'}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">
                        {userData.email || userData.mobile}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2 px-3 hover:bg-[var(--danger-subtle)] text-[var(--danger)] rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-[var(--text-muted)] mb-2">
                      Please login to access personalized features.
                    </p>
                    <Link
                      href="/auth"
                      onClick={() => setProfileOpen(false)}
                      className="w-full py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <User size={14} />
                      <span>Log In</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
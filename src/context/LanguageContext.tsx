'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { locales, LanguageCode } from '@/locales';

interface LanguageContextType {
  selectedLang: LanguageCode;
  changeLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('en');

  // Restore saved language from localStorage on initial client mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('nyaya_lang') as LanguageCode;
      if (savedLang && locales[savedLang]) {
        setSelectedLang(savedLang);
      }
    } catch (e) {
      console.warn('Failed to load language preference:', e);
    }

    const handleLangChange = () => {
      try {
        const updatedLang = localStorage.getItem('nyaya_lang') as LanguageCode;
        if (updatedLang && locales[updatedLang]) {
          setSelectedLang(updatedLang);
        }
      } catch (e) {}
    };

    window.addEventListener('nyaya_lang_changed', handleLangChange);
    return () => {
      window.removeEventListener('nyaya_lang_changed', handleLangChange);
    };
  }, []);

  const changeLanguage = useCallback((lang: LanguageCode) => {
    if (!locales[lang]) return;
    setSelectedLang(lang);
    try {
      localStorage.setItem('nyaya_lang', lang);
    } catch (e) {
      console.warn('Failed to save language preference:', e);
    }
    window.dispatchEvent(new Event('nyaya_lang_changed'));
  }, []);

  const t = useCallback((key: string): string => {
    // 1. Direct translation lookup for target language
    const currentDict = locales[selectedLang];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    // 2. Graceful fallback to English dictionary
    const fallbackDict = locales['en'];
    if (fallbackDict && fallbackDict[key]) {
      return fallbackDict[key];
    }
    // 3. Fallback to key
    return key;
  }, [selectedLang]);

  const value = useMemo(() => ({
    selectedLang,
    changeLanguage,
    t,
  }), [selectedLang, changeLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

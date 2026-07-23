'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageAutoTranslator() {
  const { selectedLang } = useLanguage();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Apply googtrans cookie
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${selectedLang}; path=/`;
    document.cookie = `googtrans=/en/${selectedLang}; domain=${domain}; path=/`;

    // Function to trigger translation element change
    const triggerTranslate = () => {
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (combo) {
        combo.value = selectedLang;
        combo.dispatchEvent(new Event('change'));
      }
    };

    // If script isn't loaded yet, load Google Translate script dynamically
    if (!document.getElementById('gt-script')) {
      const script = document.createElement('script');
      script.id = 'gt-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=nyayaGoogleTranslateInit';
      script.async = true;
      document.body.appendChild(script);

      (window as any).nyayaGoogleTranslateInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'hi,bn,ta,te,mr,gu,kn,ml,pa,en',
            autoDisplay: false,
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
        setTimeout(triggerTranslate, 500);
      };
    } else {
      triggerTranslate();
    }
  }, [selectedLang]);

  return <div id="google_translate_element" className="hidden" />;
}

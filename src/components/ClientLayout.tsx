'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LocationProvider } from '@/context/LocationContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync initial sidebar state to screen width to avoid hydration mismatch
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }

    const handleResize = () => {
      // Auto-close on mobile/tablet resize to prevent drawer overlays showing when going back/forth
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth page and full-screen routes render without layout shells
  if (pathname === '/auth') {
    return (
      <LanguageProvider>
        {children}
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <LocationProvider>
        {/* Root shell — uses CSS design tokens for all theme changes */}
        <div
          className="flex h-screen overflow-hidden font-sans transition-colors duration-200"
          style={{
            backgroundColor: 'var(--background)',
            color: 'var(--text-primary)',
          }}
        >
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

          <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
            <Header
              onToggleSidebar={() => setSidebarOpen(prev => !prev)}
            />
            <main
              className="flex-1 overflow-y-auto relative no-scrollbar"
              style={{ backgroundColor: 'var(--background)' }}
            >
              {children}
            </main>
          </div>
        </div>
      </LocationProvider>
    </LanguageProvider>
  );
}
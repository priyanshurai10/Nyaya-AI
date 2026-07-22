'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LocationProvider } from '@/context/LocationContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Sidebar remains collapsed (false) by default across all screen sizes
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Automatically collapse sidebar on route change so main content is always full-screen
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Auth page renders without layout shell
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
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { LocationProvider } from '@/context/LocationContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If we are on the auth portal or in full screen loaders, do not render layout shells
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
        <div className="flex h-screen bg-slate-50 dark:bg-[#0B1220] text-slate-900 dark:text-white overflow-hidden font-sans transition-colors duration-200">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
            <main className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-white/5 bg-slate-50 dark:bg-[#0B1220] transition-colors duration-200">
              {children}
            </main>
          </div>
        </div>
      </LocationProvider>
    </LanguageProvider>
  );
}
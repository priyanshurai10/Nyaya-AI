'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    try {
      const token = localStorage.getItem('nyaya_token');
      const user = localStorage.getItem('nyaya_user');
      const target = (token || user) ? '/dashboard' : '/auth';
      
      timer = setTimeout(() => {
        router.replace(target);
      }, 100);
    } catch (e) {
      router.replace('/auth');
    }
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col items-center justify-center space-y-6 font-sans relative overflow-hidden">
      <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-[#138808]/10 via-white/5 to-[#FF9933]/10 blur-[80px] animate-pulse" />
      <div className="relative flex flex-col items-center text-center space-y-4">
        <Logo animated={true} size={100} />
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Nyaya AI
        </h1>
        <p className="text-xs text-[var(--text-muted)] max-w-xs leading-normal">
          Redirecting to platform...
        </p>
      </div>
    </div>
  );
}

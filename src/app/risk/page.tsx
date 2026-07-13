'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RiskPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/coming-soon'); }, [router]);
  return <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-white">Redirecting...</div>;
}
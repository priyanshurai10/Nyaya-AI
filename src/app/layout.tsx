import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: "Nyaya AI — India's Multilingual Legal Operating System",
  description: "Har Bharatiya ke liye AI Lawyer Assistant. Multilingual legal assistant supporting 10+ Indian languages for FIR analysis, court notices, legal research, and more.",
  keywords: "legal AI, India, multilingual, FIR, court notice, legal assistant, Hindi, Tamil, Telugu, Nyaya AI",
  authors: [{ name: "Nyaya AI" }],
  robots: "index, follow",
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: "Nyaya AI — Justice Made Simple For Every Citizen",
    description: "AI-powered legal assistant for every Indian citizen",
    siteName: "Nyaya AI",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0B1220' },
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..900;1,14..32,300..900&family=Noto+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[var(--background)] text-[var(--text-primary)]">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
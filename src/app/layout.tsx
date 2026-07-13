import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  title: "Nyaya AI — India's Multilingual Legal Operating System",
  description: "Har Bharatiya ke liye AI Lawyer Assistant. Multilingual legal assistant supporting 10+ Indian languages for FIR analysis, court notices, legal research, and more.",
  keywords: "legal AI, India, multilingual, FIR, court notice, legal assistant, Hindi, Tamil, Telugu",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#020813] text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
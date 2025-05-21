'use client';

import QRScannerPage from '@/components/QRScannerPage';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <main className="min-h-screen">
        <QRScannerPage />
      </main>
      <Toaster />
    </ThemeProvider>
  );
}
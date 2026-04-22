import type { Metadata } from 'next';
import type { Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { PwaRegistration } from '@/components/PwaRegistration';
import { AuthProvider } from '@/lib/auth-context';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: 'KOEN',
  title: 'KOEN',
  description: 'Voice-first construction site assistant for capturing and structuring job site updates.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KOEN',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#ffd60a',
};

import { Toaster } from 'sonner';

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 relative">
        <div className="fixed inset-0 blueprint-grid z-[-1]" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PwaRegistration />
            {children}
            <Toaster 
              theme="dark" 
              position="top-center" 
              richColors 
              closeButton
              toastOptions={{
                className: 'glass-dark border-primary/20 industrial-shadow font-sans',
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


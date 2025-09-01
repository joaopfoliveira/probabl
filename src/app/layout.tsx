/**
 * Root layout - English only version
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { AdSlotBanner, AdSlotFooter } from '@/components/AdSlot';
import { FooterAffiliateButton } from '@/components/AffiliateButton';
import { Navigation } from '@/components/navigation';
import { GoogleAdsense } from '@/components/GoogleAdsense';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap', 
  fallback: ['ui-monospace', 'monospace'],
  preload: true,
});

export const metadata: Metadata = {
  title: {
    template: '%s | Its Probabl',
    default: 'Its Probabl',
  },
  description: 'AI-powered daily betting tips and predictions',
  keywords: [
    'betting tips',
    'AI predictions', 
    'sports betting',
    'football tips',
    'daily predictions',
    'betting analysis'
  ],
  authors: [{ name: 'Its Probabl' }],
  creator: 'Its Probabl',
  metadataBase: new URL('https://betting-tips-ai.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Its Probabl',
    description: 'AI-powered daily betting tips and predictions',
    url: 'https://betting-tips-ai.com',
    siteName: 'Its Probabl',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Its Probabl',
    description: 'AI-powered daily betting tips and predictions',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'google-adsense-account': 'ca-pub-1038501632603430',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body suppressHydrationWarning>
        {/* Google AdSense - Script will be added to <head> by component */}
        <GoogleAdsense clientId="ca-pub-1038501632603430" />
        
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            {/* Top Banner Ad */}
            <AdSlotBanner className="hidden md:block" />
            
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded bg-black text-white flex items-center justify-center font-bold text-sm">
                      Its
                    </div>
                    <span className="font-bold text-lg">Probabl</span>
                  </Link>
                </div>
                
                <Navigation />
                
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                </div>
              </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="border-t bg-background">
              <div className="container py-8">
                {/* Footer Banner Ad */}
                <AdSlotFooter className="mb-6" />
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="h-6 w-6 rounded bg-black text-white flex items-center justify-center font-bold text-xs">
                        Its
                      </div>
                      <span className="font-bold">Probabl</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Daily AI-generated tips for responsible sports betting.
                    </p>
                    <FooterAffiliateButton locale="en" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Navigation</h3>
                    <ul className="space-y-2 text-sm">
                      <li><Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
                      <li><Link href="/today" className="text-muted-foreground hover:text-foreground">Today</Link></li>
                      <li><Link href="/history" className="text-muted-foreground hover:text-foreground">History</Link></li>
                      {/* <li><a href="/blog" className="text-muted-foreground hover:text-foreground">Blog</a></li> */}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Legal</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="/about" className="text-muted-foreground hover:text-foreground">About</a></li>
                      <li><a href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                      <li><a href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                  <p>&copy; 2024 Its Probabl. All rights reserved.</p>
                  <p className="mt-2">
                    Please gamble responsibly. This website is for entertainment purposes only.
                  </p>
                  <p className="mt-2">
                    <Link href="/admin" className="opacity-20 hover:opacity-100 transition-opacity text-xs">
                      ⚙️
                    </Link>
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

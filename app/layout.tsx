import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AppShell from "@/components/AppShell";
import FacebookPixel from "@/components/FacebookPixel";
import { Suspense } from "react";
import { CartProvider } from "@/context/CartContext";
import { SoundProvider } from "@/context/SoundContext";
import DynamicFooter from "@/components/DynamicFooter";
import StyleDNAWidget from "@/components/StyleDNAWidget";
import FashionPersonaSidebar from "@/components/FashionPersonaSidebar";
import FloatingTracker from "@/components/FloatingTracker";
import AIConcierge from "@/components/AIConcierge";
import { ThemeProvider } from "@/context/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ToastProvider";
import { I18nProvider } from "@/context/I18nContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://astharhat.com'), // Replace with actual deployment URL
  title: {
    default: "AstharHat - Biggest Sale & Premium Electronics",
    template: "%s | AstharHat",
  },
  description: "Up to 30% off on premium electronics and lifestyle gadgets. Shop now for the best deals in Bangladesh.",
  openGraph: {
    title: "AstharHat - Biggest Sale & Premium Electronics",
    description: "Discover premium electronics and lifestyle gadgets at unbeatable prices.",
    url: 'https://astharhat.com',
    siteName: 'AstharHat',
    images: [
      {
        url: 'https://astharhat.com/og-image.jpg', // Ensure this image exists in your public folder or host
        width: 1200,
        height: 630,
        alt: 'AstharHat Store',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AstharHat',
    description: 'Premium Electronics & Lifestyle Gadgets',
    images: ['https://astharhat.com/og-image.jpg'],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'AstharHat',
              url: 'https://astharhat.com',
              logo: 'https://astharhat.com/logo.png',
              sameAs: [
                'https://www.facebook.com/AstharHat',
                'https://www.youtube.com/@AstharHat',
                'https://www.instagram.com/AstharHat'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+8801700000000',
                contactType: 'customer service',
                areaServed: 'BD',
                availableLanguage: ['en', 'bn']
              }
            })
          }}
        />
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
        <Providers>
          <I18nProvider>
            <ErrorBoundary>
              <ToastProvider>
                <CartProvider>
                  <SoundProvider>
                    <AppShell>
                      {children}
                    </AppShell>
                    <FashionPersonaSidebar />
                    <FloatingTracker />
                    <AIConcierge />
                    <DynamicFooter />
                    <LanguageSwitcher />
                  </SoundProvider>
                </CartProvider>
              </ToastProvider>
            </ErrorBoundary>
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}

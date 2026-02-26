import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import AppShell from "@/components/AppShell";
import FacebookPixel from "@/components/FacebookPixel";
import { Suspense } from "react";
import { CartProvider } from "@/context/CartContext";
import { SoundProvider } from "@/context/SoundContext";
import DynamicFooter from "@/components/DynamicFooter";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ToastProvider";
import { I18nProvider } from "@/context/I18nContext";
import { LocationProvider } from "@/context/LocationContext";
import { LazyMotion, domAnimation } from "framer-motion"

export const runtime = 'edge';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://astharhat.com'), // Replace with actual deployment URL
  title: {
    default: "AstharHat - Premium E-commerce Experience",
    template: "%s | AstharHat",
  },
  description: "Experience premium shopping with AstharHat. Quality products, fast delivery, and secure payments.",
  openGraph: {
    title: "AstharHat - Premium E-commerce Store",
    description: "Shop the best electronics, lifestyle products, and more at AstharHat.",
    url: 'https://astharhat.com',
    siteName: 'AstharHat',
    images: [
      {
        url: 'https://astharhat.com/og-image.jpg',
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 text-blue-900`}
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
        <ErrorBoundary>
          <Providers>
            <I18nProvider>
              <ToastProvider>
                <CartProvider>
                  <LocationProvider>
                    <SoundProvider>
                      <LazyMotion features={domAnimation} strict>
                        <AppShell>
                          <Suspense fallback={null}>
                            {children}
                          </Suspense>
                        </AppShell>
                      </LazyMotion>
                      <DynamicFooter />
                      <LanguageSwitcher />
                    </SoundProvider>
                  </LocationProvider>
                </CartProvider>
              </ToastProvider>
            </I18nProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import { Oswald } from 'next/font/google';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { WhatsAppButton } from '@/components/vivaan/WhatsAppButton';

import { ErrorBoundary } from '@/components/ErrorBoundary';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Vivaan Farms',
  description: 'Pure A2 Gir Cow Bilona Ghee & Organic Goods from Gujarat',
  openGraph: {
    title: 'Vivaan Farms',
    description: 'Pure A2 Gir Cow Bilona Ghee & Organic Goods from Gujarat',
  },
  icons: {
    icon: 'https://i.ibb.co/FqCKvSVb/Group-66-1-removebg-preview.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${oswald.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://i.ibb.co/FqCKvSVb/Group-66-1-removebg-preview.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <FirebaseClientProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <WhatsAppButton />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

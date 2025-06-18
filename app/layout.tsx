import type React from 'react';
import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Footer } from '@/app/components/footer';

// Inter with optimized settings for Google-like typography
// Configured with specific weights and features for Material Design 3
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal'],
  preload: true,
  adjustFontFallback: false, // Better font rendering control
});

export const metadata = {
  title: 'ProtoPeek',
  description: 'A modern tool to decode protobuf data using .proto files',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem={false}
          disableTransitionOnChange
        >
          <main className='flex min-h-screen flex-col bg-[#1a1a1a] text-white'>
            <div className='flex-grow'>{children}</div>
            <Footer />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

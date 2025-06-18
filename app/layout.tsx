import type React from 'react';
import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Footer } from '@/app/components/footer';

// Inter with optimized settings for Material Design 3 typography
// Configured for the best rendering quality and readability
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal'],
  preload: true,
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

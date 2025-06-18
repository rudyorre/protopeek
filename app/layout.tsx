import type React from 'react';
import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Footer } from '@/app/components/footer';
import { BackToTop } from '@/app/components/back-to-top';

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
  title: 'ProtoPeek - Protocol Buffer Decoder & Visualizer',
  description: 'A modern tool to decode and visualize protobuf data using .proto files, entirely in your browser. Privacy-focused with local-only processing.',
  keywords: 'protobuf, protocol buffers, decoder, visualizer, .proto files, protobuf decoder, binary data',
  authors: [{ name: 'Rudy Orre' }],
  openGraph: {
    title: 'ProtoPeek - Protocol Buffer Decoder & Visualizer',
    description: 'Decode and visualize Protocol Buffer messages with schema support, entirely in your browser',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProtoPeek - Protocol Buffer Decoder & Visualizer',
    description: 'Decode and visualize Protocol Buffer messages with schema support, entirely in your browser',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning className="preload">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove preload class after page loads to enable smooth transitions
              window.addEventListener('load', () => {
                setTimeout(() => {
                  document.documentElement.classList.remove('preload');
                }, 100);
              });
            `,
          }}
        />
      </head>
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
            <BackToTop />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

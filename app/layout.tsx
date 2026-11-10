import type React from 'react';
import type { Metadata } from 'next';
import '@/app/globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Footer } from '@/app/components/footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ProtoPeek — Protocol Buffers Wire Inspector & Visualizer',
  description:
    'Client-side Protocol Buffers (protobuf) wire format decoder, interactive hex dump inspector, and schema-aware visualizer. Decode hex, base64, or binary payloads with or without .proto files.',
  keywords: [
    'protobuf',
    'protocol buffers',
    'protobuf decoder',
    'wire format inspector',
    'hex dump',
    'grpc debugger',
    'proto3',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning className='dark'>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className='flex min-h-screen flex-col bg-[#0B0E14] text-slate-100'>
            <main className='flex-grow'>{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

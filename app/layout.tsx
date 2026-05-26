import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'VoiceForge AI - Professional AI Voice Cloning Platform',
  description:
    'Create stunning AI-generated voices with our cutting-edge voice cloning technology. Text-to-speech, voice cloning, and RVC conversion powered by state-of-the-art AI models.',
  openGraph: {
    title: 'VoiceForge AI - Professional AI Voice Cloning Platform',
    description:
      'Create stunning AI-generated voices with our cutting-edge voice cloning technology.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

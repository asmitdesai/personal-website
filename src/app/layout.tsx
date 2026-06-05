import type { Metadata } from 'next';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PageWrapper } from '@/components/layout/PageWrapper';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: 'Asmit Desai — Security Engineering',
  description: 'Security engineering student, CTF player, and detection engineer. PES University.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#080808] text-[#ededed] antialiased font-[family-name:var(--font-sans)]">
        <Nav />
        <PageWrapper>
          {children}
        </PageWrapper>
        <Footer />
      </body>
    </html>
  );
}

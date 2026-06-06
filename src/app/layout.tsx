import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { CursorDot } from '@/components/ui/CursorDot';
import { SITE } from '@/lib/site';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

const title = `${SITE.name} — Security Engineering`;
const ogImage = `/og?title=${encodeURIComponent(SITE.name)}&subtitle=${encodeURIComponent('Security Engineering')}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: title,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title,
    description: SITE.description,
    url: SITE.url,
    images: [{ url: ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: SITE.description,
    images: [ogImage],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#080808] text-[#ededed] antialiased font-[family-name:var(--font-sans)]">
        <CursorDot />
        <Nav />
        <PageWrapper>
          {children}
        </PageWrapper>
        <Footer />
      </body>
    </html>
  );
}

import Link from 'next/link';
import { SearchBox } from '@/components/ui/SearchBox';
import { NavLinks } from './NavLinks';

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between gap-4 px-6">
        <Link href="/" className="shrink-0 font-mono text-[13px] text-fg transition-colors hover:text-accent sm:text-sm">
          asmitdesai.dev
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden sm:block">
            <SearchBox />
          </div>
          <NavLinks />
          <a
            href="https://tryhackme.com/p/asmitdesai02"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded border border-accent/30 px-3 py-1 font-mono text-[11px] text-accent transition-all hover:border-accent hover:bg-accent/5 sm:inline-block"
          >
            TryHackMe ↗
          </a>
        </div>
      </div>
      {/* hairline glow along the bottom border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.35), transparent)' }}
      />
    </nav>
  );
}

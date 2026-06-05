import Link from 'next/link';

const NAV_LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/writeups/thm', label: 'THM' },
  { href: '/writeups/security', label: 'Security' },
  { href: '/about', label: 'About' },
];

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#080808]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-mono)] text-sm text-[#ededed] transition-colors hover:text-[#22c55e]"
        >
          asmit.dev
        </Link>
        <div className="flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="nav-link text-sm text-[#a1a1a1] transition-colors hover:text-[#ededed]"
            >
              {label}
            </Link>
          ))}
          <a
            href="https://tryhackme.com/p/asmitdesai"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-[#22c55e]/30 px-3 py-1 font-[family-name:var(--font-mono)] text-[11px] text-[#22c55e] transition-all hover:border-[#22c55e] hover:bg-[#22c55e]/5"
          >
            TryHackMe ↗
          </a>
        </div>
      </div>
    </nav>
  );
}

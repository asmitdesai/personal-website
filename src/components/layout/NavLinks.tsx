'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActivePath } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/writeups/thm', label: 'THM' },
  { href: '/writeups/security', label: 'Security' },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {NAV_LINKS.map(({ href, label }) => {
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`nav-link text-[13px] transition-colors sm:text-sm ${active ? 'nav-link--active text-fg' : 'text-fg-2 hover:text-fg'}`}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/asmitdesai' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/asmit-desai-858668230/' },
  { label: 'TryHackMe', href: 'https://tryhackme.com/p/asmitdesai02' },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border py-8">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 font-mono text-xs text-muted">
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          <span>all systems nominal · © {new Date().getFullYear()} Asmit Desai</span>
        </p>
        <div className="flex gap-6">
          {LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-muted transition-colors hover:text-accent"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

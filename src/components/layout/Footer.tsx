const LINKS = [
  { label: 'GitHub', href: 'https://github.com/asmitdesai' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/asmitdesai' },
  { label: 'TryHackMe', href: 'https://tryhackme.com/p/asmitdesai02' },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[#1a1a1a] py-8">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6">
        <p className="font-[family-name:var(--font-mono)] text-xs text-[#525252]">
          © {new Date().getFullYear()} Asmit Desai
        </p>
        <div className="flex gap-6">
          {LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#525252] transition-colors hover:text-[#a1a1a1]"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

import type { ReactNode } from 'react';

export function SectionLabel({ children, inline = false }: { children: ReactNode; inline?: boolean }) {
  if (inline) {
    return <span className="mr-3 font-mono text-[10px] uppercase tracking-widest text-muted">{children}</span>;
  }
  return <h2 className="mb-5 font-mono text-xs uppercase tracking-widest text-muted">{children}</h2>;
}

import type { ReactNode } from 'react';

const CORNERS = ['tl', 'tr', 'bl', 'br'] as const;

const SURFACE = {
  surface: 'bg-surface',
  terminal: 'bg-terminal',
} as const;

interface ReticleCardProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article';
  surface?: keyof typeof SURFACE;
}

export function ReticleCard({ children, className = '', as: Tag = 'div', surface = 'surface' }: ReticleCardProps) {
  return (
    <Tag className={`reticle rounded-xl border border-border p-6 ${SURFACE[surface]} ${className}`}>
      {CORNERS.map((corner) => (
        <span key={corner} data-corner={corner} className="reticle-bracket" aria-hidden />
      ))}
      {children}
    </Tag>
  );
}

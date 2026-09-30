import { DotGrid } from './DotGrid';
import { formatCount } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  count?: number;
}

// Expects to sit at the top of a `px-6 py-20` <main>; the dot grid bleeds into that padding.
export function PageHeader({ eyebrow, title, subtitle, count }: PageHeaderProps) {
  return (
    <header data-page-header className="relative isolate mb-10 border-b border-border pb-8">
      <DotGrid variant="header" />
      <p className="mb-3 font-mono text-xs text-accent">{`// ${eyebrow}`}</p>
      <div className="flex items-end justify-between gap-6">
        <h1 className="text-3xl font-semibold tracking-tight text-fg">{title}</h1>
        {count !== undefined && (
          <span className="shrink-0 pb-1 font-mono text-xs text-muted">{formatCount(count)}</span>
        )}
      </div>
      {subtitle && <p className="mt-2 text-sm text-fg-2">{subtitle}</p>}
    </header>
  );
}

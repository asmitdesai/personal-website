import { DotGrid } from './DotGrid';

export function EmptyState({ label = 'Nothing published here yet.' }: { label?: string }) {
  return (
    <div
      data-empty-state
      className="relative isolate flex min-h-[140px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border-hover p-6"
    >
      <DotGrid variant="panel" />
      <p className="font-mono text-sm text-muted">{label}</p>
    </div>
  );
}

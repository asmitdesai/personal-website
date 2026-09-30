type Variant = 'hero' | 'header' | 'panel';

const WRAPPER: Record<Variant, string> = {
  hero: 'inset-0',
  header: '-inset-x-6 -top-20 bottom-0',
  panel: 'inset-0',
};

// Decorative backdrop. The parent must be `relative isolate` — the grid sits at -z-10.
export function DotGrid({ variant }: { variant: Variant }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute -z-10 overflow-hidden ${WRAPPER[variant]}`}>
      {variant === 'hero' && (
        <div
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 65%)' }}
        />
      )}
      <div className={`dot-grid dot-grid--${variant}`} />
    </div>
  );
}

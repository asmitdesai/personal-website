export function EmptyState({ label = 'Nothing published here yet.' }: { label?: string }) {
  return (
    <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-[#2a2a2a] p-6">
      <p className="font-[family-name:var(--font-mono)] text-sm text-[#525252]">{label}</p>
    </div>
  );
}

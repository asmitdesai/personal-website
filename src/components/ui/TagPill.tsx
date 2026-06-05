import Link from 'next/link';

interface TagPillProps {
  name: string;
  slug?: string;
  href?: string;
}

export function TagPill({ name, slug, href }: TagPillProps) {
  const target = href ?? (slug ? `/tags/${slug}` : undefined);
  const className =
    'font-[family-name:var(--font-mono)] text-[11px] text-[#22c55e] border border-[#22c55e]/20 rounded px-2 py-0.5 transition-all hover:border-[#22c55e]/50 hover:bg-[#22c55e]/5 hover:scale-[1.02] inline-block';

  if (target) {
    return (
      <Link href={target} className={className}>
        {name}
      </Link>
    );
  }
  return <span className={className}>{name}</span>;
}

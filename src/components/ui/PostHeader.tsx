import Link from 'next/link';
import type { Post } from '@/db/queries';
import { DotGrid } from './DotGrid';
import { TagPill } from './TagPill';
import { backLink, formatDate, parseTags, readingTime, typeLabel } from '@/lib/utils';

// Expects to sit at the top of a `px-6 py-20` <main>; the dot grid bleeds into that padding.
export function PostHeader({ post }: { post: Post }) {
  const tags = parseTags(post.tags);
  const back = backLink(post.type);
  return (
    <header data-post-header className="relative isolate mb-10 border-b border-border pb-8">
      <DotGrid variant="header" />
      <Link href={back.href} className="mb-6 inline-block font-mono text-xs text-muted transition-colors hover:text-accent">
        ← back to {back.label}
      </Link>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="rounded border border-accent/20 px-2 py-0.5 font-mono text-[11px] text-accent">
          {typeLabel(post.type)}
        </span>
        {post.published_at && (
          <span className="font-mono text-xs text-muted">
            {formatDate(post.published_at, { month: 'long', year: 'numeric' })}
          </span>
        )}
        <span className="font-mono text-xs text-muted">{readingTime(post.body)} min read</span>
      </div>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight text-fg">{post.title}</h1>
      {post.excerpt && <p className="mb-4 text-sm leading-relaxed text-fg-2">{post.excerpt}</p>}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagPill key={tag} name={tag} />
          ))}
        </div>
      )}
    </header>
  );
}

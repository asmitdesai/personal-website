import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAnyBySlug } from '@/db/queries';
import { TagPill } from '@/components/ui/TagPill';
import { Markdown } from '@/components/ui/Markdown';
import { formatDate, parseTags, readingTime } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

// Drafts must never be indexed.
export const metadata: Metadata = {
  title: 'Preview',
  robots: { index: false, follow: false },
};

const TYPE_LABEL: Record<string, string> = {
  project: 'Project',
  thm: 'TryHackMe',
  security: 'Security',
};

export default async function PreviewPage({ params }: Props) {
  const { slug } = await params;
  const post = await getAnyBySlug(slug);
  if (!post) notFound();

  const tags = parseTags(post.tags);

  return (
    <main className="mx-auto max-w-[768px] px-6 py-20">
      <div className="mb-8 rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/5 px-4 py-2 font-[family-name:var(--font-mono)] text-xs text-[#22c55e]">
        {post.published ? 'PREVIEW — this post is published' : 'DRAFT PREVIEW — not published'}
      </div>
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded border border-[#22c55e]/20 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-[#22c55e]">
            {TYPE_LABEL[post.type] ?? post.type}
          </span>
          {post.published_at && (
            <span className="font-[family-name:var(--font-mono)] text-xs text-[#525252]">
              {formatDate(post.published_at, { month: 'long', year: 'numeric' })}
            </span>
          )}
          <span className="font-[family-name:var(--font-mono)] text-xs text-[#525252]">
            {readingTime(post.body)} min read
          </span>
        </div>
        <h1 className="mb-4 text-3xl font-semibold text-[#ededed]">{post.title}</h1>
        {post.excerpt && (
          <p className="mb-4 text-sm leading-relaxed text-[#a1a1a1]">{post.excerpt}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagPill key={tag} name={tag} />
            ))}
          </div>
        )}
      </div>
      <hr className="mb-8 border-[#1a1a1a]" />
      <article className="prose-custom">
        <Markdown body={post.body} />
      </article>
    </main>
  );
}

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { getPostBySlug } from '@/db/queries';
import { TagPill } from '@/components/ui/TagPill';
import { formatDate, parseTags } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, 'project');
  return { title: post ? `${post.title} — Asmit Desai` : 'Not Found' };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, 'project');
  if (!post) notFound();

  const tags = parseTags(post.tags);

  return (
    <main className="mx-auto max-w-[768px] px-6 py-20">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded border border-[#22c55e]/20 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-[#22c55e]">
            Project
          </span>
          {post.published_at && (
            <span className="font-[family-name:var(--font-mono)] text-xs text-[#525252]">
              {formatDate(post.published_at, { month: 'long', year: 'numeric' })}
            </span>
          )}
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
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{post.body}</ReactMarkdown>
      </article>
    </main>
  );
}

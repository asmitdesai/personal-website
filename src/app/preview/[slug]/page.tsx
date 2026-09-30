import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAnyBySlug } from '@/db/queries';
import { Markdown } from '@/components/ui/Markdown';
import { PostHeader } from '@/components/ui/PostHeader';
import { ReadingProgress } from '@/components/ui/ReadingProgress';

interface Props {
  params: Promise<{ slug: string }>;
}

// Drafts must never be indexed.
export const metadata: Metadata = {
  title: 'Preview',
  robots: { index: false, follow: false },
};

export default async function PreviewPage({ params }: Props) {
  const { slug } = await params;
  const post = await getAnyBySlug(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-[768px] px-6 py-20">
      <div className="relative z-10 mb-8 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 font-mono text-xs text-accent">
        {post.published ? 'PREVIEW — this post is published' : 'DRAFT PREVIEW — not published'}
      </div>
      <ReadingProgress />
      <PostHeader post={post} />
      <article className="prose-custom">
        <Markdown body={post.body} />
      </article>
    </main>
  );
}

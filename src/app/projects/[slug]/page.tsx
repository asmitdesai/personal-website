import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostBySlug } from '@/db/queries';
import { Markdown } from '@/components/ui/Markdown';
import { PostHeader } from '@/components/ui/PostHeader';
import { ReadingProgress } from '@/components/ui/ReadingProgress';
import { postMetadata, postJsonLd } from '@/lib/seo';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, 'project');
  return post ? postMetadata(post) : { title: 'Not Found' };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, 'project');
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-[768px] px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: postJsonLd(post) }}
      />
      <ReadingProgress />
      <PostHeader post={post} />
      <article className="prose-custom">
        <Markdown body={post.body} />
      </article>
    </main>
  );
}

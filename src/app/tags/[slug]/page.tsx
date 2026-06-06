import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTagBySlug, getPostsByTag } from '@/db/queries';
import { PostCard } from '@/components/ui/PostCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  return { title: tag ? `#${tag.name}` : 'Tag Not Found' };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const [tag, posts] = await Promise.all([
    getTagBySlug(slug),
    getPostsByTag(slug),
  ]);

  if (!tag) notFound();

  return (
    <main className="mx-auto max-w-[768px] px-6 py-20">
      <div className="mb-10">
        <p className="mb-1 font-[family-name:var(--font-mono)] text-xs text-[#525252]">TAG</p>
        <h1 className="text-3xl font-semibold text-[#ededed]">#{tag.name}</h1>
      </div>
      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}

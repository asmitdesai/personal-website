import type { Metadata } from 'next';
import { getPublishedPosts } from '@/db/queries';
import { TagFilter } from '@/components/ui/TagFilter';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'Security Posts' };

export default async function SecurityPage() {
  const posts = await getPublishedPosts('security');

  return (
    <main className="mx-auto max-w-[768px] px-6 py-20">
      <PageHeader
        eyebrow="security"
        title="Security"
        subtitle="Detection engineering deep-dives, tooling writeups, and research notes."
        count={posts.length}
      />
      {posts.length === 0 ? <EmptyState /> : <TagFilter posts={posts} />}
    </main>
  );
}

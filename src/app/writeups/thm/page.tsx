import type { Metadata } from 'next';
import { getPublishedPosts } from '@/db/queries';
import { TagFilter } from '@/components/ui/TagFilter';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'TryHackMe Writeups' };

export default async function ThmPage() {
  const posts = await getPublishedPosts('thm');

  return (
    <main className="mx-auto max-w-[768px] px-6 py-20">
      <PageHeader
        eyebrow="tryhackme"
        title="TryHackMe Writeups"
        subtitle="Path completions, room walkthroughs, and learning notes."
        count={posts.length}
      />
      {posts.length === 0 ? <EmptyState /> : <TagFilter posts={posts} />}
    </main>
  );
}

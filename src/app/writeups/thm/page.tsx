import type { Metadata } from 'next';
import { getPublishedPosts } from '@/db/queries';
import { TagFilter } from '@/components/ui/TagFilter';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'TryHackMe Writeups' };

export default async function ThmPage() {
  const posts = await getPublishedPosts('thm');

  return (
    <main className="mx-auto max-w-[768px] px-6 py-20">
      <h1 className="mb-2 text-3xl font-semibold text-[#ededed]">TryHackMe Writeups</h1>
      <p className="mb-10 text-sm text-[#a1a1a1]">
        Path completions, room walkthroughs, and learning notes.
      </p>
      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <TagFilter posts={posts} />
      )}
    </main>
  );
}

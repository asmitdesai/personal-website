import type { Metadata } from 'next';
import { getPublishedPosts } from '@/db/queries';
import { TagFilter } from '@/components/ui/TagFilter';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  const projects = await getPublishedPosts('project');

  return (
    <main className="mx-auto max-w-[768px] px-6 py-20">
      <h1 className="mb-2 text-3xl font-semibold text-[#ededed]">Projects</h1>
      <p className="mb-10 text-sm text-[#a1a1a1]">
        Detection engineering work, CTF tooling, and security research.
      </p>
      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <TagFilter posts={projects} />
      )}
    </main>
  );
}

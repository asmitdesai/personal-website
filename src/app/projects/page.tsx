import type { Metadata } from 'next';
import { getPublishedPosts } from '@/db/queries';
import { TagFilter } from '@/components/ui/TagFilter';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  const projects = await getPublishedPosts('project');

  return (
    <main className="mx-auto max-w-[768px] px-6 py-20">
      <PageHeader
        eyebrow="projects"
        title="Projects"
        subtitle="Detection engineering work, CTF tooling, and security research."
        count={projects.length}
      />
      {projects.length === 0 ? <EmptyState /> : <TagFilter posts={projects} />}
    </main>
  );
}

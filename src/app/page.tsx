import Link from 'next/link';
import { Hero } from '@/components/sections/Hero';
import { PostCard } from '@/components/ui/PostCard';
import { TagPill } from '@/components/ui/TagPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Reveal } from '@/components/ui/Reveal';
import { getRecentPosts, getAllTags } from '@/db/queries';

const TOOLS = [
  'Wazuh', 'Velociraptor', 'MISP', 'VirusTotal', 'Shuffle',
  'Burp Suite', 'Wireshark', 'Docker', 'Python', 'TypeScript',
];

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/asmitdesai' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/asmit-desai-858668230/' },
  { label: 'THM', href: 'https://tryhackme.com/p/asmitdesai02' },
];

export default async function HomePage() {
  const [recentPosts, allTags] = await Promise.all([getRecentPosts(4), getAllTags()]);

  const featured = recentPosts[0] ?? null;
  const rest = recentPosts.slice(1);

  return (
    <>
      <Hero />

      {/* skills strip */}
      <div className="border-y border-border bg-surface py-4">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-3 gap-y-2 px-6">
          <SectionLabel inline>Tools</SectionLabel>
          {TOOLS.map((tool) => (
            <span
              key={tool}
              className="rounded-full border border-border bg-surface-2 px-3 py-1 font-mono text-xs text-fg-2 transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* main content grid */}
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[1fr_300px]">
        <div>
          <SectionLabel>Recent Work</SectionLabel>
          {recentPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {featured && <PostCard post={featured} index={0} featured />}
              {rest.map((post, i) => (
                <PostCard key={post.id} post={post} index={i + 1} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-10">
          <Reveal>
            <SectionLabel>About</SectionLabel>
            <p className="text-sm leading-relaxed text-fg-2">
              Security engineering student at PES University, focused on SOC and detection engineering.
              Built a Wazuh + MISP enrichment pipeline at SecPod.
            </p>
            <Link href="/about" className="mt-3 inline-block font-mono text-xs text-accent transition-colors hover:text-[#4ade80]">
              More about me →
            </Link>
          </Reveal>

          <Reveal delay={0.06}>
            <SectionLabel>Links</SectionLabel>
            <div className="flex gap-4">
              {LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-muted transition-colors hover:text-accent"
                >
                  {label} ↗
                </a>
              ))}
            </div>
          </Reveal>

          {allTags.length > 0 && (
            <Reveal delay={0.12}>
              <SectionLabel>Tags</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <TagPill key={tag.id} name={tag.name} slug={tag.slug} />
                ))}
              </div>
            </Reveal>
          )}
        </aside>
      </div>
    </>
  );
}

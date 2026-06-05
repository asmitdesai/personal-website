import { Hero } from '@/components/sections/Hero';
import { PostCard } from '@/components/ui/PostCard';
import { TagPill } from '@/components/ui/TagPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { getRecentPosts, getAllTags } from '@/db/queries';

const TOOLS = [
  'Wazuh', 'Velociraptor', 'MISP', 'VirusTotal', 'Shuffle',
  'Burp Suite', 'Wireshark', 'Docker', 'Python', 'TypeScript',
];

export default async function HomePage() {
  const [recentPosts, allTags] = await Promise.all([
    getRecentPosts(4),
    getAllTags(),
  ]);

  const featured = recentPosts[0] ?? null;
  const rest = recentPosts.slice(1);

  return (
    <>
      <Hero />

      {/* skills strip */}
      <div className="border-y border-[#1a1a1a] bg-[#0f0f0f] py-4">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-6 gap-y-2 px-6">
          <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#525252]">
            TOOLS
          </span>
          {TOOLS.map((tool) => (
            <span
              key={tool}
              className="font-[family-name:var(--font-mono)] text-xs text-[#a1a1a1]"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* main content grid */}
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[1fr_300px]">
        {/* left: posts */}
        <div>
          <h2 className="mb-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[#525252]">
            Recent Work
          </h2>
          {recentPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {featured && <PostCard post={featured} index={0} />}
              {rest.map((post, i) => (
                <PostCard key={post.id} post={post} index={i + 1} />
              ))}
            </div>
          )}
        </div>

        {/* right: sidebar */}
        <aside className="space-y-10">
          <div>
            <h2 className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[#525252]">
              About
            </h2>
            <p className="text-sm leading-relaxed text-[#a1a1a1]">
              BTech CSE at PES University, Bengaluru. Focused on SOC
              engineering, threat detection, and incident response.
              Active CTF player and challenge author.
            </p>
            <div className="mt-4 flex gap-4">
              <a href="https://github.com/asmitdesai" target="_blank" rel="noopener noreferrer" className="font-[family-name:var(--font-mono)] text-xs text-[#525252] transition-colors hover:text-[#a1a1a1]">GitHub ↗</a>
              <a href="https://linkedin.com/in/asmit-desai-858668230/" target="_blank" rel="noopener noreferrer" className="font-[family-name:var(--font-mono)] text-xs text-[#525252] transition-colors hover:text-[#a1a1a1]">LinkedIn ↗</a>
              <a href="https://tryhackme.com/p/asmitdesai02" target="_blank" rel="noopener noreferrer" className="font-[family-name:var(--font-mono)] text-xs text-[#525252] transition-colors hover:text-[#a1a1a1]">THM ↗</a>
            </div>
          </div>

          {allTags.length > 0 && (
            <div>
              <h2 className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[#525252]">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <TagPill key={tag.id} name={tag.name} slug={tag.slug} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

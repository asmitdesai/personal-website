'use client';

import { useState } from 'react';
import { PostCard } from './PostCard';
import { EmptyState } from './EmptyState';
import { parseTags } from '@/lib/utils';
import type { Post } from '@/db/queries';

export function TagFilter({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState<string | null>(null);

  const allTags = Array.from(
    new Set(posts.flatMap((p) => parseTags(p.tags))),
  );

  const filtered = active
    ? posts.filter((p) => parseTags(p.tags).includes(active))
    : posts;

  return (
    <div>
      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActive(null)}
            className={`rounded border px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] transition-all ${
              active === null
                ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                : 'border-[#2a2a2a] text-[#525252] hover:border-[#3a3a3a] hover:text-[#a1a1a1]'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActive(tag === active ? null : tag)}
              className={`rounded border px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] transition-all ${
                active === tag
                  ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]'
                  : 'border-[#22c55e]/20 text-[#22c55e] hover:border-[#22c55e]/50 hover:bg-[#22c55e]/5'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
        )}
      </div>
    </div>
  );
}

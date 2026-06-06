'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { parseTags, postPath } from '@/lib/utils';
import type { Post } from '@/db/queries';

type Indexed = Post & { tagsText: string };

const TYPE_LABEL: Record<string, string> = {
  project: 'Project',
  thm: 'TryHackMe',
  security: 'Security',
};

export function SearchBox() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<Indexed[] | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy-load the index the first time the box is opened (from an event handler,
  // not an effect, so we never setState synchronously during render).
  function loadIndex() {
    if (posts !== null || loading) return;
    setLoading(true);
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data: { posts: Post[] }) => {
        setPosts(
          data.posts.map((p) => ({ ...p, tagsText: parseTags(p.tags).join(' ') })),
        );
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }

  function openBox() {
    setOpen(true);
    loadIndex();
  }

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const fuse = useMemo(
    () =>
      posts
        ? new Fuse(posts, {
            keys: [
              { name: 'title', weight: 2 },
              { name: 'excerpt', weight: 1 },
              { name: 'tagsText', weight: 1 },
            ],
            threshold: 0.4,
            ignoreLocation: true,
          })
        : null,
    [posts],
  );

  const results = useMemo(() => {
    if (!query.trim() || !fuse) return [];
    return fuse.search(query.trim()).slice(0, 6).map((r) => r.item);
  }, [query, fuse]);

  function go(post: Post) {
    setOpen(false);
    setQuery('');
    router.push(postPath(post));
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onFocus={openBox}
        onChange={(e) => {
          setQuery(e.target.value);
          openBox();
        }}
        placeholder="Search…"
        aria-label="Search posts"
        className={`rounded border border-[#1a1a1a] bg-[#0f0f0f] px-3 py-1 font-[family-name:var(--font-mono)] text-xs text-[#ededed] placeholder:text-[#525252] transition-all duration-300 focus:border-[#22c55e]/40 focus:outline-none ${
          open ? 'w-56' : 'w-32'
        }`}
      />

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {loading && posts === null ? (
            <div className="space-y-2 p-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-[#1a1a1a]" />
                  <div className="h-2 w-1/2 animate-pulse rounded bg-[#141414]" />
                </div>
              ))}
            </div>
          ) : query.trim() === '' ? (
            <p className="p-3 font-[family-name:var(--font-mono)] text-[11px] text-[#525252]">
              Type to search posts…
            </p>
          ) : results.length === 0 ? (
            <p className="p-3 font-[family-name:var(--font-mono)] text-[11px] text-[#525252]">
              No matches for “{query.trim()}”
            </p>
          ) : (
            <ul>
              {results.map((post) => (
                <li key={post.id}>
                  <button
                    type="button"
                    onClick={() => go(post)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-[#22c55e]/5"
                  >
                    <span className="truncate text-xs text-[#ededed]">{post.title}</span>
                    <span className="shrink-0 font-[family-name:var(--font-mono)] text-[10px] text-[#525252]">
                      {TYPE_LABEL[post.type] ?? post.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { parseGitHubRepo, timeAgo } from '@/lib/utils';

type Stats = { stars: number; pushedAt: string };

const CACHE_TTL = 1000 * 60 * 30; // 30 min

function readCache(repo: string): Stats | null {
  try {
    const raw = sessionStorage.getItem(`gh:${repo}`);
    if (!raw) return null;
    const { stats, ts } = JSON.parse(raw) as { stats: Stats; ts: number };
    if (Date.now() - ts > CACHE_TTL) return null;
    return stats;
  } catch {
    return null;
  }
}

export function GitHubBadge({ url }: { url: string }) {
  const repo = parseGitHubRepo(url);
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!repo) return;

    const cached = readCache(repo);
    if (cached) {
      // Hydrating from the sessionStorage cache — a one-shot sync from an external store.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStats(cached);
      return;
    }

    let cancelled = false;
    fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { stargazers_count: number; pushed_at: string }) => {
        if (cancelled) return;
        const next: Stats = { stars: data.stargazers_count, pushedAt: data.pushed_at };
        setStats(next);
        try {
          sessionStorage.setItem(`gh:${repo}`, JSON.stringify({ stats: next, ts: Date.now() }));
        } catch {
          /* storage full / unavailable — ignore */
        }
      })
      .catch(() => {
        // Repo missing or rate-limited — collapse the badge entirely.
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [repo]);

  if (!repo || failed) return null;

  // Skeleton while loading keeps the row height stable.
  if (!stats) {
    return (
      <span className="inline-flex h-4 w-24 animate-pulse rounded bg-[#1a1a1a]" aria-hidden />
    );
  }

  return (
    <span className="flex items-center gap-3 font-[family-name:var(--font-mono)] text-[11px] text-[#525252]">
      <span className="flex items-center gap-1">
        <span className="text-[#22c55e]">★</span>
        {stats.stars}
      </span>
      <span>{timeAgo(stats.pushedAt)}</span>
    </span>
  );
}

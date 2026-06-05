'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDate, parseTags } from '@/lib/utils';
import type { Post } from '@/db/queries';

const TYPE_LABEL: Record<string, string> = {
  project: 'Project',
  thm: 'TryHackMe',
  security: 'Security',
};

function postHref(post: Post): string {
  if (post.type === 'project') return `/projects/${post.slug}`;
  if (post.type === 'thm') return `/writeups/thm/${post.slug}`;
  return `/writeups/security/${post.slug}`;
}

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: index * 0.07 }}
    >
      <Link href={postHref(post)} className="group block">
        <article className="rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] p-6 transition-all duration-200 hover:border-[#2a2a2a] hover:shadow-[0_0_24px_rgba(34,197,94,0.06)]">
          <div className="mb-3 flex items-start justify-between gap-4">
            <h3 className="font-medium leading-snug text-[#ededed] transition-colors group-hover:text-[#22c55e]">
              {post.title}
            </h3>
            <span className="shrink-0 rounded border border-[#1a1a1a] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-[#525252]">
              {TYPE_LABEL[post.type] ?? post.type}
            </span>
          </div>
          {post.excerpt && (
            <p className="mb-4 text-sm leading-relaxed text-[#a1a1a1]">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {parseTags(post.tags).slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-[#22c55e]/20 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-[#22c55e]"
                >
                  {tag}
                </span>
              ))}
            </div>
            {post.published_at && (
              <span className="font-[family-name:var(--font-mono)] text-xs text-[#525252]">
                {formatDate(post.published_at)}
              </span>
            )}
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

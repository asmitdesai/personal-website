'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { formatDate, parseTags, postPath, typeLabel } from '@/lib/utils';
import { GitHubBadge } from './GitHubBadge';
import { ReticleCard } from './ReticleCard';
import type { Post } from '@/db/queries';

interface PostCardProps {
  post: Post;
  index?: number;
  featured?: boolean;
}

export function PostCard({ post, index = 0, featured = false }: PostCardProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      data-reveal
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={reduce ? { duration: 0 } : { duration: 0.25, delay: index * 0.07 }}
    >
      <Link href={postPath(post)} className="group block rounded-xl">
        <ReticleCard as="article">
          {featured && (
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-accent">Featured</p>
          )}
          <div className="mb-3 flex items-start justify-between gap-4">
            <h3
              className={`font-medium leading-snug text-fg transition-colors group-hover:text-accent ${featured ? 'text-lg' : ''}`}
            >
              {post.title}
            </h3>
            <span className="shrink-0 rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
              {typeLabel(post.type)}
            </span>
          </div>
          {post.excerpt && <p className="mb-4 text-sm leading-relaxed text-fg-2">{post.excerpt}</p>}
          {post.github_url && (
            <div className="mb-4">
              <GitHubBadge url={post.github_url} />
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {parseTags(post.tags).slice(0, 4).map((tag) => (
                <span key={tag} className="rounded border border-accent/20 px-2 py-0.5 font-mono text-[11px] text-accent">
                  {tag}
                </span>
              ))}
            </div>
            {post.published_at && (
              <span className="shrink-0 font-mono text-xs text-muted">{formatDate(post.published_at)}</span>
            )}
          </div>
        </ReticleCard>
      </Link>
    </motion.div>
  );
}

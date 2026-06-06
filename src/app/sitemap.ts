import type { MetadataRoute } from 'next';
import { getAllPublishedPosts } from '@/db/queries';
import { postPath } from '@/lib/utils';
import { SITE } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPublishedPosts();

  const staticRoutes = ['', '/about', '/projects', '/writeups/thm', '/writeups/security'].map(
    (path) => ({
      url: `${SITE.url}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
    }),
  );

  const postRoutes = posts.map((post) => ({
    url: `${SITE.url}${postPath(post)}`,
    lastModified: post.updated_at
      ? new Date(post.updated_at)
      : post.published_at
        ? new Date(post.published_at)
        : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}

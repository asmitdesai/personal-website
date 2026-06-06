import { eq, desc, and, inArray } from 'drizzle-orm';
import { db } from './index';
import { posts, tags, postTags } from './schema';

export type Post = {
  id: number;
  slug: string;
  title: string;
  type: string;
  body: string;
  excerpt: string | null;
  tags: string | null;
  github_url: string | null;
  published: number | null;
  published_at: string | null;
  updated_at: string | null;
};

export type Tag = {
  id: number;
  name: string;
  slug: string;
};

export async function getRecentPosts(limit = 4): Promise<Post[]> {
  return db
    .select()
    .from(posts)
    .where(eq(posts.published, 1))
    .orderBy(desc(posts.published_at))
    .limit(limit);
}

export async function getAllPublishedPosts(): Promise<Post[]> {
  return db
    .select()
    .from(posts)
    .where(eq(posts.published, 1))
    .orderBy(desc(posts.published_at));
}

export async function getPublishedPosts(type: string): Promise<Post[]> {
  return db
    .select()
    .from(posts)
    .where(and(eq(posts.published, 1), eq(posts.type, type)))
    .orderBy(desc(posts.published_at));
}

export async function getPostBySlug(slug: string, type: string): Promise<Post | null> {
  const results = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.type, type), eq(posts.published, 1)))
    .limit(1);
  return results[0] ?? null;
}

export async function getAnyBySlug(slug: string): Promise<Post | null> {
  const results = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);
  return results[0] ?? null;
}

export async function getAllTags(): Promise<Tag[]> {
  return db.select().from(tags).orderBy(tags.name);
}

export async function getPostsByTag(tagSlug: string): Promise<Post[]> {
  const tagRows = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, tagSlug))
    .limit(1);

  if (!tagRows[0]) return [];

  const pivots = await db
    .select()
    .from(postTags)
    .where(eq(postTags.tag_id, tagRows[0].id));

  if (pivots.length === 0) return [];

  const postIds = pivots.map((p: { post_id: number | null }) => p.post_id).filter(Boolean) as number[];

  return db
    .select()
    .from(posts)
    .where(and(eq(posts.published, 1), inArray(posts.id, postIds)))
    .orderBy(desc(posts.published_at));
}

export async function getTagBySlug(tagSlug: string): Promise<Tag | null> {
  const results = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, tagSlug))
    .limit(1);
  return results[0] ?? null;
}

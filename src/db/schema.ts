import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'project' | 'thm' | 'security'
  body: text('body').notNull(),
  excerpt: text('excerpt'),
  tags: text('tags'), // JSON array, e.g. '["wazuh","siem"]'
  published: integer('published').default(0),
  published_at: text('published_at'),
  updated_at: text('updated_at'),
});

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
});

export const postTags = sqliteTable('post_tags', {
  post_id: integer('post_id').references(() => posts.id),
  tag_id: integer('tag_id').references(() => tags.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.post_id, t.tag_id] }),
}));

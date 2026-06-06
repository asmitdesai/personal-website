import type { Metadata } from 'next';
import type { Post } from '@/db/queries';
import { postPath } from './utils';
import { SITE } from './site';

export function postMetadata(post: Post): Metadata {
  const description = post.excerpt ?? SITE.description;
  const ogImage = `/og?title=${encodeURIComponent(post.title)}&type=${post.type}`;
  const url = `${SITE.url}${postPath(post)}`;

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.published_at ?? undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [ogImage],
    },
  };
}

export function personJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.name,
    url: SITE.url,
    jobTitle: 'Security Engineering Student',
    description: SITE.description,
    sameAs: [
      'https://github.com/asmitdesai',
      'https://www.linkedin.com/in/asmit-desai-858668230/',
      'https://tryhackme.com/p/asmitdesai02',
    ],
  });
}

export function postJsonLd(post: Post): string {
  const url = `${SITE.url}${postPath(post)}`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? SITE.description,
    url,
    mainEntityOfPage: url,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    author: { '@type': 'Person', name: SITE.name, url: SITE.url },
  });
}

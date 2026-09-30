export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function formatDate(iso: string | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', opts ?? { month: 'short', year: 'numeric' });
}

export function postPath(post: { type: string; slug: string }): string {
  if (post.type === 'project') return `/projects/${post.slug}`;
  if (post.type === 'thm') return `/writeups/thm/${post.slug}`;
  return `/writeups/security/${post.slug}`;
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);
  const units: Array<[number, string]> = [
    [31536000, 'y'],
    [2592000, 'mo'],
    [86400, 'd'],
    [3600, 'h'],
    [60, 'm'],
  ];
  for (const [secs, label] of units) {
    const n = Math.floor(seconds / secs);
    if (n >= 1) return `${n}${label} ago`;
  }
  return 'just now';
}

export function parseGitHubRepo(url: string): string | null {
  const match = url.match(/github\.com\/([^/]+\/[^/?#]+)/);
  return match ? match[1].replace(/\.git$/, '') : null;
}

export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

const TYPE_LABELS: Record<string, string> = {
  project: 'Project',
  thm: 'TryHackMe',
  security: 'Security',
};

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function formatCount(n: number): string {
  return `${String(n).padStart(2, '0')} ${n === 1 ? 'entry' : 'entries'}`;
}

const BACK_LINKS: Record<string, { href: string; label: string }> = {
  project: { href: '/projects', label: 'projects' },
  thm: { href: '/writeups/thm', label: 'tryhackme' },
  security: { href: '/writeups/security', label: 'security' },
};

export function backLink(type: string): { href: string; label: string } {
  return BACK_LINKS[type] ?? { href: '/', label: 'home' };
}

export function codeLanguage(className: string | undefined): string | null {
  const match = className?.match(/(?:^|\s)language-([\w+#-]+)/);
  return match ? match[1] : null;
}

export function scrollProgress(scrollY: number, scrollHeight: number, viewportHeight: number): number {
  const max = scrollHeight - viewportHeight;
  if (max <= 0) return 1;
  return Math.min(1, Math.max(0, scrollY / max));
}

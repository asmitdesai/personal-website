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

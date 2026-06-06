import { NextRequest, NextResponse } from 'next/server';
import { getPublishedPosts, getAllPublishedPosts } from '@/db/queries';

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');
  const allowed = ['project', 'thm', 'security'];

  // No type → all published posts (used by global search).
  if (!type) {
    const posts = await getAllPublishedPosts();
    return NextResponse.json({ posts });
  }

  if (!allowed.includes(type)) {
    return NextResponse.json(
      { error: 'type param must be: project | thm | security' },
      { status: 400 },
    );
  }

  const posts = await getPublishedPosts(type);
  return NextResponse.json({ posts });
}

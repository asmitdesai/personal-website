import { NextRequest, NextResponse } from 'next/server';
import { getPublishedPosts } from '@/db/queries';

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');
  const allowed = ['project', 'thm', 'security'];

  if (!type || !allowed.includes(type)) {
    return NextResponse.json(
      { error: 'type param required: project | thm | security' },
      { status: 400 },
    );
  }

  const posts = await getPublishedPosts(type);
  return NextResponse.json({ posts });
}

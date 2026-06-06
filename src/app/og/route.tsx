import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/site';

export const runtime = 'edge';

const TYPE_LABEL: Record<string, string> = {
  project: 'Project',
  thm: 'TryHackMe Writeup',
  security: 'Security',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') ?? SITE.name).slice(0, 120);
  const type = searchParams.get('type');
  const subtitle = type
    ? TYPE_LABEL[type] ?? type
    : searchParams.get('subtitle') ?? 'Security Engineering';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#080808',
          padding: '80px',
          fontFamily: 'monospace',
        }}
      >
        {/* top: accent tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{ width: '14px', height: '14px', borderRadius: '9999px', backgroundColor: '#22c55e' }}
          />
          <div style={{ color: '#22c55e', fontSize: '28px', letterSpacing: '2px' }}>
            {subtitle.toUpperCase()}
          </div>
        </div>

        {/* title */}
        <div
          style={{
            display: 'flex',
            color: '#ededed',
            fontSize: title.length > 50 ? '64px' : '80px',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-1px',
          }}
        >
          {title}
        </div>

        {/* footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#525252',
            fontSize: '28px',
            borderTop: '1px solid #1a1a1a',
            paddingTop: '32px',
          }}
        >
          <span style={{ color: '#a1a1a1' }}>{SITE.name}</span>
          <span>asmit.dev</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

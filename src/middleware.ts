import { NextRequest, NextResponse } from 'next/server';

// Per-request nonce-based Content-Security-Policy. Next.js reads the nonce from
// the request's CSP header and applies it to its own scripts automatically.
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV !== 'production';

  const directives = [
    `default-src 'self'`,
    // strict-dynamic + nonce locks scripts to ones we emit; dev needs eval for HMR.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // Tailwind/Framer set inline style attributes, which nonces can't cover.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `connect-src 'self' https://api.github.com https://tryhackme.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    // Don't force https upgrades on http://localhost during development.
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ];
  const csp = directives.join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('content-security-policy', csp);
  return response;
}

export const config = {
  // Apply to documents, not static assets or image optimizer.
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|.well-known).*)',
      missing: [{ type: 'header', key: 'next-router-prefetch' }],
    },
  ],
};

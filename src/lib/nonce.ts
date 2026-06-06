import { headers } from 'next/headers';

// The CSP nonce set by middleware — needed on inline scripts (e.g. JSON-LD)
// so they pass the strict Content-Security-Policy.
export async function getNonce(): Promise<string | undefined> {
  return (await headers()).get('x-nonce') ?? undefined;
}

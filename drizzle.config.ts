import type { Config } from 'drizzle-kit';

const url = process.env.DB_URL ?? 'file:sqlite.db';
// Turso when DB_URL points at libsql:// OR when Turso credentials are present
// (Vercel sets TURSO_DATABASE_URL/TURSO_AUTH_TOKEN but not DB_URL).
const isTurso = url.startsWith('libsql://') || !!process.env.TURSO_DATABASE_URL;

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: isTurso ? 'turso' : 'sqlite',
  dbCredentials: isTurso
    ? {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
    : { url },
} satisfies Config;

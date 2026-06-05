import type { Config } from 'drizzle-kit';

const url = process.env.DB_URL ?? 'file:sqlite.db';
const isTurso = url.startsWith('libsql://');

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

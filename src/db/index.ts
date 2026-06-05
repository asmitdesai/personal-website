import * as schema from './schema';

function createDb() {
  const url = process.env.DB_URL ?? 'file:sqlite.db';

  if (url.startsWith('libsql://')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require('drizzle-orm/libsql');
    return drizzle(
      createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }),
      { schema },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require('better-sqlite3');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require('drizzle-orm/better-sqlite3');
  return drizzle(new Database(url.replace('file:', '')), { schema });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = createDb() as any;

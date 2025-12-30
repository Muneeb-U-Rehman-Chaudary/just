
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/db/schema';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL || "libsql://dummy-url.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN || "dummy-token",
});

export const db = drizzle(client, { schema });

export type Database = typeof db;
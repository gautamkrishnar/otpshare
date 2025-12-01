import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from '../db/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || './data/otpmanager.db';
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Setup database connection - use file: prefix for local SQLite files
const absolutePath = path.resolve(dbPath);
console.log('Database path: ', absolutePath);

// Use the recommended Drizzle approach with connection URL
export const db = drizzle({
  connection: { url: `file:${absolutePath}` },
  schema,
});

export const initializeDatabase = async () => {
  // Enable WAL mode and foreign keys using raw SQL
  await db.run(sql`PRAGMA journal_mode = WAL`);
  await db.run(sql`PRAGMA foreign_keys = ON`);

  // Run migrations
  // In dev: __dirname is src/config, migrations at src/db/migrations (../db/migrations)
  // In production: __dirname is dist, migrations at dist/db/migrations (db/migrations)
  let migrationsFolder = path.join(__dirname, 'db/migrations');
  if (!fs.existsSync(migrationsFolder)) {
    migrationsFolder = path.join(__dirname, '../db/migrations');
  }

  console.log('Migrations folder path:', migrationsFolder);
  console.log('Migrations folder exists:', fs.existsSync(migrationsFolder));

  if (fs.existsSync(migrationsFolder)) {
    const metaPath = path.join(migrationsFolder, 'meta', '_journal.json');
    console.log('_journal.json path:', metaPath);
    console.log('_journal.json exists:', fs.existsSync(metaPath));
  }

  await migrate(db, { migrationsFolder });

  console.log('Database initialized successfully');
};

export default db;

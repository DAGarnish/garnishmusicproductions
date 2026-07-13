import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { Users } from './collections/Users';
import { Pages } from './collections/Pages';
import { Posts } from './collections/Posts';
import { Courses } from './collections/Courses';
import { Media } from './collections/Media';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use Postgres adapter if DATABASE_URI or DATABASE_URL starts with postgres:// or postgresql://,
// otherwise default to SQLite for zero-config local development and testing.
const rawDbUri = process.env.DATABASE_URI || process.env.DATABASE_URL || '';
// Automatically upgrade 'sslmode=require' to 'sslmode=verify-full' to prevent libpq / pg security warnings
const dbUri = rawDbUri.replace('sslmode=require', 'sslmode=verify-full');
const isPostgres = dbUri.startsWith('postgres://') || dbUri.startsWith('postgresql://');

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Garnish Music Production CMS',
    },
    suppressHydrationWarning: true,
  },
  editor: lexicalEditor({}),
  collections: [
    Users,
    Pages,
    Posts,
    Courses,
    Media,
  ],
  secret: process.env.PAYLOAD_SECRET || 'garnish-music-production-super-secret-key-2026',
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  db: isPostgres
    ? postgresAdapter({
        pool: {
          connectionString: dbUri,
        },
        push: true,
      })
    : sqliteAdapter({
        client: {
          url: dbUri || 'file:./garnish-local.db',
        },
      }),
  sharp,
  plugins: [],
});

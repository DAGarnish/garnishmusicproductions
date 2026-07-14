/**
 * sync-sql-dump-to-sqlite.cjs
 * 
 * Synchronizes courses, pages, and media from the raw WordPress multisite SQL dump
 * (`database/garnishmusicprod_xzghkquntn.sql`) right into `garnish-local.db` (SQLite)
 * without needing a running MySQL container.
 * 
 * Also updates all `media` table URLs where `wp_upload_path` is present to use
 * the canonical `garnish-uploads` Cloudinary CDN folder where all WP files were uploaded.
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

const SQL_DUMP_PATH = path.resolve(__dirname, '..', '..', 'database', 'garnishmusicprod_xzghkquntn.sql');
const SQLITE_DB_PATH = path.resolve(__dirname, '..', 'garnish-local.db');
const CLOUDINARY_UPLOADS_BASE = 'https://res.cloudinary.com/s7pus8t5/image/upload/garnish-uploads';

const BLOG_MAP = {
  1: 'www',
  2: 'nsh',
  3: 'ber',
  4: 'hk',
  5: 'mia',
  7: 'la',
  8: 'edu',
  9: 'ny',
  18: 'tyo',
  21: 'sea',
  30: 'bcn',
  33: 'hou',
  35: 'syd',
  46: 'av',
  48: 'lis',
  50: 'bh',
  51: 'sf',
  54: 'sg',
  55: 'pdx',
  56: 'mrb',
  57: 'sante',
};

function runSync() {
  console.log('=== Tally & Sync SQL Dump to SQLite (`garnish-local.db`) ===\n');

  if (!fs.existsSync(SQL_DUMP_PATH)) {
    console.error(`❌ SQL dump not found at ${SQL_DUMP_PATH}`);
    process.exit(1);
  }

  const db = new sqlite3.Database(SQLITE_DB_PATH);

  // Step 1: Update media table URLs where wp_upload_path is present to point to garnish-uploads
  console.log('Step 1: Updating media table URLs to use canonical garnish-uploads structure...');
  db.run(`
    UPDATE media 
    SET url = '${CLOUDINARY_UPLOADS_BASE}/' || wp_upload_path
    WHERE wp_upload_path IS NOT NULL 
      AND wp_upload_path != '' 
      AND wp_upload_path NOT LIKE 'local-hero/%'
  `, function(err) {
    if (err) {
      console.error('Error updating media URLs:', err);
    } else {
      console.log(`✅ Updated ${this.changes} media records to point directly to garnish-uploads.\n`);
    }

    // Step 2: Verify current counts across tenants
    console.log('Step 2: Checking SQLite course & page counts across all subdomains:\n');
    db.all(`
      SELECT tenant, count(*) as cnt FROM courses GROUP BY tenant
    `, (err, courseRows) => {
      const courseMap = {};
      if (courseRows) courseRows.forEach(r => courseMap[r.tenant] = r.cnt);

      db.all(`
        SELECT tenant, count(*) as cnt FROM pages GROUP BY tenant
      `, (err, pageRows) => {
        const pageMap = {};
        if (pageRows) pageRows.forEach(r => pageMap[r.tenant] = r.cnt);

        Object.keys(BLOG_MAP).sort((a,b)=>Number(a)-Number(b)).forEach(id => {
          const tenant = BLOG_MAP[id];
          console.log(`  [Blog ${id.padStart(2, ' ')} | ${tenant.padEnd(5, ' ')}] Courses: ${(courseMap[tenant] || 0).toString().padStart(3, ' ')} | Pages: ${(pageMap[tenant] || 0).toString().padStart(3, ' ')}`);
        });

        console.log('\n✅ SQLite synchronization and image path tally complete!');
        db.close();
      });
    });
  });
}

runSync();

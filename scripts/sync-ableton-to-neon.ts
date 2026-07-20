import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// @ts-ignore - node:sqlite types might not be present in @types/node v20
import { DatabaseSync } from 'node:sqlite';
import pkg from 'pg';
const { Pool } = pkg;

(async () => {
  console.log('Syncing ableton-live-course-london from SQLite -> Neon Postgres...');
  const sqlite = new DatabaseSync('garnish-local.db');
  
  const pgUri = process.env.DATABASE_URI || process.env.DATABASE_URL || '';
  const pool = new Pool({ connectionString: pgUri });

  try {
    // 1. Fetch from SQLite
    const sqliteRows = sqlite.prepare("SELECT * FROM courses WHERE id >= 294 ORDER BY id ASC").all();
    console.log(`Found ${sqliteRows.length} courses in SQLite with ID >= 294:`);

    for (const row of sqliteRows as any[]) {
      console.log(`- ID ${row.id}: ${row.slug} (${row.tenant}) -> "${row.title}"`);
    }

    // Check what columns courses table has in Postgres
    const colRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses' AND table_schema = 'public'
    `);
    const pgCols = colRes.rows.map(r => r.column_name);
    console.log('\nPostgres courses columns:', pgCols);

    for (const row of sqliteRows as any[]) {
      // Check if ID already exists in Postgres
      const checkRes = await pool.query('SELECT id FROM courses WHERE id = $1', [row.id]);
      if (checkRes.rows.length > 0) {
        console.log(`Updating ID ${row.id} in Postgres...`);
        // Build update
        const colsToUpdate = Object.keys(row).filter(k => pgCols.includes(k) && k !== 'id');
        const setClause = colsToUpdate.map((col, idx) => `"${col}" = $${idx + 1}`).join(', ');
        const values = colsToUpdate.map(col => row[col]);
        await pool.query(`UPDATE courses SET ${setClause} WHERE id = $${values.length + 1}`, [...values, row.id]);
        console.log(`✅ Updated ID ${row.id}`);
      } else {
        console.log(`Inserting ID ${row.id} into Postgres...`);
        const colsToInsert = Object.keys(row).filter(k => pgCols.includes(k));
        const colNames = colsToInsert.map(c => `"${c}"`).join(', ');
        const placeholders = colsToInsert.map((_, idx) => `$${idx + 1}`).join(', ');
        const values = colsToInsert.map(col => row[col]);
        await pool.query(`INSERT INTO courses (${colNames}) VALUES (${placeholders})`, values);
        console.log(`✅ Inserted ID ${row.id}`);
      }
    }

    // Also update pg sequence for courses_id_seq just in case
    await pool.query("SELECT setval('courses_id_seq', (SELECT max(id) FROM courses))");
    console.log('✅ Sequence courses_id_seq updated.');

  } catch (err: any) {
    console.error('Migration error:', err);
  } finally {
    sqlite.close();
    await pool.end();
  }
  process.exit(0);
})();

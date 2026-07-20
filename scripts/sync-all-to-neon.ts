import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import pkg from 'pg';
const { Pool } = pkg;

(async () => {
  console.log('Syncing all missing data from SQLite -> Neon Postgres...');
  const sqlite = new DatabaseSync('garnish-local.db');
  
  const pgUri = process.env.DATABASE_URI || process.env.DATABASE_URL || '';
  const pool = new Pool({ connectionString: pgUri });

  try {
    const tables = ['courses', 'media', 'payload_preferences', 'users'];
    
    for (const table of tables) {
      console.log(`\n--- Syncing table: ${table} ---`);
      
      // Get all SQLite rows
      let sqliteRows;
      try {
        sqliteRows = sqlite.prepare(`SELECT * FROM ${table}`).all();
      } catch (e) {
        console.log(`Table ${table} might not exist in SQLite, skipping.`);
        continue;
      }
      console.log(`Found ${sqliteRows.length} rows in SQLite ${table}`);

      // Get Postgres columns
      const colRes = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
      `, [table]);
      const pgCols = colRes.rows.map(r => r.column_name);
      
      if (pgCols.length === 0) {
         console.log(`Table ${table} does not exist in Postgres, skipping.`);
         continue;
      }

      let insertedCount = 0;
      for (const row of sqliteRows as any[]) {
        // Only insert if ID doesn't exist in Postgres
        const checkRes = await pool.query(`SELECT id FROM ${table} WHERE id = $1`, [row.id]);
        if (checkRes.rows.length === 0) {
          const colsToInsert = Object.keys(row).filter(k => pgCols.includes(k));
          const colNames = colsToInsert.map(c => `"${c}"`).join(', ');
          const placeholders = colsToInsert.map((_, idx) => `$${idx + 1}`).join(', ');
          const values = colsToInsert.map(col => row[col]);
          
          try {
            await pool.query(`INSERT INTO ${table} (${colNames}) VALUES (${placeholders})`, values);
            insertedCount++;
          } catch (e) {
             console.error(`Failed to insert ID ${row.id} into ${table}: ${e.message}`);
          }
        }
      }
      
      console.log(`✅ Inserted ${insertedCount} missing rows into Postgres ${table}.`);
      
      // Update sequence if it exists
      try {
        await pool.query(`SELECT setval('${table}_id_seq', (SELECT max(id) FROM ${table}))`);
        console.log(`✅ Sequence ${table}_id_seq updated.`);
      } catch (e) {}
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
})();

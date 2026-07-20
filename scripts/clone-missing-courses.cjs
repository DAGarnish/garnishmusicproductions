require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

(async () => {
  const p = new Pool({connectionString: process.env.DATABASE_URL});
  try {
    const missingSlugsRes = await p.query("SELECT DISTINCT slug FROM courses WHERE slug NOT IN (SELECT slug FROM courses WHERE tenant = 'www')");
    const missingSlugs = missingSlugsRes.rows.map(r => r.slug);
    console.log(`Found ${missingSlugs.length} slugs missing in www`);

    for (const slug of missingSlugs) {
      // Find the first available course record across any tenant for this slug
      const sourceRowRes = await p.query("SELECT * FROM courses WHERE slug = $1 LIMIT 1", [slug]);
      if (sourceRowRes.rows.length > 0) {
        const d = sourceRowRes.rows[0];
        try {
          await p.query(
            "INSERT INTO courses (title, slug, tenant, wp_post_id, short_description, description, price, created_at, updated_at) VALUES ($1, $2, 'www', $3, $4, $5, $6, NOW(), NOW())", 
            [d.title, d.slug, d.wp_post_id, d.short_description || '', d.description || '', d.price || '']
          );
          console.log(`✅ Cloned ${slug} to www`);
        } catch (e) {
          console.error(`❌ Failed to clone ${slug}: ${e.message}`);
        }
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    p.end();
  }
})();

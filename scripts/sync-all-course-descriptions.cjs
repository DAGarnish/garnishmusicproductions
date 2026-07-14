const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../garnish-local.db');
const db = new sqlite3.Database(dbPath);

async function syncDescriptions() {
  const allCourses = await new Promise((resolve, reject) => {
    db.all('SELECT id, slug, tenant, title, description, short_description FROM courses', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const bestDescBySlug = {};
  const bestShortBySlug = {};

  // 1. Find the longest description and short_description for each exact slug
  allCourses.forEach(c => {
    if (c.description && c.description.length > (bestDescBySlug[c.slug]?.length || 0)) {
      bestDescBySlug[c.slug] = c.description;
    }
    if (c.short_description && c.short_description.length > (bestShortBySlug[c.slug]?.length || 0)) {
      bestShortBySlug[c.slug] = c.short_description;
    }
  });

  // 2. Map known topic fallbacks so related courses (like ableton vs ableton-production) share rich accordions if one is short/missing
  const topicEquivalents = [
    ['logic-course', 'logic-pro-x-new', 'logic-pro', 'logic-pro-x-course-london'],
    ['ableton', 'ableton-production', 'abletonlive101201'],
    ['mixing-mastering-course', 'mastering'],
    ['electronic-music-dj-course', 'turntablism-dj-course', 'underground-dj-course'],
    ['songwriting-course', 'hit-songwriting'],
  ];

  topicEquivalents.forEach(group => {
    let longestGroupDesc = '';
    let longestGroupShort = '';
    group.forEach(slug => {
      if (bestDescBySlug[slug] && bestDescBySlug[slug].length > longestGroupDesc.length) {
        longestGroupDesc = bestDescBySlug[slug];
      }
      if (bestShortBySlug[slug] && bestShortBySlug[slug].length > longestGroupShort.length) {
        longestGroupShort = bestShortBySlug[slug];
      }
    });
    group.forEach(slug => {
      if (!bestDescBySlug[slug] || bestDescBySlug[slug].length < 600 || !bestDescBySlug[slug].includes('mkd_accordion')) {
        if (longestGroupDesc.length >= 600 && longestGroupDesc.includes('mkd_accordion')) {
          bestDescBySlug[slug] = longestGroupDesc;
        }
      }
      if (!bestShortBySlug[slug] || bestShortBySlug[slug].length < 50) {
        if (longestGroupShort.length >= 50) bestShortBySlug[slug] = longestGroupShort;
      }
    });
  });

  // 3. Now synchronously update all course rows
  let updatedCount = 0;
  for (const c of allCourses) {
    const targetDesc = bestDescBySlug[c.slug] || c.description || '';
    const targetShort = bestShortBySlug[c.slug] || c.short_description || '';

    const needDescUpdate = !c.description || c.description.length < targetDesc.length;
    const needShortUpdate = !c.short_description || c.short_description.length < targetShort.length;

    if (needDescUpdate || needShortUpdate) {
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE courses SET description = ?, short_description = ? WHERE id = ?',
          [targetDesc, targetShort, c.id],
          function(err) {
            if (err) reject(err);
            else {
              updatedCount++;
              resolve();
            }
          }
        );
      });
    }
  }

  console.log(`Successfully synced rich descriptions across ${updatedCount} course records across all tenants.`);
  db.close();
}

syncDescriptions().catch(console.error);

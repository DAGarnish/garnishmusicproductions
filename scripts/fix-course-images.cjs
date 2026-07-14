/**
 * fix-course-images.cjs
 * 
 * Fixes two problems in the garnish-local.db:
 * 1. Courses whose featured_image_id points to a logo GIF — finds the best
 *    topic-matching non-logo media record and updates the foreign key.
 * 2. Verifies hero image media records exist in the DB.
 * 
 * Usage: node scripts/fix-course-images.cjs
 */

const sqlite3 = require('sqlite3');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', 'garnish-local.db');
const CLOUDINARY_BASE = 'https://res.cloudinary.com/s7pus8t5/image/upload/garnish-uploads';

// Map of topic keywords → preferred Cloudinary garnish-uploads path
// These are the paths the user uploaded to garnish-uploads
const TOPIC_IMAGE_MAP = [
  { keywords: ['dave', 'dg-800'],            path: 'sites/8/2016/09/DG-800.jpg' },
  { keywords: ['songwrit', 'k-pop', 'kpop'], path: '2018/05/20130809-DSC_9511.jpg' },
  { keywords: ['ableton'],                   path: 'sites/5/2018/02/Ableton-Live-10-Release_3_web.jpg' },
  { keywords: ['logic'],                     path: '2018/03/LogClass-800.jpg' },
  { keywords: ['fl-studio', 'fl studio', 'fruity'], path: 'sites/7/2020/03/Online-Music-Production-Courses.jpg' },
  { keywords: ['pro-tools', 'pro tools'],    path: 'sites/7/2025/01/Girl-in-Headphones-Blur.png' },
  { keywords: ['dj', 'turntab', 'rekordbox', 'edj'], path: 'sites/7/2025/01/PUSH-3-Blur-Dark.png' },
  { keywords: ['mix', 'master', 'post-prod'], path: 'sites/7/2025/01/Girl-in-Headphones-Blur.png' },
  { keywords: ['vocal'],                     path: '2020/02/Garnish26.jpg' },
  { keywords: ['compos', 'rhythm', 'radio', 'podcast', 'arturia'], path: '2020/02/Garnish21.jpg' },
  { keywords: ['sound', 'design', 'synth'],  path: 'sites/7/2020/03/Online-Music-Production-Courses.jpg' },
  { keywords: ['camp', 'summer', 'school'],  path: '2020/02/Garnish21.jpg' },
  { keywords: ['producer', 'production', 'electronic', 'program'], path: 'sites/7/2020/03/Online-Music-Production-Courses.jpg' },
  { keywords: ['hip-hop', 'hip hop', 'maschine'], path: 'sites/7/2020/03/Online-Music-Production-Courses.jpg' },
  { keywords: ['video'],                     path: 'sites/7/2020/03/Online-Music-Production-Courses.jpg' },
];

function getTopicImageUrl(slug, title) {
  const s = ((slug || '') + ' ' + (title || '')).toLowerCase();
  for (const entry of TOPIC_IMAGE_MAP) {
    if (entry.keywords.some(kw => s.includes(kw))) {
      return `${CLOUDINARY_BASE}/${entry.path}`;
    }
  }
  return `${CLOUDINARY_BASE}/sites/3/2021/09/28afbf82-4126-434a-81cc-853f0216e1f0.jpg`;
}

function run() {
  const db = new sqlite3.Database(DB_PATH);

  console.log('=== Garnish Course Image Fix Script ===\n');

  // Step 1: Get all courses with logo images
  db.all(`
    SELECT c.id, c.title, c.slug, c.tenant, c.featured_image_id, m.filename, m.url
    FROM courses c
    LEFT JOIN media m ON c.featured_image_id = m.id
    WHERE m.filename LIKE '%logo%' OR c.featured_image_id IS NULL
  `, (err, courses) => {
    if (err) {
      console.error('Error fetching courses:', err);
      db.close();
      return;
    }

    console.log(`Found ${courses.length} courses with logo/missing images to fix.\n`);

    let fixed = 0;
    let pending = courses.length;

    if (pending === 0) {
      console.log('Nothing to fix!');
      db.close();
      return;
    }

    for (const course of courses) {
      const topicUrl = getTopicImageUrl(course.slug, course.title);
      const wpPath = topicUrl.replace(`${CLOUDINARY_BASE}/`, '');
      
      // Find or create a media record for this URL
      db.get(`SELECT id FROM media WHERE url = ?`, [topicUrl], (err, existing) => {
        if (err) {
          console.error(`Error looking up media for course ${course.id}:`, err);
          pending--;
          if (pending === 0) { console.log(`\nDone. Fixed ${fixed} courses.`); db.close(); }
          return;
        }

        if (existing) {
          // Update course to point to existing media record
          db.run(`UPDATE courses SET featured_image_id = ? WHERE id = ?`, [existing.id, course.id], (err) => {
            if (!err) {
              fixed++;
              console.log(`  ✓ ${course.tenant}/${course.slug} → media id ${existing.id}`);
            }
            pending--;
            if (pending === 0) { console.log(`\nDone. Fixed ${fixed} courses.`); db.close(); }
          });
        } else {
          // Try to find by wp_upload_path to get the garnish-media URL for this image
          db.get(`SELECT id FROM media WHERE wp_upload_path = ?`, [wpPath], (err, byPath) => {
            const targetId = byPath?.id;
            if (targetId) {
              db.run(`UPDATE courses SET featured_image_id = ? WHERE id = ?`, [targetId, course.id], (err) => {
                if (!err) { fixed++; console.log(`  ✓ ${course.tenant}/${course.slug} → wp_path match id ${targetId}`); }
                pending--;
                if (pending === 0) { console.log(`\nDone. Fixed ${fixed} courses.`); db.close(); }
              });
              return;
            }

            // Insert new media record — use unique filename derived from wp_upload_path hash
            const filename = wpPath.split('/').pop();
            const safeName = filename.replace(/\.(\w+)$/, `-gu.$1`); // e.g. DG-800-gu.jpg
            const now = new Date().toISOString();
            db.run(
              `INSERT OR IGNORE INTO media (filename, url, alt, wp_upload_path, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
              [safeName, topicUrl, course.title + ' course image', wpPath, now, now],
              function(insertErr) {
                // Whether or not insert succeeded, look up the record by url
                db.get(`SELECT id FROM media WHERE url = ? OR filename = ?`, [topicUrl, safeName], (err2, found) => {
                  if (found) {
                    db.run(`UPDATE courses SET featured_image_id = ? WHERE id = ?`, [found.id, course.id], (err3) => {
                      if (!err3) { fixed++; console.log(`  + ${course.tenant}/${course.slug} → media id ${found.id} (${safeName})`); }
                      pending--;
                      if (pending === 0) { console.log(`\nDone. Fixed ${fixed} courses.`); db.close(); }
                    });
                  } else {
                    console.error(`  ✗ ${course.tenant}/${course.slug} — could not resolve media`);
                    pending--;
                    if (pending === 0) { console.log(`\nDone. Fixed ${fixed} courses.`); db.close(); }
                  }
                });
              }
            );
          });
        }
      });
    }
  });
}

run();

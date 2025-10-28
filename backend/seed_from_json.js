const { Pool } = require('pg');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Database connection
const pool = new Pool({
  user: 'satyoga',
  host: 'localhost',
  database: 'satyoga_db',
  password: 'satyoga_dev_password',
  port: 5432,
});

// Access level mapping
const ACCESS_LEVEL_MAP = {
  'public': 'free',
  'restricted': 'gyani',
  'pragyani': 'pragyani',
  'pragyani_plus': 'pragyani_plus'
};

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function seedTeachings() {
  console.log('Reading teachings_categorized.json...\n');

  const data = JSON.parse(fs.readFileSync('../teachings_categorized.json', 'utf8'));

  let inserted = 0;
  let errors = 0;

  // Process each content type: video, videoandaudio, audio, text
  for (const [contentType, teachings] of Object.entries(data)) {
    if (contentType === 'stats') continue; // Skip stats

    console.log(`\nProcessing ${contentType} teachings (${teachings.length} items)...`);

    for (const teaching of teachings) {
      try {
        const id = uuidv4();
        const slug = teaching.slug || generateSlug(teaching.title);
        const accessLevel = ACCESS_LEVEL_MAP[teaching.accessType] || 'free';
        const category = teaching.master_category || 'other';

        // Extract description
        const description = teaching.excerpt_text || teaching.content_text?.substring(0, 500) || '';

        // Parse published date
        const publishedDate = teaching.date ? new Date(teaching.date) : null;

        // Get media IDs
        const youtubeIds = teaching.youtube_ids || [];
        const cloudflareIds = teaching.cloudflare_ids || [];
        const podbeanIds = teaching.podbean_ids || [];

        // Get thumbnail
        const thumbnailUrl = teaching.featured_media?.url || null;

        // Get preview duration
        const previewDuration = teaching.preview_duration || null;

        // Get text content for essays
        const textContent = contentType === 'text' ? (teaching.content_text || '') : null;

        await pool.query(`
          INSERT INTO teachings (
            id, slug, title, description, content_type, access_level,
            preview_duration, youtube_ids, cloudflare_ids, podbean_ids,
            thumbnail_url, published_date, category, view_count, text_content,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
          )
        `, [
          id,
          slug,
          teaching.title,
          description,
          contentType, // video, videoandaudio, audio, or text
          accessLevel,
          previewDuration,
          JSON.stringify(youtubeIds),
          JSON.stringify(cloudflareIds),
          JSON.stringify(podbeanIds),
          thumbnailUrl,
          publishedDate,
          category, // qa, video_teaching, guided_meditation, or essay
          0,
          textContent
        ]);

        inserted++;
        if (inserted % 50 === 0) {
          console.log(`  Inserted ${inserted} teachings...`);
        }
      } catch (error) {
        errors++;
        console.error(`  Error inserting teaching "${teaching.title}":`, error.message);
      }
    }
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   Inserted: ${inserted} teachings`);
  console.log(`   Errors: ${errors}`);

  // Show breakdown by category
  const result = await pool.query(`
    SELECT content_type, category, COUNT(*) as count
    FROM teachings
    GROUP BY content_type, category
    ORDER BY category, content_type
  `);

  console.log('\n📊 Database breakdown:');
  result.rows.forEach(row => {
    console.log(`   ${row.category.padEnd(20)} | ${row.content_type.padEnd(15)} | ${row.count} teachings`);
  });
}

async function main() {
  try {
    await seedTeachings();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const queries = [
  // Video testimonials table
  `CREATE TABLE IF NOT EXISTS video_testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_url TEXT NOT NULL,
    poster_url TEXT,
    name VARCHAR(255),
    location VARCHAR(255),
    testimony TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  // Site content / settings key-value table
  `CREATE TABLE IF NOT EXISTS site_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_key VARCHAR(100) UNIQUE NOT NULL,
    content_value TEXT,
    content_type VARCHAR(50) DEFAULT 'text',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  // Seed default content rows (ignore duplicates)
  `INSERT IGNORE INTO site_content (content_key, content_value, content_type) VALUES
    ('mobile_hero_video', 'https://mda-dev.spinny.com/sp-file-system/public/2026-02-16/3f7957ad509b4fc888114ae91d3690be/raw/file.mp4', 'video'),
    ('mobile_hero_image', '', 'image'),
    ('mobile_hero_heading', 'the master', 'text'),
    ('mobile_hero_subheading', 'India\\'s most-trusted car home*', 'text'),
    ('mobile_hero_btn_text', 'Buy Car', 'text'),
    ('sell_section_image', 'https://acko-cms.ackoassets.com/large_Dhoni_car_image_74e57c2de2.webp', 'image'),
    ('sell_section_video', 'https://spn-sta.spinny.com/spinny-web/static-images/web-asset/videos/spinny_sellright.mp4', 'video'),
    ('sell_section_heading', 'Select your car brand and model to get started', 'text')
  `
];

const runQuery = (i) => {
  if (i >= queries.length) { console.log('All migrations done.'); db.end(); return; }
  db.query(queries[i], (err) => {
    if (err && err.code !== 'ER_DUP_ENTRY') console.error(`Query ${i} error:`, err.message);
    else console.log(`Query ${i} done.`);
    runQuery(i + 1);
  });
};
runQuery(0);

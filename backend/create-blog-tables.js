require('dotenv').config();
const mysql = require('mysql2');
const db = mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS, database: process.env.DB_NAME });

const queries = [
  `CREATE TABLE IF NOT EXISTS blog_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS blog_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    content LONGTEXT,
    excerpt TEXT,
    featured_image TEXT,
    video_url TEXT,
    video_type VARCHAR(20) DEFAULT 'youtube',
    status ENUM('draft','pending','scheduled','published') DEFAULT 'draft',
    meta_title VARCHAR(500),
    meta_description TEXT,
    author_id INT,
    published_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS blog_post_categories (
    post_id INT NOT NULL, category_id INT NOT NULL,
    PRIMARY KEY (post_id, category_id)
  )`,
  `CREATE TABLE IF NOT EXISTS blog_post_tags (
    post_id INT NOT NULL, tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id)
  )`,
  `INSERT IGNORE INTO blog_categories (name, slug) VALUES
    ('Buying Guide','buying-guide'),('Maintenance','maintenance'),
    ('Market Trends','market-trends'),('Ownership','ownership'),
    ('Finance','finance'),('News','news')`,
  `INSERT IGNORE INTO blog_tags (name, slug) VALUES
    ('Used Cars','used-cars'),('EV','ev'),('Tips','tips'),
    ('Finance','finance'),('Sedan','sedan'),('SUV','suv')`
];

const run = (i) => {
  if (i >= queries.length) { console.log('All blog tables created.'); db.end(); return; }
  db.query(queries[i], err => {
    if (err) console.error(`Q${i} error:`, err.message);
    else console.log(`Q${i} done.`);
    run(i+1);
  });
};
run(0);

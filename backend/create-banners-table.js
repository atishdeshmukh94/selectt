require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const sql = `
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page VARCHAR(50) NOT NULL COMMENT 'home or buy-cars',
  type VARCHAR(20) NOT NULL COMMENT 'desktop or mobile or promo',
  title VARCHAR(255),
  subtitle VARCHAR(255),
  cta_text VARCHAR(100),
  cta_link VARCHAR(500),
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

db.query(sql, (err) => {
  if (err) {
    console.error('Error creating banners table:', err.message);
  } else {
    console.log('SUCCESS: banners table created.');
  }
  db.end();
});

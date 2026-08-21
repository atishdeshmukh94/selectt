const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'selectt_db',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
});

db.connect((err) => {
  if (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }

  db.query("SELECT * FROM banners WHERE page = 'sell-car'", (err, rows) => {
    if (err) {
      console.error("Error fetching banners:", err);
    } else {
      console.log("BANNERS for sell-car:", rows);
    }
    db.end();
  });
});

const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.query('SELECT setting_key, setting_value FROM site_settings WHERE setting_key LIKE ? OR setting_key LIKE ?', ['%whatsapp%', '%gallabox%'], (err, rows) => {
  if (err) console.error(err);
  else console.log(JSON.stringify(rows, null, 2));
  process.exit();
});

require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.query(
  'ALTER TABLE bookings ADD COLUMN interested_in_loan BOOLEAN DEFAULT FALSE',
  (err) => {
    if (err) {
      if (err.code === 'ER_DUP_COLUMN_NAME') {
        console.log('Column already exists, skipping.');
      } else {
        console.error('Error:', err.message);
      }
    } else {
      console.log('SUCCESS: interested_in_loan column added to bookings table.');
    }
    db.end();
  }
);

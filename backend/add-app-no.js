require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) { console.error('Error connecting to MySQL:', err); process.exit(1); }
    
    // Check if column exists first
    const checkQuery = `SHOW COLUMNS FROM loan_applications LIKE 'application_no'`;
    
    db.query(checkQuery, (err, results) => {
        if (err) { console.error(err); process.exit(1); }
        
        if (results.length === 0) {
            const addColQuery = `ALTER TABLE loan_applications ADD COLUMN application_no VARCHAR(20) UNIQUE AFTER id`;
            db.query(addColQuery, (err) => {
                if (err) { console.error('Error adding column:', err.message); }
                else { console.log('application_no column added successfully!'); }
                process.exit(0);
            });
        } else {
            console.log('application_no column already exists.');
            process.exit(0);
        }
    });
});

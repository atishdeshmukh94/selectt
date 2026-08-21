const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    }
    
    db.query('ALTER TABLE sell_requests ADD COLUMN inspection_time VARCHAR(50) NULL', (err) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("inspection_time column already exists.");
            } else {
                console.error("Failed to add inspection_time:", err.message);
            }
        } else {
            console.log("inspection_time column added successfully.");
        }
        db.end();
    });
});

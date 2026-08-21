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
    
    // Add inspection_date
    db.query('ALTER TABLE sell_requests ADD COLUMN inspection_date VARCHAR(50) NULL', (err) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("inspection_date column already exists.");
            } else {
                console.error("Failed to add inspection_date:", err.message);
            }
        } else {
            console.log("inspection_date column added successfully.");
        }

        // Add inspection_notes
        db.query('ALTER TABLE sell_requests ADD COLUMN inspection_notes TEXT NULL', (err) => {
            if (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log("inspection_notes column already exists.");
                } else {
                    console.error("Failed to add inspection_notes:", err.message);
                }
            } else {
                console.log("inspection_notes column added successfully.");
            }
            db.end();
        });
    });
});

const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'selectt'
});

db.connect();

const queries = [
    "ALTER TABLE test_drives MODIFY COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'",
    "UPDATE test_drives SET status = 'approved' WHERE status = ''"
];

const runQueries = async () => {
    for (const q of queries) {
        await new Promise((resolve, reject) => {
            db.query(q, (err) => {
                if (err) {
                    console.error('FAILED:', q, err.message);
                    reject(err);
                } else {
                    console.log('OK:', q);
                    resolve();
                }
            });
        });
    }
    db.end();
};

runQueries().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});

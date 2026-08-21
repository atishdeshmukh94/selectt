const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'selectt'
});

db.connect();

const columns = [
    "ADD COLUMN reasons_to_buy TEXT DEFAULT NULL",
    "ADD COLUMN specifications TEXT DEFAULT NULL",
    "ADD COLUMN features TEXT DEFAULT NULL",
    "ADD COLUMN quality_report TEXT DEFAULT NULL",
    "ADD COLUMN more_images TEXT DEFAULT NULL"
];

const runMigration = async () => {
    for (const col of columns) {
        const q = `ALTER TABLE cars ${col}`;
        await new Promise((resolve, reject) => {
            db.query(q, (err) => {
                if (err && !err.message.includes('Duplicate column name')) {
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

runMigration().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});

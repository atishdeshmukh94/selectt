const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) { console.error('Error connecting to MySQL:', err); process.exit(1); }
    
    const queries = [
        // 1. Remove the old foreign key (if it exists)
        "ALTER TABLE loan_applications DROP FOREIGN KEY loan_applications_ibfk_1",
        // 2. Rename column user_id to customer_id
        "ALTER TABLE loan_applications CHANGE COLUMN user_id customer_id INT NULL",
        // 3. Add new foreign key to customers table
        "ALTER TABLE loan_applications ADD CONSTRAINT fk_loan_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL"
    ];

    let completed = 0;
    const runNext = () => {
        if (completed === queries.length) {
            console.log('Database migration successful!');
            process.exit(0);
        }
        db.query(queries[completed], (err) => {
            if (err) {
                console.error(`Error in query ${completed + 1}:`, err.message);
                // Continue if error is "cannot drop/already exists" (idempotency)
                if (err.errno === 1025 || err.errno === 1091 || err.errno === 1060) {
                     completed++;
                     runNext();
                     return;
                }
                process.exit(1);
            }
            completed++;
            runNext();
        });
    };

    runNext();
});

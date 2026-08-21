const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) throw err;
    db.query('ALTER TABLE sell_requests ADD COLUMN car_id INT NULL', (err, results) => {
        if (err) {
            console.error(err);
        } else {
            console.log("car_id column added successfully.");
        }
        db.end();
    });
});

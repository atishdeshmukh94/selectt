const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const alterQueries = [
    "ALTER TABLE users CHANGE COLUMN name first_name VARCHAR(100) NOT NULL",
    "ALTER TABLE users ADD COLUMN last_name VARCHAR(100) NOT NULL AFTER first_name",
    "ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER password",
    "ALTER TABLE users ADD COLUMN bio TEXT AFTER phone",
    "ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'staff') DEFAULT 'staff'",
    "ALTER TABLE users ADD COLUMN job_title VARCHAR(100) AFTER role",
    "ALTER TABLE users ADD COLUMN country VARCHAR(100) AFTER job_title",
    "ALTER TABLE users ADD COLUMN city_state VARCHAR(100) AFTER country",
    "ALTER TABLE users ADD COLUMN postal_code VARCHAR(20) AFTER city_state",
    "ALTER TABLE users ADD COLUMN tax_id VARCHAR(50) AFTER postal_code",
    "ALTER TABLE users ADD COLUMN facebook VARCHAR(255) AFTER tax_id",
    "ALTER TABLE users ADD COLUMN x_com VARCHAR(255) AFTER facebook",
    "ALTER TABLE users ADD COLUMN linkedin VARCHAR(255) AFTER x_com",
    "ALTER TABLE users ADD COLUMN instagram VARCHAR(255) AFTER linkedin",
    "ALTER TABLE users ADD COLUMN image VARCHAR(255) DEFAULT './images/user/owner.jpg' AFTER instagram"
];

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL for migration');

    let completed = 0;
    alterQueries.forEach(query => {
        db.query(query, (err) => {
            if (err) {
                console.warn(`Query failed (might already exist): ${query}`, err.message);
            } else {
                console.log(`Successfully ran: ${query}`);
            }
            completed++;
            if (completed === alterQueries.length) {
                console.log('Migration completed');
                db.end();
            }
        });
    });
});

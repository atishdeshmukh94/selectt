const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const tables = [
`CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20) NOT NULL UNIQUE,
    alt_phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    area VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`,
`CREATE TABLE IF NOT EXISTS sell_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    variant VARCHAR(100),
    year INT,
    km INT,
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    ownership VARCHAR(50),
    location VARCHAR(255),
    asking_price DECIMAL(15,2),
    description TEXT,
    inspection_date VARCHAR(50) NULL,
    inspection_time VARCHAR(50) NULL,
    inspection_notes TEXT NULL,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
)`,
`CREATE TABLE IF NOT EXISTS calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    color VARCHAR(50),
    reminder_time DATETIME,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`
];

const extraColumns = [
    { name: 'ownership', def: "VARCHAR(50) DEFAULT '1st Owner'" },
    { name: 'engine_capacity', def: 'VARCHAR(50)' },
    { name: 'reg_year', def: 'INT' },
    { name: 'reg_state', def: 'VARCHAR(50)' },
    { name: 'spare_key', def: "VARCHAR(20) DEFAULT 'Yes'" },
    { name: 'insurance_status', def: "VARCHAR(50) DEFAULT 'Active'" },
    { name: 'color', def: 'VARCHAR(50)' },
    { name: 'body_type', def: 'VARCHAR(50)' },
    { name: 'description', def: 'TEXT' },
    { name: 'video_url', def: 'VARCHAR(255) DEFAULT NULL' },
    { name: 'status', def: "VARCHAR(50) DEFAULT 'active'" },
];

async function run() {
    for (const q of tables) {
        await new Promise((resolve) => {
            db.query(q, (err) => {
                if (err) console.error('Error:', err.message);
                else console.log('Table OK:', q.substring(7, 60).trim());
                resolve();
            });
        });
    }
    for (const col of extraColumns) {
        await new Promise((resolve) => {
            db.query(`ALTER TABLE cars ADD COLUMN ${col.name} ${col.def}`, (err) => {
                if (err && err.message.includes('Duplicate column')) {
                    console.log('Column already exists (skipped):', col.name);
                } else if (err) {
                    console.error('Column error:', col.name, err.message);
                } else {
                    console.log('Column added:', col.name);
                }
                resolve();
            });
        });
    }
    db.end();
    console.log('\nMigration complete!');
}

run();

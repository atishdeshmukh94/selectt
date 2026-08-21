const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'selectt'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS test_drives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT(11) NOT NULL,
    car_id INT(11) NOT NULL,
    location ENUM('hub', 'doorstep') NOT NULL,
    date_label VARCHAR(50) NOT NULL,
    date_day VARCHAR(50) NOT NULL,
    slot VARCHAR(50) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (car_id) REFERENCES cars(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

db.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('test_drives table created or already exists.');
    }
    db.end();
});

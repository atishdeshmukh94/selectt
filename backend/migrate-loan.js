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
    
    const query = `
    CREATE TABLE IF NOT EXISTS loan_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL, 
        profession_type ENUM('salaried', 'business') NOT NULL,
        pan_card VARCHAR(255),
        aadhar_card VARCHAR(255),
        bank_statement VARCHAR(255),
        salary_slip VARCHAR(255),
        gst_certificate VARCHAR(255),
        gumasta_license VARCHAR(255),
        electricity_bill VARCHAR(255),
        msme_certificate VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('loan_applications table created successfully!');
        }
        process.exit(0);
    });
});

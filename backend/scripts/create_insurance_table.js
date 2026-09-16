const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function createInsuranceTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  console.log('Connected to MySQL DB:', process.env.DB_NAME);

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS insurance_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_no VARCHAR(50) UNIQUE NOT NULL,
      customer_id INT NULL,
      vehicle_number VARCHAR(20) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      plan_type VARCHAR(100) DEFAULT 'Comprehensive Plan',
      status VARCHAR(50) DEFAULT 'pending',
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_vehicle (vehicle_number),
      INDEX idx_phone (phone),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await connection.query(createTableQuery);
  console.log('Table insurance_requests verified/created successfully.');

  await connection.end();
}

createInsuranceTable().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

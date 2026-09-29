const { Client } = require('ssh2');
const mysql = require('mysql2/promise');

const createTablesSQL = `
CREATE TABLE IF NOT EXISTS career_jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100) DEFAULT 'Sales',
  location VARCHAR(100) DEFAULT 'Mumbai',
  job_type VARCHAR(50) DEFAULT 'Full-time',
  experience VARCHAR(100) DEFAULT '1-3 Years',
  description TEXT,
  requirements TEXT,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS career_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  position VARCHAR(255) NOT NULL,
  resume_url VARCHAR(500) NULL,
  message TEXT NULL,
  status ENUM('new', 'reviewed', 'shortlisted', 'rejected') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const seedJobsSQL = `
INSERT INTO career_jobs (title, department, location, job_type, experience, description, is_active, sort_order)
SELECT 'Sales Executive', 'Sales', 'Mumbai', 'Full-time', '1-3 Years', 'Drive car sales, assist customers with consultations and test drives.', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM career_jobs WHERE title = 'Sales Executive');

INSERT INTO career_jobs (title, department, location, job_type, experience, description, is_active, sort_order)
SELECT 'Car Evaluator', 'Operations', 'Remote / Field', 'Full-time', '2-5 Years', 'Perform 200-point vehicle inspections and condition assessments.', 1, 2
WHERE NOT EXISTS (SELECT 1 FROM career_jobs WHERE title = 'Car Evaluator');

INSERT INTO career_jobs (title, department, location, job_type, experience, description, is_active, sort_order)
SELECT 'Content Writer', 'Marketing', 'Remote', 'Full-time', '1-3 Years', 'Create automotive articles, car reviews, and social media content.', 1, 3
WHERE NOT EXISTS (SELECT 1 FROM career_jobs WHERE title = 'Content Writer');
`;

async function setupVPS() {
  const conn = new Client();
  conn.on('ready', () => {
    const fullCmd = `mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "${createTablesSQL.replace(/\n/g, ' ')} ${seedJobsSQL.replace(/\n/g, ' ')}"`;
    conn.exec(fullCmd, (err, stream) => {
      if (err) {
        console.error('VPS SQL Error:', err);
        conn.end();
        return;
      }
      stream.on('data', d => process.stdout.write(d));
      stream.on('close', () => {
        console.log('✅ VPS Career tables created and seeded successfully!');
        conn.end();
      });
    });
  }).connect({
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
  });
}

setupVPS();

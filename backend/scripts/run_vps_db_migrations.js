const { Client } = require('ssh2');

const DB_NAME = 'connect-db';
const DB_USER = 'selectt-wepnex';
const DB_PASS = '6EVSUZ7RNYA9bV0WUoxy';

const conn = new Client();

console.log('Connecting to VPS to run database schema upgrades and column sync...');

conn.on('ready', () => {
    const migrationSQL = `
-- Ensure status column exists in cars
ALTER TABLE cars ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT 0;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_hot_deal BOOLEAN DEFAULT 0;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS original_price DECIMAL(12,2) DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS emi_starts_at DECIMAL(10,2) DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS reg_number VARCHAR(50) DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS insurance_validity VARCHAR(50) DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS rto VARCHAR(50) DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS engine_capacity VARCHAR(50) DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS mileage VARCHAR(50) DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS bunny_video_id VARCHAR(100) DEFAULT NULL;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS imagekit_folder VARCHAR(255) DEFAULT NULL;

-- Ensure media_alt_tags table exists
CREATE TABLE IF NOT EXISTS media_alt_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_path VARCHAR(500) NOT NULL UNIQUE,
    alt_text VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ensure website_visitors table exists
CREATE TABLE IF NOT EXISTS website_visitors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visitor_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(100),
    ip_address VARCHAR(100),
    user_agent TEXT,
    page_url VARCHAR(500),
    page_title VARCHAR(255),
    referrer VARCHAR(500),
    city VARCHAR(100),
    country VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_visitor (visitor_id),
    INDEX idx_updated (updated_at)
);

-- Ensure admin user exists with password 'admin123' if empty
INSERT IGNORE INTO users (id, username, email, password, role, first_name, last_name)
VALUES (1, 'admin', 'admin@selectt.in', '$2a$10$w8.1UuB9TkgxG2W2Pq5q7Oq9u.3lF2.o8m4tE4pW9q2n4n3u6g9q2', 'admin', 'Super', 'Admin');
`;

    const cmd = `
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

        mysql -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} << 'EOF'
${migrationSQL}
EOF
        echo "Database schema columns synchronized successfully!"

        cd /home/selectt-api/htdocs/api.selectt.in
        pm2 restart selectt-api --update-env
        sleep 2

        echo -e "\n=== TESTING LIVE /api/cars ENDPOINT ==="
        curl -s http://127.0.0.1:5000/api/cars
        echo -e "\n\n=== TESTING LIVE /api/health ENDPOINT ==="
        curl -s http://127.0.0.1:5000/health
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => process.stdout.write(d));
        stream.on('close', (code) => {
            console.log(`\nMigration completed with exit code ${code}`);
            conn.end();
        });
    });
}).connect({
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
});

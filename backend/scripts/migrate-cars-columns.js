const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'selectt-db',
    waitForConnections: true,
    connectionLimit: 5
});

const requiredColumns = [
    { name: 'registration_no', type: 'VARCHAR(50) NULL' },
    { name: 'rto_code', type: 'VARCHAR(50) NULL' },
    { name: 'rto', type: 'VARCHAR(50) NULL' },
    { name: 'hub', type: 'VARCHAR(255) NULL' },
    { name: 'location', type: 'VARCHAR(255) DEFAULT \'Mumbai\'' },
    { name: 'badge_text', type: 'VARCHAR(100) NULL' },
    { name: 'is_assured', type: 'TINYINT(1) DEFAULT 0' },
    { name: 'listing_type', type: 'VARCHAR(50) DEFAULT \'standard\'' },
    { name: 'original_price', type: 'DECIMAL(12,2) NULL' },
    { name: 'discount_type', type: 'VARCHAR(50) DEFAULT \'none\'' },
    { name: 'discount_value', type: 'DECIMAL(12,2) DEFAULT 0' },
    { name: 'offer_price', type: 'DECIMAL(12,2) NULL' },
    { name: 'video_url', type: 'VARCHAR(500) NULL' },
    { name: 'spare_key', type: 'VARCHAR(20) DEFAULT \'Yes\'' },
    { name: 'insurance_status', type: 'VARCHAR(50) DEFAULT \'Active\'' },
    { name: 'engine_capacity', type: 'VARCHAR(50) NULL' },
    { name: 'reg_year', type: 'INT NULL' },
    { name: 'reg_state', type: 'VARCHAR(100) NULL' },
    { name: 'ownership', type: 'VARCHAR(50) DEFAULT \'1st Owner\'' },
    { name: 'reasons_to_buy', type: 'LONGTEXT NULL' },
    { name: 'specifications', type: 'LONGTEXT NULL' },
    { name: 'features', type: 'LONGTEXT NULL' },
    { name: 'quality_report', type: 'LONGTEXT NULL' },
    { name: 'more_images', type: 'LONGTEXT NULL' }
];

db.getConnection((err, conn) => {
    if (err) {
        console.error('DB Connection Failed:', err.message);
        process.exit(1);
    }
    console.log('Connected to MySQL DB successfully.');

    conn.query('SHOW COLUMNS FROM cars', (showErr, cols) => {
        if (showErr) {
            console.error('Error fetching cars columns:', showErr.message);
            conn.release();
            process.exit(1);
        }

        const existingColNames = new Set(cols.map(c => c.Field.toLowerCase()));
        console.log('Existing columns in cars table:', Array.from(existingColNames).join(', '));

        const missing = requiredColumns.filter(c => !existingColNames.has(c.name.toLowerCase()));
        if (missing.length === 0) {
            console.log('All required columns are already present in cars table!');
            conn.release();
            process.exit(0);
        }

        console.log(`Found ${missing.length} missing columns: ${missing.map(m => m.name).join(', ')}`);
        let completed = 0;
        missing.forEach(col => {
            const sql = `ALTER TABLE cars ADD COLUMN \`${col.name}\` ${col.type}`;
            conn.query(sql, (altErr) => {
                if (altErr) {
                    console.error(`Error adding column ${col.name}:`, altErr.message);
                } else {
                    console.log(`Successfully added column: ${col.name}`);
                }
                completed++;
                if (completed === missing.length) {
                    console.log('All column migrations completed!');
                    conn.release();
                    process.exit(0);
                }
            });
        });
    });
});

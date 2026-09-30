require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

const createCouponsTable = `
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NULL,
    description TEXT NULL,
    discount_type ENUM('percentage', 'flat') NOT NULL DEFAULT 'flat',
    discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    applies_to ENUM('booking_amount', 'car_price') NOT NULL DEFAULT 'booking_amount',
    min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    max_discount_amount DECIMAL(10,2) NULL,
    usage_limit INT NULL,
    used_count INT NOT NULL DEFAULT 0,
    valid_from DATETIME NULL,
    valid_until DATETIME NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

pool.query(createCouponsTable, (err) => {
    if (err) {
        console.error('Error creating coupons table:', err);
    } else {
        console.log('Coupons table created or already exists.');
    }

    // Ensure coupon_code and discount_amount columns exist in bookings table
    const bookingColumns = [
        { name: 'coupon_code', query: "ALTER TABLE bookings ADD COLUMN coupon_code VARCHAR(50) NULL" },
        { name: 'discount_amount', query: "ALTER TABLE bookings ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00" }
    ];

    let pending = bookingColumns.length;
    bookingColumns.forEach(col => {
        pool.query(`SHOW COLUMNS FROM bookings LIKE '${col.name}'`, (showErr, rows) => {
            if (!showErr && (!rows || rows.length === 0)) {
                pool.query(col.query, (alterErr) => {
                    if (alterErr) console.error(`Error adding ${col.name}:`, alterErr);
                    else console.log(`Added ${col.name} to bookings.`);
                    checkDone();
                });
            } else {
                console.log(`Column ${col.name} already in bookings.`);
                checkDone();
            }
        });
    });

    function checkDone() {
        pending--;
        if (pending <= 0) {
            // Seed a sample coupon if table is empty
            pool.query('SELECT COUNT(*) as cnt FROM coupons', (countErr, countRows) => {
                if (!countErr && countRows[0].cnt === 0) {
                    const sampleQuery = `
                        INSERT INTO coupons (code, title, description, discount_type, discount_value, applies_to, min_order_amount, is_active)
                        VALUES 
                        ('SELECTT500', 'Special Booking Discount', 'Get ₹500 off on your vehicle booking deposit', 'flat', 500.00, 'booking_amount', 1000.00, 1),
                        ('FESTIVE10', 'Festive Offer 10% Off', 'Get 10% off on your booking amount (up to ₹1,000)', 'percentage', 10.00, 'booking_amount', 2000.00, 1)
                    `;
                    pool.query(sampleQuery, (seedErr) => {
                        if (seedErr) console.error('Error seeding sample coupons:', seedErr);
                        else console.log('Sample coupons seeded successfully!');
                        pool.end();
                    });
                } else {
                    pool.end();
                }
            });
        }
    }
});

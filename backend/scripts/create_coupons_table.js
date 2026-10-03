const { Client } = require('ssh2');

const conn = new Client();

const sql = `CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NULL,
    description TEXT NULL,
    discount_type ENUM('flat', 'percentage') NOT NULL DEFAULT 'flat',
    discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
    applies_to ENUM('booking_amount', 'car_price') NOT NULL DEFAULT 'booking_amount',
    min_order_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    max_discount_amount DECIMAL(12, 2) NULL,
    usage_limit INT NULL,
    used_count INT NOT NULL DEFAULT 0,
    valid_from DATETIME NULL,
    valid_until DATETIME NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;

// Inline the SQL directly into the mysql command to avoid env var parsing issues
const cmd = `
  cd /home/selectt-api/htdocs/api.selectt.in
  source .env 2>/dev/null || true
  DB_USER=$(grep -m1 '^DB_USER=' .env | cut -d= -f2 | tr -d '"')
  DB_PASS=$(grep -m1 '^DB_PASS=' .env | cut -d= -f2 | tr -d '"')
  DB_NAME=$(grep -m1 '^DB_NAME=' .env | cut -d= -f2 | tr -d '"')
  mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "${sql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"
  echo "EXIT_CODE:$?"
  mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "DESCRIBE coupons;"
`;

conn.on('ready', () => {
    console.log('Connected to VPS...');
    conn.exec(cmd, (err, stream) => {
        if (err) { console.error('SSH exec error:', err); conn.end(); return; }
        stream.on('data', d => process.stdout.write(d.toString()));
        stream.stderr.on('data', d => process.stderr.write(d.toString()));
        stream.on('close', code => {
            console.log(`\nDone (exit code: ${code})`);
            conn.end();
        });
    });
}).connect({
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
});

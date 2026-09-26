const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
    const nodeRunner = `
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'selectt-wepnex',
    password: '6EVSUZ7RNYA9bV0WUoxy',
    database: 'connect-db'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connect error:', err.message);
        process.exit(1);
    }
    console.log('Connected to MySQL directly!');

    const alters = [
        "ALTER TABLE cars ADD COLUMN status VARCHAR(50) DEFAULT 'active'",
        "ALTER TABLE cars ADD COLUMN is_featured BOOLEAN DEFAULT 0",
        "ALTER TABLE cars ADD COLUMN is_hot_deal BOOLEAN DEFAULT 0",
        "ALTER TABLE cars ADD COLUMN views_count INT DEFAULT 0",
        "ALTER TABLE cars ADD COLUMN original_price DECIMAL(12,2) DEFAULT NULL",
        "ALTER TABLE cars ADD COLUMN emi_starts_at DECIMAL(10,2) DEFAULT NULL",
        "ALTER TABLE cars ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0",
        "ALTER TABLE cars ADD COLUMN reg_number VARCHAR(50) DEFAULT NULL",
        "ALTER TABLE cars ADD COLUMN insurance_validity VARCHAR(50) DEFAULT NULL",
        "ALTER TABLE cars ADD COLUMN rto VARCHAR(50) DEFAULT NULL",
        "ALTER TABLE cars ADD COLUMN mileage VARCHAR(50) DEFAULT NULL",
        "ALTER TABLE cars ADD COLUMN video_url VARCHAR(500) DEFAULT NULL",
        "ALTER TABLE cars ADD COLUMN bunny_video_id VARCHAR(100) DEFAULT NULL",
        "ALTER TABLE cars ADD COLUMN imagekit_folder VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE sell_requests ADD COLUMN inspection_time VARCHAR(50) DEFAULT NULL",
        "ALTER TABLE sell_requests ADD COLUMN inspection_type VARCHAR(50) DEFAULT NULL"
    ];

    let pending = alters.length;
    alters.forEach((sql) => {
        db.query(sql, (qErr) => {
            if (qErr && !qErr.message.includes('Duplicate column')) {
                console.log('Alter notice:', qErr.message);
            }
            pending--;
            if (pending === 0) {
                console.log('All column alterations completed!');
                db.query("SELECT COUNT(*) as count FROM cars", (err, res) => {
                    console.log('Cars count:', res);
                    db.end();
                });
            }
        });
    });
});
`;

    const cmd = `
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

        cat << 'EOF' > /home/selectt-api/htdocs/api.selectt.in/sync_schema.js
${nodeRunner}
EOF
        cd /home/selectt-api/htdocs/api.selectt.in
        node sync_schema.js
        pm2 restart selectt-api --update-env
        sleep 2
        echo -e "\n=== TESTING LIVE /api/cars ENDPOINT ==="
        curl -s http://127.0.0.1:5000/api/cars | head -c 200
        echo -e "\n\n=== TESTING LIVE /api/health ENDPOINT ==="
        curl -s http://127.0.0.1:5000/health
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', d => process.stdout.write(d));
        stream.on('close', () => conn.end());
    });
}).connect({
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
});

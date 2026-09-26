const { Client } = require('ssh2');

const DB_NAME = 'connect-db';
const DB_USER = 'selectt-wepnex';
const DB_PASS = '6EVSUZ7RNYA9bV0WUoxy';
const REMOTE_BASE = '/home/selectt-api/htdocs/api.selectt.in';

const conn = new Client();

console.log('Connecting to VPS to import database and link .env...');

conn.on('ready', () => {
    const cmd = `
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

        echo "=== 1. TESTING MYSQL CONNECTION ==="
        mysql -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} -e "SHOW TABLES;" || {
            echo "Database ${DB_NAME} not created yet or credentials incorrect. Please click 'Add Database' first.";
            exit 1;
        }

        echo "=== 2. IMPORTING database.sql INTO ${DB_NAME} ==="
        mysql -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} < ${REMOTE_BASE}/database.sql
        echo "Database import finished!"

        echo "=== 3. TABLE COUNT IN ${DB_NAME} ==="
        mysql -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} -e "SHOW TABLES;"

        echo "=== 4. UPDATING .env ON VPS ==="
        cat << 'EOF' > ${REMOTE_BASE}/.env
NODE_ENV=production
PORT=5000
DB_HOST=127.0.0.1
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
DB_NAME=${DB_NAME}
JWT_SECRET=s3l3ctt_jwt_$ecret_k3y_2025_xK9mR7pL2nQ8vW4jY6hT1bZ3cF5dG0eA
ALLOWED_ORIGINS=https://selectt.in,https://www.selectt.in,https://admin.selectt.in,http://localhost:5173,http://localhost:5174,https://api.selectt.in
SITE_URL=https://selectt.in

# ImageKit.io Configuration
IMAGEKIT_PUBLIC_KEY=public_6cuIDfKYa22dql//M1rxKCv0Y0o=
IMAGEKIT_PRIVATE_KEY=private_zhPh1CfqVPsDiqwgzth5v3auCAo=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/selectt
EOF

        echo "=== 5. RESTARTING PM2 PROCESS ==="
        cd ${REMOTE_BASE}
        pm2 restart selectt-api --update-env
        sleep 2

        echo "=== 6. TESTING LIVE DATABASE QUERY VIA API ==="
        curl -s http://127.0.0.1:5000/api/cars | head -c 200
        echo -e "\n\n=== 7. LIVE HEALTH CHECK ==="
        curl -s http://127.0.0.1:5000/health
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d) => process.stdout.write(d));
        stream.on('close', (code) => {
            console.log(`\nImport and link process finished with code ${code}`);
            conn.end();
        });
    });
}).connect({
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
});

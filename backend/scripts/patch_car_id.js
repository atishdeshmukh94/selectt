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
    if (err) throw err;

    db.query("ALTER TABLE sell_requests ADD COLUMN car_id INT DEFAULT NULL", (err) => {
        if (err && !err.message.includes('Duplicate column')) console.log('Notice:', err.message);
        console.log('sell_requests.car_id added!');
        db.end();
    });
});
`;

    const cmd = `
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

        cat << 'EOF' > /home/selectt-api/htdocs/api.selectt.in/patch_car_id.js
${nodeRunner}
EOF
        cd /home/selectt-api/htdocs/api.selectt.in
        node patch_car_id.js
        pm2 restart selectt-api --update-env
        sleep 2
        echo -e "\n=== TESTING LIVE /api/cars ENDPOINT ==="
        curl -s http://127.0.0.1:5000/api/cars | head -c 300
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

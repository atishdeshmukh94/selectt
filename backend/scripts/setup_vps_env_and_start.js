const { Client } = require('ssh2');

const REMOTE_BASE = '/home/selectt-api/htdocs/api.selectt.in';

const conn = new Client();

conn.on('ready', () => {
    console.log('Connected! Creating .env and starting PM2...');

    const envContent = `NODE_ENV=production
PORT=5000
DB_HOST=127.0.0.1
DB_USER=selectt_user
DB_PASS=selectt_pass_to_replace
DB_NAME=selectt_production
JWT_SECRET=s3l3ctt_jwt_$ecret_k3y_2025_xK9mR7pL2nQ8vW4jY6hT1bZ3cF5dG0eA
ALLOWED_ORIGINS=https://selectt.in,https://www.selectt.in,https://admin.selectt.in,http://localhost:5173,http://localhost:5174,https://api.selectt.in
SITE_URL=https://selectt.in

# ImageKit.io Credentials
IMAGEKIT_PUBLIC_KEY=public_6cuIDfKYa22dql//M1rxKCv0Y0o=
IMAGEKIT_PRIVATE_KEY=private_zhPh1CfqVPsDiqwgzth5v3auCAo=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/selectt
`;

    const cmd = `
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

        cat << 'EOF' > ${REMOTE_BASE}/.env
${envContent}
EOF

        echo "Created .env on VPS!"

        cd ${REMOTE_BASE}
        pm2 delete selectt-api 2>/dev/null || true
        pm2 start index.js --name selectt-api --env production
        pm2 save

        echo "=== PM2 STATUS ==="
        pm2 status
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d) => process.stdout.write(d));
        stream.on('close', () => {
            console.log('\nPM2 setup command finished.');
            conn.end();
        });
    });
}).connect({
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
});

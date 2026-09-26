const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
    const envContent = `NODE_ENV=production
PORT=3000
DB_HOST=127.0.0.1
DB_USER=selectt-wepnex
DB_PASS=6EVSUZ7RNYA9bV0WUoxy
DB_NAME=connect-db
JWT_SECRET=s3l3ctt_jwt_$ecret_k3y_2025_xK9mR7pL2nQ8vW4jY6hT1bZ3cF5dG0eA
ALLOWED_ORIGINS=https://selectt.in,https://www.selectt.in,https://admin.selectt.in,http://localhost:5173,http://localhost:5174,https://api.selectt.in
SITE_URL=https://selectt.in

# ImageKit.io Configuration
IMAGEKIT_PUBLIC_KEY=public_6cuIDfKYa22dql//M1rxKCv0Y0o=
IMAGEKIT_PRIVATE_KEY=private_zhPh1CfqVPsDiqwgzth5v3auCAo=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/selectt

# Bunny.net Stream Video Configuration
BUNNY_STREAM_LIBRARY_ID=762989
BUNNY_STREAM_API_KEY=bdeb8046-5192-47f1-bcfdeaf48d97-ef01-4450
BUNNY_STREAM_CDN_HOSTNAME=vz-0ed4d2e7-46d.b-cdn.net
`;

    const cmd = `
        cat << 'EOF' > /home/selectt-api/htdocs/api.selectt.in/.env
${envContent}
EOF
        echo "VPS .env updated with Bunny Stream credentials!"

        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

        cd /home/selectt-api/htdocs/api.selectt.in
        pm2 restart selectt-api --update-env
        sleep 2
        pm2 status
        curl -s http://127.0.0.1:3000/health
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

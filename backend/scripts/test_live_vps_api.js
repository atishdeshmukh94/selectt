const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
    const cmd = `
        echo "=== CURL LOCALHOST 5000 HEALTH ==="
        curl -s http://127.0.0.1:5000/health || curl -i http://127.0.0.1:5000/health

        echo -e "\n\n=== CURL LOCALHOST 3000 HEALTH ==="
        curl -s http://127.0.0.1:3000/health 2>/dev/null || true

        echo -e "\n=== PM2 LOGS (LAST 25 LINES) ==="
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        pm2 logs selectt-api --lines 25 --nostream
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d) => process.stdout.write(d));
        stream.on('close', () => conn.end());
    });
}).connect({
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
});

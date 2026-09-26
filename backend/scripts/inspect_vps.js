const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
    console.log('SSH Connection ready!');

    const cmd = `
        source ~/.profile
        source ~/.bashrc
        echo "=== NODE & NPM ==="
        node -v
        npm -v
        which node
        which pm2 2>/dev/null || npm list -g pm2

        echo "=== HTDOCS DIRECTORY ==="
        ls -la ~/htdocs/
        ls -la ~/htdocs/api.selectt.in/ 2>/dev/null

        echo "=== MYSQL CLI CHECK ==="
        mysql -V 2>/dev/null || echo "mysql client not in path or permission"
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (d) => process.stdout.write(d));
        stream.on('close', (code) => {
            conn.end();
        });
    });
}).connect({
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
});

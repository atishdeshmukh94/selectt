const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
    const cmd = `
        echo "=== CHECK MYSQL LISTEN PORT ==="
        ss -tuln | grep 3306 || netstat -tuln | grep 3306

        echo "=== CHECK MYSQL CONNECTION ==="
        mysql -u root -p'#ADPJc0UoNJxo7Ll' -e "SHOW DATABASES;" 2>/dev/null || \
        mysql -u root -p'ADPJc0UoNJxo7Ll' -e "SHOW DATABASES;" 2>/dev/null || \
        mysql -u root -e "SHOW DATABASES;" 2>/dev/null || \
        echo "Root direct mysql login failed from selectt-api"
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

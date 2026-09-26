const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
    const cmd = `
        echo "=== PS AUX NODE PROCESSES ==="
        ps aux | grep node | grep -v grep

        echo "=== SYSTEMD SERVICES ==="
        systemctl --user status 2>/dev/null || echo "no user systemctl"
        ls -la /etc/systemd/system/*api.selectt.in* 2>/dev/null || echo "no root service visible"

        echo "=== HTDOCS CONTENTS ==="
        ls -la ~/htdocs/api.selectt.in/
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

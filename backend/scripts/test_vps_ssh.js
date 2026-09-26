const { Client } = require('ssh2');

const conn = new Client();

const SSH_CONFIG = {
    host: '200.97.166.12',
    port: 22,
    username: 'root',
    password: process.env.VPS_SSH_PASSWORD || '#ADPJc0UoNJxo7Ll',
    readyTimeout: 30000
};

console.log(`Connecting to ${SSH_CONFIG.host} as ${SSH_CONFIG.username}...`);

conn.on('ready', () => {
    console.log('SSH Connection ESTABLISHED successfully!');

    // Run basic inspection commands
    const cmd = `
        echo "=== HOSTNAME & OS ==="
        uname -a
        cat /etc/os-release | grep PRETTY_NAME

        echo "=== NODE & NPM ==="
        node -v 2>/dev/null || echo "Node not in global path"
        npm -v 2>/dev/null || echo "NPM not in global path"
        which clp || echo "Cloudpanel CLI"

        echo "=== CLOUDPANEL SITES PATH ==="
        ls -la /home/
        ls -la /home/selectt-api/htdocs/api.selectt.in/ 2>/dev/null || ls -la /home/selectt-api/ 2>/dev/null

        echo "=== MYSQL STATUS ==="
        mysql -V 2>/dev/null || which mariadb || which mysql
        systemctl is-active mysql 2>/dev/null || systemctl is-active mariadb 2>/dev/null
    `;

    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log(`Command closed with code ${code}`);
            conn.end();
        }).on('data', (data) => {
            process.stdout.write(data);
        }).stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    });
}).on('error', (err) => {
    console.error('SSH Connection Failed:', err.message);
}).connect(SSH_CONFIG);

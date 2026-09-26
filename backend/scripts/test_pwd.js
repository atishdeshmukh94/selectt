const { Client } = require('ssh2');

const passwordsToTry = [
    '#ADPJc0UoNJxo7Ll',
    'ADPJc0UoNJxo7Ll',
    '#ADPJc0UoNJxo7Ll\n'
];

async function tryPassword(pwd) {
    return new Promise((resolve) => {
        const conn = new Client();
        conn.on('ready', () => {
            console.log(`\n>>> SUCCESS with password: "${pwd}"`);
            conn.end();
            resolve(true);
        }).on('error', (err) => {
            console.log(`Failed with password "${pwd}": ${err.message}`);
            resolve(false);
        }).connect({
            host: '200.97.166.12',
            port: 22,
            username: 'root',
            password: pwd,
            readyTimeout: 10000
        });
    });
}

async function main() {
    for (const pwd of passwordsToTry) {
        const ok = await tryPassword(pwd);
        if (ok) break;
    }
}

main();

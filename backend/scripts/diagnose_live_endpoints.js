const { Client } = require('ssh2');
const mysql = require('mysql2/promise');

const LOCAL_DB = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'selectt-db'
};

const VPS_SSH = {
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
};

const VPS_DB = {
    user: 'selectt-wepnex',
    pass: '6EVSUZ7RNYA9bV0WUoxy',
    db: 'connect-db'
};

async function main() {
    const localDb = await mysql.createConnection(LOCAL_DB);
    const [localTablesRes] = await localDb.query('SHOW TABLES');
    const localTables = localTablesRes.map(t => Object.values(t)[0]);
    console.log('Local Tables count:', localTables.length);

    const conn = new Client();
    await new Promise((resolve, reject) => {
        conn.on('ready', resolve);
        conn.on('error', reject);
        conn.connect(VPS_SSH);
    });
    console.log('Connected to VPS');

    const runCmd = (cmd) => new Promise((resolve) => {
        conn.exec(cmd, (err, stream) => {
            let out = '';
            stream.on('data', d => out += d.toString());
            stream.stderr.on('data', d => out += d.toString());
            stream.on('close', () => resolve(out));
        });
    });

    const vpsTablesOut = await runCmd(`mysql -u ${VPS_DB.user} -p'${VPS_DB.pass}' ${VPS_DB.db} -e "SHOW TABLES;" 2>/dev/null`);
    console.log('=== VPS Tables ===\n', vpsTablesOut);

    // Compare all table schemas
    console.log('\n=== Comparing Table Schemas (Local vs VPS) ===');
    for (const table of localTables) {
        const [localCols] = await localDb.query(`DESCRIBE \`${table}\``);
        const localColNames = localCols.map(c => c.Field);

        const vpsColsOut = await runCmd(`mysql -u ${VPS_DB.user} -p'${VPS_DB.pass}' ${VPS_DB.db} -e "DESCRIBE \`${table}\`;" 2>/dev/null`);
        if (vpsColsOut.includes("doesn't exist")) {
            console.log(`❌ Table '${table}' MISSING on VPS!`);
        } else {
            const vpsColNames = vpsColsOut.split('\n').slice(1).map(l => l.split('\t')[0].trim()).filter(Boolean);
            const missingOnVps = localColNames.filter(c => !vpsColNames.includes(c));
            if (missingOnVps.length > 0) {
                console.log(`⚠️ Table '${table}' missing columns on VPS:`, missingOnVps);
            } else {
                console.log(`✅ Table '${table}' OK (${localColNames.length} columns match)`);
            }
        }
    }

    // Check recent PM2 logs
    console.log('\n=== Recent Backend PM2 Error Logs on VPS ===');
    const logsOut = await runCmd(`export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"; pm2 logs selectt-api --lines 30 --nostream`);
    console.log(logsOut);

    await localDb.end();
    conn.end();
}

main().catch(console.error);

const { Client } = require('ssh2');

const VPS_SSH = {
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
};

const conn = new Client();
conn.on('ready', () => {
    const query = process.argv[2] || "SELECT id, make, model FROM cars;";
    const cmd = `mysql -u selectt-wepnex -p6EVSUZ7RNYA9bV0WUoxy connect-db -e "${query}" 2>&1`;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        let out = '';
        stream.on('data', d => out += d);
        stream.stderr.on('data', d => out += d);
        stream.on('close', () => {
            console.log(out);
            conn.end();
            process.exit(0);
        });
    });
}).connect(VPS_SSH);

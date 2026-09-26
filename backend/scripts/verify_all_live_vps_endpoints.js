const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
    const cmd = `
        echo "=== 1. /health ==="
        curl -s http://127.0.0.1:5000/health
        
        echo -e "\n\n=== 2. /api/cars (Sample) ==="
        curl -s http://127.0.0.1:5000/api/cars | head -c 180

        echo -e "\n\n=== 3. /api/brands ==="
        curl -s http://127.0.0.1:5000/api/brands | head -c 180

        echo -e "\n\n=== 4. /api/locations ==="
        curl -s http://127.0.0.1:5000/api/locations | head -c 180

        echo -e "\n\n=== 5. /api/banners ==="
        curl -s http://127.0.0.1:5000/api/banners | head -c 180
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

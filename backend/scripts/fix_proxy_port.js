const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
    const cmd = `
        echo "=== CHECK CLOUDPANEL VHOST PROXY PORT ==="
        grep -i "proxy_pass" /etc/nginx/sites-enabled/*api.selectt.in* 2>/dev/null || grep -i "proxy_pass" /etc/nginx/sites-available/* 2>/dev/null || echo "Vhost path check"

        echo "=== UPDATING .env PORT TO MATCH VHOST (PORT 3000) ==="
        sed -i 's/PORT=5000/PORT=3000/g' /home/selectt-api/htdocs/api.selectt.in/.env
        cat /home/selectt-api/htdocs/api.selectt.in/.env | grep PORT

        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        cd /home/selectt-api/htdocs/api.selectt.in
        pm2 restart selectt-api --update-env
        sleep 2
        pm2 status

        echo -e "\n=== TESTING LOCAL CURL 3000 ==="
        curl -s http://127.0.0.1:3000/health

        echo -e "\n\n=== TESTING LOCAL NGINX PROXY PASS VIA IP ==="
        curl -s -k -H "Host: api.selectt.in" https://127.0.0.1/health
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

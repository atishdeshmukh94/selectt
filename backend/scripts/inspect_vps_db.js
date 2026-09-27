const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
    const cmd = `
        echo '=== VPS .ENV CORS & ALLOWED_ORIGINS ==='
        cat /home/selectt-api/htdocs/api.selectt.in/.env | grep -E 'ALLOWED_ORIGINS|CORS|DB_'

        echo '=== VPS BANNERS TABLE SCHEMA ==='
        mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "DESCRIBE banners;" 2>/dev/null

        echo '=== VPS BANNERS ROW COUNT ==='
        mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "SELECT page, type, count(*) FROM banners GROUP BY page, type;" 2>/dev/null

        echo '=== VPS CARS COUNT ==='
        mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "SELECT count(*) as total_cars FROM cars;" 2>/dev/null

        echo '=== VPS SITE CONTENT COUNT ==='
        mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "SELECT count(*) as total_content FROM site_content;" 2>/dev/null

        echo '=== VPS SETTINGS COUNT ==='
        mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "SELECT count(*) as total_settings FROM settings;" 2>/dev/null

        echo '=== VPS BRANDS COUNT ==='
        mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "SELECT count(*) as total_brands FROM brands;" 2>/dev/null

        echo '=== VPS UPLOADS COUNT ==='
        ls -1 /home/selectt-api/htdocs/api.selectt.in/public/uploads | wc -l
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

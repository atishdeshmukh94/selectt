const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const sql = `
    SELECT 
        TRIM(c.make) as brand_name,
        TRIM(c.model) as model_name,
        COUNT(*) as car_count
    FROM cars c
    WHERE (c.status IS NULL OR c.status = '' OR c.status = 'active')
      AND c.status != 'sold_out'
      AND c.status != 'draft'
      AND c.make IS NOT NULL AND TRIM(c.make) != ''
      AND c.model IS NOT NULL AND TRIM(c.model) != ''
    GROUP BY TRIM(c.make), TRIM(c.model)
    ORDER BY TRIM(c.make) ASC, car_count DESC, TRIM(c.model) ASC;
  `;
  const cmd = `mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "${sql.replace(/\n/g, ' ')}"`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', code => {
      conn.end();
    });
  });
}).connect({
  host: '200.97.166.12',
  port: 22,
  username: 'selectt-api',
  password: 'qdBG7QXFQayXUuwvHPzo'
});

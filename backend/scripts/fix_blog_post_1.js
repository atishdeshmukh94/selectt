const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const sql = `UPDATE blog_posts SET meta_title = 'Buying your dream car? Check Now!', meta_description = 'Looking to buy your dream car in 2026? Check out the latest car models, prices, body types, and essential car buying tips by Selectt Mumbai.' WHERE id = 1;`;
  
  conn.exec(`mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "${sql}"`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => {
      console.log('Updated blog post #1 in VPS DB!');
      conn.exec("mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e \"SELECT id, title, slug, meta_title, meta_description FROM blog_posts WHERE id = 1;\"", (err2, stream2) => {
        stream2.on('data', d2 => process.stdout.write(d2));
        stream2.on('close', () => conn.end());
      });
    });
  });
}).connect({
  host: '200.97.166.12',
  port: 22,
  username: 'selectt-api',
  password: 'qdBG7QXFQayXUuwvHPzo'
});

const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '200.97.166.12',
      user: 'selectt-wepnex',
      password: '6EVSUZ7RNYA9bV0WUoxy',
      database: 'connect-db'
    });

    console.log('Connected to live DB!');
    const [cols] = await conn.query('DESCRIBE cars');
    console.log('Cars table columns:', cols.map(c => c.Field));

    const [users] = await conn.query('SELECT id, name, email, role FROM users');
    console.log('Users in live DB:', users);

    await conn.end();
  } catch (e) {
    console.error('DB Error:', e.message);
  }
})();

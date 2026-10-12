const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const remoteCmd = `export PATH=/home/selectt-api/.nvm/versions/node/v24.21.0/bin:$PATH; node -e "
    const OneSignalService = require('/home/selectt-api/htdocs/api.selectt.in/onesignal-service');
    const mysql = require('/home/selectt-api/htdocs/api.selectt.in/node_modules/mysql2');
    const db = mysql.createPool({ host: 'localhost', user: 'selectt-wepnex', password: '6EVSUZ7RNYA9bV0WUoxy', database: 'connect-db' });
    const os = new OneSignalService(db);
    os.sendPushNotification({
      title: '🚗 Test Notification',
      message: 'Hello Selectt subscribers!',
      url: 'https://selectt.in/cars',
      imageUrl: 'https://api.selectt.in/uploads/car_6_photo_1_1782136930527.webp'
    }).then(r => {
      console.log('LIVE VPS PUSH RESULT:', JSON.stringify(r));
      process.exit(0);
    }).catch(e => {
      console.error('LIVE VPS PUSH ERROR:', e.message);
      process.exit(1);
    });
  "`;

  conn.exec(remoteCmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', code => {
      console.log('Exited with code:', code);
      conn.end();
    });
  });
}).connect({
  host: '200.97.166.12',
  port: 22,
  username: 'selectt-api',
  password: 'qdBG7QXFQayXUuwvHPzo'
});

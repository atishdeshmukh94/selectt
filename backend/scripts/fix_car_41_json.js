const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const images = [
    "/uploads/car_11_photo_2_1782136933178.webp",
    "/uploads/car_11_photo_3_1782136933182.webp",
    "/uploads/car_11_photo_4_1782136933188.webp",
    "/uploads/car_11_photo_5_1782136933201.webp",
    "/uploads/car_11_photo_6_1782136933206.webp",
    "/uploads/car_11_photo_7_1782136933219.webp"
  ];
  const jsonStr = JSON.stringify(images).replace(/'/g, "\\'");
  const sql = `UPDATE cars SET more_images = '${jsonStr}', video_url = 'https://iframe.mediadelivery.net/embed/762989/783c4059-153d-4a7b-b072-1f1c63bbfede' WHERE id = 41;`;

  conn.exec(`mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "${sql}"`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => {
      console.log('Updated car 41 in VPS database successfully!');
      conn.exec("mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e \"SELECT id, make, model, video_url, more_images FROM cars WHERE id = 41;\"", (err2, stream2) => {
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

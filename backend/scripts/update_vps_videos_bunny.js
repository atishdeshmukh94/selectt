const { Client } = require('ssh2');

const videoMap = {
  'car_12_video_1782136933466.mp4': 'https://iframe.mediadelivery.net/embed/762989/28a14745-bfba-462d-93e7-cc4deaec67b1',
  'car_1_video_1782136928905.mp4': 'https://iframe.mediadelivery.net/embed/762989/c76caa5d-7be5-47e3-9183-259de031aa5e',
  'car_2_video_1782136929056.mp4': 'https://iframe.mediadelivery.net/embed/762989/aa66dabf-8d65-4fae-bd7c-f086478b5b14',
  'car_3_video_1782136929438.mp4': 'https://iframe.mediadelivery.net/embed/762989/5cc22d92-5b98-4ac6-971d-499b736bf98a',
  'car_4_video_1782136930023.mp4': 'https://iframe.mediadelivery.net/embed/762989/3417b23e-a734-4ba3-a131-df4cdf6c57f6',
  'car_5_video_1782136930313.mp4': 'https://iframe.mediadelivery.net/embed/762989/c176f9f6-6cf3-4d4b-9b0f-4a2cec30a71a',
  'car_6_video_1782136930801.mp4': 'https://iframe.mediadelivery.net/embed/762989/bc04c056-089b-44e6-abcf-140ea85301f5',
  'car_7_video_1782136931353.mp4': 'https://iframe.mediadelivery.net/embed/762989/d7edd47a-0b2a-41cf-af47-c33782c7d517',
  'car_8_video_1782136931826.mp4': 'https://iframe.mediadelivery.net/embed/762989/67435ccc-6741-41ed-93b9-6524cc7b71f3',
  'car_9_video_1782136932639.mp4': 'https://iframe.mediadelivery.net/embed/762989/12aba57f-ce1d-4621-9f5f-665760ce5355'
};

const conn = new Client();
conn.on('ready', () => {
  let sql = '';
  for (const [filename, embedUrl] of Object.entries(videoMap)) {
    sql += `UPDATE cars SET video_url = '${embedUrl}' WHERE video_url LIKE '%${filename}'; `;
  }
  const cmd = `mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "${sql}" && mysql -u selectt-wepnex -p'6EVSUZ7RNYA9bV0WUoxy' connect-db -e "SELECT id, make, model, video_url FROM cars WHERE video_url IS NOT NULL AND video_url != '' LIMIT 10;"`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => {
      console.log('VPS DB updated with Bunny Stream URLs!');
      conn.end();
    });
  });
}).connect({
  host: '200.97.166.12',
  port: 22,
  username: 'selectt-api',
  password: 'qdBG7QXFQayXUuwvHPzo'
});

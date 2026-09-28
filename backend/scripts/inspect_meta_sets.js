const https = require('https');

const token = 'EAIo8QpxjUvIBShFcXMZC7YlPGwBIuMlhJFObguvxS6yvipTWYjBSuY03all2R6qxybMyeyRuThOrXjB5Hl6lKhUc0o50ZA96okACvvdPZBa8rla3ukxqYwSXhKVjDfa5xFBpVeeSVlBpjZB3F1hobJMp6ONoN9HF0UVUO9SRyyRpJx8vlddbqPuWHoxluwZDZD';
const catalogId = '2206855529763290';

function getProductSets() {
  const url = `https://graph.facebook.com/v21.0/${catalogId}/product_sets?fields=id,name,filter,product_count&access_token=${token}`;

  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('Product Sets in Meta Catalog:');
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.error('Parse error:', data);
      }
    });
  }).on('error', console.error);
}

getProductSets();

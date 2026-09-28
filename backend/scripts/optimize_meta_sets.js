const https = require('https');

const token = 'EAIo8QpxjUvIBShFcXMZC7YlPGwBIuMlhJFObguvxS6yvipTWYjBSuY03all2R6qxybMyeyRuThOrXjB5Hl6lKhUc0o50ZA96okACvvdPZBa8rla3ukxqYwSXhKVjDfa5xFBpVeeSVlBpjZB3F1hobJMp6ONoN9HF0UVUO9SRyyRpJx8vlddbqPuWHoxluwZDZD';
const catalogId = '2206855529763290';

const setConfigs = [
  { id: '1781058892489770', name: 'MARUTI SUZUKI', filter: { or: [{ brand: { i_contains: 'Maruti' } }, { brand: { i_contains: 'Suzuki' } }] } },
  { id: '736788542593605', name: 'HYUNDAI', filter: { brand: { i_contains: 'Hyundai' } } },
  { id: '1102913385394980', name: 'TATA', filter: { brand: { i_contains: 'Tata' } } },
  { id: '1646557933431945', name: 'TOYOTA', filter: { brand: { i_contains: 'Toyota' } } },
  { id: '3558738794285794', name: 'HONDA', filter: { brand: { i_contains: 'Honda' } } },
  { id: '1300319495026942', name: 'FORD', filter: { brand: { i_contains: 'Ford' } } },
  { id: '1019438436936086', name: 'SKODA', filter: { brand: { i_contains: 'Skoda' } } },
  { id: '758584647107289', name: 'VOLKSWAGEN', filter: { or: [{ brand: { i_contains: 'Volkswagen' } }, { brand: { i_contains: 'VW' } }] } },
  { id: '24460064233587050', name: 'MAHINDRA', filter: { brand: { i_contains: 'Mahindra' } } },
  { id: '1086787769646771', name: 'KIA', filter: { brand: { i_contains: 'Kia' } } },
  { id: '1335281491587606', name: 'MG', filter: { brand: { i_contains: 'MG' } } },
  { id: '1567117121032511', name: 'JEEP', filter: { brand: { i_contains: 'Jeep' } } },
  { id: '1224722819547986', name: 'Mercedes', filter: { or: [{ brand: { i_contains: 'Mercedes' } }, { brand: { i_contains: 'Benz' } }] } }
];

async function updateSet(set) {
  return new Promise((resolve) => {
    const postData = new URLSearchParams({
      access_token: token,
      filter: JSON.stringify(set.filter)
    }).toString();

    const req = https.request({
      hostname: 'graph.facebook.com',
      port: 443,
      path: `/v21.0/${set.id}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log(`Updated set ${set.name} (${set.id}):`, json);
        } catch (e) {
          console.error(`Error updating ${set.name}:`, body);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`Request error for ${set.name}:`, e.message);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('Optimizing Meta Product Sets with dynamic brand filters...');
  for (const set of setConfigs) {
    await updateSet(set);
  }
  console.log('\nAll Meta product sets optimized! Checking product counts...');
  
  // Re-fetch to verify
  https.get(`https://graph.facebook.com/v21.0/${catalogId}/product_sets?fields=id,name,filter,product_count&access_token=${token}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const parsed = JSON.parse(data);
      console.log('\nUpdated Product Sets Overview:');
      (parsed.data || []).forEach(s => {
        console.log(`- ${s.name}: ${s.product_count} products (filter: ${s.filter || 'All'})`);
      });
    });
  });
}

run();

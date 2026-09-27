const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'index.js');
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("app.set('trust proxy'")) {
    code = code.replace(/const app = express\(\);[\r\n]+const port/, "const app = express();\r\napp.set('trust proxy', 1);\r\nconst port");
    fs.writeFileSync(file, code, 'utf8');
    console.log('Successfully added trust proxy to index.js');
} else {
    console.log('Already present');
}

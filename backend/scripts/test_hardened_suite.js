const http = require('http');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_local_audit';

// Start test backend server on port 5099
process.env.PORT = '5099';
process.env.NODE_ENV = 'test';

const { spawn } = require('child_process');

console.log('Spawning test backend process on port 5099...');
const serverProcess = spawn('node', ['index.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: '5099' }
});

serverProcess.stdout.on('data', data => console.log(`[TEST SERVER] ${data}`));
serverProcess.stderr.on('data', data => console.error(`[TEST SERVER ERR] ${data}`));

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(data); } catch { parsed = data; }
                resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

const results = [];
function recordTest(name, passed, details) {
    results.push({ name, passed, details });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${name}: ${details}`);
}

async function runSuite() {
    await wait(2500); // wait for server to start

    console.log('\n====================================================');
    console.log('RUNNING REGRESSION TEST SUITE AGAINST HARDENED SERVER');
    console.log('====================================================\n');

    // 1. Health check & zero credentials leakage
    try {
        const res = await makeRequest({ hostname: 'localhost', port: 5099, path: '/health', method: 'GET' });
        const hasNoSecrets = !JSON.stringify(res.body).includes('DB_PASS') && 
                             !JSON.stringify(res.body).includes('JWT_SECRET');
        recordTest('Health Check & Zero Secrets Exposure', res.statusCode === 200 && hasNoSecrets, `Status: ${res.statusCode}`);
    } catch (e) {
        recordTest('Health Check & Zero Secrets Exposure', false, e.message);
    }

    // 2. Unauthenticated Admin Route Rejection
    try {
        const res = await makeRequest({ hostname: 'localhost', port: 5099, path: '/api/customers', method: 'GET' });
        recordTest('Unauthenticated Admin Route Rejection', res.statusCode === 401, `Status: ${res.statusCode} (Expected 401)`);
    } catch (e) {
        recordTest('Unauthenticated Admin Route Rejection', false, e.message);
    }

    // 3. Customer Token Blocked from Admin Customers List (Vertical Privilege Escalation Prevention)
    try {
        const customerToken = jwt.sign({ id: 9999, phone: '9999999999', role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });
        const res = await makeRequest({
            hostname: 'localhost',
            port: 5099,
            path: '/api/customers',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        recordTest('Customer Token Blocked from Admin Customers List', res.statusCode === 403, `Status: ${res.statusCode} (Expected 403 Forbidden)`);
    } catch (e) {
        recordTest('Customer Token Blocked from Admin Customers List', false, e.message);
    }

    // 4. Customer Token Blocked from Admin Car Creation
    try {
        const customerToken = jwt.sign({ id: 9999, phone: '9999999999', role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });
        const res = await makeRequest({
            hostname: 'localhost',
            port: 5099,
            path: '/api/cars',
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${customerToken}`,
                'Content-Type': 'application/json'
            }
        }, { make: 'Test', model: 'TestCar', price: 100000 });
        recordTest('Customer Token Blocked from Creating Cars', res.statusCode === 403, `Status: ${res.statusCode} (Expected 403 Forbidden)`);
    } catch (e) {
        recordTest('Customer Token Blocked from Creating Cars', false, e.message);
    }

    // 5. Customer Token Blocked from Admin Insurance Requests
    try {
        const customerToken = jwt.sign({ id: 9999, phone: '9999999999', role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });
        const res = await makeRequest({
            hostname: 'localhost',
            port: 5099,
            path: '/api/admin/insurance-requests',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        recordTest('Customer Token Blocked from Admin Insurance Requests', res.statusCode === 403, `Status: ${res.statusCode} (Expected 403 Forbidden)`);
    } catch (e) {
        recordTest('Customer Token Blocked from Admin Insurance Requests', false, e.message);
    }

    // 6. Weak Fallback Secret Key Forgery Rejection
    try {
        const forgedToken = jwt.sign({ id: 1, role: 'admin' }, 'your-secret-key', { expiresIn: '1h' });
        const res = await makeRequest({
            hostname: 'localhost',
            port: 5099,
            path: '/api/customers',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${forgedToken}` }
        });
        recordTest('Weak Fallback Secret Key Forgery Rejection', res.statusCode === 401, `Status: ${res.statusCode} (Expected 401 Invalid Token)`);
    } catch (e) {
        recordTest('Weak Fallback Secret Key Forgery Rejection', false, e.message);
    }

    // 7. Legitimate Admin Token Access
    try {
        const adminToken = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        const res = await makeRequest({
            hostname: 'localhost',
            port: 5099,
            path: '/api/customers',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        recordTest('Legitimate Admin Token Access', res.statusCode === 200, `Status: ${res.statusCode} (Expected 200 OK)`);
    } catch (e) {
        recordTest('Legitimate Admin Token Access', false, e.message);
    }

    // 8. HTTP Security Headers
    try {
        const res = await makeRequest({ hostname: 'localhost', port: 5099, path: '/health', method: 'GET' });
        const hasXContentType = res.headers['x-content-type-options'] === 'nosniff';
        recordTest('HTTP Security Headers (Helmet Active)', hasXContentType, `X-Content-Type-Options: ${res.headers['x-content-type-options']}`);
    } catch (e) {
        recordTest('HTTP Security Headers (Helmet Active)', false, e.message);
    }

    console.log('\n====================================================');
    const allPassed = results.every(r => r.passed);
    console.log(`TEST SUMMARY: ${results.filter(r => r.passed).length}/${results.length} PASSED`);
    console.log(`OVERALL STATUS: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
    console.log('====================================================');

    serverProcess.kill();
    process.exit(allPassed ? 0 : 1);
}

runSuite();

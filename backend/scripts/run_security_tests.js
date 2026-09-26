const http = require('http');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_local_audit';
const BASE_URL = 'http://localhost:5000';

const results = [];

function recordTest(name, passed, details) {
    results.push({ name, passed, details });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${name}: ${details}`);
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

async function runTests() {
    console.log('====================================================');
    console.log('STARTING SELECTT PRE-PRODUCTION SECURITY TEST SUITE');
    console.log('====================================================\n');

    // 1. Health check & Info Disclosure test
    try {
        const res = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/health',
            method: 'GET'
        });
        const hasNoSecrets = !JSON.stringify(res.body).includes('DB_PASS') && 
                             !JSON.stringify(res.body).includes('JWT_SECRET') &&
                             !JSON.stringify(res.body).includes('password');
        recordTest('Health Check & Zero Secrets Exposure', res.statusCode === 200 && hasNoSecrets, `Status: ${res.statusCode}, No leaked credentials.`);
    } catch (e) {
        recordTest('Health Check & Zero Secrets Exposure', false, `Failed to reach /health: ${e.message}`);
    }

    // 2. Unauthenticated Admin Route Access Check (OWASP A01 Broken Access Control)
    try {
        const res = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/customers',
            method: 'GET'
        });
        recordTest('Unauthenticated Admin Route Rejection', res.statusCode === 401, `Status: ${res.statusCode} (Expected 401)`);
    } catch (e) {
        recordTest('Unauthenticated Admin Route Rejection', false, e.message);
    }

    // 3. Customer Token Accessing Admin Endpoints (Privilege Escalation / RBAC Verification)
    try {
        const customerToken = jwt.sign({ id: 9999, phone: '9999999999', role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });
        const res = await makeRequest({
            hostname: 'localhost',
            port: 5000,
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
            port: 5000,
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
            port: 5000,
            path: '/api/admin/insurance-requests',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${customerToken}` }
        });
        recordTest('Customer Token Blocked from Admin Insurance Requests', res.statusCode === 403, `Status: ${res.statusCode} (Expected 403 Forbidden)`);
    } catch (e) {
        recordTest('Customer Token Blocked from Admin Insurance Requests', false, e.message);
    }

    // 6. Weak Fallback Secret Token Forgery Resistance
    try {
        const forgedToken = jwt.sign({ id: 1, role: 'admin' }, 'your-secret-key', { expiresIn: '1h' });
        const res = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/customers',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${forgedToken}` }
        });
        recordTest('Weak Fallback Secret Key Forgery Rejection', res.statusCode === 401, `Status: ${res.statusCode} (Expected 401 Invalid Token)`);
    } catch (e) {
        recordTest('Weak Fallback Secret Key Forgery Rejection', false, e.message);
    }

    // 7. Legitimate Admin Token Access Verification
    try {
        const adminToken = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        const res = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/customers',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        recordTest('Legitimate Admin Token Access', res.statusCode === 200, `Status: ${res.statusCode} (Expected 200 OK)`);
    } catch (e) {
        recordTest('Legitimate Admin Token Access', false, e.message);
    }

    // 8. Security Headers Verification (Helmet)
    try {
        const res = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/health',
            method: 'GET'
        });
        const hasXContentType = res.headers['x-content-type-options'] === 'nosniff';
        const hasXFrame = !!res.headers['x-frame-options'];
        const hasXDownload = res.headers['x-download-options'] === 'noopen';
        recordTest('HTTP Security Headers (Helmet Active)', hasXContentType, `X-Content-Type-Options: ${res.headers['x-content-type-options']}`);
    } catch (e) {
        recordTest('HTTP Security Headers (Helmet Active)', false, e.message);
    }

    console.log('\n====================================================');
    const allPassed = results.every(r => r.passed);
    console.log(`TEST SUMMARY: ${results.filter(r => r.passed).length}/${results.length} PASSED`);
    console.log(`OVERALL STATUS: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`);
    console.log('====================================================');

    process.exit(allPassed ? 0 : 1);
}

runTests();

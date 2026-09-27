const jwt = require('jsonwebtoken');
const https = require('https');

async function testAdminBannerCreation() {
    const token = jwt.sign(
        { id: 1, email: 'admin@selectt.in', role: 'admin', is_admin: 1 },
        's3l3ctt_jwt_$ecret_k3y_2025_xK9mR7pL2nQ8vW4jY6hT1bZ3cF5dG0eA',
        { expiresIn: '1h' }
    );

    const postData = JSON.stringify({
        page: 'sell-car',
        type: 'step',
        title: 'Live API Test Banner',
        subtitle: 'Testing banner creation',
        cta_text: 'Learn More',
        cta_link: '/sell-car',
        sort_order: 99,
        is_active: 1
    });

    const options = {
        hostname: 'api.selectt.in',
        port: 443,
        path: '/api/admin/banners',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = https.request(options, res => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
            console.log('POST /api/admin/banners Response status:', res.statusCode);
            console.log('Response body:', body);
            try {
                const data = JSON.parse(body);
                if (data.id) {
                    const delReq = https.request({
                        hostname: 'api.selectt.in',
                        port: 443,
                        path: '/api/admin/banners/' + data.id,
                        method: 'DELETE',
                        headers: { 'Authorization': 'Bearer ' + token }
                    }, delRes => {
                        console.log('DELETE test banner status:', delRes.statusCode);
                    });
                    delReq.end();
                }
            } catch (e) {
                console.error(e);
            }
        });
    });
    req.write(postData);
    req.end();
}
testAdminBannerCreation();

const bcrypt = require('bcryptjs');

async function test() {
    const password = 'password123';
    const dbPassword = 'password123';
    
    try {
        const isMatch = await bcrypt.compare(password, dbPassword).catch(() => {
            console.log('Catch triggered');
            return password === dbPassword;
        });
        console.log('isMatch:', isMatch);
    } catch (e) {
        console.log('Outer catch:', e.message);
    }
}

test();

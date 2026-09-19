const http = require('http');

async function test() {
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'superadmin@dev.local', password: 'DevPassword123!' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
        console.error('Login failed:', loginData);
        return;
    }
    const token = loginData?.data?.accessToken || loginData?.data?.token || loginData.token;
    console.log('Logged in! Token prefix:', String(token).substring(0, 10));
    console.log('Logged in! Token prefix:', token.substring(0, 10));

    console.log('Creating outage...');
    const outageRes = await fetch('http://localhost:5000/api/v1/electricity/outages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            title: '[ALERT] Scheduled Power Outage - Test',
            description: 'Unexpected Interruption',
            areaName: 'Test Area',
            severity: 'MEDIUM',
            startedAt: new Date().toISOString(),
            affectedAreas: ['Test Area'],
            location: {
                type: 'Point',
                coordinates: [73.7125, 24.5854]
            }
        })
    });
    const result = await outageRes.json();
    console.log('Outage creation result:', JSON.stringify(result, null, 2));
}

test().catch(console.error);

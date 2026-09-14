const axios = require('axios');

async function test() {
    try {
        const login = await axios.post('http://localhost:5000/api/v1/auth/admin/login', {
            email: 'superadmin@dev.local',
            password: 'DevPassword123!'
        });
        console.log("LOGIN SUCCESS:", !!login.data);
        const token = login.data.data.tokens.accessToken;

        try {
            const me = await axios.get('http://localhost:5000/api/v1/admin/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("ME SUCCESS:", !!me.data);
        } catch (e2) {
            console.error("ME ERROR:", e2.response?.status, e2.response?.data);
        }
    } catch (e) {
        console.error("LOGIN ERROR:", e.response?.status, e.response?.data);
    }
}
test();

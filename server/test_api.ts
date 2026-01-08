
import axios from 'axios';

const API_URL = 'http://localhost:4000';

const run = async () => {
    try {
        console.log('1. Testing Health...');
        const health = await axios.get(`${API_URL}/health`);
        console.log('Health:', health.data);

        console.log('2. Logging in...');
        // Try to login (or register if fails, but let's assume login for 'owner@agency.com' if created previously)
        // I'll try to register a NEW user to be safe
        const email = `test.${Date.now()}@example.com`;
        const password = 'password123';

        console.log(`Registering ${email}...`);
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            email,
            password,
            role: 'OWNER'
        });
        const token = regRes.data.token;
        console.log('Got Token:', token ? 'YES' : 'NO');

        console.log('3. creating Lead...');
        const leadRes = await axios.post(`${API_URL}/leads`, {
            name: 'Test Lead',
            company: 'Test Corp',
            value: 5000,
            status: 'NEW'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Lead Created:', leadRes.data);

        console.log('SUCCESS! Backend is working.');

    } catch (err: any) {
        console.error('FAILED:', err.response?.data || err.message);
    }
};

run();

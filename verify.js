const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
    console.log('--- Starting Tests ---');

    try {
        // 1. Health check
        console.log('Testing /api/healthz...');
        const health = await axios.get(`${BASE_URL}/api/healthz`);
        console.log('Health:', health.data);

        // 2. Create Paste
        console.log('\nCreating a paste...');
        const createRes = await axios.post(`${BASE_URL}/api/pastes`, {
            content: 'Hello World',
            ttl_seconds: 60,
            max_views: 2
        });
        const { id, url } = createRes.data;
        console.log('Created Paste ID:', id);

        // 3. Fetch Paste (View 1)
        console.log('\nFetching paste (View 1)...');
        const view1 = await axios.get(`${BASE_URL}/api/pastes/${id}`);
        console.log('View 1:', view1.data);

        // 4. Fetch Paste (View 2)
        console.log('\nFetching paste (View 2)...');
        const view2 = await axios.get(`${BASE_URL}/api/pastes/${id}`);
        console.log('View 2:', view2.data);

        // 5. Fetch Paste (View 3) - Should be 404
        console.log('\nFetching paste (View 3 - Should fail)...');
        try {
            await axios.get(`${BASE_URL}/api/pastes/${id}`);
        } catch (err) {
            console.log('View 3 Status:', err.response.status, '(Expected 404)');
        }

        // 6. Test Expiry (Deterministic Time)
        console.log('\nTesting Expiry with x-test-now-ms...');
        const expiryPaste = await axios.post(`${BASE_URL}/api/pastes`, {
            content: 'Expired Content',
            ttl_seconds: 10
        });
        const expiryId = expiryPaste.data.id;
        const now = Date.now();

        console.log('Fetching BEFORE expiry...');
        const before = await axios.get(`${BASE_URL}/api/pastes/${expiryId}`, {
            headers: { 'x-test-now-ms': now.toString() }
        });
        console.log('Before Expiry:', before.status);

        console.log('Fetching AFTER expiry (simulated 20s later)...');
        try {
            await axios.get(`${BASE_URL}/api/pastes/${expiryId}`, {
                headers: { 'x-test-now-ms': (now + 20000).toString() }
            });
        } catch (err) {
            console.log('After Expiry Status:', err.response.status, '(Expected 404)');
        }

        console.log('\n--- All Tests Completed ---');
    } catch (err) {
        console.error('Test Failed:', err.message);
        if (err.response) console.log('Response Data:', err.response.data);
    }
}

runTests();

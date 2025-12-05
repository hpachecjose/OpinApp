// backend/src/testAuth.js
import crypto from 'crypto';

const BASE_URL = 'http://localhost:4000';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

async function runTests() {
    console.log('🚀 Starting Auth Tests...');

    // 1. Register
    console.log('\nTesting Register...');
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test User',
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            company: 'Test Corp'
        })
    });
    const regData = await regRes.json();
    console.log('Register Status:', regRes.status);
    console.log('Register Response:', regData);

    if (regRes.status !== 201) {
        console.error('❌ Register failed');
        return;
    }

    // 2. Login
    console.log('\nTesting Login...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        })
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    // console.log('Login Response:', loginData);

    if (loginRes.status !== 200) {
        console.error('❌ Login failed');
        return;
    }
    const token = loginData.token;
    console.log('✅ Login successful, token received.');

    // 3. Get Me
    console.log('\nTesting Get Me...');
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log('Get Me Status:', meRes.status);
    console.log('Get Me Response:', meData);

    if (meRes.status !== 200) {
        console.error('❌ Get Me failed');
    }

    // 4. Request Password Reset
    console.log('\nTesting Request Password Reset...');
    const resetReqRes = await fetch(`${BASE_URL}/api/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_EMAIL })
    });
    const resetReqData = await resetReqRes.json();
    console.log('Request Reset Status:', resetReqRes.status);
    console.log('Request Reset Response:', resetReqData);

    // Note: We can't easily get the token from the email in this test script without mocking email or checking DB.
    // For this test, we will assume the request succeeded if status is 200.
    // To test the full flow, we would need to read the DB to get the token.

    // Let's try to read the DB directly via Prisma? No, let's keep it simple and just check status.
    // If we want to test the reset, we need the token.
    // Since we are running in the same environment, we could potentially use Prisma here too, but this script is running via node, so we can import Prisma.

    // Let's try to import Prisma and get the token.
}

runTests().catch(console.error);

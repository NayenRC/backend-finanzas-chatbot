import axios from 'axios';

const PRODUCTION_API_URL = 'https://backend-finanzas-chatbot-production.up.railway.app/api';
const UNIQUE_ID = Date.now();
const TEST_USER = {
    name: 'Production Test',
    email: `prod_test_${UNIQUE_ID}@test.com`,
    password: 'password123'
};

async function testProduction() {
    console.log(`--- Testing Production API: ${PRODUCTION_API_URL} ---`);

    try {
        console.log(`1. Registering user: ${TEST_USER.email}`);
        const regRes = await axios.post(`${PRODUCTION_API_URL}/auth/register`, TEST_USER);
        console.log('✅ Registration success:', regRes.status);

        console.log(`2. Attempting login as: ${TEST_USER.email}`);
        const loginRes = await axios.post(`${PRODUCTION_API_URL}/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        console.log('✅ Login success:', loginRes.status);
        console.log('Token received:', loginRes.data.token ? 'YES' : 'NO');

    } catch (error) {
        console.error('❌ Test failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testProduction();

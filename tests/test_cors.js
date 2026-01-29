import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';

const PORT = 3001; // Use a different port for testing if possible or just rely on the server being up

async function runTest() {
    console.log('Testing CORS configuration...');

    const testOrigins = [
        'http://localhost:5173',
        'https://my-app.vercel.app',
        'https://another-preview-feat.vercel.app',
        'http://malicious-site.com'
    ];

    for (const origin of testOrigins) {
        try {
            const response = await axios.get(`http://localhost:${process.env.PORT || 3000}/api/`, {
                headers: { Origin: origin },
                validateStatus: false
            });

            const allowOrigin = response.headers['access-control-allow-origin'];
            const success = allowOrigin === origin;

            console.log(`Origin: ${origin.padEnd(40)} | Allowed: ${success ? 'YES' : 'NO'} | Header: ${allowOrigin || 'None'}`);
        } catch (error) {
            console.error(`Error testing origin ${origin}: ${error.message}`);
        }
    }
}

// Note: This script assumes the server is running.
// In a real verification, we would start the server, test, and stop it.
runTest();

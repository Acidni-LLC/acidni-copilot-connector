/**
 * API Test Script for Terprint Copilot Connector
 * 
 * Tests connectivity to the Terprint APIM endpoints
 * Run: node scripts/test-api.js
 */

const https = require('https');

const APIM_BASE_URL = process.env.APIM_BASE_URL || 'https://apim-terprint-dev.azure-api.net';
const APIM_KEY = process.env.APIM_SUBSCRIPTION_KEY;

const tests = [
    {
        name: 'Chat Health Check',
        method: 'GET',
        path: '/chat/health',
        expectedStatus: 200
    },
    {
        name: 'Recommend Health Check',
        method: 'GET',
        path: '/recommend/health',
        expectedStatus: 200
    },
    {
        name: 'Deals Health Check',
        method: 'GET',
        path: '/deals/health',
        expectedStatus: 200
    },
    {
        name: 'Data API Health Check',
        method: 'GET',
        path: '/data/api/health',
        expectedStatus: 200
    }
];

async function testEndpoint(test) {
    return new Promise((resolve) => {
        const url = new URL(test.path, APIM_BASE_URL);
        
        const options = {
            hostname: url.hostname,
            path: url.pathname,
            method: test.method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (APIM_KEY) {
            options.headers['Ocp-Apim-Subscription-Key'] = APIM_KEY;
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const passed = res.statusCode === test.expectedStatus;
                resolve({
                    name: test.name,
                    passed,
                    status: res.statusCode,
                    expected: test.expectedStatus,
                    response: data.substring(0, 200)
                });
            });
        });

        req.on('error', (e) => {
            resolve({
                name: test.name,
                passed: false,
                error: e.message
            });
        });

        req.setTimeout(10000, () => {
            req.destroy();
            resolve({
                name: test.name,
                passed: false,
                error: 'Timeout'
            });
        });

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Terprint Copilot Connector - API Tests\n');
    console.log(`Base URL: ${APIM_BASE_URL}`);
    console.log(`API Key: ${APIM_KEY ? '✓ Configured' : '✗ Not configured (set APIM_SUBSCRIPTION_KEY)'}\n`);
    console.log('─'.repeat(60));

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        const result = await testEndpoint(test);
        
        if (result.passed) {
            console.log(`✅ ${result.name}: ${result.status}`);
            passed++;
        } else if (result.error) {
            console.log(`❌ ${result.name}: ${result.error}`);
            failed++;
        } else {
            console.log(`❌ ${result.name}: Got ${result.status}, expected ${result.expected}`);
            failed++;
        }
    }

    console.log('─'.repeat(60));
    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
        console.log('\n⚠️  Some tests failed. Ensure:');
        console.log('   1. APIM_SUBSCRIPTION_KEY environment variable is set');
        console.log('   2. You have network access to apim-terprint-dev.azure-api.net');
        console.log('   3. The Terprint services are running');
        process.exit(1);
    } else {
        console.log('\n✅ All API endpoints are accessible!');
        process.exit(0);
    }
}

runTests();

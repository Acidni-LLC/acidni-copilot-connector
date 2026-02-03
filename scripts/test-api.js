/**
 * API connectivity test for Terprint Copilot Connector
 * Tests the APIM endpoints used by the Copilot plugin
 */

const https = require('https');

const APIM_BASE = 'apim-terprint-dev.azure-api.net';
const API_KEY = process.env.APIM_SUBSCRIPTION_KEY;

async function testEndpoint(name, path, expectedStatus = 200) {
    return new Promise((resolve) => {
        const options = {
            hostname: APIM_BASE,
            path: path,
            method: 'GET',
            timeout: 30000,
            headers: {
                'Ocp-Apim-Subscription-Key': API_KEY || '',
                'Accept': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const passed = res.statusCode === expectedStatus;
                const icon = passed ? 'PASS' : 'FAIL';
                console.log(icon + ' ' + name + ': Got ' + res.statusCode + ', expected ' + expectedStatus);
                if (passed && data) {
                    try {
                        const json = JSON.parse(data);
                        const count = Array.isArray(json) ? json.length : (json.count || 'N/A');
                        console.log('   Response: ' + count + ' items');
                    } catch (e) {
                        // Not JSON, that is ok for some endpoints
                    }
                }
                resolve(passed);
            });
        });

        req.on('error', (e) => {
            console.log('FAIL ' + name + ': Error - ' + e.message);
            resolve(false);
        });

        req.on('timeout', () => {
            req.destroy();
            console.log('FAIL ' + name + ': Timeout after 30s');
            resolve(false);
        });

        req.end();
    });
}

async function runTests() {
    console.log('\nTerprint Copilot Connector - API Tests\n');
    console.log('Base URL: https://' + APIM_BASE);
    console.log('API Key: ' + (API_KEY ? 'Configured' : 'Not configured (set APIM_SUBSCRIPTION_KEY)'));
    console.log('\n' + '='.repeat(60));

    const tests = [
        { name: 'Data Strains (List)', path: '/data/strains?limit=5', status: 200 },
        { name: 'Data Strains (Search)', path: '/data/strains?name=Blue', status: 200 }
    ];

    const results = [];
    for (const test of tests) {
        const passed = await testEndpoint(test.name, test.path, test.status);
        results.push(passed);
    }

    console.log('='.repeat(60) + '\n');

    const passed = results.filter(Boolean).length;
    const failed = results.length - passed;
    console.log('Results: ' + passed + ' passed, ' + failed + ' failed\n');

    if (failed > 0) {
        console.log('Some tests failed. Ensure:');
        console.log('   1. APIM_SUBSCRIPTION_KEY environment variable is set');
        console.log('   2. You have network access to ' + APIM_BASE);
        console.log('   3. The Terprint services are running\n');
        process.exit(1);
    } else {
        console.log('All tests passed! The Copilot connector can access Terprint APIs.\n');
    }
}

runTests();

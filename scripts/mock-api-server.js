/**
 * Mock API Server - Logs all incoming requests from Copilot
 * Use with dev tunnels or ngrok to expose locally
 * 
 * Usage:
 *   node scripts/mock-api-server.js
 *   
 * Then expose with:
 *   devtunnel host -p 3000 --allow-anonymous
 *   OR
 *   ngrok http 3000
 */

const http = require('http');

const PORT = 3000;

// ANSI colors for pretty logging
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function log(color, label, value) {
  console.log(`${color}${label}${colors.reset}`, value || '');
}

const server = http.createServer((req, res) => {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    const timestamp = new Date().toISOString();
    
    console.log('\n' + '='.repeat(80));
    log(colors.bright + colors.cyan, '🔔 INCOMING REQUEST', `[${timestamp}]`);
    console.log('='.repeat(80));
    
    // Method & URL
    log(colors.green, '📍 Method:', req.method);
    log(colors.green, '📍 URL:', req.url);
    
    // Parse query string
    const url = new URL(req.url, `http://localhost:${PORT}`);
    log(colors.green, '📍 Path:', url.pathname);
    
    if (url.search) {
      log(colors.yellow, '\n📦 Query Parameters:');
      url.searchParams.forEach((value, key) => {
        console.log(`   ${key}: ${value}`);
      });
    }
    
    // Headers - THIS IS THE KEY PART
    log(colors.magenta, '\n📋 Headers:');
    Object.entries(req.headers).forEach(([key, value]) => {
      // Highlight auth-related headers
      if (key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('key') ||
          key.toLowerCase().includes('ocp-apim') ||
          key.toLowerCase().includes('subscription')) {
        log(colors.red + colors.bright, `   🔑 ${key}:`, value);
      } else {
        console.log(`   ${key}: ${value}`);
      }
    });
    
    // Body
    if (body) {
      log(colors.yellow, '\n📝 Request Body:');
      try {
        const parsed = JSON.parse(body);
        console.log(JSON.stringify(parsed, null, 2));
      } catch {
        console.log(body);
      }
    }
    
    console.log('\n' + '-'.repeat(80));
    
    // Determine which endpoint was called and return mock data
    const path = url.pathname;
    let response = { error: 'Unknown endpoint' };
    let status = 200;
    
    if (path.includes('/strains')) {
      response = {
        data: [
          {
            id: "mock-1",
            name: "Blue Dream (MOCK)",
            strain_type: "Flower",
            genetics: "Blueberry x Haze",
            terpene_profile: { myrcene: 0.5, limonene: 0.3 },
            cannabinoid_profile: { thc: 21.5, cbd: 0.1 },
            metadata: { description: "This is a MOCK response from the local emulator" }
          },
          {
            id: "mock-2", 
            name: "Blue Cookies (MOCK)",
            strain_type: "Flower",
            genetics: "GSC x Blueberry",
            metadata: { description: "MOCK response - check terminal for request details" }
          }
        ],
        pagination: { total: 2, limit: 25, offset: 0, hasMore: false },
        meta: { requestId: "mock-local", processingTimeMs: 1, source: "LOCAL MOCK SERVER" }
      };
      log(colors.green, '✅ Responding with:', 'Mock strains data');
    } else if (path.includes('/deals')) {
      response = {
        data: [
          {
            id: "deal-mock-1",
            strain_name: "Blue Dream (MOCK)",
            dispensary: "mock-dispensary",
            brand: "Mock Brand",
            sale_price: 25.00,
            original_price: 35.00,
            discount_percent: 28
          }
        ],
        meta: { source: "LOCAL MOCK SERVER" }
      };
      log(colors.green, '✅ Responding with:', 'Mock deals data');
    } else if (path.includes('/dispensaries')) {
      response = {
        data: [
          {
            id: 1,
            dispensaryName: "Mock Dispensary (LOCAL)",
            address: "123 Test Street",
            city: "St. Augustine",
            zipCode: "32084"
          }
        ],
        meta: { source: "LOCAL MOCK SERVER" }
      };
      log(colors.green, '✅ Responding with:', 'Mock dispensaries data');
    } else if (path.includes('/recommendations')) {
      response = {
        data: [
          {
            strain: { id: "rec-1", name: "Blue Dream (MOCK)", strain_type: "Flower" },
            match_score: 95,
            match_reasons: ["Mock recommendation from local server"]
          }
        ],
        meta: { source: "LOCAL MOCK SERVER" }
      };
      log(colors.green, '✅ Responding with:', 'Mock recommendations');
    } else if (path.includes('/chat')) {
      response = {
        response: "This is a MOCK response from the local API emulator. Check your terminal to see exactly what Copilot sent!",
        sources: ["local-mock"],
        related_strains: ["Blue Dream"]
      };
      log(colors.green, '✅ Responding with:', 'Mock chat response');
    } else {
      log(colors.yellow, '⚠️ Unknown endpoint:', path);
    }
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    res.writeHead(status);
    res.end(JSON.stringify(response, null, 2));
    
    log(colors.cyan, '\n📤 Response sent:', `${status} OK`);
    console.log('='.repeat(80) + '\n');
  });
});

server.listen(PORT, () => {
  console.log('\n' + '█'.repeat(60));
  console.log(colors.bright + colors.green);
  console.log('  🔍 TERPRINT API MOCK SERVER');
  console.log('  Debugging tool for M365 Copilot requests');
  console.log(colors.reset);
  console.log('█'.repeat(60));
  console.log(`\n  📡 Server running at: http://localhost:${PORT}`);
  console.log('\n  Next steps:');
  console.log('  1. Expose this port with dev tunnels:');
  console.log(`     ${colors.cyan}devtunnel host -p ${PORT} --allow-anonymous${colors.reset}`);
  console.log('  2. Or use ngrok:');
  console.log(`     ${colors.cyan}ngrok http ${PORT}${colors.reset}`);
  console.log('  3. Update openapi.json server URL to the tunnel URL');
  console.log('  4. Re-provision and test in Copilot');
  console.log('\n  Watch this terminal to see EXACTLY what Copilot sends! 👀\n');
});

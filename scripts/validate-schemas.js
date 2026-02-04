const fs = require('fs');
const path = require('path');
const https = require('https');
const Ajv = require('ajv');
const Ajv04 = require('ajv-draft-04');
const addFormats = require('ajv-formats');

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch schema: ${url} (status ${res.statusCode})`));
        res.resume();
        return;
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function validateFile(filePath) {
  const display = path.relative(process.cwd(), filePath);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(raw);
  const schemaUrl = json.$schema;
  if (!schemaUrl) {
    console.warn(`WARN ${display}: No $schema property found; skipping.`);
    return true;
  }

  // Use draft-04 compatible AJV for Microsoft schemas that reference draft-04
  const ajv = new Ajv04({ strict: false, allErrors: true });
  addFormats(ajv);

  const schema = await fetchJson(schemaUrl);
  const validate = ajv.compile(schema);
  const valid = validate(json);
  if (!valid) {
    console.error(`FAIL ${display}: Schema validation errors:`);
    for (const err of validate.errors || []) {
      console.error(`  - ${err.instancePath} ${err.message}`);
    }
    return false;
  }
  console.log(`PASS ${display}: Valid against ${schemaUrl}`);
  return true;
}

async function main() {
  const targets = [
    path.join('appPackage', 'ai-plugin.json'),
    path.join('appPackage', 'declarativeAgent.json'),
  ];

  const results = [];
  for (const target of targets) {
    try {
      const ok = await validateFile(path.resolve(target));
      results.push(ok);
    } catch (e) {
      console.error(`ERROR ${target}: ${e.message}`);
      results.push(false);
    }
  }

  const failed = results.filter((x) => !x).length;
  if (failed > 0) {
    process.exit(1);
  }
}

main();

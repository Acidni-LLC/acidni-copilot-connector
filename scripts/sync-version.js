const fs = require('fs');
const path = require('path');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
}

function replaceVersionInText(text, version) {
  return text
    .replace(/Terprint AI v\d+\.\d+\.\d+/g, `Terprint AI v${version}`)
    .replace(/version"\s*:\s*"\d+\.\d+\.\d+"/g, `version": "${version}"`);
}

function main() {
  const root = process.cwd();
  const manifestPath = path.join(root, 'appPackage', 'manifest.json');
  const pkgPath = path.join(root, 'package.json');
  const openapiPath = path.join(root, 'appPackage', 'apiSpecificationFile', 'openapi.json');
  const agentPath = path.join(root, 'appPackage', 'declarativeAgent.json');
  const pluginPath = path.join(root, 'appPackage', 'ai-plugin.json');
  const policyPath = path.join(root, 'version-policy.xml');

  const manifest = readJson(manifestPath);
  const version = manifest.version;
  if (!version) {
    console.error('Manifest version is missing.');
    process.exit(1);
  }

  let changed = false;

  // package.json
  const pkg = readJson(pkgPath);
  if (pkg.version !== version) {
    pkg.version = version;
    writeJson(pkgPath, pkg);
    console.log(`Updated package.json version -> ${version}`);
    changed = true;
  }

  // openapi.json
  const openapi = readJson(openapiPath);
  if (openapi.info && openapi.info.version !== version) {
    openapi.info.version = version;
    writeJson(openapiPath, openapi);
    console.log(`Updated OpenAPI info.version -> ${version}`);
    changed = true;
  }

  // declarativeAgent.json (text replacement in instructions)
  const agent = readJson(agentPath);
  if (typeof agent.instructions === 'string') {
    const updated = replaceVersionInText(agent.instructions, version);
    if (updated !== agent.instructions) {
      agent.instructions = updated;
      writeJson(agentPath, agent);
      console.log(`Updated declarativeAgent.json instructions version -> ${version}`);
      changed = true;
    }
  }

  // ai-plugin.json (description_for_model)
  const plugin = readJson(pluginPath);
  if (typeof plugin.description_for_model === 'string') {
    const updated = replaceVersionInText(plugin.description_for_model, version);
    if (updated !== plugin.description_for_model) {
      plugin.description_for_model = updated;
      writeJson(pluginPath, plugin);
      console.log(`Updated ai-plugin.json description_for_model version -> ${version}`);
      changed = true;
    }
  }

  // version-policy.xml (simple string replace)
  if (fs.existsSync(policyPath)) {
    const policyRaw = fs.readFileSync(policyPath, 'utf-8');
    const updated = replaceVersionInText(policyRaw, version);
    if (updated !== policyRaw) {
      fs.writeFileSync(policyPath, updated);
      console.log(`Updated version-policy.xml -> ${version}`);
      changed = true;
    }
  }

  if (!changed) {
    console.log('Version already in sync.');
  }
}

main();

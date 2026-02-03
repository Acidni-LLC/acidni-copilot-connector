# Terprint Copilot Connector - Local Testing Guide

## Prerequisites

1. **Microsoft 365 Copilot License** - Your M365 tenant needs Copilot
2. **VS Code** with Teams Toolkit extension
3. **Node.js 18+**
4. **Sideloading enabled** in your tenant

## Quick Start

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Configure Environment
```powershell
# Copy example env file
Copy-Item env\.env.dev.example env\.env.dev

# Get APIM key from Key Vault and add to .env.dev
$key = az keyvault secret show --vault-name kv-terprint-dev --name apim-subscription-key --query value -o tsv
Write-Host "Add this to env/.env.dev:"
Write-Host "APIM_SUBSCRIPTION_KEY=$key"
```

### Step 3: Test API Connectivity
```powershell
$env:APIM_SUBSCRIPTION_KEY = "your-key-here"
npm run test:api
```

### Step 4: Sideload to Copilot

#### Option A: VS Code + Teams Toolkit
1. Open project in VS Code
2. Install Teams Toolkit extension if needed
3. Sign in with your M365 account (Teams Toolkit sidebar)
4. Press F5 or click "Preview Your App"

#### Option B: Manual Upload
1. Run `npm run build` to create package
2. Go to https://admin.microsoft.com  Settings  Integrated apps
3. Upload the .zip from `appPackage/build/`
4. Assign to yourself for testing

## Verify Copilot Access

After sideloading, go to:
- https://copilot.microsoft.com (web)
- OR Microsoft 365 app  Copilot

Look for "Terprint AI" in your available agents/plugins.

## Test Prompts

Try these in Copilot:
- "Search for strains with blue in the name"
- "What indica strains are available?"
- "Find strains high in myrcene"

## Troubleshooting

### "App not appearing in Copilot"
- Ensure Copilot license is assigned to your account
- Wait 5-10 minutes after sideloading
- Check Admin Center for app status

### "API errors"
- Verify APIM_SUBSCRIPTION_KEY is set correctly
- Run `npm run test:api` to verify connectivity

### "Sideloading not allowed"
- Ask your M365 admin to enable sideloading
- Or use a M365 Developer tenant

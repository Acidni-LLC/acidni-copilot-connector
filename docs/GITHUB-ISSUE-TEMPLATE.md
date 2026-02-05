# [Bug] Declarative Agent API Plugin Tools Not Injected into M365 Copilot Session

## Summary
Declarative agent published via Teams Toolkit loads its instructions successfully in M365 Copilot, but the API plugin tools (functions defined in `ai-plugin.json`) are NOT injected into the session. Copilot only sees internal tools (`hydrate_tool_response`, `multi_tool_use.parallel`).

## Environment
- **Teams Toolkit Version:** v1.7 schema
- **Manifest Version:** devPreview
- **App Version:** 5.0.0
- **Teams App ID:** `1e001056-95df-4bc8-8321-6da22c409ca6`
- **API Key Registration ID:** `9203f215-ea6a-4f7d-96a3-7dee8370d271`
- **Declarative Agent Schema:** v1.2
- **AI Plugin Schema:** v2.2
- **API Spec Format:** Swagger 2.0 (JSON)
- **API Host:** Azure API Management
- **Authentication:** API Key via `Ocp-Apim-Subscription-Key` header
- **Validation:** 52/52 rules passed on publish

## Symptoms

When invoking the declarative agent via `@Terprint AI`, Copilot:
- ✅ Loads the custom system instructions (knows about tools)
- ✅ Understands tool parameters and when to use them
- ❌ Cannot call the tools - they're not in the available tools list
- ❌ Only has `hydrate_tool_response` and `multi_tool_use.parallel` available

## Copilot's Error Response

```
"I want to run getStrains for you — but I can't, because in this chat session 
the getStrains tool is not actually available.

The only tools that exist here are:
- hydrate_tool_response
- multi_tool_use.parallel

Since getStrains is not defined, I can't execute it."
```

## Expected Behavior

When invoking `@Terprint AI find indica strains`, Copilot should:
1. Recognize `getStrains` function from `ai-plugin.json`
2. Prompt user for confirmation
3. Execute API call with registered API key
4. Return results

## What Works

- ✅ Same Swagger 2.0 spec works in Power Platform Custom Connector
- ✅ All API endpoints respond correctly via direct HTTP
- ✅ App provisions and publishes without errors
- ✅ 52/52 validation rules pass
- ✅ Agent instructions load correctly in Copilot

## Files Structure

```
appPackage/
├── manifest.json              # Teams manifest
├── declarativeAgent.json      # Agent config (v1.2)
├── ai-plugin.json             # Plugin functions (v2.2)
└── apiSpecificationFile/
    └── Terprint-Cannabis-Intelligence.swagger.json  # Swagger 2.0
```

## Key ai-plugin.json Snippet

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/copilot/plugin/v2.2/schema.json",
  "functions": [
    { "name": "getStrains", "description": "Search cannabis strains..." },
    { "name": "searchDeals", "description": "Find deals..." },
    { "name": "findDispensaries", "description": "Find dispensaries..." }
  ],
  "runtimes": [{
    "type": "OpenApi",
    "auth": {
      "type": "ApiKeyPluginVault",
      "reference_id": "${{TERPRINT_API_KEY_REGISTRATION_ID}}"
    },
    "spec": { "url": "apiSpecificationFile/Terprint-Cannabis-Intelligence.swagger.json" },
    "run_for_functions": ["getStrains", "searchDeals", "findDispensaries", ...]
  }]
}
```

## teamsapp.yml API Key Registration

```yaml
- uses: apiKey/register
  with:
    name: apiKey
    appId: ${{TEAMS_APP_ID}}
    primaryClientSecret: ${{APIM_SUBSCRIPTION_KEY}}
    apiSpecPath: ./appPackage/apiSpecificationFile/Terprint-Cannabis-Intelligence.swagger.json
  writeToEnvironmentFile:
    registrationId: TERPRINT_API_KEY_REGISTRATION_ID
```

## Steps to Reproduce

1. Create declarative agent with API plugin using Teams Toolkit
2. Define functions in `ai-plugin.json` with OpenAPI runtime
3. Register API key via `teamsapp.yml`
4. Run `npx teamsapp provision --env dev`
5. Run `npx teamsapp publish --env dev`
6. Open M365 Copilot (https://m365.cloud.microsoft/chat)
7. Type `@YourAgent` and ask a question that should trigger a tool
8. Observe: Agent instructions load, but tools are not available

## Questions

1. Is there an admin approval step specifically for API plugin tool execution?
2. Is there a tenant-level policy that must be enabled for tools to be injected?
3. What is the correct flow for tools to be registered in an M365 Copilot session?
4. Why does the system redirect to `hydrate_tool_response` when there's no prior tool output?

## Additional Context

- Full bug report with screenshots: https://github.com/Acidni-LLC/acidni-copilot-connector/blob/main/docs/MICROSOFT-FEEDBACK-REPORT.md
- We also observed a JavaScript error in Copilot's frontend: `TypeError: r?.hasAttribute is not a function`

## Request

Please investigate why API plugin tools are not being injected into the Copilot session despite successful provision/publish. 

We would also appreciate developer/testing licenses to properly validate our integration, as we cannot access Copilot Studio as an alternative approach.

---
**Company:** Acidni LLC  
**Repository:** https://github.com/Acidni-LLC/acidni-copilot-connector

# Microsoft 365 Agents for Teams & Copilot — Build Prompt (Pro-Code)

Purpose:
You WILL create a production-grade Microsoft 365 agent for Teams and Copilot using Microsoft’s official SDKs, schemas, and tooling. You MUST follow authoritative best practices from Microsoft Learn and OfficeDev samples.

Authoritative Sources:

- [Agents in Teams overview](https://learn.microsoft.com/en-us/microsoftteams/platform/agents-in-teams/overview)
- [Build your first agent](https://learn.microsoft.com/en-us/microsoftteams/platform/agents-in-teams/build-first-agent)
- [OfficeDev Teams samples](https://github.com/OfficeDev/microsoft-teams-samples)
- [Copilot handoff sample (ME)](https://github.com/OfficeDev/microsoft-teams-samples/tree/main/samples/msgext-copilot-handoff)
- Contoso Knowledge Hub sample in OfficeDev repo

Success Criteria:

- Runnable Teams agent with Teams SDK (JS/TS preferred) and Azure OpenAI integration.
- Compliant Teams manifest.json, environment files, and packaging ZIP.
- Copilot action surface via messaging extension or OpenAPI action aligned with samples.
- Secure config (no secrets in code), basic telemetry, and schema validation.
- Clear instructions, conversation starters, and long-form description for Copilot discoverability.

Implementation Steps (condensed):

1) Tooling Setup
   - Install VS Code + Microsoft 365 Agents Toolkit, Node.js LTS

2) Scaffold Agent
   - Agents Toolkit → Create New Agent/App → Teams Agents and Apps → General Teams Agent (TypeScript)
   - Configure Azure OpenAI (endpoint, key, deployment name)

3) Environment
   - Create `env/.env.local`:
     - `BOT_ID`, `BOT_PASSWORD`, `BOT_TYPE=MultiTenant`, `TENANT_ID`
     - `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT_NAME`
     - optional `APPINSIGHTS_CONNECTION_STRING`

4) Agent Logic
   - Initialize Teams AI Application with Azure OpenAI
   - Add system instructions and conversation starters; handle messages safely

5) Copilot Actions
   - Option A: Messaging Extension query command (per `msgext-copilot-handoff`)
   - Option B: OpenAPI action with `appPackage/openapi.json`

6) Manifest & Package
   - Author long `description.full`, correct icons, scopes; validate schema; package ZIP

7) Telemetry & Validate
   - Add Insights or logs; F5 to sideload; test prompts

Commands:

- `npm install`
- F5 to sideload in VS Code
- `npm run validate` (if available)
- `npx @microsoft/teams-toolkit-cli package`

Acceptance Checks:

- Agent shows conversation starters in Teams
- Prompts return model output (with citations if implemented)
- Messaging extension returns results and supports handoff (if implemented)
- No secrets committed; `.env` consumed

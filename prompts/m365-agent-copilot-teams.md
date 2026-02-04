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

- Deliver a runnable Teams agent with Teams SDK (JS/TS preferred) and Azure OpenAI integration.
- Provide a compliant Teams manifest.json, environment files, and packaging ZIP.
- Include a Copilot action surface via messaging extension or OpenAPI action aligned with samples.
- Implement secure config (no secrets in code), basic telemetry, and schema validation.
- Provide clear instructions, conversation starters, and long-form description for Copilot discoverability.

Inputs:

- Language: TypeScript (default) or C#/Python.
- Azure OpenAI: AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT_NAME.
- Bot identity: BOT_ID, BOT_PASSWORD, BOT_TYPE, TENANT_ID.
- Dev tunnel URL for local debugging.

Architecture Standards:

- Use Teams SDK (Teams AI Library) for agent logic and message handling.
- Structure: .vscode/, appPackage/, env/, infra/ (optional), src/.
- Copilot actions: implement messaging extension command(s) or OpenAPI action per OfficeDev samples.
- Security: load secrets from .env only; never commit secrets; use MultiTenant unless org requires SingleTenant.
- Telemetry: add Application Insights (from env) or minimal structured logging.

Implementation Steps:

1) Tooling Setup
   - Install VS Code and Microsoft 365 Agents Toolkit extension
   - Ensure Node.js LTS is installed

2) Scaffold Agent
   - Agents Toolkit → Create New Agent/App → Teams Agents and Apps → General Teams Agent → TypeScript
   - Choose Azure OpenAI and input endpoint, key, deployment name

3) Configure Environment
   - Create env/.env.local with:
     - BOT_ID, BOT_PASSWORD, BOT_TYPE=MultiTenant, TENANT_ID
     - AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT_NAME
     - Optional: APPINSIGHTS_CONNECTION_STRING

4) Implement Agent Logic
   - Initialize Teams AI Application with Azure OpenAI model
   - Add system instructions and conversation starters per “Agent user experience” docs
   - Handle messages with citations and safe content policies

5) Copilot Action Surface
   - Option A (Messaging Extension): add a query command per msgext-copilot-handoff sample
   - Option B (OpenAPI Action): expose an OpenAPI spec and reference it from action runtime

6) Manifest & Packaging
   - Create appPackage/manifest.json with long description.full, clear name, correct icons, scopes
   - Validate schema; package into ZIP for sideload

7) Telemetry & Logging
   - Wire Application Insights (if provided) or add structured logs

8) Run & Validate
   - F5 in VS Code to sideload; verify conversation starters and action command
   - Add test prompts; ensure safe and deterministic behavior

9) Production Readiness
   - Add README with setup, run, and deployment steps
   - Ensure rate limits, error handling, and timeout policies

Best Practices (MANDATORY):

- Use Teams SDK abstractions over raw Bot Framework where possible
- Provide long-form manifest description for Copilot comprehension
- Keep instructions concise and goal-oriented; avoid forcing function calls unless required
- Use environment variables; never hardcode secrets
- Validate manifests and actions against official schemas
- Provide conversation starters mapped to core capabilities
- Add basic telemetry and redact PII

Deliverables:

- src/ agent with Teams SDK and Azure OpenAI wiring
- appPackage/manifest.json with valid schema and icons
- Optional appPackage/openapi.json if using OpenAPI action
- env/.env.local sample; README.md with quick start
- Packaged ZIP for Teams sideload

Commands (Windows PowerShell):

- npm install
- Start debugging in VS Code (F5) to sideload
- npm run validate (if available)
- npx @microsoft/teams-toolkit-cli package

Acceptance Tests:

- Teams shows agent with conversation starters
- Prompt “Summarize our latest chat” returns model output with citations (if implemented)
- Messaging extension query returns results and supports Copilot handoff (if implemented)
- No secrets in repo; .env consumed correctly

Notes:

- Prefer TypeScript samples from OfficeDev for patterns and structure
- Keep SDK versions current per Microsoft Learn

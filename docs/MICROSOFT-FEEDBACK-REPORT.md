# Microsoft 365 Copilot Declarative Agent - Bug Report & License Request

**Submitted by:** Acidni LLC  
**Contact:** Jamieson Gill  
**Date:** February 5, 2026  
**Product:** Microsoft 365 Copilot - Declarative Agents with API Plugins  

---

## Executive Summary

We are developing a Microsoft 365 Copilot declarative agent called **Terprint AI** - a cannabis intelligence assistant for Florida medical marijuana patients. Despite following all Microsoft documentation and successfully provisioning/publishing via Teams Toolkit, **our API plugin tools are not being invoked** by Copilot. Instead, Copilot responds with messages stating the tools are "not available in this environment."

We are requesting:
1. **Technical support** to resolve the tool invocation issues
2. **Developer/testing licenses** for Microsoft 365 Copilot to properly validate our integration

---

## Technical Details

### Environment Configuration

| Component | Value |
|-----------|-------|
| **Teams Toolkit Version** | Latest (v1.7 schema) |
| **Manifest Version** | devPreview |
| **App Version** | 5.0.0 |
| **Teams App ID** | `1e001056-95df-4bc8-8321-6da22c409ca6` |
| **Published App ID** | `10376350-9702-48e3-829c-5fa4e4873ab2` |
| **API Key Registration ID** | `9203f215-ea6a-4f7d-96a3-7dee8370d271` |
| **Declarative Agent Schema** | v1.2 |
| **AI Plugin Schema** | v2.2 |
| **API Spec Format** | Swagger 2.0 (JSON) |
| **API Host** | Azure API Management (`apim-terprint-dev.azure-api.net`) |
| **Authentication** | API Key via `Ocp-Apim-Subscription-Key` header |

### API Endpoints (All Verified Working)

We have confirmed all API endpoints work correctly via direct HTTP calls and Power Platform custom connectors:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/copilot/chat` | POST | Natural language cannabis Q&A |
| `/copilot/strains` | GET | Search cannabis strains |
| `/copilot/recommendations` | GET | Personalized strain recommendations |
| `/copilot/deals` | GET | Search dispensary deals/pricing |
| `/copilot/locations` | GET | Find nearby dispensaries |

**Verification:** The same Swagger 2.0 spec was exported from a **working Power Automate Custom Connector** where all actions execute successfully.

---

## Issue 1: Tools Not Invoked - "Not Available in This Environment"

### Symptoms

When using M365 Copilot Chat and invoking our declarative agent, Copilot responds with:

> "I want to run getStrains for you — but I can't, because in this chat session the getStrains tool is not actually available."
>
> "The only tools that exist here are:
> - hydrate_tool_response
> - multi_tool_use.parallel
>
> Since getStrains is not defined, I can't execute it."

### Expected Behavior

Copilot should:
1. Recognize the `getStrains` function defined in our `ai-plugin.json`
2. Prompt the user for confirmation before calling the API
3. Execute the API call using the registered API key
4. Return results to the user

### What We've Tried

1. ✅ Multiple provision/publish cycles
2. ✅ Cleared and re-registered API keys
3. ✅ Switched from OpenAPI 3.0 to Swagger 2.0 (OpenAPI 3.0 broke the connector)
4. ✅ Used exact Swagger spec exported from working Power Platform custom connector
5. ✅ Verified all 52 validation rules pass during publish
6. ✅ Confirmed app is published to Admin Portal
7. ✅ Tested in Edge, Chrome, and InPrivate mode
8. ✅ Cleared browser cache and hard-refreshed

### Files Submitted for Review

- `appPackage/manifest.json` - Teams app manifest
- `appPackage/declarativeAgent.json` - Agent configuration
- `appPackage/ai-plugin.json` - Plugin function definitions
- `appPackage/apiSpecificationFile/Terprint-Cannabis-Intelligence.swagger.json` - API spec (exported from working Power Platform connector)

---

## Issue 2: JavaScript TypeError in M365 Copilot UI

### Error Details

```
Exception has occurred: TypeError: r?.hasAttribute is not a function
  at https://res.public.onecdn.static.microsoft/midgard/versionless-v2/dty-274d7ae9-e5e0-48eb-80db-f8daf26a8d1b-default-prod-m365chat-postload_08861753f35e80b1b8a0.js:1:180386
    at Array.filter (<anonymous>)
    at ...postload_08861753f35e80b1b8a0.js:1:180319
    at ...postload_08861753f35e80b1b8a0.js:1:181969
    at MutationObserver.<anonymous> (...postload_08861753f35e80b1b8a0.js:1:182641)
```

### Context

This error occurs in Microsoft's minified Copilot frontend bundle (`m365chat-postload_*.js`) when:
1. The user submits a query that should invoke a plugin tool
2. Right before Copilot would display the tool confirmation dialog
3. The MutationObserver appears to be processing DOM elements incorrectly

### Impact

This error appears to prevent or interfere with the tool invocation flow.

---

## Issue 3: Copilot Studio License Blocking

### Symptoms

When attempting to build the agent in Copilot Studio (as an alternative approach), we receive:

> "You currently do not have a user license that allows you to publish in Copilot Studio. Please contact your administrator to upgrade your license or enable the necessary permissions."

### Impact

Unable to use Copilot Studio as an alternative development path.

---

## Questions for Microsoft

1. **Why are the declared functions not available to Copilot?** The `ai-plugin.json` clearly defines `chatWithTerprint`, `getStrains`, `getRecommendations`, `searchDeals`, and `findDispensaries` - but Copilot claims only `hydrate_tool_response` and `multi_tool_use.parallel` exist.

2. **Is there a tenant-level setting** that must be enabled for API plugins to work?

3. **Is there an admin approval step** in Teams Admin Center that we're missing?

4. **Is the JavaScript error** (`r?.hasAttribute is not a function`) a known issue?

5. **What is the expected timeline** for a declarative agent's tools to become available after publishing?

---

## License Request for Development & Testing

### Current Situation

We are a small development company (Acidni LLC) building a medical cannabis intelligence platform for Florida patients. We are investing significant development effort into M365 Copilot integration but are unable to properly test due to:

1. **No Copilot Studio license** - Cannot use alternative development approach
2. **Limited testing capability** - Unable to verify if issues are on our side or Microsoft's
3. **No support channel** - Standard support doesn't cover Copilot extensibility issues

### Request

We respectfully request **developer/testing licenses** for Microsoft 365 Copilot to:

1. Properly validate our declarative agent integration
2. Test the Power Platform connector approach via Copilot Studio
3. Provide quality feedback to Microsoft on the developer experience
4. Build a showcase integration that could serve as a reference for other developers

### What We're Building

**Terprint AI** provides:
- Real-time cannabis strain data (5,000+ strains)
- Lab-tested terpene and cannabinoid profiles (4,500+ batches)
- Personalized recommendations based on effects
- Dispensary pricing and deals
- Location-based dispensary finder

This could serve as a **reference implementation** for healthcare/wellness API plugins in M365 Copilot.

---

## Attachments

### Repository Structure

```
acidni-copilot-connector/
├── appPackage/
│   ├── manifest.json                    # Teams manifest v5.0.0
│   ├── declarativeAgent.json            # Agent config v1.2
│   ├── ai-plugin.json                   # Plugin functions v2.2
│   └── apiSpecificationFile/
│       └── Terprint-Cannabis-Intelligence.swagger.json
├── teamsapp.yml                         # Teams Toolkit config
├── env/.env.dev                         # Environment config
└── docs/
    └── MICROSOFT-FEEDBACK-REPORT.md     # This document
```

### Provision/Publish Success Output

```
Publish success!
[Terprint AI] is published successfully to Admin Portal (https://aka.ms/teamsfx-mtac).
After approval, your app will be available for your organization.

Summary:
52 passed.
(√) Done: Acceptance test service has finished checking provided add-in.
```

---

## Contact Information

**Company:** Acidni LLC  
**Developer:** Jamieson Gill  
**GitHub Repository:** https://github.com/Acidni-LLC/acidni-copilot-connector  
**API Endpoint:** https://apim-terprint-dev.azure-api.net  

We are happy to provide:
- Screen recordings of the issues
- Full debug logs
- Access to our test environment
- Live debugging sessions with Microsoft engineers

---

## Requested Actions

1. **Technical investigation** into why tools are not available in Copilot sessions
2. **Fix or workaround** for the `hasAttribute` JavaScript error
3. **Developer licenses** for M365 Copilot and Copilot Studio
4. **Direct communication channel** with the Copilot extensibility team

Thank you for your attention to this matter. We are committed to building a quality integration and providing valuable feedback to improve the M365 Copilot developer experience.

---

*Document Version: 1.0*  
*Last Updated: February 5, 2026*

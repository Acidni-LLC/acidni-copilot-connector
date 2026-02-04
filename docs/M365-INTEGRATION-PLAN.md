# Terprint M365 Integration Plan: Strategic Roadmap

| Document Info | Value |
| ------------- | ----- |
| **Document ID** | COPILOT-PLAN-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Date** | February 4, 2026 |
| **Author** | Acidni AI SDO |
| **Master Location** | `acidni-config/products/copilot-connector/docs/06-m365-integration-plan.md` |

---

## 1. Executive Summary

This document outlines a comprehensive 6-phase strategic plan to integrate Terprint cannabis intelligence services with Microsoft 365, Teams, and Copilot. The plan maximizes leverage of existing infrastructure while progressively expanding capabilities.

### Current State Assessment

| Component | Status | Notes |
|-----------|--------|-------|
| **Declarative Agent** | ✅ Working | Basic `getStrains` function |
| **API Plugin (v2.2)** | ✅ Working | Single function, minimal OpenAPI |
| **Teams Manifest** | ✅ Working | v3.18.0, devPreview schema |
| **APIM Backend** | ✅ Deployed | `apim-terprint-dev.azure-api.net` |
| **AAD App Registration** | ✅ Configured | SSO-ready |
| **Teams Toolkit Pipeline** | ✅ Working | Provision → Deploy → Publish |

### Current Limitations

1. **Single API Function** - Only `getStrains` exposed; missing chat, recommendations, deals, locations
2. **Minimal Agent Instructions** - Basic instructions; no domain expertise
3. **No Authentication Flow** - API uses `auth.type: None`; no user context
4. **Limited Conversation Starters** - Generic prompts
5. **No Adaptive Cards** - Plain text responses only

---

## 2. Strategic Phases Overview

| Phase | Focus | Timeline | Priority |
|-------|-------|----------|----------|
| Phase 1 | Expand API Surface | Week 1-2 | 🔴 Critical |
| Phase 2 | Enhance Agent Intelligence | Week 2-3 | 🔴 Critical |
| Phase 3 | Authentication & Personalization | Week 3-4 | 🟡 High |
| Phase 4 | Rich User Experience | Week 4-5 | 🟡 High |
| Phase 5 | Teams-Native Features | Week 5-6 | 🟢 Medium |
| Phase 6 | Production & Marketplace | Week 7-8 | 🟢 Medium |

---

## 3. Phase 1: Expand API Surface

**Goal**: Expose all Terprint capabilities to Copilot

### 3.1 OpenAPI Specification Expansion

**Current State**: Single `/strains` endpoint  
**Target State**: All core Terprint services exposed

| Function | Endpoint | Description |
|----------|----------|-------------|
| `chatWithTerprint` | `/chat/query` | Natural language Q&A about cannabis |
| `getStrains` | `/data/v2/strains` | Search and browse strain data |
| `getRecommendations` | `/recommend/strains` | Personalized strain suggestions |
| `searchDeals` | `/deals/search` | Price comparisons across dispensaries |
| `findDispensaries` | `/data/api/locations` | Dispensary location finder |

### 3.2 AI Plugin Functions Update

```json
{
  "functions": [
    {
      "name": "chatWithTerprint",
      "description": "Have a conversation about cannabis strains, effects, terpenes, and medical uses. Use for open-ended questions."
    },
    {
      "name": "getStrains",
      "description": "Search and browse cannabis strains by name, type (indica/sativa/hybrid), or characteristics."
    },
    {
      "name": "getRecommendations",
      "description": "Get personalized strain recommendations based on desired effects like relaxation, focus, or pain relief."
    },
    {
      "name": "searchDeals",
      "description": "Find the best prices and deals on cannabis products at Florida dispensaries."
    },
    {
      "name": "findDispensaries",
      "description": "Locate medical marijuana dispensaries near a city, ZIP code, or address in Florida."
    }
  ]
}
```

### 3.3 Deliverables

- [ ] Expanded `openapi.json` with all 5 operations
- [ ] Updated `ai-plugin.json` with semantic function descriptions
- [ ] Request/response schemas with Copilot-friendly descriptions
- [ ] API connectivity tests for all endpoints

---

## 4. Phase 2: Enhance Agent Intelligence

**Goal**: Transform Terprint into a domain expert agent

### 4.1 Rich Agent Instructions

**Current**: "You are Terprint AI. When users ask about cannabis strains, use the getStrains function."

**Target**:
```
You are Terprint AI, a knowledgeable cannabis intelligence assistant for 
Florida medical marijuana patients. You have expertise in:

- **Strain Analysis**: Terpene profiles, cannabinoid ratios, effects
- **Personalization**: Match strains to symptoms, preferences, tolerances
- **Market Intelligence**: Real-time pricing, deals, dispensary inventory
- **Compliance**: Florida MMUR regulations and patient guidance

Guidelines:
- Always verify strain availability before recommending
- Provide terpene-based explanations for effects
- Include dispensary pricing when discussing specific products
- Respect medical privacy; don't ask for personal health details
- Cite lab data (COA) when available
- Use searchDeals before recommending specific purchases
- Use findDispensaries when users mention location
```

### 4.2 Conversation Starters

| Starter | Capability Showcased |
|---------|---------------------|
| "What indica strains help with sleep?" | Recommendations |
| "Compare Blue Dream vs Gelato" | Strain Analysis |
| "Find deals on flower near Orlando" | Deals + Location |
| "What dispensaries have high-myrcene strains?" | Location + Terpene |
| "Recommend strains for focus and creativity" | Personalization |
| "Show me today's best dispensary deals" | Deals |
| "What are the effects of limonene?" | Educational |
| "Find sativas under $40 in Tampa" | Deals + Location |

### 4.3 Deliverables

- [ ] Updated `declarativeAgent.json` with expert instructions
- [ ] 8+ conversation starters covering all capabilities
- [ ] Testing matrix for conversation flows

---

## 5. Phase 3: Authentication & Personalization

**Goal**: Enable user-specific experiences

### 5.1 SSO Integration Flow

```
User → Copilot → Terprint Agent → APIM (with user token) → Backend (user context)
```

### 5.2 Plugin Auth Configuration

**Current**: `auth.type: None`  
**Target**: OAuth 2.0 with user context

```json
{
  "runtimes": [{
    "auth": {
      "type": "OAuthPluginVault",
      "reference_id": "${{OAUTH_CONNECTION_ID}}"
    }
  }]
}
```

### 5.3 User Features Enabled

| Feature | Requires Auth | Benefit |
|---------|---------------|---------|
| View saved favorites | ✅ | Personalized experience |
| Save new favorites | ✅ | Persistent preferences |
| Recommendation history | ✅ | Improved suggestions |
| Price alerts | ✅ | Proactive notifications |
| Anonymous browsing | ❌ | Basic functionality |

### 5.4 Deliverables

- [ ] APIM OAuth policy update
- [ ] Plugin auth configuration
- [ ] Backend user context handling
- [ ] Privacy documentation

---

## 6. Phase 4: Rich User Experience

**Goal**: Provide compelling visual responses

### 6.1 Adaptive Card Templates

#### Strain Detail Card
```json
{
  "type": "AdaptiveCard",
  "body": [
    { "type": "TextBlock", "text": "${strain.name}", "size": "Large", "weight": "Bolder" },
    { "type": "ColumnSet", "columns": [
      { "width": "auto", "items": [{ "type": "Image", "url": "${strain.imageUrl}", "size": "Medium" }] },
      { "width": "stretch", "items": [
        { "type": "FactSet", "facts": [
          { "title": "Type", "value": "${strain.type}" },
          { "title": "THC", "value": "${strain.thc}%" },
          { "title": "CBD", "value": "${strain.cbd}%" },
          { "title": "Top Terpene", "value": "${strain.topTerpene}" }
        ]}
      ]}
    ]},
    { "type": "TextBlock", "text": "${strain.description}", "wrap": true }
  ],
  "actions": [
    { "type": "Action.OpenUrl", "title": "View on Terprint", "url": "${strain.url}" },
    { "type": "Action.Submit", "title": "Find Deals", "data": { "action": "findDeals", "strain": "${strain.name}" }}
  ]
}
```

#### Deal Card
```json
{
  "type": "AdaptiveCard",
  "body": [
    { "type": "TextBlock", "text": "🔥 ${deal.title}", "weight": "Bolder", "color": "Good" },
    { "type": "FactSet", "facts": [
      { "title": "Dispensary", "value": "${deal.dispensary}" },
      { "title": "Price", "value": "$${deal.price}" },
      { "title": "Original", "value": "~~$${deal.originalPrice}~~" },
      { "title": "Savings", "value": "${deal.discount}% off" },
      { "title": "Valid Until", "value": "${deal.expiresAt}" }
    ]},
    { "type": "ActionSet", "actions": [
      { "type": "Action.OpenUrl", "title": "View Deal", "url": "${deal.url}" },
      { "type": "Action.OpenUrl", "title": "Get Directions", "url": "${deal.directionsUrl}" }
    ]}
  ]
}
```

### 6.2 Deliverables

- [ ] Strain detail Adaptive Card template
- [ ] Deal/promotion Adaptive Card template
- [ ] Dispensary location card with map
- [ ] Comparison card for multiple strains
- [ ] Backend response formatting

---

## 7. Phase 5: Teams-Native Features

**Goal**: Deep Teams integration beyond Copilot

### 7.1 Messaging Extension

Enable Terprint in compose box for sharing strain info:

```json
{
  "composeExtensions": [{
    "botId": "${{BOT_ID}}",
    "commands": [{
      "id": "searchStrains",
      "type": "query",
      "title": "Search Strains",
      "description": "Find and share cannabis strain information",
      "parameters": [{
        "name": "query",
        "title": "Strain name",
        "description": "Enter strain name or effect to search"
      }],
      "initialRun": true
    }]
  }]
}
```

### 7.2 Personal Tab Dashboard

```json
{
  "staticTabs": [{
    "entityId": "terprintDashboard",
    "name": "My Strains",
    "contentUrl": "https://terprint.acidni.net/teams/dashboard?context={loginHint}",
    "scopes": ["personal"]
  }]
}
```

### 7.3 Bot for Proactive Notifications

```
[Terprint AI] 🔔 Deal Alert!
Fluent Dispensary has 25% off Blue Dream flower today.
This matches your saved favorite strain.
[View Deal] [Dismiss]
```

### 7.4 Deliverables

- [ ] Messaging extension with search capability
- [ ] Personal tab for favorites dashboard
- [ ] Bot registration for proactive notifications
- [ ] Teams Toolkit bot scaffolding

---

## 8. Phase 6: Production & Marketplace

**Goal**: Production deployment and marketplace listing

### 8.1 App Certification Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Privacy Policy URL | 🟡 Pending | Update acidni.net/privacy |
| Terms of Use URL | 🟡 Pending | Update acidni.net/terms |
| Publisher Verification | 🟡 Pending | Microsoft Partner Center |
| App Icon Guidelines | ✅ Done | 192x192 and 32x32 |
| Manifest Validation | ✅ Done | Teams Toolkit validates |
| Security Review | 🟡 Pending | Microsoft submission |

### 8.2 Marketplace Metadata

```yaml
listing:
  short_description: "AI-powered cannabis strain intelligence with lab data and personalized recommendations"
  long_description: |
    Terprint AI brings comprehensive cannabis intelligence directly into Microsoft 365:
    
    🌿 **Strain Database**: Search 5,000+ strains with lab-verified terpene and cannabinoid profiles
    💊 **Medical Matching**: Get recommendations based on desired effects and symptoms
    💰 **Deal Finder**: Compare prices across Florida dispensaries in real-time
    📍 **Dispensary Locator**: Find nearby MMTCs with inventory availability
    
    Perfect for Florida medical marijuana patients seeking informed purchasing decisions.
  
  categories:
    - "Data & Analytics"
    - "AI + Machine Learning"
  
  industries:
    - "Cannabis"
    - "Healthcare"
  
  keywords:
    - cannabis
    - marijuana
    - dispensary
    - terpenes
    - THC
    - CBD
    - medical marijuana
    - Florida
```

### 8.3 Deliverables

- [ ] Publisher verification complete
- [ ] Privacy/Terms pages updated
- [ ] App certification submission
- [ ] Production environment setup
- [ ] Launch communications

---

## 9. Implementation Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Microsoft 365 Ecosystem                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐  │
│  │   Copilot   │  │   Teams     │  │   Outlook   │  │   Edge/Web       │  │
│  │  (Agent)    │  │ (ME/Bot/Tab)│  │  (Future)   │  │   (Future)       │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────────┬─────────┘  │
│         │                │                │                   │             │
│         └────────────────┼────────────────┼───────────────────┘             │
│                          │                                                   │
│  ┌───────────────────────┴───────────────────────────────────────────────┐  │
│  │                 Terprint AI Plugin (Declarative Agent)                 │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────────┐  │  │
│  │  │ getStrains │ │ chatQuery  │ │ getDeals   │ │ findDispensaries   │  │  │
│  │  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └──────────┬─────────┘  │  │
│  └────────┴──────────────┴──────────────┴───────────────────┴────────────┘  │
│                          │                                                   │
└──────────────────────────┼───────────────────────────────────────────────────┘
                           │
┌──────────────────────────┴───────────────────────────────────────────────────┐
│                    Azure API Management (apim-terprint-dev)                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────────────────┐  │
│  │ Rate Limits │ │ OAuth/JWT   │ │ Caching     │ │ Request Transformation │  │
│  │ 100/min     │ │ Validation  │ │ 5 min TTL   │ │ Header Injection       │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────────────────────┘
                           │
┌──────────────────────────┴───────────────────────────────────────────────────┐
│                    Terprint Backend Services (Container Apps)                 │
│  ┌────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │
│  │ terprint-ai-   │ │ terprint-ai- │ │ terprint-ai- │ │ terprint-data    │   │
│  │ chat           │ │ recommender  │ │ deals        │ │ (SQL + Cosmos)   │   │
│  │ (Azure OpenAI) │ │ (ML Models)  │ │ (Scraper)    │ │                  │   │
│  └────────────────┘ └──────────────┘ └──────────────┘ └──────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Success Metrics

| Metric | Current | Phase 2 | Phase 4 | Phase 6 |
|--------|---------|---------|---------|---------|
| API Functions | 1 | 5 | 5 | 5 |
| Conversation Starters | 2 | 8 | 8 | 8 |
| Auth Type | None | None | OAuth | OAuth |
| Response Format | Text | Text | Adaptive Cards | Adaptive Cards |
| Platform Coverage | Copilot | Copilot | Copilot + Teams | Full M365 |
| Target MAU | - | 10 | 50 | 200 |

---

## 11. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API rate limiting | High | Medium | Implement caching in APIM |
| Copilot schema changes | Medium | Low | Pin to stable schema versions |
| Auth flow complexity | Medium | Medium | Phased rollout with fallback |
| Marketplace rejection | High | Low | Follow certification guide |
| Backend service outage | High | Low | Multi-region deployment |

---

## 12. Dependencies

### External
- Microsoft 365 Copilot GA availability
- Teams Toolkit schema stability
- APIM service availability

### Internal
- Terprint AI Chat service deployed
- Terprint Recommender service deployed
- Terprint Deals service deployed
- Data API v2 stable

---

## 13. Quick Reference Commands

```powershell
# Validate manifests
npm run validate:schemas

# Test API connectivity
npm run test:api

# Package for deployment
npm run package

# Provision to dev environment
npx teamsapp provision --env dev

# Preview in Teams
npx teamsapp preview --env dev
```

---

## 14. Related Documents

| Document | Location |
|----------|----------|
| Solution Architecture | `acidni-config/products/copilot-connector/docs/04-solution-architecture.md` |
| Business Case | `acidni-config/products/copilot-connector/docs/01-business-case.md` |
| Business Requirements | `acidni-config/products/copilot-connector/docs/02-business-requirements.md` |
| Product Configuration | `acidni-config/products/copilot-connector/product.yaml` |

---

## Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| Solution Architect | AI SDO | 🟡 Pending | - |
| Product Owner | Jamieson Gill | 🟡 Pending | - |
| Security Architect | AI SDO | 🟡 Pending | - |

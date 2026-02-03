# Acidni Copilot Connector

Microsoft 365 Copilot plugin that integrates Terprint AI cannabis analytics services directly into your Microsoft 365 experience.

## 🌿 Features

- **Cannabis Strain Chat**: Ask natural language questions about strains, terpenes, and effects
- **Personalized Recommendations**: Get strain suggestions based on your preferences
- **Deal Finder**: Search for the best prices at Florida dispensaries
- **Dispensary Locator**: Find nearby medical marijuana dispensaries

## 🏗️ Architecture

This is a **Declarative Agent with API Plugin** that connects to Terprint's existing AI services through Azure API Management:

```
Microsoft 365 Copilot → Declarative Agent → API Plugin → APIM → Terprint AI Services
```

## 📁 Project Structure

```
acidni-copilot-connector/
├── appPackage/                      # Teams/Copilot app package
│   ├── manifest.json                # Teams app manifest
│   ├── declarativeAgent.json        # Copilot agent configuration
│   ├── ai-plugin.json               # API plugin manifest
│   ├── apiSpecificationFile/        
│   │   └── openapi.json             # OpenAPI spec for Terprint APIs
│   ├── color.png                    # App icon (192x192)
│   └── outline.png                  # App icon outline (32x32)
├── .github/
│   └── workflows/
│       └── validate.yml             # CI/CD workflow
├── teamsapp.yml                     # Teams Toolkit configuration
├── teamsapp.local.yml               # Local development config
├── env/
│   └── .env.dev                     # Environment variables
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Teams Toolkit for VS Code](https://marketplace.visualstudio.com/items?itemName=TeamsDevApp.ms-teams-vscode-extension)
- Microsoft 365 developer tenant with Copilot enabled
- Azure subscription (for APIM access)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Acidni-LLC/acidni-copilot-connector.git
   cd acidni-copilot-connector
   ```

2. **Install Teams Toolkit**
   - Open VS Code
   - Install "Teams Toolkit" extension
   - Sign in with your Microsoft 365 account

3. **Configure environment**
   ```bash
   cp env/.env.dev.example env/.env.dev
   # Edit env/.env.dev with your APIM subscription key
   ```

4. **Sideload to Teams**
   - Press F5 in VS Code, or
   - Use Teams Toolkit: "Provision" then "Deploy"

### Testing in Copilot

Once sideloaded, open Microsoft 365 Copilot and try these prompts:

- "Tell me about Blue Dream strain"
- "Recommend strains for relaxation"
- "Find deals on flower near Orlando"
- "What dispensaries are in Tampa?"

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `APIM_BASE_URL` | APIM gateway URL | Yes |
| `APIM_SUBSCRIPTION_KEY` | APIM subscription key | Yes |

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/chat/query` | Natural language Q&A |
| `/recommend/strains` | Strain recommendations |
| `/deals/search` | Deal finder |
| `/data/api/locations/search` | Dispensary locator |

## 📦 Deployment

### To Microsoft AppSource (Production)

1. Update version in `appPackage/manifest.json`
2. Package the app: `npx @microsoft/teams-toolkit-cli package`
3. Submit to Partner Center for certification

### To Teams Admin Center (Enterprise)

1. Build the package: `npm run build`
2. Upload to Teams Admin Center > Manage apps
3. Configure policies for user access

## 🔒 Security

- All traffic routed through Azure API Management
- OAuth 2.0 authentication via Entra ID
- No user data stored in the plugin
- Rate limiting enforced at APIM level

## 📊 Telemetry

Usage metrics are captured via Application Insights:

- Request counts by operation
- Response times
- Error rates
- User satisfaction (thumbs up/down)

## 🧪 Testing

### Validate Manifest
```bash
npm run validate
```

### Test API Connectivity
```bash
npm run test:api
```

## 📝 Documentation

- [Business Case](docs/01-business-case.md)
- [Business Requirements](docs/02-business-requirements.md)
- [Solution Architecture](docs/04-solution-architecture.md)
- [API Specification](appPackage/apiSpecificationFile/openapi.json)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

Copyright © 2026 Acidni LLC. All rights reserved.

## 🔗 Links

- [Terprint Platform](https://terprint.acidni.net)
- [Acidni LLC](https://www.acidni.com)
- [Microsoft 365 Copilot Docs](https://learn.microsoft.com/en-us/microsoft-365-copilot/)

# Terprint AI Bot

Teams bot for Terprint AI, providing messaging extension for cannabis intelligence.

## Features

- **Messaging Extension**: Search strains, get recommendations, find deals and dispensaries
- **Bot Commands**: Direct chat with Terprint AI
- **Copilot Integration**: Works as an action in M365 Copilot

## Quick Start

```bash
cd bot
npm install
cp .env.example .env
# Edit .env with your BOT_ID and BOT_PASSWORD
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BOT_ID` | Azure Bot registration App ID |
| `BOT_PASSWORD` | Azure Bot registration password |
| `APIM_BASE_URL` | Terprint APIM endpoint |
| `APIM_SUBSCRIPTION_KEY` | APIM subscription key for authentication |
| `PORT` | Server port (default: 3978) |

## Azure Bot Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Azure Bot** resource
3. Choose **Multi Tenant** for bot type
4. Create new App Registration or use existing
5. Copy the App ID → `BOT_ID`
6. Create a client secret → `BOT_PASSWORD`
7. Set Messaging Endpoint: `https://your-domain/api/messages`

## Architecture

```
bot/
├── src/
│   ├── index.ts         # Entry point, HTTP server setup
│   ├── bot.ts           # TerprintBot with messaging extension handlers
│   ├── apiClient.ts     # TerprintApiClient for APIM calls
│   └── teamsBot.ts      # (legacy) Original bot implementation
├── package.json
├── tsconfig.json
└── .env.example
```

## Messaging Extension Commands

| Command | Description |
|---------|-------------|
| `searchStrains` | Search cannabis strains by name |
| `getRecommendations` | Get strain recommendations by effects |
| `searchDeals` | Find deals on products |
| `findDispensaries` | Locate dispensaries by city |

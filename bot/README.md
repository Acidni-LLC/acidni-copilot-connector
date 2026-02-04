# Terprint AI Bot

Teams bot for Terprint AI, providing:

- **Messaging Extension**: Search and share strain information in conversations
- **Personal Tab**: Dashboard for saved strains and preferences
- **Proactive Notifications**: Deal alerts for saved strains

## Development

```bash
cd bot
npm install
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BOT_ID` | Azure Bot registration App ID |
| `BOT_PASSWORD` | Azure Bot registration password |
| `API_ENDPOINT` | Terprint APIM endpoint |
| `PORT` | Server port (default: 3978) |

## Deployment

The bot is deployed as part of the Teams Toolkit workflow. See `teamsapp.yml` for provisioning configuration.

## Architecture

```
bot/
├── src/
│   ├── index.ts         # Entry point, HTTP server
│   └── teamsBot.ts      # Bot logic, messaging extension handlers
├── package.json
└── tsconfig.json
```

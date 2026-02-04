/**
 * Terprint AI Bot - Entry Point
 * Handles Teams bot messaging, messaging extensions, and proactive notifications
 */

import * as restify from "restify";
import type { Request, Response, Next } from "restify";
import {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  ConfigurationBotFrameworkAuthentication,
  TurnContext,
} from "botbuilder";
import { TerprintBot } from "./teamsBot";

// Load environment variables
const botId = process.env.BOT_ID || "";
const botPassword = process.env.BOT_PASSWORD || "";
const apiEndpoint = process.env.API_ENDPOINT || "https://apim-terprint-dev.azure-api.net";

// Create HTTP server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.PORT || 3978, () => {
  console.log(`\nTerprint Bot listening on port ${process.env.PORT || 3978}`);
  console.log(`Bot ID: ${botId}`);
  console.log(`API Endpoint: ${apiEndpoint}`);
});

// Create adapter with authentication
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: botId,
  MicrosoftAppPassword: botPassword,
  MicrosoftAppType: "MultiTenant",
});

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
  {},
  credentialsFactory
);

const adapter = new CloudAdapter(botFrameworkAuthentication);

// Error handler
adapter.onTurnError = async (context: TurnContext, error: Error) => {
  console.error(`\n [onTurnError] unhandled error: ${error}`);
  console.error(error.stack);

  // Send a trace activity for debugging
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  // Send a message to the user
  await context.sendActivity(
    "Sorry, Terprint encountered an error. Please try again."
  );
};

// Create the bot instance
const bot = new TerprintBot(apiEndpoint);

// Listen for incoming requests
server.post("/api/messages", async (req, res) => {
  await adapter.process(req, res, (context) => bot.run(context));
});

// Health check endpoint
server.get("/api/health", (req, res, next) => {
  res.send(200, {
    status: "healthy",
    service: "terprint-bot",
    version: "3.20.0",
    timestamp: new Date().toISOString(),
  });
  next();
});

// Proactive notification endpoint (for deal alerts)
server.post("/api/notify", async (req, res, next) => {
  // This endpoint will be called by Azure Functions to send proactive deal notifications
  // Requires conversation reference storage (Azure Table Storage or Cosmos DB)
  res.send(200, { message: "Notification endpoint ready" });
  next();
});

console.log("Terprint Bot started successfully.");

/**
 * Terprint Teams Bot
 * Handles messaging extension queries, bot commands, and proactive notifications
 */

import {
  TeamsActivityHandler,
  TurnContext,
  MessagingExtensionQuery,
  MessagingExtensionResponse,
  CardFactory,
  MessageFactory,
  Attachment,
} from "botbuilder";

interface StrainResult {
  id: string;
  name: string;
  type: string;
  thc_avg: number;
  cbd_avg: number;
  dominant_terpene?: string;
  effects: string[];
  flavors: string[];
  description?: string;
}

interface ApiResponse {
  data: StrainResult[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export class TerprintBot extends TeamsActivityHandler {
  private apiEndpoint: string;

  constructor(apiEndpoint: string) {
    super();
    this.apiEndpoint = apiEndpoint;

    // Handle incoming messages
    this.onMessage(async (context: TurnContext, next) => {
      const text = context.activity.text?.toLowerCase().trim() || "";

      if (text === "help") {
        await this.sendHelpCard(context);
      } else if (text === "deals") {
        await context.sendActivity(
          "🔍 Searching for today's best deals... Use Copilot for real-time deal information."
        );
      } else if (text === "favorites") {
        await context.sendActivity(
          "⭐ View your saved strains at https://portal.terprint.net/dashboard"
        );
      } else {
        // Default response for unknown commands
        await context.sendActivity(
          "🌿 Hi! I'm Terprint AI. Try asking me about cannabis strains in Copilot, or type 'help' for commands."
        );
      }

      await next();
    });

    // Handle members added
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded || [];
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await this.sendWelcomeCard(context);
        }
      }
      await next();
    });
  }

  /**
   * Handle messaging extension search queries
   */
  async handleTeamsMessagingExtensionQuery(
    context: TurnContext,
    query: MessagingExtensionQuery
  ): Promise<MessagingExtensionResponse> {
    const searchQuery = query.parameters?.[0]?.value as string || "";

    if (!searchQuery && !query.state) {
      // Return initial results when no query
      return this.getInitialResults();
    }

    try {
      const strains = await this.searchStrains(searchQuery);
      const attachments = strains.map((strain) =>
        this.createStrainPreviewCard(strain)
      );

      return {
        composeExtension: {
          type: "result",
          attachmentLayout: "list",
          attachments,
        },
      };
    } catch (error) {
      console.error("Search error:", error);
      return {
        composeExtension: {
          type: "message",
          text: "Sorry, I couldn't search strains right now. Please try again.",
        },
      };
    }
  }

  /**
   * Handle messaging extension card action (when user selects a result)
   */
  async handleTeamsMessagingExtensionSelectItem(
    context: TurnContext,
    obj: any
  ): Promise<MessagingExtensionResponse> {
    const strain = obj as StrainResult;
    const card = this.createStrainDetailCard(strain);

    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments: [card],
      },
    };
  }

  /**
   * Search strains from Terprint API
   */
  private async searchStrains(query: string): Promise<StrainResult[]> {
    try {
      const url = `${this.apiEndpoint}/data/v2/strains?strain_name=${encodeURIComponent(query)}&limit=10`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = (await response.json()) as ApiResponse;
      return data.data || [];
    } catch (error) {
      console.error("API fetch error:", error);
      return [];
    }
  }

  /**
   * Get initial/popular strains when no search query
   */
  private getInitialResults(): MessagingExtensionResponse {
    const popularStrains: StrainResult[] = [
      {
        id: "blue-dream",
        name: "Blue Dream",
        type: "hybrid",
        thc_avg: 21,
        cbd_avg: 0.1,
        dominant_terpene: "myrcene",
        effects: ["relaxed", "happy", "euphoric"],
        flavors: ["blueberry", "sweet", "berry"],
      },
      {
        id: "gelato",
        name: "Gelato",
        type: "hybrid",
        thc_avg: 23,
        cbd_avg: 0.1,
        dominant_terpene: "limonene",
        effects: ["relaxed", "happy", "euphoric"],
        flavors: ["sweet", "citrus", "fruity"],
      },
      {
        id: "og-kush",
        name: "OG Kush",
        type: "hybrid",
        thc_avg: 20,
        cbd_avg: 0.3,
        dominant_terpene: "myrcene",
        effects: ["relaxed", "happy", "euphoric"],
        flavors: ["earthy", "pine", "woody"],
      },
    ];

    const attachments = popularStrains.map((strain) =>
      this.createStrainPreviewCard(strain)
    );

    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments,
      },
    };
  }

  /**
   * Create preview card for messaging extension results list
   */
  private createStrainPreviewCard(strain: StrainResult): Attachment {
    const typeEmoji =
      strain.type === "indica" ? "🌙" : strain.type === "sativa" ? "☀️" : "🌿";
    const effectsList = strain.effects?.slice(0, 3).join(", ") || "N/A";

    const card = CardFactory.thumbnailCard(
      `${typeEmoji} ${strain.name}`,
      `THC: ${strain.thc_avg}% | ${strain.dominant_terpene || "N/A"}`,
      undefined,
      undefined,
      {
        subtitle: `Effects: ${effectsList}`,
        tap: { type: "invoke", value: strain },
      }
    );

    // Add preview for list display
    (card as any).preview = CardFactory.thumbnailCard(
      `${typeEmoji} ${strain.name}`,
      `${strain.type.charAt(0).toUpperCase() + strain.type.slice(1)} | THC: ${strain.thc_avg}%`,
      undefined,
      undefined,
      { subtitle: effectsList }
    );

    return card;
  }

  /**
   * Create detailed Adaptive Card for selected strain
   */
  private createStrainDetailCard(strain: StrainResult): Attachment {
    const typeEmoji =
      strain.type === "indica" ? "🌙" : strain.type === "sativa" ? "☀️" : "🌿";
    const typeLabel =
      strain.type === "indica"
        ? "Indica"
        : strain.type === "sativa"
          ? "Sativa"
          : "Hybrid";

    const card = {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.5",
      body: [
        {
          type: "TextBlock",
          text: `${typeEmoji} ${strain.name}`,
          size: "Large",
          weight: "Bolder",
          wrap: true,
        },
        {
          type: "TextBlock",
          text: `${typeLabel} Strain`,
          spacing: "None",
          isSubtle: true,
        },
        {
          type: "FactSet",
          facts: [
            { title: "THC", value: `${strain.thc_avg}%` },
            { title: "CBD", value: `${strain.cbd_avg}%` },
            { title: "Terpene", value: strain.dominant_terpene || "N/A" },
          ],
        },
        {
          type: "TextBlock",
          text: "Effects",
          weight: "Bolder",
          spacing: "Medium",
        },
        {
          type: "TextBlock",
          text: strain.effects?.join(", ") || "N/A",
          wrap: true,
          isSubtle: true,
        },
        {
          type: "TextBlock",
          text: "Flavors",
          weight: "Bolder",
          spacing: "Small",
        },
        {
          type: "TextBlock",
          text: strain.flavors?.join(", ") || "N/A",
          wrap: true,
          isSubtle: true,
        },
      ],
      actions: [
        {
          type: "Action.OpenUrl",
          title: "View on Terprint",
          url: `https://portal.terprint.net/strains/${strain.id}`,
        },
        {
          type: "Action.OpenUrl",
          title: "Find Deals",
          url: `https://portal.terprint.net/deals?strain=${encodeURIComponent(strain.name)}`,
        },
      ],
    };

    return CardFactory.adaptiveCard(card);
  }

  /**
   * Send welcome card to new users
   */
  private async sendWelcomeCard(context: TurnContext): Promise<void> {
    const card = {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.5",
      body: [
        {
          type: "TextBlock",
          text: "🌿 Welcome to Terprint AI!",
          size: "Large",
          weight: "Bolder",
        },
        {
          type: "TextBlock",
          text: "Your cannabis intelligence assistant for Florida medical marijuana patients.",
          wrap: true,
        },
        {
          type: "TextBlock",
          text: "Here's what I can help with:",
          weight: "Bolder",
          spacing: "Medium",
        },
        {
          type: "TextBlock",
          text: "• **Search Strains** - Find strains by name, type, or effects\n• **Get Recommendations** - Personalized strain suggestions\n• **Find Deals** - Best prices at Florida dispensaries\n• **Locate Dispensaries** - Find MMTCs near you",
          wrap: true,
        },
      ],
      actions: [
        {
          type: "Action.OpenUrl",
          title: "Open Dashboard",
          url: "https://portal.terprint.net/dashboard",
        },
        {
          type: "Action.Submit",
          title: "Show Commands",
          data: { action: "help" },
        },
      ],
    };

    await context.sendActivity(
      MessageFactory.attachment(CardFactory.adaptiveCard(card))
    );
  }

  /**
   * Send help card with available commands
   */
  private async sendHelpCard(context: TurnContext): Promise<void> {
    const card = {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.5",
      body: [
        {
          type: "TextBlock",
          text: "🌿 Terprint AI Commands",
          size: "Large",
          weight: "Bolder",
        },
        {
          type: "FactSet",
          facts: [
            { title: "help", value: "Show this help message" },
            { title: "deals", value: "Get today's best dispensary deals" },
            { title: "favorites", value: "View your saved strains" },
          ],
        },
        {
          type: "TextBlock",
          text: "💡 **Pro tip**: Use me in the compose box to search and share strain info with colleagues!",
          wrap: true,
          spacing: "Medium",
        },
      ],
    };

    await context.sendActivity(
      MessageFactory.attachment(CardFactory.adaptiveCard(card))
    );
  }
}

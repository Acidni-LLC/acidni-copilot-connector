import {
  TeamsActivityHandler,
  TurnContext,
  MessagingExtensionQuery,
  MessagingExtensionResponse,
  CardFactory,
  MessagingExtensionAction,
  MessagingExtensionActionResponse,
} from 'botbuilder';
import { TerprintApiClient } from './apiClient';

export class TerprintBot extends TeamsActivityHandler {
  private apiClient: TerprintApiClient;

  constructor() {
    super();
    this.apiClient = new TerprintApiClient();

    // Handle messages
    this.onMessage(async (context, next) => {
      const text = context.activity.text?.trim() || '';
      
      // Simple command routing
      if (text.toLowerCase().includes('strain')) {
        await this.handleStrainQuery(context, text);
      } else if (text.toLowerCase().includes('recommend')) {
        await this.handleRecommendation(context, text);
      } else if (text.toLowerCase().includes('deal')) {
        await this.handleDealSearch(context, text);
      } else if (text.toLowerCase().includes('dispensary') || text.toLowerCase().includes('location')) {
        await this.handleDispensarySearch(context, text);
      } else {
        // Default: chat with Terprint
        await this.handleChat(context, text);
      }

      await next();
    });
  }

  // Handle messaging extension search queries (Copilot invokes this)
  async handleTeamsMessagingExtensionQuery(
    context: TurnContext,
    query: MessagingExtensionQuery
  ): Promise<MessagingExtensionResponse> {
    const searchQuery = query.parameters?.[0]?.value || '';
    const commandId = query.commandId;

    try {
      let results: any[] = [];

      switch (commandId) {
        case 'searchStrains':
          results = await this.apiClient.searchStrains(searchQuery);
          break;
        case 'getRecommendations':
          results = await this.apiClient.getRecommendations(searchQuery);
          break;
        case 'searchDeals':
          results = await this.apiClient.searchDeals(searchQuery);
          break;
        case 'findDispensaries':
          results = await this.apiClient.findDispensaries(searchQuery);
          break;
        default:
          results = await this.apiClient.chat(searchQuery);
      }

      return this.createSearchResponse(results, commandId);
    } catch (error) {
      console.error('Search error:', error);
      return {
        composeExtension: {
          type: 'result',
          attachmentLayout: 'list',
          attachments: [],
        },
      };
    }
  }

  private createSearchResponse(results: any[], commandId: string): MessagingExtensionResponse {
    const attachments = results.slice(0, 10).map((item) => {
      const card = this.createResultCard(item, commandId);
      return {
        ...CardFactory.heroCard(
          item.name || item.strainName || item.dispensaryName || 'Result',
          item.description || item.type || '',
          undefined,
          undefined
        ),
        preview: CardFactory.heroCard(
          item.name || item.strainName || item.dispensaryName || 'Result',
          item.description || item.type || ''
        ),
      };
    });

    return {
      composeExtension: {
        type: 'result',
        attachmentLayout: 'list',
        attachments,
      },
    };
  }

  private createResultCard(item: any, commandId: string) {
    // Create adaptive card based on result type
    return CardFactory.adaptiveCard({
      type: 'AdaptiveCard',
      version: '1.5',
      body: [
        {
          type: 'TextBlock',
          text: item.name || item.strainName || item.dispensaryName || 'Result',
          size: 'Large',
          weight: 'Bolder',
        },
        {
          type: 'TextBlock',
          text: item.description || item.type || item.address || '',
          wrap: true,
        },
      ],
    });
  }

  private async handleStrainQuery(context: TurnContext, query: string) {
    const strains = await this.apiClient.searchStrains(query);
    const response = strains.length > 0
      ? `Found ${strains.length} strains:\n${strains.slice(0, 5).map((s: any) => `• ${s.name} (${s.type})`).join('\n')}`
      : 'No strains found matching your query.';
    await context.sendActivity(response);
  }

  private async handleRecommendation(context: TurnContext, query: string) {
    const recs = await this.apiClient.getRecommendations(query);
    const response = recs.length > 0
      ? `Here are my recommendations:\n${recs.slice(0, 5).map((r: any) => `• ${r.name}: ${r.reason || r.description || ''}`).join('\n')}`
      : 'I couldn\'t find recommendations based on your criteria.';
    await context.sendActivity(response);
  }

  private async handleDealSearch(context: TurnContext, query: string) {
    const deals = await this.apiClient.searchDeals(query);
    const response = deals.length > 0
      ? `Found ${deals.length} deals:\n${deals.slice(0, 5).map((d: any) => `• ${d.title || d.productName}: ${d.price || d.discount || ''}`).join('\n')}`
      : 'No current deals found.';
    await context.sendActivity(response);
  }

  private async handleDispensarySearch(context: TurnContext, query: string) {
    const dispensaries = await this.apiClient.findDispensaries(query);
    const response = dispensaries.length > 0
      ? `Found ${dispensaries.length} dispensaries:\n${dispensaries.slice(0, 5).map((d: any) => `• ${d.dispensaryName}: ${d.address}, ${d.city}`).join('\n')}`
      : 'No dispensaries found in that area.';
    await context.sendActivity(response);
  }

  private async handleChat(context: TurnContext, message: string) {
    const response = await this.apiClient.chat(message);
    await context.sendActivity(response.answer || response.message || 'I\'m here to help with cannabis questions!');
  }
}

import axios, { AxiosInstance } from 'axios';

export class TerprintApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.APIM_BASE_URL || 'https://apim-terprint-dev.azure-api.net',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.APIM_SUBSCRIPTION_KEY || '',
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async searchStrains(query: string, limit: number = 25): Promise<any[]> {
    try {
      const response = await this.client.get('/copilot/strains', {
        params: { strain_name: query, limit },
      });
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error searching strains:', error);
      return [];
    }
  }

  async getRecommendations(effects: string): Promise<any[]> {
    try {
      const response = await this.client.get('/copilot/recommendations', {
        params: { effects },
      });
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  async searchDeals(query: string): Promise<any[]> {
    try {
      const response = await this.client.get('/copilot/deals', {
        params: { product: query },
      });
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error searching deals:', error);
      return [];
    }
  }

  async findDispensaries(location: string): Promise<any[]> {
    try {
      const response = await this.client.get('/copilot/dispensaries', {
        params: { city: location },
      });
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error finding dispensaries:', error);
      return [];
    }
  }

  async chat(message: string): Promise<any> {
    try {
      const response = await this.client.post('/copilot/chat', {
        message,
      });
      return response.data || { answer: 'I couldn\'t process that request.' };
    } catch (error) {
      console.error('Error in chat:', error);
      return { answer: 'Sorry, I encountered an error processing your request.' };
    }
  }
}

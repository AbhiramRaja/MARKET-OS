import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: 'us-east-1', // Bedrock is available in us-east-1
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || ''
  }
});

class BedrockService {
  /**
   * Generate AI product recommendations using Amazon Bedrock (Claude)
   */
  static async getProductRecommendations(userPreferences, products) {
    try {
      const prompt = `Based on the following user preferences and available products, recommend the top 3 products:

User Preferences: ${JSON.stringify(userPreferences)}

Available Products: ${JSON.stringify(products.slice(0, 10))}

Provide recommendations in JSON format with product IDs and reasoning.`;

      const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      };

      const command = new InvokeModelCommand({
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload)
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return {
        success: true,
        recommendations: responseBody.content[0].text
      };
    } catch (error) {
      console.error('Bedrock AI recommendation error:', error);
      
      // Fallback to simple recommendation logic
      return {
        success: false,
        recommendations: this.getFallbackRecommendations(products),
        error: 'Using fallback recommendations'
      };
    }
  }

  /**
   * Generate product descriptions using AI
   */
  static async generateProductDescription(productName, category) {
    try {
      const prompt = `Write a compelling, SEO-optimized product description for: ${productName} in the ${category} category. Make it engaging and highlight key features in 2-3 sentences.`;

      const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      };

      const command = new InvokeModelCommand({
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload)
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return {
        success: true,
        description: responseBody.content[0].text
      };
    } catch (error) {
      console.error('Bedrock AI description error:', error);
      return {
        success: false,
        description: `Premium ${productName} - High quality ${category} product`,
        error: 'Using fallback description'
      };
    }
  }

  /**
   * AI-powered search query enhancement
   */
  static async enhanceSearchQuery(query) {
    try {
      const prompt = `Given this search query: "${query}", suggest 3 related search terms that a customer might also be interested in. Return only the terms, separated by commas.`;

      const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      };

      const command = new InvokeModelCommand({
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload)
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      const suggestions = responseBody.content[0].text.split(',').map(s => s.trim());
      
      return {
        success: true,
        suggestions
      };
    } catch (error) {
      console.error('Bedrock AI search enhancement error:', error);
      return {
        success: false,
        suggestions: [],
        error: 'Search enhancement unavailable'
      };
    }
  }

  /**
   * Fallback recommendations when Bedrock is unavailable
   */
  static getFallbackRecommendations(products) {
    // Simple algorithm: return top 3 products by rating or newest
    return products
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3)
      .map(p => ({
        productId: p.productId,
        name: p.name,
        reason: 'Highly rated product'
      }));
  }

  /**
   * Check if Bedrock is properly configured
   */
  static isConfigured() {
    return !!(process.env.REACT_APP_AWS_ACCESS_KEY_ID && 
              process.env.REACT_APP_AWS_SECRET_ACCESS_KEY);
  }
}

export default BedrockService;

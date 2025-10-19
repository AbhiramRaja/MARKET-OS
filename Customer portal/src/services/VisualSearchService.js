// Real AWS Rekognition Visual Search Service
import { generateClient } from 'aws-amplify/api';

export class VisualSearchService {
  /**
   * Analyze image using AWS Rekognition via Lambda function
   * @param {File} imageFile - The image file to analyze
   * @returns {Promise} - Analysis results with detected labels and matched products
   */
  static async analyzeImage(imageFile) {
    try {
      console.log('Starting visual search with Rekognition...');
      
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
  // Use Amplify API wrapper
  const client = generateClient();
      
      // Call Lambda function via API Gateway
      const response = await client.graphql({
        query: `
          mutation VisualSearch($image: String!) {
            visualSearch(image: $image) {
              success
              results {
                id
                name
                description
                price
                originalPrice
                discount
                category
                image
                tags
                inStock
                rating
                reviews
                confidence
                matchedTags
                matchCount
              }
              detectedLabels {
                name
                confidence
              }
              totalMatches
              confidence_threshold
            }
          }
        `,
        variables: {
          image: base64Image
        }
      });

      const data = response.data.visualSearch;
      
      if (!data.success) {
        throw new Error(data.error || 'Visual search failed');
      }

      console.log(`Rekognition detected ${data.detectedLabels?.length || 0} labels`);
      console.log(`Found ${data.totalMatches} matching products`);

      return {
        success: true,
        labels: data.detectedLabels || [],
        products: data.results || [],
        category: this.determinePrimaryCategory(data.results || []),
        confidence: this.calculateAverageConfidence(data.detectedLabels || []),
        colors: this.extractColors(data.detectedLabels || []),
        tags: data.detectedLabels?.map(l => l.name.toLowerCase()) || []
      };
      
    } catch (error) {
      console.error('Visual search error:', error);
      
      // Fallback to mock service for demo purposes
      console.log('Falling back to mock service...');
      const { MockVisualSearchService } = await import('./MockVisualSearchService');
      return await MockVisualSearchService.analyzeImage(imageFile);
    }
  }

  /**
   * Convert file to base64 string
   */
  static fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Determine primary category from matched products
   */
  static determinePrimaryCategory(products) {
    if (!products || products.length === 0) return 'General';
    
    // Count categories
    const categoryCounts = {};
    products.forEach(product => {
      const cat = product.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    // Return most common category
    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Calculate average confidence from labels
   */
  static calculateAverageConfidence(labels) {
    if (!labels || labels.length === 0) return 0;
    const sum = labels.reduce((acc, label) => acc + (label.confidence || 0), 0);
    return sum / labels.length / 100; // Convert to 0-1 range
  }

  /**
   * Extract color-related labels
   */
  static extractColors(labels) {
    const colorKeywords = ['red', 'blue', 'green', 'yellow', 'black', 'white', 
                          'gray', 'grey', 'pink', 'purple', 'orange', 'brown'];
    
    return labels
      .filter(label => colorKeywords.some(color => 
        label.name.toLowerCase().includes(color)))
      .map(label => label.name.toLowerCase())
      .slice(0, 3);
  }

  /**
   * Generate search query from analysis results
   * @param {Object} analysisResults - Results from analyzeImage
   * @returns {string} - Search query string
   */
  static generateSearchQuery(analysisResults) {
    if (!analysisResults || !analysisResults.labels) {
      return 'products';
    }

    // Use top 3 most relevant labels
    const topLabels = analysisResults.labels
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map(label => label.name.toLowerCase());

    return topLabels.join(' ') || 'products';
  }

  /**
   * Get matched products directly from Rekognition results
   */
  static getMatchedProducts(analysisResults) {
    return analysisResults.products || [];
  }
}

export default VisualSearchService;

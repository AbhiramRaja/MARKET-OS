import { generateClient } from 'aws-amplify/api';

// GraphQL mutation for visual search
const analyzeImageMutation = /* GraphQL */ `
  mutation AnalyzeImage($image: String!) {
    analyzeImage(image: $image) {
      success
      results {
        id
        name
        price
        image
        category
        rating
        tags
        matchCount
        confidence
      }
      detectedLabels {
        name
        confidence
      }
      totalMatches
      confidence_threshold
    }
  }
`;

class AWSVisualSearchService {
  async analyzeImage(imageFile) {
    try {
      console.log('Converting image to base64 for Rekognition...');
      
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      console.log('Calling Lambda function via GraphQL with Rekognition...');
      
  // Use Amplify API wrapper
  const client = generateClient();
      
      // Call GraphQL mutation which triggers Lambda function
      const response = await client.graphql({
        query: analyzeImageMutation,
        variables: {
          image: base64Image
        }
      });

      const analysisResult = response.data.analyzeImage;
      console.log('Rekognition analysis result:', analysisResult);
      
      if (!analysisResult.success) {
        throw new Error('Visual search failed');
      }
      
      // Convert AWS response to our standard format
      return this.formatAnalysisResult(analysisResult);
    } catch (error) {
      console.error('AWS Visual Search Error:', error);
      throw new Error(error.message || 'Failed to analyze image');
    }
  }

  /**
   * Convert file to base64 string
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  formatAnalysisResult(awsResult) {
    // Transform AWS Rekognition response to match our app's format
    const { 
      results = [], 
      detectedLabels = [], 
      confidence_threshold = 70,
      totalMatches = 0 
    } = awsResult;
    
    // Extract detected label names
    const labelNames = detectedLabels.map(l => l.name);
    
    // Extract categories from matched products
    const categories = this.extractCategoriesFromProducts(results);
    
    // Determine primary category
    const primaryCategory = categories.length > 0 ? categories[0] : 'General';
    
    // Calculate average confidence
    const avgConfidence = detectedLabels.length > 0
      ? detectedLabels.reduce((sum, l) => sum + l.confidence, 0) / detectedLabels.length
      : 0;
    
    return {
      confidence: Math.round(avgConfidence),
      categories: categories,
      primaryCategory: primaryCategory,
      tags: labelNames,
      products: results, // Include matched products
      detectedLabels: detectedLabels,
      totalMatches: totalMatches,
      analysisDetails: {
        service: 'AWS Rekognition',
        timestamp: new Date().toISOString(),
        rawLabels: detectedLabels,
        confidenceThreshold: confidence_threshold
      }
    };
  }

  extractCategoriesFromProducts(products) {
    if (!products || products.length === 0) return [];
    
    // Count category occurrences
    const categoryCounts = {};
    products.forEach(product => {
      const cat = product.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    // Sort by frequency and return
    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);
  }

  extractCategories(labels) {
    const categoryMap = {
      // Fashion items
      'Clothing': 'Fashion',
      'Shoe': 'Fashion',
      'Footwear': 'Fashion',
      'Apparel': 'Fashion',
      'Dress': 'Fashion',
      'Shirt': 'Fashion',
      'Pants': 'Fashion',
      'Jacket': 'Fashion',
      'Hat': 'Fashion',
      'Accessories': 'Fashion',
      
      // Electronics
      'Electronics': 'Electronics',
      'Computer': 'Electronics',
      'Phone': 'Electronics',
      'Mobile Phone': 'Electronics',
      'Laptop': 'Electronics',
      'Television': 'Electronics',
      'Camera': 'Electronics',
      'Headphones': 'Electronics',
      'Speaker': 'Electronics',
      
      // Home & Garden
      'Furniture': 'Home & Garden',
      'Chair': 'Home & Garden',
      'Table': 'Home & Garden',
      'Bed': 'Home & Garden',
      'Lamp': 'Home & Garden',
      'Plant': 'Home & Garden',
      
      // Books & Media
      'Book': 'Books & Media',
      'Magazine': 'Books & Media',
      'CD': 'Books & Media',
      'DVD': 'Books & Media',
      
      // Sports & Outdoors
      'Sports Equipment': 'Sports & Outdoors',
      'Ball': 'Sports & Outdoors',
      'Bicycle': 'Sports & Outdoors',
      'Exercise Equipment': 'Sports & Outdoors'
    };

    const detectedCategories = new Set();
    
    labels.forEach(label => {
      const labelName = typeof label === 'string' ? label : label.Name;
      const category = categoryMap[labelName];
      if (category) {
        detectedCategories.add(category);
      }
    });

    return Array.from(detectedCategories);
  }
}

export default new AWSVisualSearchService();
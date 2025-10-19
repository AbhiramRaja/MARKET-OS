


import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';

// Import product data for matching
import productsData from './products.json' assert { type: 'json' };

const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Minimum confidence threshold for Rekognition labels
const REKOGNITION_MIN_CONFIDENCE = 70;

// Maximum labels to detect
const MAX_LABELS = 20;

/**
 * Match detected labels to product tags
 * @param {Array} labels - Detected labels from Rekognition
 * @param {Array} products - Product catalog
 * @returns {Array} - Matched products with confidence scores
 */
function matchLabelsToProducts(labels, products) {
    const labelNames = labels.map(l => l.Name.toLowerCase());
    const matchedProducts = [];
    
    products.forEach(product => {
        if (!product.tags || !Array.isArray(product.tags)) return;
        
        // Calculate match score based on tag overlap
        const productTags = product.tags.map(t => t.toLowerCase());
        const matchingTags = productTags.filter(tag => 
            labelNames.some(label => 
                label.includes(tag) || tag.includes(label)
            )
        );
        
        if (matchingTags.length > 0) {
            // Calculate confidence as average of matching label confidences
            const matchingLabels = labels.filter(label => 
                matchingTags.some(tag => 
                    label.Name.toLowerCase().includes(tag) || 
                    tag.includes(label.Name.toLowerCase())
                )
            );
            
            const avgConfidence = matchingLabels.reduce((sum, label) => 
                sum + label.Confidence, 0) / matchingLabels.length;
            
            matchedProducts.push({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                originalPrice: product.originalPrice,
                discount: product.discount,
                category: product.category,
                image: product.image,
                tags: product.tags,
                inStock: product.inStock,
                rating: product.rating,
                reviews: product.reviews,
                confidence: Math.round(avgConfidence * 10) / 10,
                matchedTags: matchingTags,
                matchCount: matchingTags.length
            });
        }
    });
    
    // Sort by match count (descending), then by confidence (descending)
    return matchedProducts.sort((a, b) => {
        if (b.matchCount !== a.matchCount) {
            return b.matchCount - a.matchCount;
        }
        return b.confidence - a.confidence;
    }).slice(0, 12); // Return top 12 matches
}

/**
 * Lambda handler for AppSync GraphQL @function directive
 * When called from AppSync, event.arguments contains the GraphQL arguments
 */
export const handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    try {
        // AppSync passes arguments directly in event.arguments
        const imageData = event.arguments?.image || event.image;
        
        if (!imageData) {
            return {
                success: false,
                results: [],
                detectedLabels: [],
                totalMatches: 0,
                confidence_threshold: REKOGNITION_MIN_CONFIDENCE,
                error: 'No image data provided'
            };
        }
        
        // Extract base64 data (remove data:image/...;base64, prefix if present)
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBytes = Buffer.from(base64Data, 'base64');
        
        // Call AWS Rekognition to detect labels
        const detectLabelsCommand = new DetectLabelsCommand({
            Image: {
                Bytes: imageBytes
            },
            MaxLabels: MAX_LABELS,
            MinConfidence: REKOGNITION_MIN_CONFIDENCE
        });
        
        console.log('Calling AWS Rekognition...');
        const rekognitionResponse = await rekognitionClient.send(detectLabelsCommand);
        
        const detectedLabels = rekognitionResponse.Labels || [];
        console.log(`Detected ${detectedLabels.length} labels:`, 
            detectedLabels.map(l => `${l.Name} (${l.Confidence.toFixed(1)}%)`).join(', '));
        
        if (detectedLabels.length === 0) {
            return {
                success: true,
                results: [],
                detectedLabels: [],
                totalMatches: 0,
                confidence_threshold: REKOGNITION_MIN_CONFIDENCE
            };
        }
        
        // Match detected labels to products
        const matchedProducts = matchLabelsToProducts(detectedLabels, productsData);
        
        console.log(`Matched ${matchedProducts.length} products`);
        
        // Return response in GraphQL schema format
        return {
            success: true,
            results: matchedProducts,
            detectedLabels: detectedLabels.map(l => ({
                name: l.Name,
                confidence: Math.round(l.Confidence * 10) / 10
            })),
            confidence_threshold: REKOGNITION_MIN_CONFIDENCE,
            totalMatches: matchedProducts.length
        };
        
    } catch (error) {
        console.error('Visual search error:', error);
        // Return error in GraphQL format
        return {
            success: false,
            results: [],
            detectedLabels: [],
            totalMatches: 0,
            confidence_threshold: REKOGNITION_MIN_CONFIDENCE,
            error: error.message || 'Visual search failed'
        };
    }
};

const { RekognitionClient, DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
const fs = require('fs');
const path = require('path');

// Import product data for matching
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));

const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION || 'ap-south-1' });

// Minimum confidence threshold for Rekognition labels
const REKOGNITION_MIN_CONFIDENCE = 75;

// Maximum labels to detect
const MAX_LABELS = 15;

// Generic labels to filter out (too broad to be useful)
const GENERIC_LABELS = ['clothing', 'apparel', 'product', 'object', 'item', 'thing'];

/**
 * Filter and prioritize labels
 * @param {Array} labels - Raw labels from Rekognition
 * @returns {Array} - Filtered and scored labels
 */
function filterLabels(labels) {
    return labels
        .filter(label => {
            const labelLower = label.Name.toLowerCase();
            // Filter out generic labels
            return !GENERIC_LABELS.includes(labelLower);
        })
        .map(label => ({
            ...label,
            // Boost confidence of more specific labels
            Confidence: label.Name.split(' ').length > 1 ? label.Confidence * 1.1 : label.Confidence
        }))
        .sort((a, b) => b.Confidence - a.Confidence)
        .slice(0, 10); // Keep top 10 specific labels
}

/**
 * Match detected labels to product tags with improved scoring
 * @param {Array} labels - Detected labels from Rekognition
 * @param {Array} products - Product catalog
 * @returns {Array} - Matched products with confidence scores
 */
function matchLabelsToProducts(labels, products) {
    const matchedProducts = [];
    
    products.forEach(product => {
        if (!product.tags || !Array.isArray(product.tags)) return;
        
        const productTags = product.tags.map(t => t.toLowerCase());
        let totalScore = 0;
        let matchedLabelCount = 0;
        const matchingTags = [];
        
        // Calculate weighted match score
        labels.forEach(label => {
            const labelLower = label.Name.toLowerCase();
            const labelWords = labelLower.split(' ');
            
            productTags.forEach(tag => {
                // Exact match (highest weight)
                if (labelLower === tag) {
                    totalScore += label.Confidence * 2.0;
                    matchedLabelCount++;
                    if (!matchingTags.includes(tag)) matchingTags.push(tag);
                }
                // Label contains tag or vice versa (medium weight)
                else if (labelLower.includes(tag) || tag.includes(labelLower)) {
                    totalScore += label.Confidence * 1.5;
                    matchedLabelCount++;
                    if (!matchingTags.includes(tag)) matchingTags.push(tag);
                }
                // Word-level match (lower weight)
                else if (labelWords.some(word => word === tag || tag.includes(word))) {
                    totalScore += label.Confidence * 0.8;
                    matchedLabelCount++;
                    if (!matchingTags.includes(tag)) matchingTags.push(tag);
                }
            });
        });
        
        if (matchedLabelCount > 0) {
            const avgConfidence = totalScore / matchedLabelCount;
            
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
                matchCount: matchingTags.length,
                totalScore: Math.round(totalScore)
            });
        }
    });
    
    // Sort by total score (descending), then by match count
    return matchedProducts
        .filter(p => p.totalScore > 50) // Filter out weak matches
        .sort((a, b) => {
            if (Math.abs(b.totalScore - a.totalScore) > 20) {
                return b.totalScore - a.totalScore;
            }
            return b.matchCount - a.matchCount;
        })
        .slice(0, 12); // Return top 12 matches
}

/**
 * Lambda handler for AppSync GraphQL @function directive
 * When called from AppSync, event.arguments contains the GraphQL arguments
 */
exports.handler = async (event) => {
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
        
        const rawLabels = rekognitionResponse.Labels || [];
        console.log(`Detected ${rawLabels.length} raw labels:`, 
            rawLabels.map(l => `${l.Name} (${l.Confidence.toFixed(1)}%)`).join(', '));
        
        // Filter and prioritize labels
        const detectedLabels = filterLabels(rawLabels);
        console.log(`Filtered to ${detectedLabels.length} specific labels:`, 
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

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: 'ap-south-1' });
const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

(async () => {
  const demoSeller = {
    sellerId: 'DEMO_VIDEO_001',
    email: 'video@demo.com',
    businessName: 'Video Demo Electronics',
    verificationStatus: 'approved',
    verified: true,
    createdAt: new Date().toISOString(),
    documentsSubmitted: true,
    category: 'Electronics',
    documents: {
      licenseUrl: 'https://example.com/license.pdf',
      gstUrl: 'https://example.com/gst.pdf', 
      panUrl: 'https://example.com/pan.pdf'
    }
  };

  await dynamoDB.send(new PutCommand({
    TableName: 'marketos_sellers',
    Item: demoSeller
  }));

  console.log('✅ DEMO ACCOUNT FOR VIDEO CREATED!');
  console.log('📧 Email: video@demo.com');
  console.log('🔑 Password: Video123!'); 
  console.log('🏢 Business: Video Demo Electronics');
  console.log('🆔 Seller ID: DEMO_VIDEO_001');
  console.log('🎯 WILL SHOW DUMMY ANALYTICS!');
})().catch(console.error);

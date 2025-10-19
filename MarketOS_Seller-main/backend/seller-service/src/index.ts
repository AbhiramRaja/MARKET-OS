import express from 'express';
import cors from 'cors';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { sendAdminVerificationEmail, sendSellerApprovalEmail, sendSellerRejectionEmail, sendWelcomeEmail } from './services/emailService';

const app = express();
app.use(cors());
app.use(express.json());

const client = new DynamoDBClient({ region: 'ap-south-1' });
const dynamoDB = DynamoDBDocumentClient.from(client);

const TABLES = {
  PRODUCTS: 'marketos_products',
  ORDERS: 'marketos_orders',
  SELLERS: 'marketos_sellers',
  VERIFICATION_REQUESTS: 'marketos_verification_requests'
};

console.log('📊 Connected to DynamoDB');

// Root route - Health check
app.get('/', (req, res) => {
  res.json({
    service: 'MarketOS Seller Service',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      sellers: '/sellers',
      products: '/products/seller/:sellerId',
      orders: '/orders/seller/:sellerId',
      analytics: '/analytics/seller/:sellerId',
      admin: '/admin/stats',
      health: '/health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/sellers', async (req, res) => {
  try {
    const result = await dynamoDB.send(new ScanCommand({ TableName: TABLES.SELLERS }));
    res.json(result.Items || []);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
});

app.post('/sellers', async (req, res) => {
  try {
    const sellerData = req.body;
    await dynamoDB.send(new PutCommand({
      TableName: TABLES.SELLERS,
      Item: sellerData
    }));
    
    // Send welcome email to new seller
    if (sellerData.email) {
      console.log(`📧 Sending welcome email to ${sellerData.email}...`);
      const emailResult = await sendWelcomeEmail(sellerData);
      if (emailResult.success) {
        console.log(`✅ Welcome email sent successfully to ${sellerData.email}`);
      } else {
        console.error(`❌ Failed to send welcome email: ${emailResult.error}`);
      }
    }
    
    res.json({ success: true, seller: sellerData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create seller' });
  }
});

app.get('/sellers/email/:email', async (req, res) => {
  try {
    // Scan to find seller by email since email is not the primary key
    const result = await dynamoDB.send(new ScanCommand({
      TableName: TABLES.SELLERS,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': req.params.email }
    }));
    
    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    res.json(result.Items[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch seller' });
  }
});

app.get('/sellers/:sellerId', async (req, res) => {
  try {
    const result = await dynamoDB.send(new QueryCommand({
      TableName: TABLES.SELLERS,
      IndexName: 'sellerId-index',
      KeyConditionExpression: 'sellerId = :sellerId',
      ExpressionAttributeValues: { ':sellerId': req.params.sellerId }
    }));
    
    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    res.json(result.Items[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch seller' });
  }
});

app.get('/admin/sellers', async (req, res) => {
  try {
    const sellersResult = await dynamoDB.send(new ScanCommand({ TableName: TABLES.SELLERS }));
    const sellers = sellersResult.Items || [];
    
    const sellersWithDetails = await Promise.all(sellers.map(async (seller) => {
      const productsResult = await dynamoDB.send(new QueryCommand({
        TableName: TABLES.PRODUCTS,
        IndexName: 'sellerId-index',
        KeyConditionExpression: 'sellerId = :sellerId',
        ExpressionAttributeValues: { ':sellerId': seller.sellerId }
      }));
      const products = productsResult.Items || [];
      
      const ordersResult = await dynamoDB.send(new QueryCommand({
        TableName: TABLES.ORDERS,
        IndexName: 'sellerId-index',
        KeyConditionExpression: 'sellerId = :sellerId',
        ExpressionAttributeValues: { ':sellerId': seller.sellerId }
      }));
      const orders = ordersResult.Items || [];
      
      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const topProducts = products.slice(0, 3).map(p => p.name);
      
      return {
        id: seller.email,
        sellerId: seller.sellerId,
        businessName: seller.businessName,
        email: seller.email,
        revenue: totalRevenue,
        totalOrders,
        averageOrderValue,
        topProducts,
        status: seller.verified ? 'active' : 'pending',
        joinedDate: seller.joinedDate || new Date().toISOString(),
        category: seller.category || 'General'
      };
    }));
    
    // Return all sellers (including new ones with no revenue yet)
    res.json(sellersWithDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
});

app.get('/admin/stats', async (req, res) => {
  try {
    const [sellersResult, productsResult, ordersResult, verificationResult] = await Promise.all([
      dynamoDB.send(new ScanCommand({ TableName: TABLES.SELLERS })),
      dynamoDB.send(new ScanCommand({ TableName: TABLES.PRODUCTS })),
      dynamoDB.send(new ScanCommand({ TableName: TABLES.ORDERS })),
      dynamoDB.send(new QueryCommand({
        TableName: TABLES.VERIFICATION_REQUESTS,
        IndexName: 'status-index',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': 'pending' }
      }))
    ]);
    
    const sellers = sellersResult.Items || [];
    const products = productsResult.Items || [];
    const orders = ordersResult.Items || [];
    const verificationRequests = verificationResult.Items || [];
    
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const activeSellers = sellers.filter(s => s.verified).length;
    const pendingSellers = verificationRequests.length;
    const averageRating = sellers.reduce((sum, s) => sum + (s.rating || 0), 0) / sellers.length || 0;
    
    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      activeSellers,
      pendingSellers,
      averageRating: parseFloat(averageRating.toFixed(1))
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/products/seller/:sellerId', async (req, res) => {
  try {
    const result = await dynamoDB.send(new QueryCommand({
      TableName: TABLES.PRODUCTS,
      IndexName: 'sellerId-index',
      KeyConditionExpression: 'sellerId = :sellerId',
      ExpressionAttributeValues: { ':sellerId': req.params.sellerId }
    }));
    res.json(result.Items || []);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/orders/seller/:sellerId', async (req, res) => {
  try {
    const result = await dynamoDB.send(new QueryCommand({
      TableName: TABLES.ORDERS,
      IndexName: 'sellerId-index',
      KeyConditionExpression: 'sellerId = :sellerId',
      ExpressionAttributeValues: { ':sellerId': req.params.sellerId }
    }));
    res.json(result.Items || []);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/notifications/seller-verification', async (req, res) => {
  try {
    const { sellerId, businessName, email, documents } = req.body;

    const result = await dynamoDB.send(new GetCommand({
      TableName: TABLES.VERIFICATION_REQUESTS,
      Key: { email }
    }));
    
    if (result.Item && ['pending', 'approved'].includes(result.Item.status)) {
      return res.json({ 
        success: true, 
        message: result.Item.status === 'approved' ? 'Already verified' : 'Verification request already pending',
        verificationId: result.Item.email,
        status: result.Item.status
      });
    }

    await dynamoDB.send(new PutCommand({
      TableName: TABLES.VERIFICATION_REQUESTS,
      Item: {
        email,
        sellerId,
        businessName,
        documents,
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    }));

    console.log('📧 Sending verification email...');
    const emailResult = await sendAdminVerificationEmail({ sellerId, businessName, email, documents });
    
    if (emailResult.success) {
      console.log('✅ Email sent successfully');
    }

    res.json({ 
      success: true, 
      message: 'Verification request submitted',
      verificationId: email,
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

app.get('/admin/pending-verifications', async (req, res) => {
  try {
    // Fetch all sellers with pending verification status
    const result = await dynamoDB.send(new ScanCommand({
      TableName: TABLES.SELLERS,
      FilterExpression: 'verificationStatus = :status',
      ExpressionAttributeValues: { ':status': 'pending' }
    }));
    
    // Transform sellers data for frontend
    const pendingRequests = (result.Items || []).map(seller => ({
      _id: seller.sellerId,
      sellerId: seller.sellerId,
      businessName: seller.businessName,
      email: seller.email,
      documents: [
        { name: 'Business License', uploaded: !!seller.documents?.licenseUrl },
        { name: 'GST Certificate', uploaded: !!seller.documents?.gstUrl },
        { name: 'PAN Card', uploaded: !!seller.documents?.panUrl }
      ],
      status: seller.verificationStatus,
      submittedAt: seller.joinedDate || new Date().toISOString()
    }));
    
    // Sort by submission date (newest first)
    pendingRequests.sort((a, b) => {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
    
    console.log(`📋 Found ${pendingRequests.length} pending verification requests`);
    res.json(pendingRequests);
  } catch (error) {
    console.error('❌ Error fetching pending verifications:', error);
    res.status(500).json({ error: 'Failed to fetch pending verifications' });
  }
});

app.post('/admin/verify-seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { action, reason } = req.body;

    console.log(`📋 Admin action: ${action} for seller: ${sellerId}`);

    // Find seller by sellerId
    const scanResult = await dynamoDB.send(new ScanCommand({
      TableName: TABLES.SELLERS,
      FilterExpression: 'sellerId = :sellerId',
      ExpressionAttributeValues: { 
        ':sellerId': sellerId
      }
    }));
    
    if (!scanResult.Items || scanResult.Items.length === 0) {
      console.error(`❌ Seller not found: ${sellerId}`);
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    const seller = scanResult.Items[0];
    const email = seller.email;
    console.log(`✅ Found seller: ${seller.businessName} (${email})`);

    if (action === 'approve') {
      // Update seller status to approved using email as key
      await dynamoDB.send(new UpdateCommand({
        TableName: TABLES.SELLERS,
        Key: { email },
        UpdateExpression: 'SET verified = :verified, verificationStatus = :status, approvedAt = :approvedAt',
        ExpressionAttributeValues: {
          ':verified': true,
          ':status': 'approved',
          ':approvedAt': new Date().toISOString()
        }
      }));

      console.log(`✅ Seller approved: ${sellerId}`);

      // Send approval email to seller
      console.log(`📧 Sending approval email to ${email}...`);
      const emailResult = await sendSellerApprovalEmail(seller);
      if (emailResult.success) {
        console.log(`✅ Approval email sent successfully to ${email}`);
      } else {
        console.error(`❌ Failed to send approval email: ${emailResult.error}`);
      }

      res.json({ success: true, message: 'Seller approved successfully' });
      
    } else if (action === 'reject') {
      // Update seller status to rejected using email as key
      const updateParams: any = {
        TableName: TABLES.SELLERS,
        Key: { email },
        UpdateExpression: 'SET verified = :verified, verificationStatus = :status, rejectedAt = :rejectedAt',
        ExpressionAttributeValues: {
          ':verified': false,
          ':status': 'rejected',
          ':rejectedAt': new Date().toISOString()
        }
      };

      if (reason) {
        updateParams.UpdateExpression += ', rejectionReason = :reason';
        updateParams.ExpressionAttributeValues[':reason'] = reason;
      }

      await dynamoDB.send(new UpdateCommand(updateParams));

      console.log(`✅ Seller rejected: ${sellerId}`);

      // Send rejection email to seller
      console.log(`📧 Sending rejection email to ${email}...`);
      const emailResult = await sendSellerRejectionEmail(seller, reason || 'No reason provided');
      if (emailResult.success) {
        console.log(`✅ Rejection email sent successfully to ${email}`);
      } else {
        console.error(`❌ Failed to send rejection email: ${emailResult.error}`);
      }

      res.json({ success: true, message: 'Seller rejected successfully' });
    } else {
      res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
    }
  } catch (error) {
    console.error('❌ Error in verify-seller:', error);
    res.status(500).json({ error: 'Failed to verify seller', details: error });
  }
});

app.get('/analytics/seller/:sellerId', async (req, res) => {
  try {
    const [ordersResult, productsResult] = await Promise.all([
      dynamoDB.send(new QueryCommand({
        TableName: TABLES.ORDERS,
        IndexName: 'sellerId-index',
        KeyConditionExpression: 'sellerId = :sellerId',
        ExpressionAttributeValues: { ':sellerId': req.params.sellerId }
      })),
      dynamoDB.send(new QueryCommand({
        TableName: TABLES.PRODUCTS,
        IndexName: 'sellerId-index',
        KeyConditionExpression: 'sellerId = :sellerId',
        ExpressionAttributeValues: { ':sellerId': req.params.sellerId }
      }))
    ]);
    
    const orders = ordersResult.Items || [];
    const products = productsResult.Items || [];
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    res.json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate: 3.2,
      growthRate: 15.5,
      totalProducts: products.length
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.get('/analytics/seller/:sellerId/trends', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    const result = await dynamoDB.send(new QueryCommand({
      TableName: TABLES.ORDERS,
      IndexName: 'sellerId-index',
      KeyConditionExpression: 'sellerId = :sellerId',
      ExpressionAttributeValues: { ':sellerId': req.params.sellerId }
    }));
    
    const orders = result.Items || [];
    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(o => {
        if (!o.createdAt) return false;
        return new Date(o.createdAt).toISOString().split('T')[0] === dateStr;
      });
      
      trends.push({
        date: dateStr,
        revenue: dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        orders: dayOrders.length
      });
    }
    
    res.json(trends);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

app.get('/analytics/seller/:sellerId/top-products', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const [ordersResult, productsResult] = await Promise.all([
      dynamoDB.send(new QueryCommand({
        TableName: TABLES.ORDERS,
        IndexName: 'sellerId-index',
        KeyConditionExpression: 'sellerId = :sellerId',
        ExpressionAttributeValues: { ':sellerId': req.params.sellerId }
      })),
      dynamoDB.send(new QueryCommand({
        TableName: TABLES.PRODUCTS,
        IndexName: 'sellerId-index',
        KeyConditionExpression: 'sellerId = :sellerId',
        ExpressionAttributeValues: { ':sellerId': req.params.sellerId }
      }))
    ]);
    
    const orders = ordersResult.Items || [];
    const products = productsResult.Items || [];
    const productSales: { [key: string]: { count: number, revenue: number } } = {};
    
    orders.forEach(order => {
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach((item: any) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = { count: 0, revenue: 0 };
          }
          productSales[item.productId].count += item.quantity || 1;
          productSales[item.productId].revenue += item.price * (item.quantity || 1);
        });
      }
    });
    
    const topProducts = Object.entries(productSales)
      .map(([productId, data]) => {
        const product = products.find(p => p.productId === productId);
        return {
          productId,
          name: product?.name || 'Unknown Product',
          sales: data.count,
          revenue: data.revenue
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, Number(limit));
    
    res.json(topProducts);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

app.get('/inventory/seller/:sellerId/low-stock', async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    const result = await dynamoDB.send(new QueryCommand({
      TableName: TABLES.PRODUCTS,
      IndexName: 'sellerId-index',
      KeyConditionExpression: 'sellerId = :sellerId',
      ExpressionAttributeValues: { ':sellerId': req.params.sellerId }
    }));
    
    const lowStock = (result.Items || []).filter(product => 
      product.stock <= Number(threshold) && product.stock > 0
    );
    
    res.json(lowStock);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock' });
  }
});

app.put('/inventory/:productId/stock', async (req, res) => {
  try {
    await dynamoDB.send(new UpdateCommand({
      TableName: TABLES.PRODUCTS,
      Key: { productId: req.params.productId },
      UpdateExpression: 'SET stock = :quantity',
      ExpressionAttributeValues: { ':quantity': req.body.quantity }
    }));
    
    const result = await dynamoDB.send(new GetCommand({
      TableName: TABLES.PRODUCTS,
      Key: { productId: req.params.productId }
    }));
    
    res.json({ success: true, product: result.Item });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

app.post('/inventory/bulk-update', async (req, res) => {
  try {
    const { updates } = req.body;
    await Promise.all(
      updates.map(async (update: any) => {
        return dynamoDB.send(new UpdateCommand({
          TableName: TABLES.PRODUCTS,
          Key: { productId: update.productId },
          UpdateExpression: 'SET stock = :stock',
          ExpressionAttributeValues: { ':stock': update.stock }
        }));
      })
    );
    res.json({ success: true, updated: updates.length });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to bulk update' });
  }
});

app.put('/sellers/:sellerId', async (req, res) => {
  try {
    const queryResult = await dynamoDB.send(new QueryCommand({
      TableName: TABLES.SELLERS,
      IndexName: 'sellerId-index',
      KeyConditionExpression: 'sellerId = :sellerId',
      ExpressionAttributeValues: { ':sellerId': req.params.sellerId }
    }));
    
    if (!queryResult.Items || queryResult.Items.length === 0) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    const email = queryResult.Items[0].email;
    const updates = req.body;
    
    const updateExpressions: string[] = [];
    const expressionAttributeNames: any = {};
    const expressionAttributeValues: any = {};
    
    Object.keys(updates).forEach((key, index) => {
      if (key !== 'email') {
        updateExpressions.push(`#field${index} = :value${index}`);
        expressionAttributeNames[`#field${index}`] = key;
        expressionAttributeValues[`:value${index}`] = updates[key];
      }
    });
    
    if (updateExpressions.length > 0) {
      await dynamoDB.send(new UpdateCommand({
        TableName: TABLES.SELLERS,
        Key: { email },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }));
    }
    
    const result = await dynamoDB.send(new GetCommand({
      TableName: TABLES.SELLERS,
      Key: { email }
    }));
    
    res.json({ success: true, seller: result.Item });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update seller' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Seller Service running on port ${PORT}`);
  console.log(`📊 Using DynamoDB tables:`);
  console.log(`   - Products: ${TABLES.PRODUCTS}`);
  console.log(`   - Orders: ${TABLES.ORDERS}`);
  console.log(`   - Sellers: ${TABLES.SELLERS}`);
  console.log(`   - Verification: ${TABLES.VERIFICATION_REQUESTS}`);
});

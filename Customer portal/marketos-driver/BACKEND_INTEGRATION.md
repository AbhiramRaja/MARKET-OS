# Driver Portal - Backend Integration

## Overview
The driver portal is now fully connected to the AWS backend using AWS Amplify, AppSync (GraphQL), and DynamoDB.

## Architecture

### Backend Services
- **AWS Amplify**: Authentication and API configuration
- **AWS AppSync**: GraphQL API endpoint
- **Amazon Cognito**: User authentication
- **Amazon DynamoDB**: Order data storage

### Real-time Features
- **WebSocket Subscriptions**: Real-time order notifications
- **Live Status Updates**: Orders update automatically across all connected clients
- **Browser Notifications**: Desktop notifications for new delivery requests

## Files Created

### 1. GraphQL Operations
- `src/graphql/queries.js` - Query operations (listOrders, getOrder)
- `src/graphql/mutations.js` - Mutation operations (updateOrder)
- `src/graphql/subscriptions.js` - Real-time subscriptions (onCreateOrder, onUpdateOrder)

### 2. Services
- `src/services/OrderService.js` - Main service for order operations
  - Fetch orders from backend
  - Update order status (PENDING → IN_TRANSIT → DELIVERED)
  - Real-time subscriptions for new orders
  - Transform backend data to driver UI format

### 3. Utilities
- `src/utils/geocoding.js` - Location and distance utilities
  - City coordinate mapping
  - Distance calculation (Haversine formula)
  - Delivery time estimation
  - Address formatting

## Key Features

### 1. Order Management
```javascript
// Fetch all deliveries
const deliveries = await OrderService.getDeliveries();

// Get only pending orders
const pending = await OrderService.getPendingOrders();

// Get specific order
const order = await OrderService.getOrderById(orderId);
```

### 2. Status Updates
```javascript
// Mark order as picked up
await OrderService.markAsPickedUp(orderId);

// Mark order as delivered
await OrderService.markAsDelivered(orderId);

// Update custom status
await OrderService.updateOrderStatus(orderId, 'IN_TRANSIT');
```

### 3. Real-time Subscriptions
```javascript
// Subscribe to new orders
const subscription = OrderService.subscribeToNewOrders((newOrder) => {
  console.log('New delivery available:', newOrder);
  // Show notification, update UI, etc.
});

// Unsubscribe when component unmounts
subscription.unsubscribe();
```

## Order Status Flow

1. **PENDING** - Order placed by customer, waiting for driver pickup
2. **IN_TRANSIT** - Driver picked up order, on the way to delivery
3. **DELIVERED** - Order successfully delivered to customer
4. **CANCELLED** - Order cancelled (future implementation)

## Driver Portal UI Status Mapping

Backend Status → Driver UI Status:
- `PENDING` → `available` (Available for pickup)
- `IN_TRANSIT` → `picked` (In transit to customer)
- `DELIVERED` → `completed` (Delivered successfully)
- `CANCELLED` → `cancelled` (Cancelled order)

## Location & Geocoding

### City Coordinates
The system uses predefined coordinates for major Indian cities:
- Mumbai, Delhi, Bangalore, Hyderabad, Chennai
- Kolkata, Pune, Ahmedabad, Jaipur, Lucknow

### Distance Calculation
- Uses Haversine formula for accurate distance calculation
- Considers Earth's curvature
- Returns distance in kilometers (rounded to 1 decimal)

### Time Estimation
- Average city speed: 20 km/h
- Automatically calculates estimated delivery time
- Formats as "X mins" or "Xh Ym"

## Browser Notifications

The driver portal requests notification permissions and shows desktop notifications when:
- New delivery becomes available
- Order status updates
- Important alerts

```javascript
// Notification example
new Notification('New Delivery Available! 🚚', {
  body: `Order #${orderId} - ₹${amount}`,
  icon: '🚚'
});
```

## Usage in DriversPage Component

### 1. Initialization
```javascript
useEffect(() => {
  loadDriverData();
  
  // Subscribe to real-time updates
  const subscription = OrderService.subscribeToNewOrders(handleNewOrder);
  
  return () => subscription.unsubscribe();
}, []);
```

### 2. Loading Orders
```javascript
const loadDriverData = async () => {
  try {
    const orders = await OrderService.getDeliveries();
    setDeliveries(orders);
    calculateStats(orders);
  } catch (error) {
    console.error('Error loading deliveries:', error);
  }
};
```

### 3. Updating Status
```javascript
const handlePickupComplete = async (deliveryId) => {
  await OrderService.markAsPickedUp(deliveryId);
  // UI updates automatically via subscription
};

const handleDeliveryComplete = async (deliveryId) => {
  await OrderService.markAsDelivered(deliveryId);
  // Status updated in backend and synced to customer portal
};
```

## Data Flow

### Customer Places Order
1. Customer completes checkout in customer portal
2. Order created in DynamoDB with status `PENDING`
3. AppSync triggers `onCreateOrder` subscription
4. Driver portal receives real-time notification
5. New delivery appears in "Available" tab
6. Browser notification shown to driver

### Driver Accepts & Delivers
1. Driver clicks "Accept Delivery"
2. Driver navigates to pickup location
3. Driver clicks "Picked Up" → Status updates to `IN_TRANSIT`
4. Backend updates via `updateOrder` mutation
5. Customer portal shows "Out for Delivery"
6. Driver delivers and clicks "Complete"
7. Status updates to `DELIVERED`
8. Customer receives confirmation

## Error Handling

All service methods include try-catch error handling:
```javascript
try {
  const result = await OrderService.someMethod();
  return result;
} catch (error) {
  console.error('Error:', error);
  throw new Error('User-friendly error message');
}
```

The UI components catch these errors and show appropriate alerts to the driver.

## Future Enhancements

### 1. Advanced Geocoding
- Integrate Google Maps Geocoding API
- Real address-to-coordinate conversion
- Accurate distance and route calculation

### 2. Route Optimization
- Multiple delivery batching
- Optimal route planning
- Traffic-aware time estimation

### 3. Driver Assignment
- Automatic driver assignment algorithm
- Based on proximity, availability, rating
- Load balancing across drivers

### 4. Enhanced Tracking
- Live driver location tracking
- Real-time ETA updates
- Customer tracking interface

### 5. Payment Integration
- Cash on delivery confirmation
- Digital payment verification
- Earnings tracking and payout

## Testing

### Test New Order Flow
1. Place an order in customer portal
2. Check driver portal - should see new delivery immediately
3. Check browser notification
4. Verify order details match

### Test Status Updates
1. Accept a delivery
2. Mark as picked up
3. Verify status updates in both portals
4. Mark as delivered
5. Check final status synchronization

## Configuration

Backend configuration is in `aws-exports.js`:
```javascript
{
  "aws_appsync_graphqlEndpoint": "https://...",
  "aws_appsync_region": "ap-south-1",
  "aws_cognito_region": "ap-south-1",
  "aws_user_pools_id": "...",
  // ...
}
```

## Summary

✅ **Fully Connected**: Driver portal now uses real backend data
✅ **Real-time**: WebSocket subscriptions for instant updates
✅ **Synchronized**: Status changes reflect across customer and driver portals
✅ **Production Ready**: Error handling, notifications, data transformation
✅ **Scalable**: AWS managed services handle load automatically

The driver portal is now a fully functional delivery management system with real-time capabilities!

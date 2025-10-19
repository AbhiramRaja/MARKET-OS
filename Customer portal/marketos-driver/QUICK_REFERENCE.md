# Driver Portal Backend - Quick Reference

## 🚀 Quick Start

```bash
cd marketos-driver
npm install
npm start
```

## 📦 Core Files

| File | Purpose |
|------|---------|
| `src/services/OrderService.js` | Main backend service |
| `src/pages/DriversPage.jsx` | Main UI component |
| `src/graphql/queries.js` | GraphQL queries |
| `src/graphql/mutations.js` | GraphQL mutations |
| `src/graphql/subscriptions.js` | WebSocket subscriptions |
| `src/utils/geocoding.js` | Location utilities |

## 🔌 API Quick Reference

### Fetch Orders
```javascript
// Get all orders
const orders = await OrderService.getOrders();

// Get pending only
const pending = await OrderService.getPendingOrders();

// Get specific order
const order = await OrderService.getOrderById('order-id');

// Get as deliveries (UI format)
const deliveries = await OrderService.getDeliveries();
```

### Update Status
```javascript
// Mark as picked up (IN_TRANSIT)
await OrderService.markAsPickedUp(orderId);

// Mark as delivered (DELIVERED)
await OrderService.markAsDelivered(orderId);

// Custom status update
await OrderService.updateOrderStatus(orderId, 'PENDING');
```

### Real-time Subscriptions
```javascript
// Subscribe to new orders
const subscription = OrderService.subscribeToNewOrders((order) => {
  console.log('New order:', order);
});

// Unsubscribe when done
subscription.unsubscribe();

// Subscribe to updates
OrderService.subscribeToOrderUpdates((order) => {
  console.log('Order updated:', order);
});
```

## 📍 Location Utilities

```javascript
import { 
  getCityCoordinates, 
  calculateDistance,
  estimateDeliveryTime 
} from '../utils/geocoding';

// Get coordinates
const coords = getCityCoordinates('bangalore'); // [12.9716, 77.5946]

// Calculate distance
const distance = calculateDistance(
  [12.9716, 77.5946],  // From
  [12.9352, 77.6245]   // To
); // Returns: 3.8 (km)

// Estimate time
const time = estimateDeliveryTime(3.8); // "11 mins"
```

## 🔄 Status Values

| Backend | UI | Description |
|---------|-----|-------------|
| PENDING | available | Ready for pickup |
| IN_TRANSIT | picked | Out for delivery |
| DELIVERED | completed | Delivered successfully |
| CANCELLED | cancelled | Order cancelled |

## 🎯 Common Patterns

### Pattern 1: Load and Subscribe
```javascript
useEffect(() => {
  // Initial load
  const loadData = async () => {
    const orders = await OrderService.getDeliveries();
    setDeliveries(orders);
  };
  loadData();

  // Real-time updates
  const sub = OrderService.subscribeToNewOrders((newOrder) => {
    setDeliveries(prev => [newOrder, ...prev]);
  });

  return () => sub.unsubscribe();
}, []);
```

### Pattern 2: Update with Error Handling
```javascript
const handlePickup = async (id) => {
  try {
    await OrderService.markAsPickedUp(id);
    alert('Success!');
  } catch (error) {
    console.error(error);
    alert('Failed. Try again.');
  }
};
```

### Pattern 3: Browser Notifications
```javascript
// Request permission
if ('Notification' in window) {
  Notification.requestPermission();
}

// Show notification
if (Notification.permission === 'granted') {
  new Notification('New Delivery! 🚚', {
    body: `Order #${orderId} - ₹${amount}`
  });
}
```

## 🐛 Debugging

### Check Logs
```javascript
// Service logs
console.log('Orders fetched:', response);
console.log('Order status updated:', order);
console.log('New order notification:', newOrder);

// Error logs
console.error('Error fetching orders:', error);
```

### Browser DevTools
```
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "graphql"
4. Check requests/responses
```

### Test Queries Manually
```javascript
// In browser console
const testQuery = async () => {
  const orders = await OrderService.getOrders();
  console.log(orders);
};
testQuery();
```

## 📊 Data Structures

### Order Object (Backend)
```javascript
{
  id: "order-123",
  userId: "user-456",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+91 98765 43210",
  items: [
    {
      id: "item-1",
      productId: "prod-1",
      name: "Product Name",
      price: 299.99,
      quantity: 2,
      image: "url"
    }
  ],
  shippingAddress: {
    fullName: "John Doe",
    phone: "+91 98765 43210",
    addressLine1: "123 Street",
    addressLine2: "Apt 4",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001"
  },
  subtotal: 599.98,
  deliveryFee: 40.00,
  total: 639.98,
  paymentMethod: "cod",
  deliveryType: "standard",
  status: "PENDING",
  createdAt: "2025-10-17T10:30:00Z",
  updatedAt: "2025-10-17T10:30:00Z"
}
```

### Delivery Object (UI)
```javascript
{
  id: "order-123",
  orderId: "order-123",
  customerName: "John Doe",
  customerPhone: "+91 98765 43210",
  address: "123 Street, Apt 4, Bangalore, Karnataka - 560001",
  pickupLocation: "123 Street",
  deliveryLocation: "123 Street, Apt 4, Bangalore, Karnataka - 560001",
  pickupCoords: { lat: 12.9716, lng: 77.5946 },
  deliveryCoords: { lat: 12.9352, lng: 77.6245 },
  status: "available",
  items: 2,
  amount: 639.98,
  distance: "3.8 km",
  estimatedTime: "11 mins",
  pickupTime: "10:30 AM",
  estimatedDelivery: "10:41 AM",
  orderDetails: { /* full order object */ }
}
```

## 🔐 Authentication

```javascript
import { fetchAuthSession } from 'aws-amplify/auth';

// Get current user session
const session = await fetchAuthSession();
console.log('User:', session.userSub);
console.log('Tokens:', session.tokens);
```

## ⚡ Performance Tips

1. **Batch Updates**: Update multiple orders together
2. **Lazy Loading**: Load orders on-demand for large lists
3. **Caching**: Cache frequently accessed orders
4. **Debouncing**: Debounce search/filter operations
5. **Pagination**: Use nextToken for large datasets

## 🎨 UI States

```javascript
// Loading
if (loading) return <LoadingSpinner />;

// Error
if (error) return <ErrorMessage error={error} />;

// Empty
if (deliveries.length === 0) return <EmptyState />;

// Success
return <DeliveryList deliveries={deliveries} />;
```

## 📱 Notifications Setup

```javascript
// Check support
const supported = 'Notification' in window;

// Check permission
const permission = Notification.permission; // "default" | "granted" | "denied"

// Request permission
const result = await Notification.requestPermission();

// Show notification
new Notification(title, {
  body: 'Message',
  icon: '🚚',
  badge: 'badge.png',
  tag: 'order-123', // Unique ID
  requireInteraction: false
});
```

## 🔗 Useful Links

- [AWS Amplify Docs](https://docs.amplify.aws/)
- [AppSync GraphQL](https://docs.aws.amazon.com/appsync/)
- [React Hooks](https://react.dev/reference/react)
- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Orders not loading | Check AWS config, verify credentials |
| No notifications | Check browser permission settings |
| Subscription not working | Check WebSocket connection in Network tab |
| Status update fails | Verify order ID, check IAM permissions |
| Distance wrong | Update city coordinates in geocoding.js |

## 📝 Code Snippets

### Filter Orders by Status
```javascript
const available = deliveries.filter(d => d.status === 'available');
const active = deliveries.filter(d => d.status === 'picked');
const completed = deliveries.filter(d => d.status === 'completed');
```

### Calculate Today's Stats
```javascript
const today = deliveries.filter(d => {
  const orderDate = new Date(d.createdAt);
  const todayDate = new Date();
  return orderDate.toDateString() === todayDate.toDateString();
});

const completed = today.filter(d => d.status === 'completed');
const earnings = completed.reduce((sum, d) => sum + d.amount, 0);
```

### Format Currency
```javascript
const formatCurrency = (amount) => {
  return `₹${amount.toFixed(2)}`;
};
```

### Format Time
```javascript
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
```

## ✅ Testing Checklist

- [ ] Page loads without errors
- [ ] Orders display correctly
- [ ] Can update status
- [ ] Real-time notifications work
- [ ] Browser notifications appear
- [ ] Multiple tabs sync
- [ ] Stats calculate correctly
- [ ] Error handling works
- [ ] UI responsive on mobile

## 🎯 Next Steps

1. Test with real orders
2. Monitor CloudWatch logs
3. Set up error tracking
4. Add analytics
5. Optimize performance
6. Deploy to production

---

**Quick Tip**: Keep this file open in a split view while developing! 💡

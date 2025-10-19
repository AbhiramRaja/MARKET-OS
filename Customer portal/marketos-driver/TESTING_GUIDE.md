# Testing the Driver Portal Backend Integration

## Quick Start Guide

### Prerequisites
1. Driver portal is running on port 3001
2. Customer portal is running on port 3000
3. AWS Amplify is configured with valid credentials
4. DynamoDB tables are set up

### Test Scenario 1: View Existing Orders

1. **Open Driver Portal**
   ```
   http://localhost:3001
   ```

2. **Login with driver credentials**
   - The portal will fetch all orders from the backend
   - You should see orders in different tabs based on status

3. **Check Console Logs**
   ```
   Orders fetched: X
   Loaded deliveries from backend: [...]
   ```

### Test Scenario 2: Real-time Order Notifications

1. **Keep Driver Portal Open**
   - Make sure notifications are enabled (browser will prompt)

2. **Open Customer Portal in Another Tab**
   ```
   http://localhost:3000
   ```

3. **Place a New Order**
   - Add items to cart
   - Complete checkout
   - Place order

4. **Watch Driver Portal**
   - Should receive browser notification immediately
   - New order appears in "Available" tab without refresh
   - Console shows: "New order notification: {...}"

### Test Scenario 3: Order Status Updates

1. **In Driver Portal, go to "Available" tab**

2. **Click "Accept Delivery" on an order**
   - Status changes to accepted
   - Order moves to "Active" tab

3. **Click "Picked Up" button**
   - Backend updates to `IN_TRANSIT` status
   - Console shows: "Order status updated: {...}"
   - Customer portal (if open) shows "Out for Delivery"

4. **Click "Complete Delivery" button**
   - Backend updates to `DELIVERED` status
   - Order moves to "Completed" tab
   - Stats update (today's deliveries, earnings)

### Test Scenario 4: Verify Synchronization

1. **Open TWO Driver Portal tabs**
   - Both logged in as driver

2. **In Tab 1: Update an order status**

3. **In Tab 2: Watch for automatic update**
   - Should see the order status change in real-time
   - No page refresh needed

### Debugging

#### Check GraphQL Queries
Open browser console in driver portal:
```javascript
// You should see these logs:
"Orders fetched: X"
"New order received: {...}"
"Order updated: {...}"
"Order status updated: {...}"
```

#### Check Network Tab
1. Open DevTools → Network tab
2. Filter by "graphql"
3. You should see:
   - `listOrders` query on page load
   - `updateOrder` mutation when status changes
   - WebSocket connections for subscriptions

#### Check Subscriptions
In console:
```javascript
// When new order is placed
"New order notification: {...}"

// When order is updated
"Order updated: {...}"
```

### Common Issues & Solutions

#### Issue: "Failed to fetch orders"
**Solution:**
- Check AWS credentials
- Verify AppSync endpoint in aws-exports.js
- Check Cognito authentication

#### Issue: No real-time notifications
**Solution:**
- Check browser notification permissions
- Verify WebSocket connection in Network tab
- Look for subscription errors in console

#### Issue: Orders not appearing
**Solution:**
- Ensure orders exist in DynamoDB
- Check GraphQL query filters
- Verify status values match schema

#### Issue: Status update fails
**Solution:**
- Check mutation syntax
- Verify order ID is valid
- Check IAM permissions for updateOrder

### Expected Behavior

#### On Page Load
```
✓ Fetches all orders from backend
✓ Transforms to delivery format
✓ Calculates distances and times
✓ Groups by status (available/active/completed)
✓ Updates statistics
```

#### On New Order (Real-time)
```
✓ Receives WebSocket event
✓ Shows browser notification
✓ Adds to deliveries list
✓ Updates stats
✓ No page refresh needed
```

#### On Status Update
```
✓ Calls updateOrder mutation
✓ Updates backend (DynamoDB)
✓ Broadcasts to all subscribed clients
✓ Updates local state
✓ Shows success message
```

### API Endpoints Used

1. **listOrders** - GET all orders
   ```graphql
   query ListOrders($filter: ModelOrderFilterInput)
   ```

2. **updateOrder** - UPDATE order status
   ```graphql
   mutation UpdateOrder($input: UpdateOrderInput!)
   ```

3. **onCreateOrder** - SUBSCRIBE to new orders
   ```graphql
   subscription OnCreateOrder
   ```

4. **onUpdateOrder** - SUBSCRIBE to order updates
   ```graphql
   subscription OnUpdateOrder
   ```

### Verification Checklist

- [ ] Driver portal loads without errors
- [ ] Orders appear in correct tabs by status
- [ ] Can accept available deliveries
- [ ] Can mark orders as picked up
- [ ] Can mark orders as delivered
- [ ] Real-time notifications work
- [ ] Browser notifications appear
- [ ] Stats update correctly
- [ ] Multiple tabs sync in real-time
- [ ] Customer portal shows correct order status

### Performance Notes

- **Initial Load**: ~1-2 seconds (fetches all orders)
- **Status Update**: ~500ms (mutation + update)
- **Real-time Notification**: Instant (<100ms)
- **Subscription Latency**: <500ms

### Next Steps After Testing

1. **Test with Multiple Drivers**
   - Open multiple driver sessions
   - Verify orders appear for all drivers
   - Test concurrent status updates

2. **Load Testing**
   - Place multiple orders rapidly
   - Check if all appear in driver portal
   - Verify no duplicate notifications

3. **Error Recovery**
   - Disconnect internet
   - Reconnect
   - Verify subscriptions resume

4. **Production Preparation**
   - Add error boundaries
   - Implement retry logic
   - Add loading states
   - Improve error messages

## Success Indicators

✅ **Backend Connected**: Orders loaded from DynamoDB
✅ **Real-time Working**: New orders appear instantly  
✅ **Status Updates**: Changes reflect immediately
✅ **Notifications**: Browser alerts for new deliveries
✅ **Synchronization**: Multiple sessions stay in sync
✅ **Data Accuracy**: Order details match across portals

## Support

If you encounter issues:
1. Check console for error messages
2. Verify AWS configuration
3. Test GraphQL queries in AppSync console
4. Check DynamoDB table data
5. Review CloudWatch logs

Happy Testing! 🚚✨

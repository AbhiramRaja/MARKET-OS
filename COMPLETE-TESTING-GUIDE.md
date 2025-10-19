# 🧪 Complete Integration Testing Guide

## 🎯 Goal
Test the complete order flow across all 3 portals:
**Customer → Seller → Driver**

---

## 📋 Prerequisites

Make sure you have:
- ✅ Customer Portal code
- ✅ Driver Portal code  
- ✅ Seller Portal code (with beautiful new UI!)
- ✅ AWS AppSync configured
- ✅ All dependencies installed

---

## 🚀 Step 1: Start All Three Portals

### Terminal 1 - Customer Portal (Port 3000)
```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal"
npm start
```
**Wait for:** `Compiled successfully!` then open http://localhost:3000

### Terminal 2 - Seller Portal (Port 3002)
```bash
cd /Users/abhi/Documents/AWS-HACKATHON/MarketOS_Seller-main/frontend/seller-portal
npm run dev
```
**Wait for:** `ready in XXX ms` then open http://localhost:3002

### Terminal 3 - Driver Portal (Port 3001)
```bash
cd "/Users/abhi/Documents/AWS-HACKATHON/Customer portal/marketos-driver"
PORT=3001 npm start
```
**Wait for:** `Compiled successfully!` then open http://localhost:3001

---

## 🧪 Step 2: Test Order Flow

### Phase 1: Customer Places Order

1. **Open Customer Portal:** http://localhost:3000
   
2. **Login/Signup:**
   - Create account or login
   - Use any email/password (demo mode)

3. **Browse Products:**
   - Should see product catalog
   - Add items to cart

4. **Checkout:**
   - Fill shipping address
   - Select delivery type (Standard/Express)
   - Choose payment method
   - Click "Place Order"

5. **Verify:**
   - ✅ Order confirmation page shows
   - ✅ Order ID displayed
   - ✅ Status shows "PENDING"

---

### Phase 2: Seller Receives Order

1. **Open Seller Portal:** http://localhost:3002

2. **Login:**
   - Click through login (demo mode)
   - You'll land on Dashboard

3. **Go to Orders Tab:**
   - Click "🛍️ Orders" in navigation

4. **Wait for Order (5 seconds max):**
   - Orders auto-refresh every 5 seconds
   - Or click "🔄 Refresh" button manually

5. **Verify:**
   - ✅ Order appears in list
   - ✅ Customer name shown
   - ✅ Total amount displayed
   - ✅ Status: "PENDING"
   - ✅ "Live Updates" panel shows activity

6. **Update Order Status:**
   - Click "Advance Status" button
   - Status: PENDING → CONFIRMED
   - Click again: CONFIRMED → OUT_FOR_DELIVERY
   - Click once more: OUT_FOR_DELIVERY → DELIVERED

7. **Verify:**
   - ✅ Status updates in main order list
   - ✅ "Live Updates" shows status changes
   - ✅ Button becomes disabled at DELIVERED

---

### Phase 3: Driver Receives Delivery

1. **Open Driver Portal:** http://localhost:3001

2. **Login:**
   - Use driver credentials
   - Or create driver account

3. **View Orders:**
   - Should see orders with status "OUT_FOR_DELIVERY"
   - Orders ready for delivery

4. **Accept Delivery:**
   - Click on order
   - Update delivery status
   - Mark as delivered

5. **Verify:**
   - ✅ Order appears when status = OUT_FOR_DELIVERY
   - ✅ Can update delivery status
   - ✅ Real-time updates work

---

## ✅ Success Criteria

### Customer Portal:
- [x] Can browse products
- [x] Can add to cart
- [x] Can place order
- [x] Order confirmation works
- [x] Can view order status

### Seller Portal:
- [x] Beautiful login page loads
- [x] Dashboard navigation works
- [x] Orders tab shows orders
- [x] Auto-refresh every 5 seconds
- [x] Manual refresh button works
- [x] "Advance Status" updates order
- [x] Live Updates feed shows changes
- [x] No errors in console

### Driver Portal:
- [x] Can login
- [x] Sees OUT_FOR_DELIVERY orders
- [x] Can update delivery status
- [x] Real-time subscriptions work

---

## 🔍 What to Watch For

### In Browser DevTools Console:

**Customer Portal:**
```
✅ "Order placed successfully"
✅ GraphQL mutation response
✅ No errors
```

**Seller Portal:**
```
✅ "Orders fetched: [...]"
✅ Apollo Client queries working
✅ Polling every 5 seconds
✅ No WebSocket errors (we use polling now!)
```

**Driver Portal:**
```
✅ Subscription connected
✅ Order updates received
✅ No errors
```

---

## 🐛 Troubleshooting

### Order doesn't appear in Seller Portal?
- Check seller portal console for errors
- Click "🔄 Refresh" button manually
- Verify AppSync URL in .env is correct
- Check order was actually created in Customer portal

### Status update doesn't work?
- Check GraphQL mutation in Network tab
- Verify order ID is correct
- Check AppSync API key permissions

### Driver doesn't see order?
- Order must be "OUT_FOR_DELIVERY" status first
- Use Seller portal to advance status
- Check subscription is connected

---

## 📊 Expected Timeline

| Action | Portal | Time | Result |
|--------|--------|------|--------|
| Place order | Customer | Instant | Order created |
| Order appears | Seller | < 5 sec | Auto-refresh |
| Update to CONFIRMED | Seller | Instant | Status updated |
| Update to OUT_FOR_DELIVERY | Seller | Instant | Driver notified |
| Order appears | Driver | < 1 sec | Subscription |
| Mark delivered | Driver | Instant | Status updated |

---

## 🎉 Complete Flow Example

```
Time 0:00 - Customer adds laptop (₹50,000) to cart
Time 0:30 - Customer proceeds to checkout
Time 1:00 - Customer fills address, selects Express delivery
Time 1:30 - Customer clicks "Place Order"
Time 1:31 - Order #abc123 created, status: PENDING

Time 1:36 - [SELLER] Order appears in Orders tab (auto-refresh)
Time 1:40 - [SELLER] Clicks "Advance Status" → CONFIRMED
Time 1:45 - [SELLER] Clicks "Advance Status" → OUT_FOR_DELIVERY

Time 1:46 - [DRIVER] Order appears in delivery queue
Time 2:00 - [DRIVER] Accepts delivery, starts route
Time 2:30 - [DRIVER] Arrives at customer location
Time 2:31 - [DRIVER] Marks as DELIVERED

Time 2:32 - [CUSTOMER] Sees status: DELIVERED ✅
Time 2:32 - [SELLER] Sees status: DELIVERED ✅
```

---

## 📸 Screenshots to Take

For demo/presentation:

1. **Customer Portal:**
   - Product catalog
   - Shopping cart
   - Checkout page
   - Order confirmation

2. **Seller Portal:**
   - Beautiful login page
   - Dashboard overview
   - Orders tab with order list
   - Status update in action
   - Live Updates feed

3. **Driver Portal:**
   - Order list
   - Delivery details
   - Route map (if implemented)

---

## 🚀 Ready to Test?

1. Start all 3 portals
2. Open 3 browser windows side-by-side
3. Follow the flow above
4. Watch the magic happen! ✨

**Let's go!** 🎯

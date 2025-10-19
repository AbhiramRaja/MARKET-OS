# Driver Portal Backend Integration - Visual Guide

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER PORTAL                              │
│                       (Port 3000)                                    │
│                                                                      │
│  User places order → Cart → Checkout → OrderService.createOrder()  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTPS POST
                                 │ GraphQL Mutation: createOrder
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS APPSYNC                                  │
│                    GraphQL API Endpoint                              │
│              ap-south-1.amazonaws.com                                │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Queries    │  │  Mutations   │  │Subscriptions │             │
│  │              │  │              │  │              │             │
│  │ - listOrders │  │- createOrder │  │-onCreateOrder│             │
│  │ - getOrder   │  │- updateOrder │  │-onUpdateOrder│             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ Read/Write
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DYNAMODB                                     │
│                      Orders Table                                    │
│                                                                      │
│  Primary Key: id (String)                                           │
│  Attributes: userId, customerName, items, status, address, etc.     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ WebSocket (Real-time)
                                 │ Subscription Events
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DRIVER PORTAL                                │
│                       (Port 3001)                                    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    DriversPage.jsx                          │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │          useEffect() Hook                             │  │   │
│  │  │                                                        │  │   │
│  │  │  1. loadDriverData()                                  │  │   │
│  │  │     ↓                                                  │  │   │
│  │  │  2. OrderService.getDeliveries()                      │  │   │
│  │  │     ↓                                                  │  │   │
│  │  │  3. setDeliveries(orders)                             │  │   │
│  │  │                                                        │  │   │
│  │  │  4. subscribeToNewOrders()                            │  │   │
│  │  │     ↓                                                  │  │   │
│  │  │  5. Real-time notifications                           │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │          User Actions                                 │  │   │
│  │  │                                                        │  │   │
│  │  │  • Accept Delivery                                    │  │   │
│  │  │  • Mark as Picked Up → OrderService.markAsPickedUp() │  │   │
│  │  │  • Complete Delivery → OrderService.markAsDelivered()│  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    OrderService.js                          │   │
│  │                                                              │   │
│  │  Queries:                                                   │   │
│  │  • getOrders()          → List all orders                  │   │
│  │  • getPendingOrders()   → Filter PENDING only             │   │
│  │  • getOrderById()       → Get specific order              │   │
│  │                                                              │   │
│  │  Mutations:                                                 │   │
│  │  • updateOrderStatus()  → Update status                   │   │
│  │  • markAsPickedUp()     → Set IN_TRANSIT                  │   │
│  │  • markAsDelivered()    → Set DELIVERED                   │   │
│  │                                                              │   │
│  │  Subscriptions:                                             │   │
│  │  • subscribeToNewOrders() → WebSocket: onCreateOrder      │   │
│  │  • subscribeToOrderUpdates() → WebSocket: onUpdateOrder   │   │
│  │                                                              │   │
│  │  Utilities:                                                 │   │
│  │  • transformOrderToDelivery() → Format data for UI        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    geocoding.js                             │   │
│  │                                                              │   │
│  │  • getCityCoordinates() → Get lat/lng for city            │   │
│  │  • calculateDistance()  → Haversine formula                │   │
│  │  • estimateDeliveryTime() → Based on distance             │   │
│  │  • formatAddress()      → Pretty print address            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence Diagrams

### 1. Order Creation & Real-time Notification

```
Customer Portal          AppSync              DynamoDB           Driver Portal
      │                    │                     │                    │
      │  Place Order       │                     │                    │
      ├───────────────────→│                     │                    │
      │  createOrder       │                     │                    │
      │  mutation          │   Save Order        │                    │
      │                    ├────────────────────→│                    │
      │                    │                     │                    │
      │  Order Created     │                     │                    │
      │←───────────────────┤                     │                    │
      │                    │                     │                    │
      │                    │  WebSocket Event    │                    │
      │                    │  (onCreateOrder)    │                    │
      │                    ├────────────────────────────────────────→│
      │                    │                     │                    │
      │                    │                     │  Show Notification │
      │                    │                     │  Add to List       │
      │                    │                     │  ✅ New Order!     │
```

### 2. Driver Updates Order Status

```
Driver Portal          OrderService         AppSync              DynamoDB
      │                    │                     │                     │
      │  Click "Picked Up" │                     │                     │
      ├───────────────────→│                     │                     │
      │                    │  markAsPickedUp()   │                     │
      │                    ├────────────────────→│                     │
      │                    │  updateOrder        │                     │
      │                    │  mutation           │   Update status     │
      │                    │                     ├────────────────────→│
      │                    │                     │   (IN_TRANSIT)      │
      │                    │  Success            │                     │
      │                    │←────────────────────┤                     │
      │  Status Updated    │                     │                     │
      │←───────────────────┤                     │                     │
      │  Show Alert ✅     │                     │                     │
```

### 3. Multi-Device Synchronization

```
Driver 1 Portal        AppSync             DynamoDB          Driver 2 Portal
      │                   │                    │                    │
      │  Update Status    │                    │                    │
      ├──────────────────→│                    │                    │
      │                   │  Write to DB       │                    │
      │                   ├───────────────────→│                    │
      │                   │                    │                    │
      │  Success          │                    │                    │
      │←──────────────────┤                    │                    │
      │                   │                    │                    │
      │                   │  WebSocket Event   │                    │
      │                   │  (onUpdateOrder)   │                    │
      │                   ├───────────────────────────────────────→│
      │                   │                    │                    │
      │                   │                    │  Auto-update UI    │
      │                   │                    │  🔄 Synchronized   │
```

## Component Interaction Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         DriversPage                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  State:                                                          │
│  ├─ deliveries: Array<Delivery>                                │
│  ├─ stats: { todayDeliveries, todayEarnings, ... }             │
│  ├─ loading: boolean                                            │
│  └─ activeTab: 'available' | 'active' | 'completed'            │
│                                                                  │
│  Effects:                                                        │
│  ├─ loadDriverData()                    [on mount]             │
│  ├─ subscribeToNewOrders()              [on mount]             │
│  └─ subscribeToOrderUpdates()           [on mount]             │
│                                                                  │
│  Handlers:                                                       │
│  ├─ handleAcceptDelivery(id)           → Update local state    │
│  ├─ handlePickupComplete(id)           → OrderService API      │
│  └─ handleDeliveryComplete(id)         → OrderService API      │
│                                                                  │
│  Children:                                                       │
│  ├─ Stats Cards (4 cards with metrics)                         │
│  ├─ Tab Navigation (Available/Active/Completed)                │
│  ├─ Delivery Cards (filtered by activeTab)                     │
│  └─ RouteMap Modal (when delivery selected)                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ uses
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         OrderService                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Dependencies:                                                   │
│  ├─ aws-amplify/api (generateClient)                           │
│  ├─ graphql/queries.js                                          │
│  ├─ graphql/mutations.js                                        │
│  ├─ graphql/subscriptions.js                                    │
│  └─ utils/geocoding.js                                          │
│                                                                  │
│  Methods:                                                        │
│  ├─ getOrders(options)                 → Promise<Order[]>      │
│  ├─ getPendingOrders()                 → Promise<Order[]>      │
│  ├─ getOrderById(id)                   → Promise<Order>        │
│  ├─ updateOrderStatus(id, status)      → Promise<Order>        │
│  ├─ markAsPickedUp(id)                 → Promise<Order>        │
│  ├─ markAsDelivered(id)                → Promise<Order>        │
│  ├─ subscribeToNewOrders(callback)     → Subscription          │
│  ├─ subscribeToOrderUpdates(callback)  → Subscription          │
│  ├─ transformOrderToDelivery(order)    → Delivery              │
│  └─ getDeliveries()                    → Promise<Delivery[]>   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ uses
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Geocoding Utils                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Constants:                                                      │
│  └─ CITY_COORDINATES: Map<string, [lat, lng]>                  │
│                                                                  │
│  Functions:                                                      │
│  ├─ getCityCoordinates(city)           → [lat, lng]            │
│  ├─ getRandomNearbyCoordinates()       → [lat, lng]            │
│  ├─ calculateDistance(coords1, coords2) → number (km)          │
│  ├─ estimateDeliveryTime(distance)     → string (time)         │
│  ├─ formatAddress(address)             → string                │
│  ├─ getPickupLocation(address)         → string                │
│  └─ getCoordinatesFromAddress(addr)    → [lat, lng]            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Status State Machine

```
┌─────────────┐
│   PENDING   │  ← Order created by customer
└──────┬──────┘
       │
       │ Driver clicks "Picked Up"
       │ OrderService.markAsPickedUp()
       │
       ▼
┌─────────────┐
│ IN_TRANSIT  │  ← Package with driver
└──────┬──────┘
       │
       │ Driver clicks "Complete"
       │ OrderService.markAsDelivered()
       │
       ▼
┌─────────────┐
│  DELIVERED  │  ← Successfully delivered
└─────────────┘

Alternative path:
┌─────────────┐
│   PENDING   │
└──────┬──────┘
       │
       │ Order cancelled
       │ OrderService.updateOrderStatus(id, 'CANCELLED')
       │
       ▼
┌─────────────┐
│  CANCELLED  │  ← Order cancelled (future)
└─────────────┘
```

## Real-time Subscription Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     WebSocket Connection                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Component Mounts                                             │
│     ↓                                                             │
│  2. OrderService.subscribeToNewOrders(callback)                  │
│     ↓                                                             │
│  3. client.graphql({ query: onCreateOrder }).subscribe()         │
│     ↓                                                             │
│  4. WebSocket opens to AppSync                                   │
│     ↓                                                             │
│  5. Connection established ✅                                     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              Listening for events...                    │     │
│  │                                                          │     │
│  │  Event: New Order Created                              │     │
│  │    ↓                                                    │     │
│  │  Callback fires with new order data                    │     │
│  │    ↓                                                    │     │
│  │  DriversPage receives notification                     │     │
│  │    ↓                                                    │     │
│  │  Update state: setDeliveries([newOrder, ...prev])     │     │
│  │    ↓                                                    │     │
│  │  Show browser notification                             │     │
│  │    ↓                                                    │     │
│  │  UI updates automatically 🔔                           │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
│  6. Component Unmounts                                           │
│     ↓                                                             │
│  7. subscription.unsubscribe()                                   │
│     ↓                                                             │
│  8. WebSocket closes                                             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## File Dependency Graph

```
DriversPage.jsx
    │
    ├─→ OrderService.js
    │       │
    │       ├─→ graphql/queries.js
    │       │       └─→ listOrders
    │       │       └─→ getOrder
    │       │
    │       ├─→ graphql/mutations.js
    │       │       └─→ updateOrder
    │       │
    │       ├─→ graphql/subscriptions.js
    │       │       └─→ onCreateOrder
    │       │       └─→ onUpdateOrder
    │       │
    │       └─→ utils/geocoding.js
    │               └─→ calculateDistance()
    │               └─→ estimateDeliveryTime()
    │               └─→ formatAddress()
    │
    └─→ components/RouteMap.jsx
```

## Summary

This visual guide shows:
- ✅ Complete system architecture
- ✅ Data flow between components
- ✅ Real-time synchronization mechanisms
- ✅ Status update sequences
- ✅ Component interactions
- ✅ File dependencies

All diagrams are ASCII-art based for easy viewing in any text editor or terminal! 📊

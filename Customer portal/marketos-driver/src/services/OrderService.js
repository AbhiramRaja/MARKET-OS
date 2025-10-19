import { generateClient } from 'aws-amplify/api';
import { listOrders, getOrder } from '../graphql/queries';
import { updateOrder } from '../graphql/mutations';
import { onCreateOrder, onUpdateOrder } from '../graphql/subscriptions';
import { 
  getCoordinatesFromAddress, 
  calculateDistance, 
  estimateDeliveryTime,
  formatAddress,
  getPickupLocation,
  getCityCoordinates
} from '../utils/geocoding';

const client = generateClient();

class OrderService {
  /**
   * Get all orders for drivers
   * Filters can be applied to get orders by status
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of orders
   */
  async getOrders(options = {}) {
    try {
      const { status = null, limit = 100 } = options;
      
      const variables = {
        limit: limit
      };

      // Add status filter if provided
      if (status) {
        variables.filter = {
          status: {
            eq: status
          }
        };
      }

      const response = await client.graphql({
        query: listOrders,
        variables: variables
      });

      console.log('Orders fetched:', response.data.listOrders.items.length);
      return response.data.listOrders.items;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  /**
   * Get pending orders that need to be delivered
   * @returns {Promise<Array>} List of pending orders
   */
  async getPendingOrders() {
    return this.getOrders({ status: 'PENDING' });
  }

  /**
   * Get orders that are in transit
   * @returns {Promise<Array>} List of in-transit orders
   */
  async getInTransitOrders() {
    return this.getOrders({ status: 'IN_TRANSIT' });
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderById(orderId) {
    try {
      const response = await client.graphql({
        query: getOrder,
        variables: {
          id: orderId
        }
      });

      return response.data.getOrder;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order details');
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} status - New status (PENDING, IN_TRANSIT, DELIVERED, CANCELLED)
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, status) {
    try {
      const updateInput = {
        id: orderId,
        status: status
      };

      const response = await client.graphql({
        query: updateOrder,
        variables: {
          input: updateInput
        }
      });

      console.log('Order status updated:', response.data.updateOrder);
      return response.data.updateOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  /**
   * Mark order as picked up (IN_TRANSIT)
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Updated order
   */
  async markAsPickedUp(orderId) {
    return this.updateOrderStatus(orderId, 'IN_TRANSIT');
  }

  /**
   * Mark order as delivered
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Updated order
   */
  async markAsDelivered(orderId) {
    return this.updateOrderStatus(orderId, 'DELIVERED');
  }

  /**
   * Subscribe to new orders in real-time
   * @param {Function} callback - Callback function to handle new orders
   * @returns {Object} Subscription object with unsubscribe method
   */
  subscribeToNewOrders(callback) {
    try {
      const maybeObs = client.graphql({ query: onCreateOrder })
      // If the returned value is an observable with subscribe(), use it
      if (maybeObs && typeof maybeObs.subscribe === 'function') {
        const subscription = maybeObs.subscribe({
          next: ({ data }) => {
            try {
              console.log('New order received:', data.onCreateOrder);
              callback(data.onCreateOrder);
            } catch (e) { console.error('callback error', e) }
          },
          error: (error) => {
            console.error('Subscription error:', error);
          }
        })
        return subscription
      }

      // Fallback: polling when subscribe isn't supported in this environment
      console.warn('Realtime subscribe not available; falling back to polling for new orders')
      let stopped = false
      let lastSeen = new Set()
      const poll = async () => {
        if (stopped) return
        try {
          const orders = await this.getPendingOrders()
          for (const o of orders) {
            if (!lastSeen.has(o.id)) {
              lastSeen.add(o.id)
              try { callback(o) } catch (e) { console.error('poll callback error', e) }
            }
          }
        } catch (e) {
          console.error('Polling for new orders failed', e)
        }
        if (!stopped) setTimeout(poll, 5000)
      }
      poll()
      return { unsubscribe: () => { stopped = true } }
    } catch (error) {
      console.error('Error setting up subscription:', error)
      // Do not throw — return a no-op unsubscribe to avoid crashing callers
      return { unsubscribe: () => {} }
    }
  }

  /**
   * Subscribe to order updates in real-time
   * @param {Function} callback - Callback function to handle order updates
   * @returns {Object} Subscription object with unsubscribe method
   */
  subscribeToOrderUpdates(callback) {
    try {
      const maybeObs = client.graphql({ query: onUpdateOrder })
      if (maybeObs && typeof maybeObs.subscribe === 'function') {
        const subscription = maybeObs.subscribe({
          next: ({ data }) => {
            try {
              console.log('Order updated:', data.onUpdateOrder);
              callback(data.onUpdateOrder);
            } catch (e) { console.error('callback error', e) }
          },
          error: (error) => {
            console.error('Subscription error:', error);
          }
        })
        return subscription
      }

      // Fallback polling for updates: poll all orders and call callback on changed items
      console.warn('Realtime update subscribe not available; falling back to polling for order updates')
      let stopped = false
      let snapshot = new Map()
      const poll = async () => {
        if (stopped) return
        try {
          const orders = await this.getOrders()
          for (const o of orders) {
            const prev = snapshot.get(o.id)
            if (!prev || JSON.stringify(prev) !== JSON.stringify(o)) {
              snapshot.set(o.id, o)
              try { callback(o) } catch (e) { console.error('poll callback error', e) }
            }
          }
        } catch (e) {
          console.error('Polling for order updates failed', e)
        }
        if (!stopped) setTimeout(poll, 5000)
      }
      poll()
      return { unsubscribe: () => { stopped = true } }
    } catch (error) {
      console.error('Error setting up update subscription:', error)
      return { unsubscribe: () => {} }
    }
  }

  /**
   * Transform order data to delivery format for driver UI
   * @param {Object} order - Order object from database
   * @returns {Object} Delivery object formatted for driver UI
   */
  transformOrderToDelivery(order) {
    // Get coordinates from address using city information
    const deliveryCoordinates = getCoordinatesFromAddress(order.shippingAddress);
    
    // Pickup location is typically a store/warehouse - use city center as approximation
    const pickupCoordinates = getCityCoordinates(order.shippingAddress.city || 'mumbai');
    
    // Calculate distance and estimated time
    const distanceKm = calculateDistance(pickupCoordinates, deliveryCoordinates);
    const estimatedTime = estimateDeliveryTime(distanceKm);
    
    // Format pickup time
    const createdDate = new Date(order.createdAt);
    const pickupTime = createdDate.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    // Calculate estimated delivery time (add estimated time to pickup time)
    const deliveryDate = new Date(createdDate.getTime() + (parseInt(estimatedTime) * 60000));
    const estimatedDelivery = deliveryDate.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    return {
      id: order.id,
      orderId: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: formatAddress(order.shippingAddress),
      pickupLocation: getPickupLocation(order.shippingAddress),
      deliveryLocation: formatAddress(order.shippingAddress),
      pickupCoords: { lat: pickupCoordinates[0], lng: pickupCoordinates[1] },
      deliveryCoords: { lat: deliveryCoordinates[0], lng: deliveryCoordinates[1] },
      status: this.mapOrderStatusToDeliveryStatus(order.status),
      items: order.items.length,
      amount: order.total,
      distance: `${distanceKm} km`,
      estimatedTime: estimatedTime,
      pickupTime: pickupTime,
      estimatedDelivery: estimatedDelivery,
      orderDetails: order,
      createdAt: order.createdAt
    };
  }

  /**
   * Map database order status to driver UI status
   * @param {string} orderStatus - Order status from database
   * @returns {string} Delivery status for driver UI
   */
  mapOrderStatusToDeliveryStatus(orderStatus) {
    const statusMap = {
      'PENDING': 'available',
      'IN_TRANSIT': 'picked',
      'DELIVERED': 'completed',
      'CANCELLED': 'cancelled'
    };
    
    return statusMap[orderStatus] || 'available';
  }

  /**
   * Get all deliveries for driver (transformed orders)
   * @returns {Promise<Array>} List of deliveries
   */
  async getDeliveries() {
    try {
      const orders = await this.getOrders();
      return orders.map(order => this.transformOrderToDelivery(order));
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      throw error;
    }
  }

  /**
   * Get available deliveries (pending orders)
   * @returns {Promise<Array>} List of available deliveries
   */
  async getAvailableDeliveries() {
    try {
      const orders = await this.getPendingOrders();
      return orders.map(order => this.transformOrderToDelivery(order));
    } catch (error) {
      console.error('Error fetching available deliveries:', error);
      throw error;
    }
  }
}

export default new OrderService();

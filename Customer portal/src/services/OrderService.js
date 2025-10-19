import { generateClient } from 'aws-amplify/api';
import { createOrder } from '../graphql/mutations';
import { listOrders } from '../graphql/queries';

const client = generateClient();

class OrderService {
  /**
   * Create a new order in the database
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    try {
      const {
        userId = null,
        cart,
        shippingAddress,
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
        deliveryType,
        customerEmail = 'guest@marketos.com'
      } = orderData;

      // Transform cart items to OrderItem format
      const items = cart.map(item => ({
        id: item.id,
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || null
      }));

      // Prepare order input
      const orderInput = {
        userId: userId, // Link order to authenticated user
        customerName: shippingAddress.fullName,
        customerEmail: customerEmail,
        customerPhone: shippingAddress.phone,
        items: items,
        shippingAddress: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode
        },
        subtotal: parseFloat(subtotal.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        paymentMethod: paymentMethod,
        deliveryType: deliveryType,
        status: 'PENDING'
      };

      console.log('Creating order:', orderInput);

      const response = await client.graphql({
        query: createOrder,
        variables: {
          input: orderInput
        }
      });

      console.log('Order created successfully:', response.data.createOrder);
      return response.data.createOrder;

    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error(error.message || 'Failed to create order');
    }
  }

  /**
   * Get all orders (for admin/user dashboard)
   * @returns {Promise<Array>} List of orders
   */
  async getOrders() {
    try {
      const response = await client.graphql({
        query: listOrders
      });

      return response.data.listOrders.items;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderById(orderId) {
    try {
      const response = await client.graphql({
        query: listOrders,
        variables: {
          filter: {
            id: {
              eq: orderId
            }
          }
        }
      });

      const orders = response.data.listOrders.items;
      return orders.length > 0 ? orders[0] : null;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  /**
   * Get orders for a specific user
   * @param {string} userId - User ID from Cognito
   * @returns {Promise<Array>} List of user's orders
   */
  async getUserOrders(userId) {
    try {
      const response = await client.graphql({
        query: listOrders,
        variables: {
          filter: {
            userId: {
              eq: userId
            }
          }
        }
      });

      // Sort by creation date (newest first)
      const sortedOrders = response.data.listOrders.items.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      return sortedOrders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch user orders');
    }
  }

  /**
   * Update order status (for admin)
   * @param {string} orderId - Order ID
   * @param {string} newStatus - New status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, newStatus) {
    try {
      // First, get the order
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Import updateOrder mutation
      const { updateOrder } = await import('../graphql/mutations');

      const response = await client.graphql({
        query: updateOrder,
        variables: {
          input: {
            id: orderId,
            status: newStatus
          }
        }
      });

      console.log('Order status updated:', response.data.updateOrder);
      return response.data.updateOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }
}

// Export singleton instance
export default new OrderService();

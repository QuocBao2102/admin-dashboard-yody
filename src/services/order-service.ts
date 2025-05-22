import { OrderResponse, Order } from '../types/order';
import { apiRequest } from './api-client';

export const orderService = {
  /**
   * Get all orders with pagination and filtering options
   */
  getAllOrders: async (page = 10, size = 10, filter?: string) => {
    // Build query URL with parameters
    let url = `/order-service/orders`;
    
    // Add pagination if supported by API
    if (page && size) {
      url += `?page=${page - 1}&size=${size}`;
      
      if (filter) {
        url += `&filter=${encodeURIComponent(filter)}`;
      }
    } else if (filter) {
      url += `?filter=${encodeURIComponent(filter)}`;
    }
    
    try {
      console.log(`Calling order endpoint: ${url}`);
      return await apiRequest<OrderResponse>('GET', url);
    } catch (error) {
      console.error(`Error fetching order data:`, error);
      throw error;
    }
  },

  /**
   * Get order by ID
   */
  getOrderById: async (id: string) => {
    return apiRequest<{data: Order}>('GET', `/order-service/orders/${id}`);
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (id: string, status: string) => {
    return apiRequest<Order>('PATCH', `/order-service/orders/${id}/status`, { status });
  },

  /**
   * Update payment status
   */
  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    return apiRequest<Order>('PATCH', `/order-service/orders/${id}/payment-status`, { paymentStatus });
  },
  
  /**
   * Get orders by user ID
   */
  getOrdersByUserId: async (userId: string) => {
    return apiRequest<OrderResponse>('GET', `/order-service/orders/user/${userId}`);
  }
};

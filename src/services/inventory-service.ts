import { InventoryResponse, InventoryItem } from '../types/inventory';
import { apiRequest } from './api-client';

export const inventoryService = {
  /**
   * Get all inventory items with pagination and filtering options
   */
  getAllInventory: async (page = 1, size = 10, filter?: string) => {
    // Convert page for backend (backend often uses 0-based indexing)
    const adjustedPage = page - 1;
    
    // Build query URL with parameters
    let url = `/inventory-service/inventory?page=${adjustedPage}&size=${size}`;
    if (filter) {
      url += `&filter=${encodeURIComponent(filter)}`;
    }
    
    try {
      console.log(`Calling inventory endpoint: ${url}`);
      return await apiRequest<InventoryResponse>('GET', url);
    } catch (error) {
      console.error(`Error fetching inventory data:`, error);
      throw error;
    }
  },

  /**
   * Get inventory item by ID
   */
  getInventoryById: async (id: number) => {
    return apiRequest<InventoryItem>('GET', `/inventory-service/inventory/${id}`);
  },

  /**
   * Update inventory quantity
   */
  updateInventoryQuantity: async (id: number, quantity: number) => {
    return apiRequest<InventoryItem>('PATCH', `/inventory-service/inventory/${id}/quantity`, { quantity });
  },

  /**
   * Get inventory by product ID
   */
  getInventoryByProductId: async (productId: string) => {
    return apiRequest<InventoryItem[]>('GET', `/inventory-service/inventory/product/${productId}`);
  }
};

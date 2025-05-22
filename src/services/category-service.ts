import { CategoryResponse, Category } from '../types/category';
import { apiRequest } from './api-client';

export const categoryService = {
  /**
   * Get all categories with pagination
   * Trả về: { result: Category[], metadata: ... }
   */
  getAllCategories: async (page = 1, size = 20) => {
    try {
      const response = await apiRequest<CategoryResponse>(
        'GET',
        `/product-service/category?page=${page}&size=${size}`
      );
      // Trả về đúng mảng categories từ trường result
      return {
        result: response.data?.result || [],
        metadata: response.data?.metadata || {},
        raw: response
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id: number) => {
    // Không truyền header Authorization nữa
    return apiRequest<Category>('GET', `/product-service/category/${id}`);
  },

  /**
   * Create a new category
   */
  createCategory: async (categoryData: Partial<Category>) => {
    // Không truyền header Authorization nữa
    return apiRequest<Category>('POST', '/product-service/category', categoryData);
  },

  /**
   * Update a category
   */
  updateCategory: async (id: number, categoryData: Partial<Category>) => {
    // Không truyền header Authorization nữa
    return apiRequest<Category>('PUT', `/product-service/category/${id}`, categoryData);
  },

  /**
   * Delete a category
   */
  deleteCategory: async (id: number) => {
    // Không truyền header Authorization nữa
    return apiRequest<void>('DELETE', `/product-service/category/${id}`);
  }
};

import { ProductResponse, ProductDetailResponse, Product } from '../types/product';
import { CategoryResponse, Category } from '../types/category';
import { apiRequest } from './api-client';

export const productService = {
  /**
   * Get all products with pagination and filtering options
   */
  getAllProducts: async (page = 10, size = 10, filter?: string) => {
    // Convert page for backend (backend often uses 0-based indexing)
    // Ensure page is never negative
    const adjustedPage = Math.max(0, page - 1);
    
    const endpoints = [
      `/product-service/product?page=${adjustedPage}&size=${size}`,

    ];
    
    // Thêm filter nếu có
    if (filter) {
      endpoints.forEach((_, index) => {
        endpoints[index] += `&filter=${encodeURIComponent(filter)}`;
      });
    }
    
    // Thử gọi lần lượt các endpoint cho đến khi thành công
    let lastError;
    for (const endpoint of endpoints) {
      try {
        console.log(`Calling API endpoint: ${endpoint}`);
        const response = await apiRequest<ProductResponse>('GET', endpoint);
        console.log('API Response:', response);
        return response;
      } catch (error) {
        console.error(`Failed to call ${endpoint}:`, error);
        lastError = error;
      }
    }
    
    throw lastError;    
  },

  /**
   * Get product by ID
   */
  getProductById: async (id: string) => {
    return apiRequest<ProductDetailResponse>('GET', `/product-service/product/${id}`);
  },

  /**
   * Get product by slug
   */
  getProductBySlug: async (slug: string) => {
    return apiRequest<ProductDetailResponse>('GET', `/product-service/product/slug/${slug}`);
  },

  /**
   * Create new product
   */
  createProduct: async (productData: Partial<Product>) => {
    console.log('Creating new product with data:', productData);
    return apiRequest<Product>('POST', '/product-service/product', productData);
  },

  /**
   * Update product
   */
  updateProduct: async (id: string, productData: Partial<Product>) => {
    return apiRequest<Product>('PUT', `/product-service/product/${id}`, productData);
  },

  /**
   * Delete product
   */
  deleteProduct: async (id: string) => {
    return apiRequest<void>('DELETE', `/product-service/product/${id}`);
  },
  
  /**
   * Get products by category
   */
  getProductsByCategory: async (categoryId: number) => {
    return apiRequest<ProductResponse>('GET', `/product-service/category/${categoryId}/products`);
  },
  
  /**
   * Get product variant
   */
  getProductVariant: async (productId: string, capacityId: number, colorId: number) => {
    return apiRequest<ProductDetailResponse>('GET', `/product-service/product/variant/${productId}/${capacityId}/${colorId}`);
  },
  
  /**
   * Search products by name
   */
  getProductsByNameRelative: async (name: string) => {
    return apiRequest<ProductResponse>('GET', `/product-service/product/search?name=${encodeURIComponent(name)}`);
  },

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
    return apiRequest<Category>('GET', `/product-service/category/${id}`);
  },

  /**
   * Create a new category
   */
  createCategory: async (categoryData: Partial<Category>) => {
    return apiRequest<Category>('POST', '/product-service/category', categoryData);
  },

  /**
   * Update a category
   */
  updateCategory: async (id: number, categoryData: Partial<Category>) => {
    return apiRequest<Category>('PUT', `/product-service/category/${id}`, categoryData);
  },

  /**
   * Delete a category
   */
  deleteCategory: async (id: number) => {
    return apiRequest<void>('DELETE', `/product-service/category/${id}`);
  }
};



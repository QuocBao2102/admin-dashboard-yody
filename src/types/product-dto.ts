/**
 * ProductDTO - Data Transfer Object for creating/updating products
 * Matches the database schema columns exactly
 */
export interface ProductDTO {
  // Required fields
  name: string;           // varchar(100)
  basePrice: number;      // numeric(10,2)
  thumbnail_url: string;  // varchar(255) - Required by the API
  
  // Optional fields
  sku?: string;           // varchar(20)
  description?: string;   // text
  discount?: number;      // numeric(5,2)
  product_code?: string;  // varchar(20)
  rating?: number;        // float4
  slug?: string;          // varchar(100)
  status?: string;        // varchar(25)
  category_id?: number;   // int8
}

/**
 * Convert from UI product format to API DTO format
 */
export function toProductDTO(product: any): ProductDTO {
  // Always ensure thumbnail_url is set
  const thumbnailUrl = product.thumbnail_url || product.thumbnailUrl || 'https://placehold.co/400x400/EFEFEF/999999?text=No+Image';
  
  return {
    name: product.name || '',
    basePrice: Number(product.basePrice || 0),
    discount: Number(product.discount || 0),
    description: product.description || '',
    slug: product.slug || '',
    status: product.status || 'ACTIVE',
    sku: product.sku || product.baseSku || '', 
    product_code: product.product_code || '',
    rating: Number(product.rating || 0),
    thumbnail_url: thumbnailUrl, // Always include this
    category_id: product.category_id || 
                (product.categories && product.categories.length > 0 
                  ? product.categories[0].id 
                  : undefined)
  };
}

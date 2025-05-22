import { ReactNode } from 'react';
import { PaginatedResponse } from './api';

export interface ColorDto {
  id: number;
  code: string;
  name: string;
  imageUrls: string[];
}

export interface SizeDto {
  id: number;
  name: string;
  skuCode: string;
  sortOrder: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  sold: ReactNode;
  image: string | undefined;
  id: string;             // uuid
  name: string;           // varchar(100)
  description?: string;   // text
  price?: number;         // This is legacy - use basePrice instead
  basePrice: number;      // numeric(10,2)
  discount: number;       // numeric(5,2)
  slug: string;           // varchar(100)
  thumbnailUrl?: string;  // varchar(255)
  status: string;         // varchar(20)
  sku?: string;           // varchar(20) - renamed from baseSku to match DB
  product_code?: string;  // varchar(20)
  rating?: number;        // float4
  category_id?: number;   // int8 - direct link to category
  category?: { name: string };   // For backwards compatibility
  categories?: { id: number; name: string }[]; // For backwards compatibility
  created_at?: string;    // timestamptz(6)
  updated_at?: string;    // timestamptz(6)
}

export type ProductResponse = PaginatedResponse<Product>;

export interface ProductDetailResponse {
  statusCode: number;
  message: string;
  data: Product;
}

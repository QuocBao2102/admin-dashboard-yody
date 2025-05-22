import { PaginatedResponse } from './api';

export interface Warehouse {
    id: number;
    name: string;
    location: string;
    capacity: number;
}

export interface InventoryItem {
    id: number;
    productId: string;
    quantity: number;
    reservedQuantity: number;
    reorderLevel: number;
    warehouse: Warehouse;
    availableQuantity: number;
    productName?: string; // Will be populated from product data if available
    sku?: string; // Will be populated from product data if available
    category?: string; // Will be populated from product data if available
}

export type InventoryResponse = PaginatedResponse<InventoryItem>;

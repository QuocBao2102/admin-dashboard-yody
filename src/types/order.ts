import { PaginatedResponse } from './api';

export interface OrderDetail {
    id: string;
    orderId: string;
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
    discount: number;
    totalPrice: number;
    productName: string;
    variantColor: string;
    variantSize: string;
    productThumbnail: string;
}

export interface Order {
    id: string;
    userId: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    shippingAddress: string;
    billingAddress: string;
    promoCodeId: string | null;
    createdAt: string;
    updatedAt: string;
    orderDetails: OrderDetail[];
}

export interface OrderResponse {
    statusCode: number;
    error: string | null;
    message: string;
    data: Order[];
}

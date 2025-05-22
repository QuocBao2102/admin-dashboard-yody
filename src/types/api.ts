// Common API response types

export interface Metadata {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  totalElements: number;
  totalPages: number;
  pageable: any;
  content: boolean;
  items: never[];
  data: import("d:/KTPM/yody-dashboard/yody-admin/src/types/product").ProductResponse;
  metadata: Metadata;
  result: T[];
}

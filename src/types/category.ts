export interface Category {
  id: number;
  name: string;
  skuCode: string;
  slug: string;
  parentId: number | null;
}

export interface CategoryMetadata {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface CategoryResponse {
  result(result: any): unknown;
  statusCode: number;
  error: string | null;
  message: string;
  data: {
    metadata: CategoryMetadata;
    result: Category[];
  };
}

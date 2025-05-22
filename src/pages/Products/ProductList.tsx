import { useEffect, useState } from "react";
import { Link } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { productService } from "../../services/product-service";
import { Product } from "../../types/product";
import { Metadata } from "../../types/api";
import { PLACEHOLDER_IMAGE, getValidImageUrl, handleImageError } from "../../utils/image-utils";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata>({
    page: 1,
    pageSize: 100,
    totalPages: 10,
    totalItems: 0,
  });

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure we're passing the correct page number to the API
      const response = await productService.getAllProducts(
        metadata.page,
        metadata.pageSize
      );

      console.log("API Response:", response);

      // Xử lý linh hoạt các định dạng phản hồi API
      if (response) {
        // Xác định dữ liệu sản phẩm
        let productList: Product[] = [];
        let metadataInfo = { ...metadata };

        // Spring Boot pagination format
        if (response.content && Array.isArray(response.content)) {
          productList = response.content;
          metadataInfo = {
            page: response.pageable?.pageNumber + 1 || 1,
            pageSize: response.pageable?.pageSize || 10,
            totalPages: response.totalPages || 1,
            totalItems: response.totalElements || productList.length,
          };
        }
        // Custom format { data: [], metadata: {} }
        else if (response.data) {
          if (Array.isArray(response.data)) {
            productList = response.data;
          } else if (
            response.data.content &&
            Array.isArray(response.data.content)
          ) {
            productList = response.data.content;
          } else if (response.data.items && Array.isArray(response.data.items)) {
            productList = response.data.items;
          } else if (response.data.result && Array.isArray(response.data.result)) {
            productList = response.data.result;
          }

          if (response.metadata) {
            metadataInfo = {
              ...metadataInfo,
              page: response.metadata.page || metadataInfo.page,
              pageSize: response.metadata.pageSize || metadataInfo.pageSize,
              totalPages: response.metadata.totalPages || 1,
              totalItems: response.metadata.totalItems || productList.length,
            };
          } else if (response.data.metadata) {
            metadataInfo = {
              ...metadataInfo,
              page: response.data.metadata.page || metadataInfo.page,
              pageSize: response.data.metadata.pageSize || metadataInfo.pageSize,
              totalPages: response.data.metadata.totalPages || 1,
              totalItems: response.data.metadata.totalItems || productList.length,
            };
          }
        }
        // Array response
        else if (Array.isArray(response)) {
          productList = response;
        }

        // Update products list
        setProducts(productList);
        
        // Update metadata regardless of whether products were found
        setMetadata(metadataInfo);
        
        // Display error message only if there are no products on the first page
        if (productList.length === 0 && metadata.page === 1) {
          setError("No products found. The API returned an empty result.");
        } else if (productList.length === 0 && metadata.page > 1) {
          // If no products on subsequent pages, go back to the previous page
          setMetadata(prev => ({...prev, page: Math.max(1, prev.page - 1)}));
          setError("No more products available on this page.");
        }
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch products";
      setError(errorMsg);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [metadata.page, metadata.pageSize]);

  // Filter products based on search term
  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoryMatch = product.category?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return nameMatch || (categoryMatch || false);
  });

  // Delete product handler
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter((product) => product.id !== id));
      } catch (err: any) {
        const errorMsg = err.message || "Failed to delete product";
        setError(errorMsg);
        console.error("Error deleting product:", err);
      }
    }
  };

  // Determine product status based on stock
  const getProductStatus = (product: Product) => {
    if (!product.status) return { label: "In Stock", color: "success" };

    switch (product.status.toLowerCase()) {
      case "active":
        return { label: "In Stock", color: "success" };
      case "low_stock":
        return { label: "Low Stock", color: "warning" };
      case "inactive":
      case "out_of_stock":
        return { label: "Out of Stock", color: "error" };
      default:
        return { label: "In Stock", color: "success" };
    }
  };

  // Format price with VND currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Lấy danh mục chính của sản phẩm
  const getMainCategory = (product: Product) => {
    if (product.category?.name) return product.category.name;

    return product.categories && product.categories.length > 0
      ? product.categories[0].name
      : "Chưa phân loại";
  };

  return (
    <div>
      <PageMeta
        title="Product Management | YODY Admin Dashboard"
        description="Manage your product catalog - view, add, edit and delete products"
      />
      <PageBreadcrumb pageTitle="Product Management" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-7.5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
            />
          </div>
          <Link
            to="/add-product"
            className="flex items-center justify-center gap-2.5 rounded-lg bg-brand-500 px-4 py-2.5 text-center font-medium text-gray-800 hover:bg-brand-600"
          >
            <svg
              className="size-5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 4.0625V15.9375"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.0625 10H15.9375"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add New Product
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        ) : error ? (
          <div className="bg-error-50 text-error-600 p-4 rounded-lg dark:bg-error-500/10 dark:text-error-400">
            {error}
            <button
              className="ml-4 text-sm underline"
              onClick={fetchProducts}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Product</TableCell>
                  <TableCell isHeader>Category</TableCell>
                  <TableCell isHeader>Price</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <td colSpan={5} className="text-center py-8">
                      No products found.
                    </td>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const status = getProductStatus(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 rounded-lg bg-gray-100 p-1">
                              <img
                                src={getValidImageUrl(product.thumbnailUrl)}
                                alt={product.name}
                                className="h-full w-full rounded-md object-cover"
                                onError={handleImageError(PLACEHOLDER_IMAGE)}
                              />
                            </div>
                            <span className="font-medium text-gray-800 dark:text-white/90">
                              {product.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getMainCategory(product)}</TableCell>
                        <TableCell>
                          {formatPrice(
                            product.basePrice || product.price || 0
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge color={status.color as any}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button className="rounded bg-brand-50 p-2 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20">
                              <svg
                                className="size-5"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.1665 2.5H5.83317C4.3565 2.5 3.1665 3.69 3.1665 5.16667V14.1667C3.1665 15.6433 4.3565 16.8333 5.83317 16.8333H14.1665C15.6432 16.8333 16.8332 15.6433 16.8332 14.1667V5.16667C16.8332 3.69 15.6432 2.5 14.1665 2.5Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M7.5 9.16669C8.42047 9.16669 9.16667 8.42049 9.16667 7.50002C9.16667 6.57955 8.42047 5.83335 7.5 5.83335C6.57953 5.83335 5.83333 6.57955 5.83333 7.50002C5.83333 8.42049 6.57953 9.16669 7.5 9.16669Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M16.8333 12.5L13.3333 9C12.9167 8.58333 12.25 8.58333 11.8333 9L6.66667 14.1667"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <Link
                              to={`/edit-product/${product.id}`}
                              className="rounded bg-blue-light-50 p-2 text-blue-light-600 hover:bg-blue-light-100 dark:bg-blue-light-500/10 dark:text-blue-light-400 dark:hover:bg-blue-light-500/20"
                            >
                              <svg
                                className="size-5"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M9.16699 3.33331H5.00033C4.08366 3.33331 3.33366 4.08331 3.33366 4.99998V15C3.33366 15.9166 4.08366 16.6666 5.00033 16.6666H15.0003C15.917 16.6666 16.667 15.9166 16.667 15V10.8333"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M15.417 2.08332C16.0003 1.49999 16.917 1.49999 17.5003 2.08332C18.0837 2.66666 18.0837 3.58332 17.5003 4.16666L10.0003 11.6667L6.66699 12.5L7.50033 9.16666L15.417 2.08332Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="rounded bg-error-50 p-2 text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20"
                            >
                              <svg
                                className="size-5"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M16.667 5.00001H3.33366"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M8.33366 8.33331V13.3333"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M11.6663 8.33331V13.3333"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M15.8337 5.00001V16.6667C15.8337 16.8877 15.7459 17.0996 15.5896 17.2559C15.4334 17.4122 15.2214 17.5 15.0003 17.5H5.00033C4.77931 17.5 4.56735 17.4122 4.41107 17.2559C4.25479 17.0996 4.16699 16.8877 4.16699 16.6667V5.00001"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M13.3337 5.00001V3.33334C13.3337 2.89131 13.1581 2.46739 12.8455 2.15483C12.5329 1.84227 12.109 1.66667 11.667 1.66667H8.33366C7.89163 1.66667 7.46771 1.84227 7.15515 2.15483C6.84259 2.46739 6.66699 2.89131 6.66699 3.33334V5.00001"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination controls */}
        {!loading && !error && metadata.totalPages > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing{" "}
              {/* {((metadata.page - 1) * metadata.pageSize) + 1} to{" "}
              {Math.min(metadata.page * metadata.pageSize, metadata.totalItems)} of{" "} */}
              {metadata.totalItems} products
            </div>
            <div className="flex gap-2">
              {/* <button
                onClick={handlePrevPage}
                disabled={metadata.page === 1}
                className={`rounded px-3 py-1.5 text-sm ${
                  metadata.page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800">
                {metadata.page} / {metadata.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={metadata.page >= metadata.totalPages}
                className={`rounded px-3 py-1.5 text-sm ${
                  metadata.page >= metadata.totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Next
              </button> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

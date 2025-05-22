import Badge from "../ui/badge/Badge";
import { Product } from "../../types/product";

// Add prop types to accept data from Home.tsx
interface TopSellingProductsProps {
  loading?: boolean;
  error?: boolean;
  products?: Product[];
}

export default function TopSellingProducts({
  loading = false,
  error = false,
  products = [],
}: TopSellingProductsProps) {
  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Display loading state
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Top Selling Products
        </h3>
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Top Selling Products
        </h3>
        <div className="bg-error-50 text-error-600 p-4 rounded-lg text-center dark:bg-error-500/10 dark:text-error-400">
          Failed to load top selling products.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top Selling Products
        </h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Best performing products this month
        </p>
      </div>

      <div className="space-y-5">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between gap-4 border-b border-gray-100 pb-5 dark:border-gray-800"
          >
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  {product.name}
                </h4>
                <p className="text-gray-500 text-theme-xs dark:text-gray-400">
                  {product.category?.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                {product.sold} <span className="text-gray-500">sold</span>
              </p>
              <div className="mt-1 flex items-center justify-end gap-2">
                <p className="text-gray-500 text-theme-xs dark:text-gray-400">
                  {product.price !== undefined && product.price !== null
                    ? formatCurrency(
                        typeof product.price === "string"
                          ? Number(
                              (product.price as string)
                                .replace(/\./g, "")
                                .replace("₫", "")
                                .trim()
                            )
                          : product.price
                      )
                    : ""}
                </p>
                <Badge
                  size="sm"
                  color={
                    product.status === "In Stock"
                      ? "success"
                      : product.status === "Low Stock"
                      ? "warning"
                      : "error"
                  }
                >
                  {product.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

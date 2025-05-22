import { useState, useEffect } from "react";
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
import { orderService } from "../../services/order-service";
import { Order } from "../../types/order";
import { Metadata } from "../../types/api";

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata>({
    page: 1,
    pageSize: 100,
    totalPages: 1,
    totalItems: 0,
  });

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getAllOrders(
        metadata.page,
        metadata.pageSize
      );

      console.log("API Response (Orders):", response);

      if (response && response.data) {
        setOrders(response.data);

        // Set basic metadata
        setMetadata({
          ...metadata,
          totalItems: response.data.length,
          totalPages: Math.ceil(response.data.length / metadata.pageSize),
        });
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch orders";
      setError(errorMsg);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [metadata.page, metadata.pageSize]);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const idMatch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const userIdMatch = order.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const addressMatch = order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());

    let statusMatch = true;
    if (filterStatus !== "all") {
      // Convert status (e.g., "PENDING" to "Pending" for display)
      const formattedStatus = formatStatus(order.status);
      statusMatch = formattedStatus === filterStatus;
    }

    return (idMatch || userIdMatch || addressMatch) && statusMatch;
  });

  // Format status for display
  const formatStatus = (status: string): string => {
    if (!status) return "Processing";

    switch (status.toUpperCase()) {
      case "PENDING":
        return "Processing";
      case "PROCESSING":
        return "Processing";
      case "SHIPPED":
        return "Shipped";
      case "DELIVERED":
        return "Delivered";
      case "COMPLETED":
        return "Delivered";
      case "CANCELLED":
      case "CANCELED":
        return "Canceled";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  // Get status badge color
  const getStatusColor = (status: string): "primary" | "success" | "warning" | "error" => {
    const formattedStatus = formatStatus(status);
    switch (formattedStatus) {
      case "Delivered":
        return "success";
      case "Processing":
        return "primary";
      case "Shipped":
        return "warning";
      case "Canceled":
        return "error";
      default:
        return "primary";
    }
  };

  // Format date for display (ISO to DD/MM/YYYY)
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get payment method (simplified since API doesn't provide this)
  const getPaymentMethod = (order: Order): string => {
    // In a real application, this would be provided by the API
    // For now, we return a placeholder based on payment status
    return order.paymentStatus === "PAID" ? "Banking" : "COD";
  };

  // Get number of products in order
  const getProductCount = (order: Order): number => {
    if (!order.orderDetails) return 0;

    // Sum quantities or count unique products
    return order.orderDetails.reduce((sum, detail) => sum + detail.quantity, 0);
  };

  // Extract customer email from userId (simplified since API doesn't provide email)
  const getCustomerEmail = (userId: string): string => {
    // In a real application, you would fetch this from user data
    return `${userId.toLowerCase()}@example.com`;
  };

  // // Improved page navigation handlers
  // const handlePrevPage = () => {
  //   if (metadata.page > 1) {
  //     setMetadata((prev) => ({ ...prev, page: prev.page - 1 }));
  //   }
  // };

  // const handleNextPage = () => {
  //   // Allow moving to next page if current page is less than total pages
  //   if (metadata.page < metadata.totalPages) {
  //     setMetadata((prev) => ({ ...prev, page: prev.page + 1 }));
  //   }
  // };

  return (
    <div>
      <PageMeta
        title="Order Management | YODY Admin Dashboard"
        description="View and manage all customer orders - track status, review details, and process orders"
      />
      <PageBreadcrumb pageTitle="Order Management" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-7.5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by ID, customer or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
            >
              <option value="all">All Status</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Canceled">Canceled</option>
            </select>
            <button className="flex items-center justify-center gap-2.5 rounded-lg bg-brand-500 px-4 py-2.5 text-center font-medium text-gray-800 hover:bg-brand-600">
              <svg
                className="size-5"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.5 13.3334L17.5 6.66669C17.5 3.33335 16.6667 2.5 13.3333 2.5L6.66667 2.5C3.33333 2.5 2.5 3.33335 2.5 6.66669L2.5 13.3334C2.5 16.6667 3.33333 17.5 6.66667 17.5L13.3333 17.5C16.6667 17.5 17.5 16.6667 17.5 13.3334Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.66699 8.33331L13.3337 8.33331"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.66699 11.6667L10.0003 11.6667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Export
            </button>
          </div>
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
              onClick={fetchOrders}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Order ID</TableCell>
                  <TableCell isHeader>Customer</TableCell>
                  <TableCell isHeader>Date</TableCell>
                  <TableCell isHeader>Total</TableCell>
                  <TableCell isHeader>Payment</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <td colSpan={7} className="text-center py-8">
                      No orders found.
                    </td>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          #{order.id.substring(0, 8)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white/90">
                            {order.userId}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {getCustomerEmail(order.userId)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </TableCell>
                      <TableCell>{getPaymentMethod(order)}</TableCell>
                      <TableCell>
                        <Badge color={getStatusColor(order.status)}>
                          {formatStatus(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/order-details/${order.id}`}
                            className="rounded bg-brand-50 p-2 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                          >
                            <svg
                              className="size-5"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10.0003 3.33337C5.83366 3.33337 2.27533 6.11671 0.833664 10.0001C2.27533 13.8834 5.83366 16.6667 10.0003 16.6667C14.167 16.6667 17.7253 13.8834 19.167 10.0001C17.7253 6.11671 14.167 3.33337 10.0003 3.33337Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 13.3334C11.8409 13.3334 13.3333 11.841 13.3333 10.0001C13.3333 8.15913 11.8409 6.66675 10 6.66675C8.15905 6.66675 6.66666 8.15913 6.66666 10.0001C6.66666 11.841 8.15905 13.3334 10 13.3334Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Link>
                          <button className="rounded bg-blue-light-50 p-2 text-blue-light-600 hover:bg-blue-light-100 dark:bg-blue-light-500/10 dark:text-blue-light-400 dark:hover:bg-blue-light-500/20">
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
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
              {metadata.totalItems} orders
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

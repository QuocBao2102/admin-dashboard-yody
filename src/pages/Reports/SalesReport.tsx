import { useState, useEffect } from "react";
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

export default function SalesReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata>({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
  });
  const [salesSummary, setSalesSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
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

      console.log("API Response (Orders for Report):", response);

      if (response && response.data) {
        setOrders(response.data);

        // Set basic metadata
        setMetadata({
          ...metadata,
          totalItems: response.data.length,
          totalPages: Math.ceil(response.data.length / metadata.pageSize),
        });

        // Calculate sales summary data
        const totalSales = response.data.reduce((sum, order) => sum + order.totalAmount, 0);
        const pendingOrders = response.data.filter(order => 
          order.status.toUpperCase() === "PENDING" || order.status.toUpperCase() === "PROCESSING"
        ).length;
        
        setSalesSummary({
          totalSales: totalSales,
          totalOrders: response.data.length,
          averageOrderValue: response.data.length ? totalSales / response.data.length : 0,
          pendingOrders: pendingOrders
        });
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch sales data";
      setError(errorMsg);
      console.error("Error fetching sales data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [metadata.page, metadata.pageSize]);

  // Filter orders based on search term, status and date range
  const filteredOrders = orders.filter((order) => {
    const idMatch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const userIdMatch = order.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const addressMatch = order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    let statusMatch = true;
    if (filterStatus !== "all") {
      // Convert status (e.g., "PENDING" to "Processing" for display)
      const formattedStatus = formatStatus(order.status);
      statusMatch = formattedStatus === filterStatus;
    }

    // Date range filter
    let dateMatch = true;
    if (filterDateRange !== "all") {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      switch (filterDateRange) {
        case "today":
          dateMatch = orderDate.toDateString() === today.toDateString();
          break;
        case "week":
          dateMatch = orderDate >= sevenDaysAgo;
          break;
        case "month":
          dateMatch = orderDate >= thirtyDaysAgo;
          break;
      }
    }

    return (idMatch || userIdMatch || addressMatch) && statusMatch && dateMatch;
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

  return (
    <div>
      <PageMeta
        title="Sales Report | YODY Admin Dashboard"
        description="Analyze sales data, track trends, and view order metrics"
      />
      <PageBreadcrumb pageTitle="Sales Report" />

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</h3>
              <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                {formatCurrency(salesSummary.totalSales)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-50 dark:bg-success-900/20">
              <svg className="h-6 w-6 text-success-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</h3>
              <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                {salesSummary.totalOrders}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
              <svg className="h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Order</h3>
              <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                {formatCurrency(salesSummary.averageOrderValue)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning-50 dark:bg-warning-900/20">
              <svg className="h-6 w-6 text-warning-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Orders</h3>
              <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                {salesSummary.pendingOrders}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-light-50 dark:bg-blue-light-900/20">
              <svg className="h-6 w-6 text-blue-light-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-7.5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search orders..."
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
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
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
              Export Report
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
                  <TableCell isHeader>Customer ID</TableCell>
                  <TableCell isHeader>Date</TableCell>
                  <TableCell isHeader>Total</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Payment Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <td colSpan={6} className="text-center py-8">
                      No orders found matching your criteria.
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
                      <TableCell>{order.userId}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge color={getStatusColor(order.status)}>
                          {formatStatus(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge color={order.paymentStatus === "PAID" ? "success" : "warning"}>
                          {order.paymentStatus === "PAID" ? "Paid" : "Pending"}
                        </Badge>
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
            {/* <div className="flex gap-2">
              <button
                onClick={() =>
                  setMetadata((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
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
                onClick={() =>
                  setMetadata((prev) => ({
                    ...prev,
                    page: Math.min(prev.page + 1, metadata.totalPages),
                  }))
                }
                disabled={metadata.page >= metadata.totalPages}
                className={`rounded px-3 py-1.5 text-sm ${
                  metadata.page >= metadata.totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                Next
              </button>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}

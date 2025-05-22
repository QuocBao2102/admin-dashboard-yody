import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { orderService } from "../../services/order-service";
import { Order } from "../../types/order";

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        // Use the API service to get orders
        const response = await orderService.getAllOrders();
        
        if (response?.data && Array.isArray(response.data)) {
          // Take only the 5 most recent orders
          setOrders(response.data.slice(0, 5));
        }
        setError(false);
      } catch (err) {
        console.error("Error fetching recent orders:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  // Format date for display (ISO to DD/MM/YYYY)
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
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
  const getStatusColor = (status: string): "primary" | "success" | "error" => {
    const formattedStatus = formatStatus(status);
    switch (formattedStatus) {
      case "Delivered":
        return "success";
      case "Processing":
        return "primary";
      case "Canceled":
        return "error";
      default:
        return "primary";
    }
  };
  
  // Display loading state
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Recent Orders
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
          Recent Orders
        </h3>
        <div className="bg-error-50 text-error-600 p-4 rounded-lg text-center dark:bg-error-500/10 dark:text-error-400">
          Failed to load recent orders.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            See all
          </Link>
        </div>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No recent orders found
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Order ID
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Customer
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.map((order) => (
                <TableRow key={order.id} className="">
                  <TableCell className="py-3">
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      #{order.id.substring(0, 8)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-gray-300">
                    {order.userId}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={getStatusColor(order.status)}
                    >
                      {formatStatus(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Link
                      to={`/order-details/${order.id}`}
                      className="inline-flex items-center justify-center rounded bg-brand-50 p-2 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

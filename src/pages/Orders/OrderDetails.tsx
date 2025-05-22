import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";

// Define interfaces
interface OrderDetail {
  id: number;
  status: "Delivered" | "Processing" | "Canceled" | "Shipped";
  orderDate: string;
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending" | "Failed";
  shippingMethod: string;
  shippingCost: string;
  subtotal: string;
  total: string;
  notes: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    district: string;
    postalCode: string;
  };
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  name: string;
  sku: string;
  price: string;
  quantity: number;
  subtotal: string;
  image: string;
}

// Mock data
const orderDetailsData: OrderDetail[] = [
  {
    id: 10248,
    status: "Delivered",
    orderDate: "24/05/2023 - 15:30",
    paymentMethod: "COD (Cash On Delivery)",
    paymentStatus: "Paid",
    shippingMethod: "Standard Delivery",
    shippingCost: "30.000₫",
    subtotal: "1.220.000₫",
    total: "1.250.000₫",
    notes: "Giao hàng giờ hành chính",
    customer: {
      name: "Nguyễn Văn An",
      email: "nguyenvanan@gmail.com",
      phone: "0912345678",
    },
    shippingAddress: {
      street: "123 Đường Lê Lợi",
      city: "Hà Nội",
      district: "Hoàn Kiếm",
      postalCode: "100000",
    },
    items: [
      {
        id: 1,
        name: "YODY Polo Active",
        sku: "YPL-001-RD-XL",
        price: "299.000₫",
        quantity: 2,
        subtotal: "598.000₫",
        image: "/images/product/yody-1.jpg",
      },
      {
        id: 3,
        name: "YODY Kids T-shirt",
        sku: "YKT-003-GR-S",
        price: "199.000₫",
        quantity: 1,
        subtotal: "199.000₫",
        image: "/images/product/yody-3.jpg",
      },
      {
        id: 5,
        name: "YODY Summer Shorts",
        sku: "YSS-005-BG-L",
        price: "249.000₫",
        quantity: 1,
        subtotal: "249.000₫",
        image: "/images/product/yody-5.jpg",
      },
    ],
  },
  {
    id: 10249,
    status: "Processing",
    orderDate: "25/05/2023 - 10:45",
    paymentMethod: "Banking (Transfer)",
    paymentStatus: "Paid",
    shippingMethod: "Express Delivery",
    shippingCost: "45.000₫",
    subtotal: "845.000₫",
    total: "890.000₫",
    notes: "",
    customer: {
      name: "Trần Thị Bình",
      email: "tranthibinh@gmail.com",
      phone: "0923456789",
    },
    shippingAddress: {
      street: "456 Đường Nguyễn Huệ",
      city: "Hồ Chí Minh",
      district: "Quận 1",
      postalCode: "700000",
    },
    items: [
      {
        id: 2,
        name: "YODY Dress Floral",
        sku: "YDF-002-BL-M",
        price: "399.000₫",
        quantity: 1,
        subtotal: "399.000₫",
        image: "/images/product/yody-2.jpg",
      },
      {
        id: 6,
        name: "YODY Women's Blouse",
        sku: "YWB-006-WT-S",
        price: "289.000₫",
        quantity: 1,
        subtotal: "289.000₫",
        image: "/images/product/yody-6.jpg",
      },
      {
        id: 7,
        name: "YODY Cotton Jeans",
        sku: "YCJ-007-BL-M",
        price: "449.000₫",
        quantity: 1,
        subtotal: "157.000₫",
        image: "/images/product/yody-7.jpg",
      },
    ],
  },
];

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const foundOrder = orderDetailsData.find(
        (o) => o.id === parseInt(id || "0")
      );
      if (foundOrder) {
        setOrder(foundOrder);
      } else if (!id) {
        // If no ID is provided, show the first order (for the generic route)
        setOrder(orderDetailsData[0]);
      }
      setLoading(false);
    }, 300);
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "success";
      case "Pending":
        return "warning";
      case "Failed":
        return "error";
      default:
        return "primary";
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white/90">
          Order Not Found
        </h3>
        <p className="mb-5 text-gray-600 dark:text-gray-400">
          The order you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/orders"
          className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 font-medium text-gray-800 hover:bg-brand-600"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`Order #${order.id} | YODY Admin Dashboard`}
        description="View detailed information about a customer order"
      />
      <PageBreadcrumb pageTitle={`Order #${order.id}`} />

      {/* Order Status and Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Order #{order.id}
          </h2>
          <Badge color={getStatusColor(order.status)}>{order.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-300">
            <span className="flex items-center gap-2">
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
              Print Invoice
            </span>
          </button>
          {order.status === "Processing" && (
            <button className="rounded-lg bg-brand-500 px-4 py-2.5 font-medium text-gray-800 hover:bg-brand-600">
              <span className="flex items-center gap-2">
                <svg
                  className="size-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.83301 5.83325L14.1663 14.1666"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.1663 5.83325L5.83301 14.1666"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Update Status
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Details and Customer Info */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Order Information
            </h3>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {order.orderDate}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {order.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Payment Status</p>
                <Badge color={getPaymentStatusColor(order.paymentStatus)}>
                  {order.paymentStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Shipping Method</p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {order.shippingMethod}
                </p>
              </div>
            </div>

            <div className="mb-6 border-b border-gray-200 pb-6 dark:border-gray-700">
              <h4 className="mb-3 font-medium text-gray-800 dark:text-white/90">
                Customer Information
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {order.customer.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {order.customer.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {order.customer.phone}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-medium text-gray-800 dark:text-white/90">
                Shipping Address
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Street</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {order.shippingAddress.street}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {order.shippingAddress.city}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">District</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {order.shippingAddress.district}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Postal Code</p>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {order.shippingAddress.postalCode}
                  </p>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="mb-2 font-medium text-gray-800 dark:text-white/90">
                  Order Notes
                </h4>
                <p className="text-gray-600 dark:text-gray-400">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Order Summary
            </h3>
            
            <div className="mb-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {order.subtotal}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {order.shippingCost}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                <span className="font-medium text-gray-800 dark:text-white/90">Total</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">
                  {order.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Order Items ({order.items.length})
            </h3>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div 
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700 sm:flex-nowrap"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 p-1">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full rounded-md object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white/90">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        SKU: {item.sku}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {item.price} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {item.subtotal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

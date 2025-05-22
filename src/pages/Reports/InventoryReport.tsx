import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { inventoryService } from "../../services/inventory-service";
import { Metadata } from "../../types/api";
import { InventoryItem } from "../../types/inventory";

// Define inventory status type
interface InventoryStatus {
  id: number;
  name: string;
  category: string;
  inStock: number;
  reorderPoint: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  daysUntilOutOfStock?: number;
}

export default function InventoryReport() {
  const [dateRange, setDateRange] = useState<string>("this-month");
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
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
  const [inventorySummary, setInventorySummary] = useState({
    totalProducts: 0,
    stockValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  });
  
  // Fetch inventory data from API - similar to SalesReport
  const fetchInventoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getAllInventory(
        metadata.page,
        metadata.pageSize
      );

      console.log("API Response (Inventory for Report):", response);

      if (response && response.data) {
        setInventoryData(response.data.items || response.data.results || []);

        // Set basic metadata
        setMetadata({
          ...metadata,
          totalItems: response.data.length,
          totalPages: Math.ceil(response.data.length / metadata.pageSize),
        });

        // Calculate inventory summary data
        const items: InventoryItem[] = response.data.items || response.data.results || [];
        const lowStockItems = items.filter(item => 
          item.availableQuantity > 0 && item.availableQuantity <= item.reorderLevel
        ).length;
        
        const outOfStockItems = items.filter(item => 
          item.availableQuantity <= 0
        ).length;

        // Calculate stock value
        const stockValue = response.data.reduce((total, item) => {
          const itemPrice = item.product?.price || item.unitPrice || 0;
          return total + (itemPrice * item.availableQuantity);
        }, 0);

        setInventorySummary({
          totalProducts: response.data.length,
          stockValue: typeof stockValue === "number" && !isNaN(stockValue) ? stockValue : 0,
          lowStockItems: lowStockItems,
          outOfStockItems: outOfStockItems
        });

        // Update chart data
        updateChartData(response.data.items || response.data.results || []);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch inventory data";
      setError(errorMsg);
      console.error("Error fetching inventory data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [metadata.page, metadata.pageSize]);

  // Calculate and update chart data based on inventory items
  const [stockLevelSeries, setStockLevelSeries] = useState<number[]>([70, 20, 10]);
  const [categoryStockSeries, setCategoryStockSeries] = useState([
    {
      name: "Healthy Stock",
      data: [25, 15, 20, 18, 15, 30, 10, 8]
    },
    {
      name: "Low Stock",
      data: [5, 3, 6, 4, 7, 8, 2, 5]
    },
    {
      name: "Out of Stock",
      data: [2, 1, 3, 1, 2, 0, 1, 4]
    }
  ]);
  
  // Update chart data based on inventory items
  const updateChartData = (items: InventoryItem[]) => {
    if (!items || items.length === 0) return;
    
    // Calculate stock level distribution
    const healthyStock = items.filter(item => 
      item.availableQuantity > item.reorderLevel
    ).length;
    
    const lowStock = items.filter(item => 
      item.availableQuantity > 0 && item.availableQuantity <= item.reorderLevel
    ).length;
    
    const outOfStock = items.filter(item => 
      item.availableQuantity <= 0
    ).length;
    
    setStockLevelSeries([
      healthyStock, 
      lowStock, 
      outOfStock
    ]);
    
    // Group items by category
    const categoryMap = new Map();
    
    // Get unique categories from inventory items
    const uniqueCategories = Array.from(new Set(
      items.map(item => (item.product?.category?.name || "Uncategorized"))
    )).slice(0, 8); // Limit to 8 categories for display
    
    // Initialize categories
    uniqueCategories.forEach(category => {
      categoryMap.set(category, { healthy: 0, low: 0, out: 0 });
    });
    
    // Count items per category by status
    items.forEach(item => {
      const category = item.product?.category?.name || "Uncategorized";
      if (!categoryMap.has(category)) return; // Skip if not in our top categories
      
      if (item.availableQuantity <= 0) {
        categoryMap.get(category).out += 1;
      } else if (item.availableQuantity <= item.reorderLevel) {
        categoryMap.get(category).low += 1;
      } else {
        categoryMap.get(category).healthy += 1;
      }
    });
    
    // Prepare data for chart
    const healthyData = [];
    const lowStockData = [];
    const outOfStockData = [];
    
    // For each category in our list, get the data
    for (const category of uniqueCategories) {
      const data = categoryMap.get(category);
      healthyData.push(data.healthy);
      lowStockData.push(data.low);
      outOfStockData.push(data.out);
    }
    
    // Update category options with the actual category names
    categoryStockOptions.xaxis = {
      ...categoryStockOptions.xaxis,
      categories: uniqueCategories
    };
    
    setCategoryStockSeries([
      {
        name: "Healthy Stock",
        data: healthyData
      },
      {
        name: "Low Stock",
        data: lowStockData
      },
      {
        name: "Out of Stock",
        data: outOfStockData
      }
    ]);
  };
  
  // Filter inventory based on search term and status
  const filteredInventory = inventoryData.filter((item) => {
    const nameMatch = (item.product?.name || item.productName || item.productId || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoryMatch = (item.product?.category?.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    // Status filter
    let statusMatch = true;
    if (filterStatus !== "all") {
      const itemStatus = getInventoryStatus(item);
      statusMatch = itemStatus === filterStatus;
    }
    
    return (nameMatch || categoryMatch) && statusMatch;
  });
  
  // Stock level distribution chart options
  const stockLevelOptions: ApexOptions = {
    chart: {
      type: "donut",
      height: 350
    },
    colors: ["#32D583", "#FDB022", "#F04438"],
    labels: ["Healthy Stock", "Low Stock", "Out of Stock"],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: "bottom"
        }
      }
    }],
    dataLabels: {
      style: {
        fontFamily: "Outfit, sans-serif"
      }
    },
    legend: {
      fontFamily: "Outfit, sans-serif"
    }
  };

  // Category stock level chart options
  const categoryStockOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: {
        show: false
      }
    },
    colors: ["#32D583", "#FDB022", "#F04438"],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 5,
        columnWidth: "55%",
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 2,
      colors: ["#fff"]
    },
    xaxis: {
      categories: ["Men's Shirts", "Men's Bottoms", "Women's Shirts", "Women's Dresses", "Women's Bottoms", "Children", "Accessories", "Outerwear"],
      labels: {
        style: {
          colors: "#6B7280",
          fontFamily: "Outfit, sans-serif"
        }
      }
    },
    yaxis: {
      title: {
        text: "Number of Products"
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontFamily: "Outfit, sans-serif"
        }
      }
    },
    fill: {
      opacity: 1
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit, sans-serif"
    }
  };

  // Inventory turnover chart options
  const turnoverRateOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 350,
      toolbar: {
        show: false
      }
    },
    colors: ["#ffc500"],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth",
      width: 3
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      labels: {
        style: {
          colors: "#6B7280",
          fontFamily: "Outfit, sans-serif"
        }
      }
    },
    yaxis: {
      title: {
        text: "Turnover Rate"
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontFamily: "Outfit, sans-serif"
        }
      }
    },
    markers: {
      size: 4,
      colors: ["#ffc500"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6
      }
    }
  };

  // Inventory turnover chart series - This data could be computed from historical data if available
  const turnoverRateSeries = [
    {
      name: "Inventory Turnover",
      data: [3.2, 3.5, 3.8, 4.1, 3.9, 4.2, 4.5, 4.3, 4.6, 4.8, 4.9, 5.1]
    }
  ];

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get inventory status
  const getInventoryStatus = (item: InventoryItem): "In Stock" | "Low Stock" | "Out of Stock" => {
    if (item.availableQuantity <= 0) {
      return "Out of Stock";
    } else if (item.availableQuantity <= item.reorderLevel) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  };

  // Filter low stock and out of stock items
  const lowStockItems = inventoryData
    .filter(item => item.availableQuantity > 0 && item.availableQuantity <= item.reorderLevel || item.availableQuantity <= 0)
    .map((item) => ({
      id: item.id,
      name: item.product?.name || `Product #${item.productId}`,
      category: item.product?.category?.name || "Uncategorized",
      inStock: item.availableQuantity,
      reorderPoint: item.reorderLevel,
      status: getInventoryStatus(item),
      daysUntilOutOfStock: item.estimatedDaysRemaining || undefined
    }));

  return (
    <div>
      <PageMeta
        title="Inventory Report | YODY Admin Dashboard"
        description="View comprehensive inventory reports and analytics for your YODY store"
      />
      <PageBreadcrumb pageTitle="Inventory Report" />

      {/* Date Range Filter */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="this-week">This Week</option>
          <option value="last-week">Last Week</option>
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
          <option value="this-year">This Year</option>
          <option value="custom">Custom Range</option>
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

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <div className="bg-error-50 text-error-600 p-4 rounded-lg dark:bg-error-500/10 dark:text-error-400">
          {error}
          <button className="ml-4 text-sm underline" onClick={fetchInventoryData}>
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* Inventory Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</h3>
                  <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                    {inventorySummary.totalProducts}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
                  <svg className="h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock Value</h3>
                  <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                    {formatCurrency(inventorySummary.stockValue)}
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
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Items</h3>
                  <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                    {inventorySummary.lowStockItems}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning-50 dark:bg-warning-900/20">
                  <svg className="h-6 w-6 text-warning-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Out of Stock</h3>
                  <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                    {inventorySummary.outOfStockItems}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error-50 dark:bg-error-900/20">
                  <svg className="h-6 w-6 text-error-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                  Stock Level Distribution
                </h3>
                <Chart 
                  options={stockLevelOptions} 
                  series={stockLevelSeries} 
                  type="donut" 
                  height={350} 
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                  Stock Levels by Category
                </h3>
                <Chart 
                  options={categoryStockOptions} 
                  series={categoryStockSeries} 
                  type="bar" 
                  height={350} 
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Inventory Turnover Rate
              </h3>
              <Chart 
                options={turnoverRateOptions} 
                series={turnoverRateSeries} 
                type="line" 
                height={350} 
              />
            </div>
          </div>

          {/* Low Stock and Out of Stock Items */}
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-7.5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Low Stock and Out of Stock Items
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                >
                  <option value="all">All Status</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                />
              </div>
            </div>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Product Name</TableCell>
                    <TableCell isHeader>Category</TableCell>
                    <TableCell isHeader>In Stock</TableCell>
                    <TableCell isHeader>Reorder Point</TableCell>
                    <TableCell isHeader>Status</TableCell>
                    <TableCell isHeader>Days Until Out</TableCell>
                    <TableCell isHeader>Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockItems.length === 0 ? (
                    <TableRow>
                      <td colSpan={7} className="text-center py-8">
                        No low stock or out of stock items found.
                      </td>
                    </TableRow>
                  ) : (
                    lowStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <span className="font-medium text-gray-800 dark:text-white/90">
                            {item.name}
                          </span>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.inStock}</TableCell>
                        <TableCell>{item.reorderPoint}</TableCell>
                        <TableCell>
                          <Badge
                            color={
                              item.status === "In Stock"
                                ? "success"
                                : item.status === "Low Stock"
                                ? "warning"
                                : "error"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.daysUntilOutOfStock ? item.daysUntilOutOfStock : "—"}
                        </TableCell>
                        <TableCell>
                          <button className="rounded bg-brand-50 p-2 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20">
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
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

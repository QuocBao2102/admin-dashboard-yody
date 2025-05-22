import { useState, useEffect } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import TopSellingProducts from "../../components/yody/TopSellingProducts";
import PageMeta from "../../components/common/PageMeta";
import { orderService } from "../../services/order-service";
import { productService } from "../../services/product-service";
import { Order } from "../../types/order";
import { Product } from "../../types/product";

export default function Home() {
  // State for dashboard data
  const [salesMetrics, setSalesMetrics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0
  });
  const [monthlySalesData, setMonthlySalesData] = useState<any[]>([]);
  const [weeklyStatisticsData, setWeeklyStatisticsData] = useState<any[]>([]);
  const [targetData, setTargetData] = useState({
    currentSales: 0,
    targetSales: 1000000000, // 1 billion VND as default target
    percentageAchieved: 0
  });
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  // Loading states for different sections
  const [loading, setLoading] = useState({
    metrics: true,
    monthlySales: true,
    weeklyStats: true,
    target: true,
    topProducts: true
  });

  // Error states for different sections
  const [error, setError] = useState({
    metrics: false,
    monthlySales: false,
    weeklyStats: false,
    target: false,
    topProducts: false
  });

  useEffect(() => {
    // Fetch all dashboard data when component mounts
    fetchSalesMetrics();
    fetchMonthlySalesData();
    fetchWeeklyStatisticsData();
    fetchTopSellingProducts();
  }, []);

  // Fetch sales metrics data (total sales, orders, customers, average order value)
  const fetchSalesMetrics = async () => {
    try {
      // Get orders to calculate metrics
      const response = await orderService.getAllOrders(1, 1000);
      
      if (response?.data && Array.isArray(response.data)) {
        const orders = response.data;
        
        // Calculate total sales
        const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        // Calculate number of unique customers
        const uniqueCustomers = new Set(orders.map(order => order.userId)).size;
        
        // Calculate average order value
        const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;
        
        // Update sales metrics state
        setSalesMetrics({
          totalSales,
          totalOrders: orders.length,
          totalCustomers: uniqueCustomers,
          averageOrderValue
        });
        
        // Update target data based on actual sales
        setTargetData({
          currentSales: totalSales,
          targetSales: 1000000000, // 1 billion VND as default target
          percentageAchieved: (totalSales / 1000000000) * 100
        });
        
        // Update loading and error states
        setLoading(prev => ({ 
          ...prev, 
          metrics: false,
          target: false
        }));
        setError(prev => ({ 
          ...prev, 
          metrics: false,
          target: false
        }));
      }
    } catch (err) {
      console.error("Error fetching sales metrics:", err);
      setError(prev => ({ 
        ...prev, 
        metrics: true,
        target: true
      }));
    } finally {
      setLoading(prev => ({ 
        ...prev, 
        metrics: false,
        target: false
      }));
    }
  };

  // Fetch monthly sales data for charts
  const fetchMonthlySalesData = async () => {
    try {
      const response = await orderService.getAllOrders(1, 1000);
      
      if (response?.data && Array.isArray(response.data)) {
        const orders = response.data;
        
        // Process orders into monthly data
        const monthlyData = processOrdersIntoMonthlyData(orders);
        setMonthlySalesData(monthlyData);
        
        setLoading(prev => ({ ...prev, monthlySales: false }));
        setError(prev => ({ ...prev, monthlySales: false }));
      }
    } catch (err) {
      console.error("Error fetching monthly sales data:", err);
      setError(prev => ({ ...prev, monthlySales: true }));
    } finally {
      setLoading(prev => ({ ...prev, monthlySales: false }));
    }
  };

  // Process orders into monthly data format
  const processOrdersIntoMonthlyData = (orders: Order[]) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize data structure with zeros for all months
    const monthlyData = months.map(month => ({
      month,
      sales: 0,
      orders: 0
    }));
    
    // Aggregate order data by month
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthIndex = date.getMonth();
      
      // Add to the corresponding month's data
      monthlyData[monthIndex].sales += order.totalAmount;
      monthlyData[monthIndex].orders += 1;
    });
    
    return monthlyData;
  };

  // Fetch weekly statistics data for charts
  const fetchWeeklyStatisticsData = async () => {
    try {
      const response = await orderService.getAllOrders(1, 1000);
      
      if (response?.data && Array.isArray(response.data)) {
        const orders = response.data;
        
        // Process orders into weekly data
        const weeklyData = processOrdersIntoWeeklyData(orders);
        setWeeklyStatisticsData(weeklyData);
        
        setLoading(prev => ({ ...prev, weeklyStats: false }));
        setError(prev => ({ ...prev, weeklyStats: false }));
      }
    } catch (err) {
      console.error("Error fetching weekly statistics data:", err);
      setError(prev => ({ ...prev, weeklyStats: true }));
    } finally {
      setLoading(prev => ({ ...prev, weeklyStats: false }));
    }
  };

  // Process orders into weekly data format
  const processOrdersIntoWeeklyData = (orders: Order[]) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Initialize data structure with zeros for all days
    const weeklyData = days.map(day => ({
      day,
      sales: 0,
      orders: 0
    }));
    
    // Get orders from the last 7 days only
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Filter for recent orders only
    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= sevenDaysAgo;
    });
    
    // Aggregate order data by day of week
    recentOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Add to the corresponding day's data
      weeklyData[dayIndex].sales += order.totalAmount;
      weeklyData[dayIndex].orders += 1;
    });
    
    return weeklyData;
  };

  // Fetch top selling products
  const fetchTopSellingProducts = async () => {
    try {
      // In a real application, you would have an API endpoint to get top-selling products.
      // Here we'll just get all products and simulate "top selling" by taking the first few.
      const response = await productService.getAllProducts(1, 5);
      
      if (response && response.data) {
        // Extract products from the response, handling different API response formats
        let products: Product[] = [];
        
        if (Array.isArray(response.data)) {
          products = response.data;
        } else if (response.data.result && Array.isArray(response.data.result)) {
          products = response.data.result;
        } else if (response.data.content && Array.isArray(response.data.content)) {
          products = response.data.content;
        }

        // Add mock sales data for display purposes
        const productsWithSales = products.map((product, index) => ({
          ...product,
          salesCount: 100 - (index * 15), // Mock sales count (decreasing by position)
          salesAmount: (product.basePrice || product.price || 0) * (100 - (index * 15)) // Mock sales amount
        }));
        
        setTopProducts(productsWithSales);
        setLoading(prev => ({ ...prev, topProducts: false }));
        setError(prev => ({ ...prev, topProducts: false }));
      }
    } catch (err) {
      console.error("Error fetching top selling products:", err);
      setError(prev => ({ ...prev, topProducts: true }));
    } finally {
      setLoading(prev => ({ ...prev, topProducts: false }));
    }
  };

  return (
    <>
      <PageMeta
        title="YODY Admin Dashboard | Clothing Store Management"
        description="Admin dashboard for YODY clothing store - manage products, orders, customers and inventory"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics 
            loading={loading.metrics}
            error={error.metrics}
            data={salesMetrics}
          />

          <MonthlySalesChart 
            loading={loading.monthlySales}
            error={error.monthlySales}
            data={monthlySalesData}
          />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget 
            loading={loading.target}
            error={error.target}
            data={targetData}
          />
        </div>

        {/* <div className="col-span-12">
          <StatisticsChart 
            loading={loading.weeklyStats}
            error={error.weeklyStats}
            data={weeklyStatisticsData}
          />
        </div> */}

        <div className="col-span-12 xl:col-span-5">
          <TopSellingProducts
            loading={loading.topProducts}
            error={error.topProducts}
            products={topProducts}
          />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}

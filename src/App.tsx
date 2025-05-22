import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";

// Import YODY specific pages
import ProductList from "./pages/Products/ProductList";
import AddProduct from "./pages/Products/AddProduct";
import Categories from "./pages/Products/Categories";
import CustomerList from "./pages/Customers/CustomerList";
import AddCustomer from "./pages/Customers/AddCustomer";
import OrderList from "./pages/Orders/OrderList";
import OrderDetails from "./pages/Orders/OrderDetails";
import Inventory from "./pages/Inventory/Inventory";
import SalesReport from "./pages/Reports/SalesReport";
// import InventoryReport from "./pages/Reports/InventoryReport";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Products */}
            <Route path="/products" element={<ProductList />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/categories" element={<Categories />} />

            {/* Customers */}
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/add-customer" element={<AddCustomer />} />

            {/* Orders */}
            <Route path="/orders" element={<OrderList />} />
            <Route path="/order-details" element={<OrderDetails />} />
            <Route path="/order-details/:id" element={<OrderDetails />} />

            {/* Inventory */}
            <Route path="/inventory" element={<Inventory />} />

            {/* Reports */}
            <Route path="/sales-report" element={<SalesReport />} />
            {/* <Route path="/inventory-report" element={<InventoryReport />} /> */}

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

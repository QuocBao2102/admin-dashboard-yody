import { useState } from "react";
import { Link } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function AddCustomer() {
  const [customerData, setCustomerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
    membershipLevel: "Bronze",
    notes: "",
  });

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCustomerData({ ...customerData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Customer added successfully!");
    console.log(customerData);
    // Reset the form or redirect
  };

  return (
    <div>
      <PageMeta
        title="Add New Customer | YODY Admin Dashboard"
        description="Add a new customer to your database with contact information and preferences"
      />
      <PageBreadcrumb pageTitle="Add New Customer" />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] sm:p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Personal Information
              </h3>
            </div>
            
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="mb-2.5 block text-gray-700 dark:text-white/80"
              >
                First Name <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={customerData.firstName}
                onChange={handleInputChange}
                required
                placeholder="Enter first name"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="mb-2.5 block text-gray-700 dark:text-white/80"
              >
                Last Name <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={customerData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Enter last name"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2.5 block text-gray-700 dark:text-white/80"
              >
                Email <span className="text-error-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={customerData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2.5 block text-gray-700 dark:text-white/80"
              >
                Phone Number <span className="text-error-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={customerData.phone}
                onChange={handleInputChange}
                required
                placeholder="Enter phone number"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
              />
            </div>

            {/* Address Section */}
            <div className="md:col-span-2">
              <h3 className="mb-4 mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Address Information
              </h3>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="mb-2.5 block text-gray-700 dark:text-white/80"
              >
                Street Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={customerData.address}
                onChange={handleInputChange}
                placeholder="Enter street address"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
              />
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="mb-2.5 block text-gray-700 dark:text-white/80"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={customerData.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
              />
            </div>

            {/* District */}
            <div>
              <label
                htmlFor="district"
                className="mb-2.5 block text-gray-700 dark:text-white/80"
              >
                District
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={customerData.district}
                onChange={handleInputChange}
                placeholder="Enter district"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label
                htmlFor="postalCode"
                className="mb-2.5 block text-gray-700 dark:text-white/80"
              >
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={customerData.postalCode}
                onChange={handleInputChange}
                placeholder="Enter postal code"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
              />
            </div>

            {/* Membership Level */}
            <div>
              <label
                htmlFor="membershipLevel"
                className="mb-2.5 block text-gray-700 dark:text-white/80"
              >
                Membership Level
              </label>
              <select
                id="membershipLevel"
                name="membershipLevel"
                value={customerData.membershipLevel}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
              >
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label
                htmlFor="notes"
                className="mb-2.5 block text-gray-700 dark:text-white/80"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={customerData.notes}
                onChange={handleInputChange}
                rows={4}
                placeholder="Enter any additional notes about this customer"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-gray-800 hover:bg-brand-600 dark:text-gray-800"
            >
              Add Customer
            </button>
            <Link
              to="/customers"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

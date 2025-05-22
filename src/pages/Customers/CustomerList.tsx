import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { userService } from "../../services/user-service";
import { User } from "../../types/user";
import { Metadata } from "../../types/api";

export default function CustomerList() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata>({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
  });

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getAllUsers(
        metadata.page,
        metadata.pageSize
      );

      console.log("API Response (Users):", response);

      if (response && response.result) {
        setCustomers(response.result);

        // Set basic metadata
        setMetadata({
          ...metadata,
          totalItems: response.result.length,
          totalPages: Math.ceil(response.result.length / metadata.pageSize),
        });
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch users";
      setError(errorMsg);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [metadata.page, metadata.pageSize]);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.firstName &&
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.lastName &&
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.username &&
        customer.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phoneNumber && customer.phoneNumber.includes(searchTerm))
  );

  // Delete customer handler
  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await userService.deleteUser(id);
        setCustomers(customers.filter((customer) => customer.id !== id));
      } catch (err: any) {
        const errorMsg = err.message || "Failed to delete customer";
        setError(errorMsg);
        console.error("Error deleting customer:", err);
      }
    }
  };

  // Improved page navigation handlers
  const handlePrevPage = () => {
    if (metadata.page > 1) {
      setMetadata((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    // Allow moving to next page if current page is less than total pages
    if (metadata.page < metadata.totalPages) {
      setMetadata((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  // Get badge color based on membership level/role
  const getMembershipBadgeColor = (user: User) => {
    const isAdmin = user.roles?.some((role) => role.name === "ADMIN");

    if (isAdmin) {
      return "bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/10 dark:text-blue-light-500";
    }

    // Based on points or other criteria
    if (user.points > 1000) {
      return "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"; // Gold
    } else if (user.points > 500) {
      return "bg-gray-200 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"; // Silver
    } else {
      return "bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-500"; // Bronze
    }
  };

  // Get user's membership level based on role or points
  const getUserMembershipLevel = (user: User) => {
    if (user.roles?.some((role) => role.name === "ADMIN")) {
      return "Platinum";
    }

    if (user.points > 1000) {
      return "Gold";
    } else if (user.points > 500) {
      return "Silver";
    } else {
      return "Bronze";
    }
  };

  // Format date (ISO to DD/MM/YYYY)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Generate avatar placeholder when no image is available
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "XX";

    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  // Get avatar background color based on username (for consistency)
  const getAvatarColor = (username: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];

    // Simple hash function to consistently get the same color for the same user
    const hash = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div>
      <PageMeta
        title="Customer Management | YODY Admin Dashboard"
        description="Manage your customers - view, add, edit and delete customer profiles"
      />
      <PageBreadcrumb pageTitle="Customer Management" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-7.5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
            />
          </div>
          <Link
            to="/add-customer"
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
            Add New Customer
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        ) : error ? (
          <div className="bg-error-50 text-error-600 p-4 rounded-lg dark:bg-error-500/10 dark:text-error-400">
            {error}
            <button className="ml-4 text-sm underline" onClick={fetchUsers}>
              Try again
            </button>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Customer</TableCell>
                  <TableCell isHeader>Contact</TableCell>
                  <TableCell isHeader>Username</TableCell>
                  <TableCell isHeader>Member Since</TableCell>
                  <TableCell isHeader>Membership</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <td colSpan={7} className="text-center py-8">
                      No customers found.
                    </td>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-10 rounded-full flex items-center justify-center text-white ${getAvatarColor(
                              customer.username
                            )}`}
                          >
                            {getInitials(customer.firstName, customer.lastName)}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800 dark:text-white/90">
                              {customer.firstName} {customer.lastName}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ID: #{customer.id.substring(0, 8)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-gray-700 dark:text-white/80">
                            {customer.email}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {customer.phoneNumber || "No phone"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{customer.username}</TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getMembershipBadgeColor(
                            customer
                          )}`}
                        >
                          {getUserMembershipLevel(customer)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            customer.roles?.some((role) => role.name === "ADMIN")
                              ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400"
                          }`}
                        >
                          {customer.roles?.map((role) => role.name).join(", ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/customers/${customer.id}`}
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
                          <Link
                            to={`/edit-customer/${customer.id}`}
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
                            onClick={() => handleDeleteCustomer(customer.id)}
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
              {metadata.totalItems === 0
                ? 0
                : (metadata.page - 1) * metadata.pageSize + 1}{" "}
              to{" "}
              {Math.min(metadata.page * metadata.pageSize, metadata.totalItems)}{" "}
              of {metadata.totalItems} customers
            </div>
            <div className="flex gap-2">
              <button
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
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

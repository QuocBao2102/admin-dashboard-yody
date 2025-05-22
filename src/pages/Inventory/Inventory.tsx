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
import { inventoryService } from "../../services/inventory-service";
import { InventoryItem } from "../../types/inventory";
import { Metadata } from "../../types/api";

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
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

  // Fetch inventory from API
  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryService.getAllInventory(
        metadata.page,
        metadata.pageSize
      );

      console.log("API Response (Inventory):", response);

      // Xử lý linh hoạt các định dạng phản hồi API
      if (response) {
        // Xác định dữ liệu inventory
        let inventoryList: InventoryItem[] = [];
        let metadataInfo = { ...metadata };

        // Spring Boot pagination format
        if (response.content && Array.isArray(response.content)) {
          inventoryList = response.content;
          metadataInfo = {
            page: response.pageable?.pageNumber + 1 || 1,
            pageSize: response.pageable?.pageSize || 10,
            totalPages: response.totalPages || 1,
            totalItems: response.totalElements || inventoryList.length,
          };
        }
        // Custom format { data: [], metadata: {} }
        else if (response.data) {
          if (Array.isArray(response.data)) {
            inventoryList = response.data;
          } else if (
            response.data.content &&
            Array.isArray(response.data.content)
          ) {
            inventoryList = response.data.content;
          }

          if (response.metadata) {
            metadataInfo = {
              ...metadataInfo,
              totalPages: response.metadata.totalPages || 1,
              totalItems: response.metadata.totalItems || inventoryList.length,
            };
          } else if (response.data.metadata) {
            metadataInfo = {
              ...metadataInfo,
              totalPages: response.data.metadata.totalPages || 1,
              totalItems: response.data.metadata.totalItems || inventoryList.length,
            };
          }
        }
        // Array response
        else if (Array.isArray(response)) {
          inventoryList = response;
        }

        if (inventoryList.length > 0) {
          setInventory(inventoryList);
          setMetadata(metadataInfo);
        } else {
          setError("No inventory items found. The API returned an empty result.");
        }
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch inventory";
      setError(errorMsg);
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [metadata.page, metadata.pageSize]);

  // Determine inventory status based on quantities
  const getInventoryStatus = (item: InventoryItem) => {
    if (item.availableQuantity <= 0) {
      return { status: "Out of Stock", color: "error" };
    } else if (item.availableQuantity <= item.reorderLevel) {
      return { status: "Low Stock", color: "warning" };
    } else {
      return { status: "In Stock", color: "success" };
    }
  };

  // Filter inventory based on search term and status
  const filteredInventory = inventory.filter((item) => {
    const nameMatch = (item.productName || item.productId)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const warehouseMatch = item.warehouse?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const skuMatch = (item.sku || "").toLowerCase().includes(searchTerm.toLowerCase());

    const itemStatus = getInventoryStatus(item).status;

    return (
      (nameMatch || warehouseMatch || skuMatch) &&
      (filterStatus === "all" || itemStatus === filterStatus)
    );
  });

  // Update stock handler
  const handleStockUpdate = async (id: number, newStock: number) => {
    try {
      await inventoryService.updateInventoryQuantity(id, newStock);
      // Refresh inventory data after update
      fetchInventory();
    } catch (err: any) {
      const errorMsg = err.message || "Failed to update inventory";
      setError(errorMsg);
      console.error("Error updating inventory:", err);
    }
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
        title="Inventory Management | YODY Admin Dashboard"
        description="Track and manage your product inventory - monitor stock levels and reorder points"
      />
      <PageBreadcrumb pageTitle="Inventory Management" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-7.5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by product ID, warehouse or SKU..."
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
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
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
              onClick={fetchInventory}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Product ID</TableCell>
                  <TableCell isHeader>Warehouse</TableCell>
                  <TableCell isHeader>Location</TableCell>
                  <TableCell isHeader>In Stock</TableCell>
                  <TableCell isHeader>Reserved</TableCell>
                  <TableCell isHeader>Available</TableCell>
                  <TableCell isHeader>Reorder Level</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <td colSpan={9} className="text-center py-8">
                      No inventory items found.
                    </td>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    const status = getInventoryStatus(item);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <span className="font-medium text-gray-800 dark:text-white/90">
                            {item.productName || item.productId}
                          </span>
                        </TableCell>
                        <TableCell>{item.warehouse?.name}</TableCell>
                        <TableCell>{item.warehouse?.location}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.reservedQuantity}</TableCell>
                        <TableCell>{item.availableQuantity}</TableCell>
                        <TableCell>{item.reorderLevel}</TableCell>
                        <TableCell>
                          <Badge color={status.color as any}>
                            {status.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => {
                              const newStock = window.prompt(
                                "Enter new stock quantity:",
                                item.quantity.toString()
                              );
                              if (newStock !== null) {
                                const stockValue = parseInt(newStock, 10);
                                if (!isNaN(stockValue) && stockValue >= 0) {
                                  handleStockUpdate(item.id, stockValue);
                                } else {
                                  alert("Please enter a valid positive number");
                                }
                              }
                            }}
                            className="rounded bg-brand-50 p-2 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500/20"
                          >
                            <svg
                              className="size-5"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.1665 2.5H5.83317C4.3565 2.5 3.1665 3.69 3.1665 5.16667V14.1667C3.1665 15.6433 4.3565 16.8333 5.83317 16.8333H14.1665C15.6432 16.8333 16.8332 15.6433 16.8332 14.1667V5.16667C16.8332 3.69 15.6432 2.5 14.1665 2.5Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 6.6665V13.3332"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M6.6665 10H13.3332"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
              {metadata.totalItems} inventory items
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

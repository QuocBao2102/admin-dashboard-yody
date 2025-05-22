import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { productService } from "../../services/product-service"; // Changed from category-service
import { Category } from "../../types/category";
import { Metadata } from "../../types/api";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    skuCode: "",
    parentId: null as number | null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata>({
    page: 1,
    pageSize: 1000, // Using large page size to get all categories at once
    totalPages: 1,
    totalItems: 0,
  });

  // Function to fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all categories with a large page size to get everything at once
      const response = await productService.getAllCategories(0, 1000);

      if (response && response.result) {
        setCategories(response.result);
        
        // Update metadata for informational purposes
        if (response.metadata) {
          setMetadata({
            ...metadata,
            totalItems: response.result.length,
            totalPages: 1, // We're getting everything on one page
          });
        }
      } else {
        throw new Error("Failed to retrieve categories data");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch categories";
      setError(errorMsg);
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch all categories on component mount
    fetchCategories();
  }, []); 

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.skuCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get parent category name
  const getParentCategoryName = (parentId: number | null) => {
    if (parentId === null) return "None (Main Category)";
    const parent = categories.find((cat) => cat.id === parentId);
    return parent ? parent.name : "Unknown";
  };

  // Delete category handler
  const handleDeleteCategory = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await productService.deleteCategory(id); // Changed from category-service
        setCategories(categories.filter((category) => category.id !== id));
      } catch (err: any) {
        const errorMsg = err.message || "Failed to delete category";
        alert(errorMsg);
        console.error("Error deleting category:", err);
      }
    }
  };

  // Add new category
  const handleAddCategory = async () => {
    if (newCategory.name.trim() === "") {
      alert("Category name is required");
      return;
    }

    if (newCategory.skuCode.trim() === "") {
      alert("SKU code is required");
      return;
    }

    try {
      const categoryData = {
        name: newCategory.name,
        skuCode: newCategory.skuCode,
        parentId: newCategory.parentId,
        slug: newCategory.name.toLowerCase().replace(/\s+/g, "-"),
      };

      const response = await productService.createCategory(categoryData);

      // Refresh categories to get the new data
      fetchCategories();

      setNewCategory({ name: "", skuCode: "", parentId: null });
      setIsAddModalOpen(false);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to create category";
      alert(errorMsg);
      console.error("Error creating category:", err);
    }
  };

  // Add a debug section if needed (can be removed in production)
  const debugInfo = () => {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="bg-gray-100 p-4 mb-4 rounded text-sm dark:bg-gray-800">
          <details>
            <summary>Debug Info</summary>
            <div>
              <p>Total categories: {categories.length}</p>
              <p>Filtered categories: {filteredCategories.length}</p>
            </div>
          </details>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <PageMeta
        title="Categories | YODY Admin Dashboard"
        description="Manage product categories - create, edit, and organize your product catalog"
      />
      <PageBreadcrumb pageTitle="Categories" />

      {debugInfo()}

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-7.5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
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
            Add New Category
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        ) : error ? (
          <div className="bg-error-50 text-error-600 p-4 rounded-lg dark:bg-error-500/10 dark:text-error-400">
            {error}
            <button className="ml-4 text-sm underline" onClick={fetchCategories}>
              Try again
            </button>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>ID</TableCell>
                  <TableCell isHeader>Category Name</TableCell>
                  <TableCell isHeader>SKU Code</TableCell>
                  <TableCell isHeader>Slug</TableCell>
                  <TableCell isHeader>Parent Category</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <td colSpan={6} className="text-center py-8">
                      {categories.length > 0 
                        ? "No matching categories found. Try adjusting your search." 
                        : "No categories found."}
                    </td>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.id}</TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {category.name}
                        </span>
                      </TableCell>
                      <TableCell>{category.skuCode}</TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>
                        <span
                          className={
                            category.parentId === null
                              ? "font-semibold text-brand-500"
                              : ""
                          }
                        >
                          {getParentCategoryName(category.parentId)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
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
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
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
            {/* Display a summary of shown categories */}
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredCategories.length} of {categories.length} categories
            </div>
          </div>
        )}

        {/* Remove pagination controls since we're displaying all categories */}

        {/* Add Category Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Add New Category
              </h3>
              <div className="mb-4">
                <label
                  htmlFor="categoryName"
                  className="mb-2 block text-gray-700 dark:text-white/80"
                >
                  Category Name <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="skuCode"
                  className="mb-2 block text-gray-700 dark:text-white/80"
                >
                  SKU Code <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  id="skuCode"
                  value={newCategory.skuCode}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, skuCode: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="parentCategory"
                  className="mb-2 block text-gray-700 dark:text-white/80"
                >
                  Parent Category
                </label>
                <select
                  id="parentCategory"
                  value={
                    newCategory.parentId !== null
                      ? newCategory.parentId
                      : ""
                  }
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      parentId: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="">None (Main Category)</option>
                  {categories
                    .filter((cat) => cat.parentId === null) // Only show main categories as parent options
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="rounded-lg bg-brand-500 px-4 py-2 text-gray-800 hover:bg-brand-600"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

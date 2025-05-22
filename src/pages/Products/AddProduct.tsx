import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { productService } from "../../services/product-service";
import { Category } from "../../types/category";
import { PLACEHOLDER_IMAGE, formatImageUrl, handleImageError } from "../../utils/image-utils";

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    basePrice: "0",
    discount: "0",
    thumbnailUrl: "",
    slug: "",
    status: "ACTIVE",
    baseSku: "",
    description: "",
    categoryId: "",
  });

  // Enhanced image URL validation
  const [imageError, setImageError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(PLACEHOLDER_IMAGE);

  // Load categories for dropdown - Updated to use productService directly
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        // Using large page size to get all categories at once
        const response = await productService.getAllCategories(0, 1000);
        
        if (response && response.result) {
          setCategories(response.result);
          console.log("Categories loaded:", response.result.length);
        } else {
          console.error("Invalid categories response format:", response);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Set a default image URL when the component loads
  useEffect(() => {
    // Initialize with a default image URL to avoid the "empty image" error
    setFormData(prev => ({
      ...prev,
      thumbnailUrl: 'https://placehold.co/400x400/EFEFEF/999999?text=No+Image'
    }));
    
    setPreviewImage('https://placehold.co/400x400/EFEFEF/999999?text=No+Image');
  }, []);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");
  };

  // Handle input change with enhanced image validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for thumbnailUrl
    if (name === 'thumbnailUrl') {
      // Clear previous image error
      setImageError(null);
      
      // Set the raw value in the form state
      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: value,
      }));
      
      // Only update preview if there's a value
      if (value) {
        try {
          // Format and validate the URL
          const formattedUrl = formatImageUrl(value);
          setPreviewImage(formattedUrl);
          
          // Test if the image loads
          const img = new Image();
          img.onload = () => {
            setPreviewImage(formattedUrl);
            setImageError(null);
          };
          img.onerror = () => {
            setImageError("Image URL may be invalid or inaccessible");
            setPreviewImage(PLACEHOLDER_IMAGE);
          };
          img.src = formattedUrl;
        } catch (err) {
          setImageError("Invalid image URL format");
          setPreviewImage(PLACEHOLDER_IMAGE);
        }
      } else {
        setPreviewImage(PLACEHOLDER_IMAGE);
      }
    } else {
      // Normal handling for other fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Auto-generate slug when name changes
    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  // Handle form submission with improved error handling and matching DB schema
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Product name is required");
      }

      if (!formData.categoryId) {
        throw new Error("Please select a category");
      }

      // Find selected category to include its details
      const selectedCategoryId = parseInt(formData.categoryId);
      const selectedCategory = categories.find(c => c.id === selectedCategoryId);
      
      if (!selectedCategory) {
        throw new Error("Invalid category selected");
      }

      // Ensure there's always an image URL - either the user entered one or we use a default
      const thumbnailUrl = formData.thumbnailUrl.trim() 
        ? formatImageUrl(formData.thumbnailUrl) 
        : 'https://placehold.co/400x400/EFEFEF/999999?text=No+Image';
      
      // Prepare data for API according to the database schema
      const productData = {
        name: formData.name,
        basePrice: parseFloat(formData.basePrice || "0"),
        discount: parseFloat(formData.discount || "0"),
        description: formData.description || '',
        thumbnailUrl: thumbnailUrl,
        thumbnail_url: thumbnailUrl, // Include both formats for compatibility
        slug: formData.slug || generateSlug(formData.name), // Ensure slug is not empty
        status: formData.status,
        sku: formData.baseSku || '', 
        product_code: formData.baseSku || `${selectedCategory.skuCode || 'PROD'}-${Math.floor(Math.random() * 10000)}`,
        rating: 0.0,
        category_id: selectedCategoryId
      };

      console.log("Sending data to API:", productData);
      console.log("Thumbnail URL:", thumbnailUrl);

      const response = await productService.createProduct(productData);
      console.log("Product created successfully:", response);
      
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        name: "",
        basePrice: "0",
        discount: "0",
        thumbnailUrl: "",
        slug: "",
        status: "ACTIVE",
        baseSku: "",
        description: "",
        categoryId: "",
      });
      
      // Reset image preview
      setPreviewImage(PLACEHOLDER_IMAGE);
      
      // Redirect to product list after a short delay
      setTimeout(() => {
        navigate("/products");
      }, 2000);
      
    } catch (err: any) {
      const errorMsg = err.message || "Failed to create product";
      setError(errorMsg);
      console.error("Error creating product:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get parent category options for better organization
  const getGroupedCategoryOptions = () => {
    // First get all parent categories (those with parentId === null)
    const parentCategories = categories.filter(c => c.parentId === null);
    
    // Create the options structure
    return parentCategories.map(parent => {
      const childCategories = categories.filter(c => c.parentId === parent.id);
      return (
        <optgroup key={parent.id} label={parent.name}>
          <option value={parent.id}>{parent.name} (Main)</option>
          {childCategories.map(child => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </optgroup>
      );
    });
  };

  // Add debug section for development
  const debugInfo = () => {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="bg-gray-100 p-4 mb-4 rounded text-sm dark:bg-gray-800">
          <details>
            <summary>Debug Info</summary>
            <div>
              <p>Categories loaded: {categories.length}</p>
              <p>Categories loading state: {categoriesLoading ? 'Loading...' : 'Completed'}</p>
              <p>Selected category ID: {formData.categoryId || 'None'}</p>
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
        title="Add New Product | YODY Admin Dashboard"
        description="Create a new product in your catalog"
      />
      <PageBreadcrumb pageTitle="Add New Product" />

      {/* Optional debug info for development */}
      {debugInfo()}

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-7.5">
        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-lg bg-success-50 p-4 text-success-600 dark:bg-success-500/10 dark:text-success-400">
            Product created successfully! Redirecting to product list...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-error-50 p-4 text-error-600 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Product Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-gray-700 dark:text-white/80"
              >
                Product Name <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                placeholder="Áo Sơ Mi Nam Cộc Tay Cafe"
                required
              />
            </div>

            {/* Base Price */}
            <div>
              <label
                htmlFor="basePrice"
                className="mb-2 block text-gray-700 dark:text-white/80"
              >
                Base Price (VND) <span className="text-error-500">*</span>
              </label>
              <input
                type="number"
                id="basePrice"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                min="0"
                step="1000"
                required
              />
            </div>

            {/* Discount */}
            <div>
              <label
                htmlFor="discount"
                className="mb-2 block text-gray-700 dark:text-white/80"
              >
                Discount Amount (VND)
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                min="0"
                step="1000"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="categoryId"
                className="mb-2 block text-gray-700 dark:text-white/80"
              >
                Category <span className="text-error-500">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                required
              >
                <option value="">Select a category</option>
                {categoriesLoading ? (
                  <option disabled>Loading categories...</option>
                ) : categories.length === 0 ? (
                  <option disabled>No categories available</option>
                ) : (
                  getGroupedCategoryOptions()
                )}
              </select>
              {categoriesLoading && (
                <div className="mt-2 text-sm text-gray-500">Loading categories...</div>
              )}
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-gray-700 dark:text-white/80"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>

            {/* Base SKU */}
            <div>
              <label
                htmlFor="baseSku"
                className="mb-2 block text-gray-700 dark:text-white/80"
              >
                SKU Code
              </label>
              <input
                type="text"
                id="baseSku"
                name="baseSku"
                value={formData.baseSku}
                onChange={handleChange}
                placeholder="NAM-ASMN9668"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty to auto-generate from category code
              </p>
            </div>

            {/* Thumbnail URL with enhanced error feedback */}
            <div>
              <label
                htmlFor="thumbnailUrl"
                className="mb-2 block text-gray-700 dark:text-white/80"
              >
                Thumbnail Image URL
              </label>
              <input
                type="text"
                id="thumbnailUrl"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                placeholder="https://yody.io/image.webp"
                className={`w-full rounded-lg border ${
                  imageError ? 'border-error-400' : 'border-gray-200'
                } bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90`}
              />
              {imageError && (
                <p className="mt-1 text-xs text-error-500">{imageError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter full URL including https:// for external images or leave as is to use a default image
              </p>
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="mb-2 block text-gray-700 dark:text-white/80"
              >
                Product URL Slug (auto-generated)
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="ao-so-mi-nam-coc-tay-cafe"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label
              htmlFor="description"
              className="mb-2 block text-gray-700 dark:text-white/80"
            >
              Product Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-600 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-gray-800 hover:bg-brand-600 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="size-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preview section with enhanced image handling */}
      {formData.name && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-5 py-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-7.5">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Product Preview
          </h3>
          <div className="flex flex-wrap gap-6">
            <div className="h-32 w-32 rounded-lg bg-gray-100 p-1 relative">
              <img
                src={previewImage}
                alt={formData.name}
                className="h-full w-full rounded-md object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                }}
              />
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-error-100/50 rounded-md">
                  <span className="text-error-600 text-xs text-center p-1">
                    Invalid image
                  </span>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-xl font-medium text-gray-800 dark:text-white/90">
                {formData.name}
              </h4>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                SKU: {formData.baseSku || "Will be auto-generated"}
              </p>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Slug: {formData.slug}
              </p>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Status: {formData.status}
              </p>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Category: {
                  formData.categoryId 
                    ? categories.find(c => c.id.toString() === formData.categoryId)?.name || "Unknown"
                    : "Not selected"
                }
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-xl font-semibold text-brand-600 dark:text-brand-400">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    minimumFractionDigits: 0,
                  }).format(parseFloat(formData.basePrice || "0") - parseFloat(formData.discount || "0"))}
                </p>
                {parseFloat(formData.discount) > 0 && (
                  <p className="text-sm line-through text-gray-500 dark:text-gray-400">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      minimumFractionDigits: 0,
                    }).format(parseFloat(formData.basePrice || "0"))}
                  </p>
                )}
              </div>
            </div>
          </div>
          {formData.description && (
            <div className="mt-4">
              <h5 className="font-medium text-gray-800 dark:text-white/90">
                Description:
              </h5>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                {formData.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "services/productService";
import {
  Product,
  ProductType,
  ProductCategory,
  ProductSortField,
  SortDirection,
  PRODUCT_TYPES,
  PRODUCT_CATEGORIES,
  getProductTypeColor,
  getProductCategoryColor,
} from "types/product";

const PAGE_SIZE = 10;

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<ProductType | "">("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<ProductSortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteConfirmSku, setDeleteConfirmSku] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProducts(
        currentPage,
        PAGE_SIZE,
        {
          type: typeFilter || undefined,
          category: categoryFilter || undefined,
          search: searchQuery || undefined,
        },
        {
          field: sortField,
          direction: sortDirection,
        },
      );
      setProducts(result.products);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, typeFilter, categoryFilter, searchQuery, sortField, sortDirection]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value as ProductType | "");
    setCurrentPage(1);
  };

  const handleCategoryFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value as ProductCategory | "");
    setCurrentPage(1);
  };

  const handleSort = (field: ProductSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Delete modal handlers
  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setDeleteConfirmSku("");
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
    setDeleteConfirmSku("");
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteProduct(productToDelete.id);
      closeDeleteModal();
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      setDeleteError("Failed to delete product. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const isDeleteEnabled =
    productToDelete && deleteConfirmSku === productToDelete.sku;

  const SortIcon = ({ field }: { field: ProductSortField }) => {
    if (sortField !== field) {
      return (
        <svg className="ml-1 inline size-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === "asc" ? (
      <svg className="ml-1 inline size-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="ml-1 inline size-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: ProductSortField;
    children: React.ReactNode;
  }) => {
    const isActive = sortField === field;
    return (
      <th
        className={`cursor-pointer px-6 py-3 text-left text-xs uppercase tracking-wider hover:bg-gray-100 ${
          isActive
            ? "font-bold text-gray-900"
            : "font-medium text-gray-500"
        }`}
        onClick={() => handleSort(field)}
      >
        <span className="flex items-center">
          {children}
          <SortIcon field={field} />
        </span>
      </th>
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
        <button className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
        <select
          value={typeFilter}
          onChange={handleTypeFilter}
          className="rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        >
          <option value="">All Types</option>
          {PRODUCT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={handleCategoryFilter}
          className="rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <div className="ml-auto text-sm text-gray-500">
          {totalCount} total products
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
          <button
            onClick={fetchProducts}
            className="ml-4 text-sm font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Image
              </th>
              <SortableHeader field="name">Name</SortableHeader>
              <SortableHeader field="sku">SKU</SortableHeader>
              <SortableHeader field="quantity">Qty</SortableHeader>
              <SortableHeader field="category">Category</SortableHeader>
              <SortableHeader field="type">Type</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
                    Loading products...
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  {searchQuery || typeFilter || categoryFilter
                    ? "No products found matching your filters."
                    : "No products found. Click 'Add Product' to create one."}
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="size-12 rounded-lg border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="flex size-12 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-gray-400">
                        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <code className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700">
                      {product.sku}
                    </code>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {product.quantity}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getProductCategoryColor(
                        product.category,
                      )}`}
                    >
                      {product.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getProductTypeColor(
                        product.type,
                      )}`}
                    >
                      {product.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/products/${product.id}/edit`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} products
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded px-3 py-1 text-sm ${
                  currentPage === page
                    ? "bg-gray-900 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeDeleteModal}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            {/* Close button */}
            <button
              onClick={closeDeleteModal}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="size-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Delete Product
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                This action cannot be undone. This will permanently delete the
                product:
              </p>
            </div>

            {/* Product Info */}
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="font-medium text-gray-900">
                {productToDelete.name}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                SKU:{" "}
                <code className="rounded bg-gray-200 px-1.5 py-0.5 text-gray-700">
                  {productToDelete.sku}
                </code>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="mb-4">
              <label
                htmlFor="confirm-sku"
                className="block text-sm font-medium text-gray-700"
              >
                Type <span className="font-mono font-bold">{productToDelete.sku}</span> to confirm:
              </label>
              <input
                type="text"
                id="confirm-sku"
                value={deleteConfirmSku}
                onChange={(e) => setDeleteConfirmSku(e.target.value)}
                placeholder="Enter SKU to confirm"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                autoComplete="off"
              />
            </div>

            {/* Error Message */}
            {deleteError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {deleteError}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!isDeleteEnabled || deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

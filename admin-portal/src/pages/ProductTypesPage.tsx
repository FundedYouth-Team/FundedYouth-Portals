import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getProductTypes,
  deleteProductType,
} from "services/productTypeService";
import {
  ProductTypeEntity,
  ProductTypeSortField,
  SortDirection,
} from "types/productType";

const PAGE_SIZE = 10;

export function ProductTypesPage() {
  const [productTypes, setProductTypes] = useState<ProductTypeEntity[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<ProductTypeSortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<ProductTypeEntity | null>(
    null,
  );
  const [deleteConfirmSku, setDeleteConfirmSku] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProductTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProductTypes(
        currentPage,
        PAGE_SIZE,
        {
          search: searchQuery || undefined,
        },
        {
          field: sortField,
          direction: sortDirection,
        },
      );
      setProductTypes(result.productTypes);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Error fetching product types:", err);
      setError("Failed to load product types. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, sortField, sortDirection]);

  useEffect(() => {
    fetchProductTypes();
  }, [fetchProductTypes]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field: ProductTypeSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Delete modal handlers
  const openDeleteModal = (productType: ProductTypeEntity) => {
    setTypeToDelete(productType);
    setDeleteConfirmSku("");
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setTypeToDelete(null);
    setDeleteConfirmSku("");
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!typeToDelete) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteProductType(typeToDelete.id);
      closeDeleteModal();
      fetchProductTypes();
    } catch (err) {
      console.error("Error deleting product type:", err);
      setDeleteError("Failed to delete product type. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const isDeleteEnabled =
    typeToDelete && deleteConfirmSku === typeToDelete.sku;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const SortIcon = ({ field }: { field: ProductTypeSortField }) => {
    if (sortField !== field) {
      return (
        <svg
          className="ml-1 inline size-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
    return sortDirection === "asc" ? (
      <svg
        className="ml-1 inline size-4 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="ml-1 inline size-4 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: ProductTypeSortField;
    children: React.ReactNode;
  }) => {
    const isActive = sortField === field;
    return (
      <th
        className={`cursor-pointer px-6 py-3 text-left text-xs uppercase tracking-wider hover:bg-gray-100 ${
          isActive ? "font-bold text-gray-900" : "font-medium text-gray-500"
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
        <h1 className="text-2xl font-bold text-gray-900">Product Types</h1>
        <Link
          to="/products/types/add"
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add Product Type
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search by name, SKU, or description..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
        <div className="ml-auto text-sm text-gray-500">
          {totalCount} total product types
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
          <button
            onClick={fetchProductTypes}
            className="ml-4 text-sm font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Product Types Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="name">Name</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                SKU
              </th>
              <SortableHeader field="created_at">Date Created</SortableHeader>
              <SortableHeader field="updated_at">Date Updated</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
                    Loading product types...
                  </div>
                </td>
              </tr>
            ) : productTypes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  {searchQuery
                    ? "No product types found matching your search."
                    : "No product types found. Click 'Add Product Type' to create one."}
                </td>
              </tr>
            ) : (
              productTypes.map((productType) => (
                <tr key={productType.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {productType.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate text-sm text-gray-500">
                      {productType.description || "—"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <code className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700">
                      {productType.sku}
                    </code>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(productType.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(productType.updated_at)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/products/types/${productType.id}/edit`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => openDeleteModal(productType)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}{" "}
            product types
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
      {deleteModalOpen && typeToDelete && (
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
                Delete Product Type
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                This action cannot be undone. This will permanently delete the
                product type:
              </p>
            </div>

            {/* Product Type Info */}
            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="font-medium text-gray-900">
                {typeToDelete.name}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                SKU:{" "}
                <code className="rounded bg-gray-200 px-1.5 py-0.5 text-gray-700">
                  {typeToDelete.sku}
                </code>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="mb-4">
              <label
                htmlFor="confirm-sku"
                className="block text-sm font-medium text-gray-700"
              >
                Type{" "}
                <span className="font-mono font-bold">{typeToDelete.sku}</span>{" "}
                to confirm:
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

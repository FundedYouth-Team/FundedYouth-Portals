import {
  ProductTypeEntity,
  ProductTypeField,
  ProductTypeSortField,
  SortDirection,
} from "types/productType";

/**
 * Mock product type data for development.
 * Replace with Supabase queries when product_types table is created.
 */
const MOCK_PRODUCT_TYPES: ProductTypeEntity[] = [];

/**
 * Fetch paginated list of product types with filtering and sorting.
 */
export async function getProductTypes(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    search?: string;
  },
  sort?: {
    field: ProductTypeSortField;
    direction: SortDirection;
  },
): Promise<{
  productTypes: ProductTypeEntity[];
  totalCount: number;
  totalPages: number;
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredTypes = [...MOCK_PRODUCT_TYPES];

  // Apply search filter
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredTypes = filteredTypes.filter(
      (pt) =>
        pt.name.toLowerCase().includes(searchLower) ||
        pt.sku.toLowerCase().includes(searchLower) ||
        (pt.description && pt.description.toLowerCase().includes(searchLower)),
    );
  }

  // Apply sorting
  if (sort) {
    filteredTypes.sort((a, b) => {
      let aVal: string = a[sort.field];
      let bVal: string = b[sort.field];

      // Handle string comparison
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();

      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const totalCount = filteredTypes.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const productTypes = filteredTypes.slice(from, to);

  return { productTypes, totalCount, totalPages };
}

/**
 * Fetch a single product type by ID.
 */
export async function getProductTypeById(
  id: string,
): Promise<ProductTypeEntity | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_PRODUCT_TYPES.find((pt) => pt.id === id) || null;
}

/**
 * Create a new product type.
 */
export async function createProductType(
  data: Omit<ProductTypeEntity, "id" | "created_at" | "updated_at">,
): Promise<ProductTypeEntity> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newProductType: ProductTypeEntity = {
    ...data,
    id: `pt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  MOCK_PRODUCT_TYPES.push(newProductType);

  return newProductType;
}

/**
 * Update a product type by ID.
 */
export async function updateProductType(
  id: string,
  updates: Partial<Omit<ProductTypeEntity, "id" | "created_at" | "updated_at">>,
): Promise<ProductTypeEntity> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = MOCK_PRODUCT_TYPES.findIndex((pt) => pt.id === id);
  if (index === -1) {
    throw new Error("Product type not found");
  }

  // Update the product type in mock data
  MOCK_PRODUCT_TYPES[index] = {
    ...MOCK_PRODUCT_TYPES[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  return MOCK_PRODUCT_TYPES[index];
}

/**
 * Delete a product type by ID.
 */
export async function deleteProductType(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = MOCK_PRODUCT_TYPES.findIndex((pt) => pt.id === id);
  if (index === -1) {
    throw new Error("Product type not found");
  }

  // Remove the product type from mock data
  MOCK_PRODUCT_TYPES.splice(index, 1);
}

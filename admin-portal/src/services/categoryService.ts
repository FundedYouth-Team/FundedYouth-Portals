import {
  CategoryEntity,
  CategorySortField,
  SortDirection,
} from "types/category";

/**
 * Mock category data for development.
 * Replace with Supabase queries when categories table is created.
 */
const MOCK_CATEGORIES: CategoryEntity[] = [];

/**
 * Fetch paginated list of categories with filtering and sorting.
 */
export async function getCategories(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    search?: string;
  },
  sort?: {
    field: CategorySortField;
    direction: SortDirection;
  },
): Promise<{
  categories: CategoryEntity[];
  totalCount: number;
  totalPages: number;
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredCategories = [...MOCK_CATEGORIES];

  // Apply search filter
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredCategories = filteredCategories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchLower) ||
        (cat.description && cat.description.toLowerCase().includes(searchLower)),
    );
  }

  // Apply sorting
  if (sort) {
    filteredCategories.sort((a, b) => {
      let aVal: string = a[sort.field] || "";
      let bVal: string = b[sort.field] || "";

      // Handle string comparison
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();

      if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const totalCount = filteredCategories.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const categories = filteredCategories.slice(from, to);

  return { categories, totalCount, totalPages };
}

/**
 * Fetch a single category by ID.
 */
export async function getCategoryById(
  id: string,
): Promise<CategoryEntity | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_CATEGORIES.find((cat) => cat.id === id) || null;
}

/**
 * Create a new category.
 */
export async function createCategory(
  data: Omit<CategoryEntity, "id" | "created_at" | "updated_at">,
): Promise<CategoryEntity> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newCategory: CategoryEntity = {
    ...data,
    id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  MOCK_CATEGORIES.push(newCategory);

  return newCategory;
}

/**
 * Update a category by ID.
 */
export async function updateCategory(
  id: string,
  updates: Partial<Omit<CategoryEntity, "id" | "created_at" | "updated_at">>,
): Promise<CategoryEntity> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = MOCK_CATEGORIES.findIndex((cat) => cat.id === id);
  if (index === -1) {
    throw new Error("Category not found");
  }

  // Update the category in mock data
  MOCK_CATEGORIES[index] = {
    ...MOCK_CATEGORIES[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  return MOCK_CATEGORIES[index];
}

/**
 * Delete a category by ID.
 */
export async function deleteCategory(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = MOCK_CATEGORIES.findIndex((cat) => cat.id === id);
  if (index === -1) {
    throw new Error("Category not found");
  }

  // Remove the category from mock data
  MOCK_CATEGORIES.splice(index, 1);
}

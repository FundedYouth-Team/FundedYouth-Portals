/**
 * Product type definitions for Admin Portal.
 */

export type ProductType = "physical" | "digital" | "subscription" | "service";

export type ProductCategory =
  | "software"
  | "hardware"
  | "accessories"
  | "services"
  | "bundles";

/**
 * Custom field values stored with a product
 * Key is the field ID, value is the field value
 */
export type ProductCustomFields = Record<string, string | number | boolean | string[]>;

/**
 * Product from products table
 */
export interface Product {
  id: string;
  name: string;
  sku: string;
  type: string; // References product_types table
  category: string; // References categories table
  quantity: number;
  image_url: string | null;
  description: string | null;
  price: number;
  is_active: boolean;
  custom_fields: ProductCustomFields | null;
  created_at: string;
  updated_at: string;
}

/**
 * Sort field options for products
 */
export type ProductSortField =
  | "name"
  | "sku"
  | "type"
  | "quantity"
  | "category";

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

/**
 * Product type labels for display
 */
export const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "physical", label: "Physical" },
  { value: "digital", label: "Digital" },
  { value: "subscription", label: "Subscription" },
  { value: "service", label: "Service" },
];

/**
 * Product category labels for display
 */
export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "accessories", label: "Accessories" },
  { value: "services", label: "Services" },
  { value: "bundles", label: "Bundles" },
];

/**
 * Get badge color for product type
 * Since types are now dynamic, returns a consistent color for all types
 */
export function getProductTypeColor(type: string): string {
  return "bg-blue-100 text-blue-800";
}

/**
 * Get badge color for product category
 * Since categories are now dynamic, returns a consistent color for all categories
 */
export function getProductCategoryColor(category: string): string {
  return "bg-purple-100 text-purple-800";
}

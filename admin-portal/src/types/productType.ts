/**
 * Product Type entity definitions for Admin Portal.
 * This represents the product_types table for managing product type configurations.
 */

/**
 * Available input types for dynamic fields
 */
export type FieldInputType =
  | "text"
  | "number"
  | "email"
  | "url"
  | "textarea"
  | "select"
  | "checkbox"
  | "date";

/**
 * Input type options for display
 */
export const FIELD_INPUT_TYPES: { value: FieldInputType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
];

/**
 * Dynamic field definition for product types
 */
export interface ProductTypeField {
  id: string;
  name: string;
  inputType: FieldInputType;
  placeholder: string;
  presetData: string[] | null; // For select dropdowns or preset values
  isRequired: boolean;
  order: number;
}

/**
 * Product Type entity from product_types table
 */
export interface ProductTypeEntity {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  fields: ProductTypeField[];
  created_at: string;
  updated_at: string;
}

/**
 * Sort field options for product types
 */
export type ProductTypeSortField = "name" | "created_at" | "updated_at";

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

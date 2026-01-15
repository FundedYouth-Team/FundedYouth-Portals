/**
 * Category type definitions for Admin Portal.
 * This represents the categories table for managing product categories.
 */

/**
 * Category entity from categories table
 */
export interface CategoryEntity {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Sort field options for categories
 */
export type CategorySortField = "name" | "created_at" | "updated_at";

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

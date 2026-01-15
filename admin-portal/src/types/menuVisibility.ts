/**
 * Menu Visibility type definitions for Admin Portal.
 * Controls which pages are visible in the Admin and User Dashboard menus.
 */

/**
 * Represents a menu item's visibility settings
 */
export interface MenuItemVisibility {
  id: string;
  name: string;
  path: string;
  icon?: string;
  isVisible: boolean;
  isParent?: boolean;
  children?: MenuItemVisibility[];
}

/**
 * Dashboard type identifier
 */
export type DashboardType = "admin" | "user";

/**
 * Menu visibility configuration for a dashboard
 */
export interface DashboardMenuConfig {
  dashboard: DashboardType;
  label: string;
  menuItems: MenuItemVisibility[];
}

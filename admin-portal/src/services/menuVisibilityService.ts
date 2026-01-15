import {
  MenuItemVisibility,
  DashboardType,
  DashboardMenuConfig,
} from "types/menuVisibility";

/**
 * Mock menu visibility data for Admin Dashboard
 */
const ADMIN_MENU_ITEMS: MenuItemVisibility[] = [
  {
    id: "admin-dashboard",
    name: "Dashboard",
    path: "/",
    isVisible: true,
  },
  {
    id: "admin-users",
    name: "Users",
    path: "/users",
    isVisible: true,
  },
  {
    id: "admin-products",
    name: "Products",
    path: "/products",
    isVisible: true,
    isParent: true,
    children: [
      {
        id: "admin-products-all",
        name: "All Products",
        path: "/products",
        isVisible: true,
      },
      {
        id: "admin-products-types",
        name: "Product Type",
        path: "/products/types",
        isVisible: true,
      },
    ],
  },
  {
    id: "admin-vps",
    name: "VPS Management",
    path: "/vps",
    isVisible: true,
  },
  {
    id: "admin-services",
    name: "Services",
    path: "/services",
    isVisible: true,
  },
  {
    id: "admin-notifications",
    name: "Notifications",
    path: "/notifications",
    isVisible: true,
  },
  {
    id: "admin-tickets",
    name: "Tickets",
    path: "/tickets",
    isVisible: true,
  },
];

/**
 * Mock menu visibility data for User Dashboard
 */
const USER_MENU_ITEMS: MenuItemVisibility[] = [
  {
    id: "user-dashboard",
    name: "Dashboard",
    path: "/dashboard",
    isVisible: true,
  },
  {
    id: "user-services",
    name: "My Services",
    path: "/services",
    isVisible: true,
  },
  {
    id: "user-vps",
    name: "VPS Instances",
    path: "/vps",
    isVisible: true,
  },
  {
    id: "user-billing",
    name: "Billing",
    path: "/billing",
    isVisible: true,
  },
  {
    id: "user-invoices",
    name: "Invoices",
    path: "/invoices",
    isVisible: true,
  },
  {
    id: "user-support",
    name: "Support",
    path: "/support",
    isVisible: true,
  },
  {
    id: "user-tickets",
    name: "Tickets",
    path: "/tickets",
    isVisible: true,
  },
  {
    id: "user-profile",
    name: "Profile",
    path: "/profile",
    isVisible: true,
  },
];

/**
 * Get menu visibility configuration for all dashboards
 */
export async function getMenuVisibilityConfig(): Promise<DashboardMenuConfig[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    {
      dashboard: "admin",
      label: "Admin Dashboard Menu",
      menuItems: ADMIN_MENU_ITEMS,
    },
    {
      dashboard: "user",
      label: "User Dashboard Menu",
      menuItems: USER_MENU_ITEMS,
    },
  ];
}

/**
 * Update menu item visibility
 */
export async function updateMenuItemVisibility(
  dashboard: DashboardType,
  itemId: string,
  isVisible: boolean,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const menuItems = dashboard === "admin" ? ADMIN_MENU_ITEMS : USER_MENU_ITEMS;

  // Find and update the item (including nested children)
  const updateItem = (items: MenuItemVisibility[]): boolean => {
    for (const item of items) {
      if (item.id === itemId) {
        item.isVisible = isVisible;
        return true;
      }
      if (item.children) {
        if (updateItem(item.children)) {
          return true;
        }
      }
    }
    return false;
  };

  const found = updateItem(menuItems);
  if (!found) {
    throw new Error("Menu item not found");
  }
}

/**
 * Bulk update menu visibility for a dashboard
 */
export async function bulkUpdateMenuVisibility(
  dashboard: DashboardType,
  updates: { itemId: string; isVisible: boolean }[],
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  for (const update of updates) {
    await updateMenuItemVisibility(dashboard, update.itemId, update.isVisible);
  }
}

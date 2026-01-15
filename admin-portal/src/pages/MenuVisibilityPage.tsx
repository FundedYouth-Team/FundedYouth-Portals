import { useState, useEffect } from "react";
import {
  getMenuVisibilityConfig,
  updateMenuItemVisibility,
} from "services/menuVisibilityService";
import {
  DashboardMenuConfig,
  MenuItemVisibility,
  DashboardType,
} from "types/menuVisibility";

export function MenuVisibilityPage() {
  const [configs, setConfigs] = useState<DashboardMenuConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMenuVisibilityConfig();
        setConfigs(data);
      } catch (err) {
        console.error("Error fetching menu visibility config:", err);
        setError("Failed to load menu visibility settings.");
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const handleToggle = async (
    dashboard: DashboardType,
    itemId: string,
    currentValue: boolean,
  ) => {
    setSaving(itemId);
    setError(null);

    try {
      await updateMenuItemVisibility(dashboard, itemId, !currentValue);

      // Update local state
      setConfigs((prev) =>
        prev.map((config) => {
          if (config.dashboard !== dashboard) return config;

          const updateItems = (
            items: MenuItemVisibility[],
          ): MenuItemVisibility[] =>
            items.map((item) => {
              if (item.id === itemId) {
                return { ...item, isVisible: !currentValue };
              }
              if (item.children) {
                return { ...item, children: updateItems(item.children) };
              }
              return item;
            });

          return { ...config, menuItems: updateItems(config.menuItems) };
        }),
      );

      setSuccess(itemId);
      setTimeout(() => setSuccess(null), 1500);
    } catch (err) {
      console.error("Error updating menu visibility:", err);
      setError("Failed to update menu visibility.");
    } finally {
      setSaving(null);
    }
  };

  const MenuItemRow = ({
    item,
    dashboard,
    isChild = false,
  }: {
    item: MenuItemVisibility;
    dashboard: DashboardType;
    isChild?: boolean;
  }) => {
    const isSaving = saving === item.id;
    const isSuccess = success === item.id;

    return (
      <>
        <div
          className={`flex items-center justify-between border-b border-gray-100 py-3 ${
            isChild ? "pl-8" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            {isChild && (
              <span className="text-gray-300">└</span>
            )}
            <div>
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-sm text-gray-500">{item.path}</div>
            </div>
            {item.isParent && (
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                Parent Menu
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isSuccess && (
              <span className="text-sm text-green-600">Saved!</span>
            )}
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={item.isVisible}
                onChange={() =>
                  handleToggle(dashboard, item.id, item.isVisible)
                }
                disabled={isSaving}
                className="peer sr-only"
              />
              <div
                className={`peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 ${
                  isSaving ? "opacity-50" : ""
                }`}
              ></div>
              <span className="ml-3 min-w-[60px] text-sm font-medium text-gray-700">
                {item.isVisible ? "Visible" : "Hidden"}
              </span>
            </label>
          </div>
        </div>
        {item.children?.map((child) => (
          <MenuItemRow
            key={child.id}
            item={child}
            dashboard={dashboard}
            isChild
          />
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
          Loading menu settings...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Visibility</h1>
        <p className="mt-1 text-sm text-gray-500">
          Control which pages are visible in the Admin Dashboard and User
          Dashboard navigation menus.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Dashboard Sections */}
      <div className="space-y-8">
        {configs.map((config) => (
          <div
            key={config.dashboard}
            className="overflow-hidden rounded-lg bg-white shadow"
          >
            {/* Section Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {config.label}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {config.dashboard === "admin"
                  ? "Menu items shown in the Admin Portal sidebar navigation."
                  : "Menu items shown in the User Portal sidebar navigation."}
              </p>
            </div>

            {/* Menu Items */}
            <div className="px-6 py-2">
              {config.menuItems.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  dashboard={config.dashboard}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Info Note */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <svg
            className="size-5 flex-shrink-0 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Note</p>
            <p className="mt-1">
              Changes take effect immediately. Hidden menu items will no longer
              appear in the navigation for users. Admin-only pages (Role
              Management, Audit Logs, Menu Visibility) cannot be hidden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

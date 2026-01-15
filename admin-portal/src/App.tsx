import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "layouts/AdminLayout";
import { DashboardPage } from "pages/DashboardPage";
import { UsersPage } from "pages/UsersPage";
import { UserDetailPage } from "pages/UserDetailPage";
import { VpsListPage } from "pages/VpsListPage";
import { VpsDetailPage } from "pages/VpsDetailPage";
import { ServicesPage } from "pages/ServicesPage";
import { ProductsPage } from "pages/ProductsPage";
import { ProductEditPage } from "pages/ProductEditPage";
import { ProductTypesPage } from "pages/ProductTypesPage";
import { ProductTypeAddPage } from "pages/ProductTypeAddPage";
import { ProductTypeEditPage } from "pages/ProductTypeEditPage";
import { CategoriesPage } from "pages/CategoriesPage";
import { NotificationsPage } from "pages/NotificationsPage";
import { TicketsPage } from "pages/TicketsPage";
import { RoleManagementPage } from "pages/RoleManagementPage";
import { AuditLogsPage } from "pages/AuditLogsPage";
import { MenuVisibilityPage } from "pages/MenuVisibilityPage";
import { LoginPage } from "pages/LoginPage";
import { RequireAdminOrManager, RequireAdmin } from "guards";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAdminOrManager>
            <AdminLayout />
          </RequireAdminOrManager>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:userId" element={<UserDetailPage />} />
        <Route path="vps" element={<VpsListPage />} />
        <Route path="vps/:vpsId" element={<VpsDetailPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:productId/edit" element={<ProductEditPage />} />
        <Route path="products/types" element={<ProductTypesPage />} />
        <Route path="products/types/add" element={<ProductTypeAddPage />} />
        <Route path="products/types/:typeId/edit" element={<ProductTypeEditPage />} />
        <Route path="products/categories" element={<CategoriesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        {/* Admin-only routes - RequireAdmin guard enforces admin role */}
        <Route
          path="roles"
          element={
            <RequireAdmin>
              <RoleManagementPage />
            </RequireAdmin>
          }
        />
        <Route
          path="audit-logs"
          element={
            <RequireAdmin>
              <AuditLogsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="menu-visibility"
          element={
            <RequireAdmin>
              <MenuVisibilityPage />
            </RequireAdmin>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

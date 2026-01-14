import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { isAdminOrManager } from "../lib/roles";
import { UnauthorizedRedirect } from "./UnauthorizedRedirect";
import { LoadingScreen } from "../components/LoadingScreen";

interface RequireAdminOrManagerProps {
  children: ReactNode;
}

/**
 * Guard component that allows users with admin OR manager role.
 * Uses denial-by-default: users without valid admin/manager role are redirected.
 *
 * Use this for:
 * - General admin portal access
 * - Customer management pages
 * - Invoice viewing
 */
export function RequireAdminOrManager({
  children,
}: RequireAdminOrManagerProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Denial-by-default: must be authenticated AND have admin or manager role
  if (!user || !isAdminOrManager(role)) {
    return <UnauthorizedRedirect reason="admin-or-manager-required" />;
  }

  return <>{children}</>;
}

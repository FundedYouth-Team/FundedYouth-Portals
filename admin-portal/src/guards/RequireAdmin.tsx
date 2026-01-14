import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { isAdmin } from "../lib/roles";
import { UnauthorizedRedirect } from "./UnauthorizedRedirect";
import { LoadingScreen } from "../components/LoadingScreen";

interface RequireAdminProps {
  children: ReactNode;
}

/**
 * Guard component that only allows users with admin role.
 * Uses denial-by-default: any non-admin is redirected.
 *
 * Use this for:
 * - Role management UI
 * - Any admin-only functionality
 */
export function RequireAdmin({ children }: RequireAdminProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Denial-by-default: must be authenticated AND have admin role
  if (!user || !isAdmin(role)) {
    return <UnauthorizedRedirect reason="admin-required" />;
  }

  return <>{children}</>;
}

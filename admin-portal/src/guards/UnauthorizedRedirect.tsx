import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface UnauthorizedRedirectProps {
  reason: "not-authenticated" | "admin-required" | "admin-or-manager-required";
}

/**
 * Handles redirect for unauthorized access attempts.
 * - Unauthenticated users -> /login (within SPA)
 * - Authenticated but wrong role -> shows access denied (no redirect to prevent loops)
 */
export function UnauthorizedRedirect({ reason }: UnauthorizedRedirectProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Not authenticated: redirect to login page within SPA
      navigate("/login", { replace: true });
    }
    // If user is authenticated but lacks role, we stay on this page
    // to show the access denied message (prevents redirect loops in dev)
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mb-4 text-xl text-gray-600">
          {reason === "not-authenticated" && "Please sign in to continue."}
          {reason === "admin-required" &&
            "You do not have permission to access this page."}
          {reason === "admin-or-manager-required" &&
            "You do not have permission to access this page."}
        </div>
        <div className="text-gray-500">Redirecting...</div>
      </div>
    </div>
  );
}

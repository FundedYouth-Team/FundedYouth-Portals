import { useState, useEffect, useCallback } from "react";
import { ManagedUser } from "types/user";
import { Role, ROLES } from "lib/roles";
import { useAuth } from "contexts/AuthContext";
import { supabase } from "lib/supabaseClient";
import { logRoleChange } from "services/auditLogger";

/**
 * Role Management Page - Admin Only
 *
 * This page allows admins to assign and revoke user roles.
 * Managers cannot access this page (protected by RequireAdmin guard).
 *
 * SECURITY:
 * - Role changes go through the assign-role Edge Function
 * - Edge Function verifies requester is admin
 * - Frontend never writes to app_metadata directly
 */
export function RoleManagementPage() {
  const { user: currentUser, role: currentUserRole } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showNotice, setShowNotice] = useState(true);
  const [showRoleDescriptions, setShowRoleDescriptions] = useState(true);

  // Reset password modal state
  const [resetPasswordUser, setResetPasswordUser] = useState<ManagedUser | null>(null);
  const [resetEmailConfirm, setResetEmailConfirm] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } =
        await supabase.functions.invoke("admin-list-users");

      if (fetchError) {
        throw fetchError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const mappedUsers: ManagedUser[] = data.users.map(
        (u: {
          id: string;
          email: string;
          role: string | null;
          created_at: string;
          last_sign_in_at: string | null;
        }) => ({
          id: u.id,
          email: u.email,
          role: u.role as Role | null,
          lastSignIn: u.last_sign_in_at,
          createdAt: u.created_at,
        }),
      );

      setUsers(mappedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: Role | null) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const previousRole = targetUser.role;

    // Prevent self-demotion
    if (userId === currentUser?.id && newRole !== "admin") {
      setMessage({
        type: "error",
        text: "You cannot remove your own admin role.",
      });
      return;
    }

    setUpdating(userId);
    setMessage(null);

    try {
      // Call the assign-role Edge Function
      const { data, error: invokeError } = await supabase.functions.invoke(
        "assign-role",
        {
          body: {
            targetUserId: userId,
            newRole: newRole,
          },
        },
      );

      if (invokeError) {
        throw invokeError;
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to update role");
      }

      // Update local state
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );

      // Log the role change to audit log
      logRoleChange({
        actorId: currentUser?.id || "unknown",
        actorEmail: currentUser?.email || "unknown",
        actorRole: currentUserRole || "unknown",
        targetUserId: userId,
        targetEmail: targetUser.email,
        previousRole: previousRole,
        newRole: newRole,
        success: true,
      });

      setMessage({
        type: "success",
        text: `Role updated successfully for ${targetUser.email}`,
      });
    } catch (err) {
      // Log failed role change attempt
      logRoleChange({
        actorId: currentUser?.id || "unknown",
        actorEmail: currentUser?.email || "unknown",
        actorRole: currentUserRole || "unknown",
        targetUserId: userId,
        targetEmail: targetUser.email,
        previousRole: previousRole,
        newRole: newRole,
        success: false,
        errorMessage: err instanceof Error ? err.message : "Unknown error",
      });

      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update role",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser || resetEmailConfirm !== resetPasswordUser.email) {
      return;
    }

    setResettingPassword(true);
    setMessage(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "admin-reset-password",
        {
          body: { email: resetPasswordUser.email },
        },
      );

      if (invokeError) {
        throw invokeError;
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setMessage({
        type: "success",
        text: `Password reset email sent to ${resetPasswordUser.email}`,
      });

      // Close modal
      setResetPasswordUser(null);
      setResetEmailConfirm("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to send reset email",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const openResetPasswordModal = (user: ManagedUser) => {
    setResetPasswordUser(user);
    setResetEmailConfirm("");
  };

  const closeResetPasswordModal = () => {
    setResetPasswordUser(null);
    setResetEmailConfirm("");
  };

  const getRoleBadgeColor = (role: Role | null) => {
    switch (role) {
      case ROLES.ADMIN:
        return "bg-red-100 text-red-800";
      case ROLES.MANAGER:
        return "bg-blue-100 text-blue-800";
      case ROLES.USER:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Assign and revoke user roles. Only admins can access this page.
        </p>
      </div>

      {/* Security Notice */}
      <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50">
        <button
          onClick={() => setShowNotice(!showNotice)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex items-center">
            <div className="shrink-0">
              <svg
                className="size-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="ml-3 text-sm font-medium text-yellow-800">
              Admin-Only Action
            </h3>
          </div>
          <svg
            className={`size-5 text-yellow-600 transition-transform ${showNotice ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {showNotice && (
          <div className="border-t border-yellow-200 px-4 pb-4 pt-2">
            <p className="ml-8 text-sm text-yellow-700">
              Role changes are logged and audited. Changes take effect
              immediately upon the user&apos;s next login.
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
          <button
            onClick={fetchUsers}
            className="ml-4 text-sm font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div
          className={`mb-6 rounded-lg p-4 ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Role Descriptions */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white">
        <button
          onClick={() => setShowRoleDescriptions(!showRoleDescriptions)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            Role Descriptions
          </h2>
          <svg
            className={`size-5 text-gray-500 transition-transform ${showRoleDescriptions ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {showRoleDescriptions && (
          <div className="border-t border-gray-200 p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                    user
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Standard customer role. Access to customer portal only. Cannot
                  access admin portal.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                    manager
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Can access admin portal. Can view users, invoices, and manage
                  accounts. Cannot assign roles.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                    admin
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Full access. Can assign and revoke roles. Can perform all admin
                  operations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users List */}
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Users</h2>
      {users.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
          No users found.
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="space-y-4 lg:hidden">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-lg bg-white p-4 shadow"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-gray-900">
                      {user.email}
                      {user.id === currentUser?.id && (
                        <span className="ml-2 text-xs text-gray-500">(You)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {user.id.substring(0, 8)}...
                    </div>
                  </div>
                  <span
                    className={`ml-2 inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${getRoleBadgeColor(
                      user.role,
                    )}`}
                  >
                    {user.role || "No Role"}
                  </span>
                </div>
                <div className="mb-3 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Last Sign In:</span>{" "}
                  {user.lastSignIn
                    ? new Date(user.lastSignIn).toLocaleString()
                    : "Never"}
                </div>
                <div className="space-y-3 border-t border-gray-100 pt-3">
                  {user.id === currentUser?.id ? (
                    <span className="text-sm italic text-gray-500">
                      Cannot change own role
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Change Role:
                      </label>
                      <select
                        value={user.role || ""}
                        onChange={(e) =>
                          handleRoleChange(
                            user.id,
                            (e.target.value as Role) || null,
                          )
                        }
                        disabled={updating === user.id}
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
                      >
                        <option value="">No Role</option>
                        <option value={ROLES.USER}>User</option>
                        <option value={ROLES.MANAGER}>Manager</option>
                        <option value={ROLES.ADMIN}>Admin</option>
                      </select>
                      {updating === user.id && (
                        <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => openResetPasswordModal(user)}
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-lg bg-white shadow lg:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Current Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Last Sign In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {user.email}
                        {user.id === currentUser?.id && (
                          <span className="ml-2 text-xs text-gray-500">(You)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {user.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleBadgeColor(
                          user.role,
                        )}`}
                      >
                        {user.role || "No Role"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.lastSignIn
                        ? new Date(user.lastSignIn).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.id === currentUser?.id ? (
                          <span className="text-sm italic text-gray-500">
                            Cannot change own role
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={user.role || ""}
                              onChange={(e) =>
                                handleRoleChange(
                                  user.id,
                                  (e.target.value as Role) || null,
                                )
                              }
                              disabled={updating === user.id}
                              className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
                            >
                              <option value="">No Role</option>
                              <option value={ROLES.USER}>User</option>
                              <option value={ROLES.MANAGER}>Manager</option>
                              <option value={ROLES.ADMIN}>Admin</option>
                            </select>
                            {updating === user.id && (
                              <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => openResetPasswordModal(user)}
                          className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Reset Password
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              You are about to send a password reset email to:
            </p>
            <p className="mb-4 rounded bg-gray-100 p-3 font-medium text-gray-900">
              {resetPasswordUser.email}
            </p>
            <p className="mb-2 text-sm text-gray-600">
              To confirm, please type the email address below:
            </p>
            <input
              type="email"
              value={resetEmailConfirm}
              onChange={(e) => setResetEmailConfirm(e.target.value)}
              placeholder="Type email to confirm"
              className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={closeResetPasswordModal}
                disabled={resettingPassword}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={
                  resettingPassword ||
                  resetEmailConfirm !== resetPasswordUser.email
                }
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resettingPassword ? (
                  <span className="flex items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Sending...
                  </span>
                ) : (
                  "Send Reset Email"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

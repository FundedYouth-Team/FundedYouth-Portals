import { useState, useMemo } from "react";
import { getAuditLogs } from "services/auditLogger";
import { AuditAction, AuditLogEntry } from "types/auditLog";

const PAGE_SIZE = 10;

/**
 * Audit Logs Page - Admin Only
 *
 * Displays all audit log entries for security and compliance.
 * Shows role changes, sensitive data access, and other tracked events.
 */
export function AuditLogsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<AuditAction | "">("");

  const { logs, total, totalPages } = useMemo(() => {
    const result = getAuditLogs({
      limit: PAGE_SIZE,
      offset: (currentPage - 1) * PAGE_SIZE,
      action: actionFilter || undefined,
    });

    return {
      logs: result.logs,
      total: result.total,
      totalPages: Math.ceil(result.total / PAGE_SIZE),
    };
  }, [currentPage, actionFilter]);

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case "role_change":
        return "bg-purple-100 text-purple-800";
      case "sensitive_data_access":
        return "bg-amber-100 text-amber-800";
      case "subscription_modify":
        return "bg-blue-100 text-blue-800";
      case "login":
        return "bg-green-100 text-green-800";
      case "logout":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionLabel = (action: AuditAction) => {
    switch (action) {
      case "role_change":
        return "Role Change";
      case "sensitive_data_access":
        return "Sensitive Access";
      case "subscription_modify":
        return "Subscription Modify";
      case "login":
        return "Login";
      case "logout":
        return "Logout";
      default:
        return action;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const renderDetails = (log: AuditLogEntry) => {
    if (log.action === "role_change") {
      const prev = (log.details.previousRole as string) || "None";
      const next = (log.details.newRole as string) || "None";
      return (
        <span>
          <span className="text-gray-500">{prev}</span>
          <span className="mx-1">→</span>
          <span className="font-medium">{next}</span>
        </span>
      );
    }

    if (log.action === "sensitive_data_access") {
      return (
        <span className="text-amber-700">
          {log.details.dataType === "broker_password"
            ? "Viewed broker password"
            : "Accessed subscription edit"}
        </span>
      );
    }

    return null;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Security and compliance audit trail. Admin access only.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div>
          <label
            htmlFor="action-filter"
            className="block text-sm font-medium text-gray-700"
          >
            Filter by Action
          </label>
          <select
            id="action-filter"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value as AuditAction | "");
              setCurrentPage(1);
            }}
            className="mt-1 rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">All Actions</option>
            <option value="role_change">Role Changes</option>
            <option value="sensitive_data_access">Sensitive Data Access</option>
            <option value="subscription_modify">
              Subscription Modifications
            </option>
            <option value="login">Logins</option>
            <option value="logout">Logouts</option>
          </select>
        </div>
        <div className="ml-auto text-sm text-gray-500">
          {total} total entries
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No audit log entries found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatRelativeTime(log.timestamp)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getActionBadge(
                        log.action,
                      )}`}
                    >
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {log.actorEmail}
                    </div>
                    <div className="text-xs text-gray-500">
                      Role: {log.actorRole}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.targetDescription ? (
                      <div className="max-w-xs truncate text-sm text-gray-900">
                        {log.targetDescription}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {renderDetails(log) || (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {log.success ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        Success
                      </span>
                    ) : (
                      <span
                        className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800"
                        title={log.errorMessage}
                      >
                        Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(currentPage * PAGE_SIZE, total)} of {total} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded px-3 py-1 text-sm ${
                  currentPage === page
                    ? "bg-gray-900 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-2 font-medium text-gray-800">About Audit Logging</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>
            • <strong>Role Changes:</strong> All role assignments and
            revocations
          </li>
          <li>
            • <strong>Sensitive Data Access:</strong> Broker password views,
            subscription edits
          </li>
          <li>
            • <strong>Login/Logout:</strong> Admin portal authentication events
          </li>
          <li>• Logs are immutable and retained for compliance purposes</li>
        </ul>
      </div>
    </div>
  );
}

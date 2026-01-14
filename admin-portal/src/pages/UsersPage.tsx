import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "services/userService";
import { UserWithBilling } from "types/user";

const PAGE_SIZE = 10;

type SortColumn = "name" | "email" | "profile" | "billing" | "location" | "created";
type SortDirection = "asc" | "desc";

export function UsersPage() {
  const [users, setUsers] = useState<UserWithBilling[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUsers(
        currentPage,
        PAGE_SIZE,
        searchQuery || undefined,
      );
      setUsers(result.users);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const getBillingStatus = (user: UserWithBilling) => {
    if (!user.billing) return "no-billing";
    if (user.billing.stripe_customer_id) return "active";
    return "pending";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "no-billing":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "pending":
        return "Pending";
      case "no-billing":
        return "No Billing";
      default:
        return status;
    }
  };

  const isProfileComplete = (user: UserWithBilling) => {
    return Boolean(user.firstName && user.lastName && user.phone);
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New column, start with ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortedUsers = () => {
    return [...users].sort((a, b) => {
      let aValue: string | number | boolean = "";
      let bValue: string | number | boolean = "";

      switch (sortColumn) {
        case "name":
          aValue = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase();
          bValue = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "profile":
          aValue = isProfileComplete(a) ? "approved" : "pending";
          bValue = isProfileComplete(b) ? "approved" : "pending";
          break;
        case "billing":
          aValue = getBillingStatus(a);
          bValue = getBillingStatus(b);
          break;
        case "location":
          aValue = a.billing?.billing_city && a.billing?.billing_state
            ? `${a.billing.billing_city}, ${a.billing.billing_state}`.toLowerCase()
            : "";
          bValue = b.billing?.billing_city && b.billing?.billing_state
            ? `${b.billing.billing_city}, ${b.billing.billing_state}`.toLowerCase()
            : "";
          break;
        case "created":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return (
        <svg className="ml-1 inline size-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === "asc" ? (
      <svg className="ml-1 inline size-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="ml-1 inline size-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const sortedUsers = getSortedUsers();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">{totalCount} total users</div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Refresh users"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`size-5 ${loading ? "animate-spin" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg bg-gray-50 px-4 py-3 text-sm">
        <span className="font-medium text-gray-700">Key:</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="text-gray-600">Suspended Service</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
            Approved
          </span>
          <span className="text-gray-600">Profile Complete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
            Pending
          </span>
          <span className="text-gray-600">Profile Incomplete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
            Active
          </span>
          <span className="text-gray-600">Has Stripe Customer</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800">
            No Billing
          </span>
          <span className="text-gray-600">No Billing Info</span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
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

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className={`cursor-pointer px-6 py-3 text-left text-xs uppercase tracking-wider hover:bg-gray-100 ${
                  sortColumn === "name"
                    ? "bg-gray-100 font-bold text-gray-900"
                    : "font-medium text-gray-500"
                }`}
                onClick={() => handleSort("name")}
              >
                Name
                <SortIcon column="name" />
              </th>
              <th
                className={`cursor-pointer px-6 py-3 text-left text-xs uppercase tracking-wider hover:bg-gray-100 ${
                  sortColumn === "email"
                    ? "bg-gray-100 font-bold text-gray-900"
                    : "font-medium text-gray-500"
                }`}
                onClick={() => handleSort("email")}
              >
                Email
                <SortIcon column="email" />
              </th>
              <th
                className={`cursor-pointer px-6 py-3 text-left text-xs uppercase tracking-wider hover:bg-gray-100 ${
                  sortColumn === "profile"
                    ? "bg-gray-100 font-bold text-gray-900"
                    : "font-medium text-gray-500"
                }`}
                onClick={() => handleSort("profile")}
              >
                Profile
                <SortIcon column="profile" />
              </th>
              <th
                className={`cursor-pointer px-6 py-3 text-left text-xs uppercase tracking-wider hover:bg-gray-100 ${
                  sortColumn === "billing"
                    ? "bg-gray-100 font-bold text-gray-900"
                    : "font-medium text-gray-500"
                }`}
                onClick={() => handleSort("billing")}
              >
                Billing Status
                <SortIcon column="billing" />
              </th>
              <th
                className={`cursor-pointer px-6 py-3 text-left text-xs uppercase tracking-wider hover:bg-gray-100 ${
                  sortColumn === "location"
                    ? "bg-gray-100 font-bold text-gray-900"
                    : "font-medium text-gray-500"
                }`}
                onClick={() => handleSort("location")}
              >
                Location
                <SortIcon column="location" />
              </th>
              <th
                className={`cursor-pointer px-6 py-3 text-left text-xs uppercase tracking-wider hover:bg-gray-100 ${
                  sortColumn === "created"
                    ? "bg-gray-100 font-bold text-gray-900"
                    : "font-medium text-gray-500"
                }`}
                onClick={() => handleSort("created")}
              >
                Created
                <SortIcon column="created" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  {searchQuery
                    ? "No users found matching your search."
                    : "No users found."}
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => {
                const billingStatus = getBillingStatus(user);
                const displayName =
                  user.firstName || user.lastName
                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : "-";
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {displayName}
                        </span>
                        {user.hasSuspendedService && (
                          <span
                            className="inline-flex size-5 items-center justify-center rounded-full bg-red-100 text-red-600"
                            title="Has suspended service"
                          >
                            <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-gray-900">{user.email}</div>
                      <div className="text-xs text-gray-500">
                        ID: {user.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {isProfileComplete(user) ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(
                          billingStatus,
                        )}`}
                      >
                        {getStatusLabel(billingStatus)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.billing?.billing_city && user.billing?.billing_state
                        ? `${user.billing.billing_city}, ${user.billing.billing_state}`
                        : "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link
                        to={`/users/${user.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}{" "}
            users
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
    </div>
  );
}

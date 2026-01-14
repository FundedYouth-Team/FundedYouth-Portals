import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getVpsInstances } from "services/vpsService";
import { VpsWithUser, VpsStatus, getVpsStatusColor } from "types/vps";

const PAGE_SIZE = 10;

export function VpsListPage() {
  const [vpsInstances, setVpsInstances] = useState<VpsWithUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<VpsStatus | "">("");
  const [assignmentFilter, setAssignmentFilter] = useState<
    "" | "assigned" | "unassigned"
  >("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getVpsInstances(currentPage, PAGE_SIZE, {
        status: statusFilter || undefined,
        assignedOnly: assignmentFilter === "assigned",
        unassignedOnly: assignmentFilter === "unassigned",
        search: searchQuery || undefined,
      });
      setVpsInstances(result.vpsInstances);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Error fetching VPS instances:", err);
      setError("Failed to load VPS instances. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, assignmentFilter, searchQuery]);

  useEffect(() => {
    fetchVps();
  }, [fetchVps]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as VpsStatus | "");
    setCurrentPage(1);
  };

  const handleAssignmentFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAssignmentFilter(e.target.value as "" | "assigned" | "unassigned");
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">VPS Management</h1>
        <Link
          to="/vps/new"
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add VPS
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search by name, IP, or provider..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
        <select
          value={statusFilter}
          onChange={handleStatusFilter}
          className="rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        >
          <option value="">All Statuses</option>
          <option value="running">Running</option>
          <option value="pending">Pending</option>
          <option value="disabled">Disabled</option>
        </select>
        <select
          value={assignmentFilter}
          onChange={handleAssignmentFilter}
          className="rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        >
          <option value="">All VPS</option>
          <option value="assigned">Assigned Only</option>
          <option value="unassigned">Unassigned Only</option>
        </select>
        <div className="ml-auto text-sm text-gray-500">
          {totalCount} total VPS
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
          <button
            onClick={fetchVps}
            className="ml-4 text-sm font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* VPS Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                VPS Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                IP / Region
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Specs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Assigned To
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
                    Loading VPS instances...
                  </div>
                </td>
              </tr>
            ) : vpsInstances.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  {searchQuery || statusFilter || assignmentFilter
                    ? "No VPS instances found matching your filters."
                    : "No VPS instances found. Click 'Add VPS' to create one."}
                </td>
              </tr>
            ) : (
              vpsInstances.map((vps) => (
                <tr key={vps.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {vps.provider_vps_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {vps.operating_system}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {vps.host_provider}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-mono text-sm text-gray-900">
                      {vps.ip_address
                        ? vps.port
                          ? `${vps.ip_address}:${vps.port}`
                          : vps.ip_address
                        : "-"}
                    </div>
                    <div className="text-xs text-gray-500">{vps.region}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {vps.vcpu} vCPU / {vps.vram_gb} GB
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getVpsStatusColor(
                        vps.status,
                      )}`}
                    >
                      {vps.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {vps.assigned_user_email ? (
                      <Link
                        to={`/users/${vps.assigned_user_id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {vps.assigned_user_email}
                      </Link>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Link
                      to={`/vps/${vps.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
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
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} VPS
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

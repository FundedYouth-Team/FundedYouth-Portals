import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getVpsById,
  createVps,
  updateVps,
  deleteVps,
} from "services/vpsService";
import { getAllUsersForSelect } from "services/userService";
import {
  VpsCreateInput,
  VPS_PROVIDERS,
  VPS_OPERATING_SYSTEMS,
  VPS_REGIONS,
} from "types/vps";

export function VpsDetailPage() {
  const { vpsId } = useParams<{ vpsId: string }>();
  const navigate = useNavigate();
  const isNew = vpsId === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [formData, setFormData] = useState<VpsCreateInput>({
    host_provider: "",
    provider_vps_name: "",
    ip_address: "",
    port: null,
    region: "",
    operating_system: "",
    vcpu: 2,
    vram_gb: 4,
    status: "pending",
    assigned_user_id: null,
    notes: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch users for dropdown
        const userList = await getAllUsersForSelect();
        setUsers(userList);

        // Fetch VPS if editing
        if (!isNew && vpsId) {
          setLoading(true);
          const vps = await getVpsById(vpsId);
          if (vps) {
            setFormData({
              host_provider: vps.host_provider,
              provider_vps_name: vps.provider_vps_name,
              ip_address: vps.ip_address || "",
              port: vps.port,
              region: vps.region,
              operating_system: vps.operating_system,
              vcpu: vps.vcpu,
              vram_gb: vps.vram_gb,
              status: vps.status,
              assigned_user_id: vps.assigned_user_id,
              notes: vps.notes || "",
            });
          } else {
            setError("VPS not found.");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isNew, vpsId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "vcpu" || name === "vram_gb"
          ? parseInt(value) || 0
          : name === "port"
            ? value
              ? parseInt(value) || null
              : null
            : name === "assigned_user_id"
              ? value || null
              : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isNew) {
        await createVps(formData);
      } else if (vpsId) {
        await updateVps(vpsId, formData);
      }
      navigate("/vps");
    } catch (err: unknown) {
      console.error("Error saving VPS:", err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Unknown error";
      setError(`Failed to save VPS: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!vpsId || isNew) return;

    setDeleting(true);
    try {
      await deleteVps(vpsId);
      navigate("/vps");
    } catch (err) {
      console.error("Error deleting VPS:", err);
      setError("Failed to delete VPS. Please try again.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
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
        <Link
          to="/vps"
          className="mb-2 inline-block text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to VPS Management
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "Add New VPS" : "Edit VPS"}
        </h1>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Host Provider */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Host Provider *
              </label>
              <select
                name="host_provider"
                value={formData.host_provider}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">Select provider...</option>
                {VPS_PROVIDERS.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
            </div>

            {/* VPS Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Provider VPS Name *
              </label>
              <input
                type="text"
                name="provider_vps_name"
                value={formData.provider_vps_name}
                onChange={handleChange}
                required
                placeholder="e.g., vps-prod-001"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* IP Address */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                IP Address
              </label>
              <input
                type="text"
                name="ip_address"
                value={formData.ip_address || ""}
                onChange={handleChange}
                placeholder="e.g., 192.168.1.100"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* Port */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Port
              </label>
              <input
                type="number"
                name="port"
                value={formData.port ?? ""}
                onChange={handleChange}
                placeholder="e.g., 3389"
                min="1"
                max="65535"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* Region */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Region *
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">Select region...</option>
                {VPS_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Operating System */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Operating System *
              </label>
              <select
                name="operating_system"
                value={formData.operating_system}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">Select OS...</option>
                {VPS_OPERATING_SYSTEMS.map((os) => (
                  <option key={os} value={os}>
                    {os}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            {/* vCPU */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                vCPU *
              </label>
              <input
                type="number"
                name="vcpu"
                value={formData.vcpu}
                onChange={handleChange}
                required
                min="1"
                max="128"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* vRAM */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                RAM (GB) *
              </label>
              <input
                type="number"
                name="vram_gb"
                value={formData.vram_gb}
                onChange={handleChange}
                required
                min="1"
                max="512"
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* Assigned User */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Assigned User
              </label>
              <select
                name="assigned_user_id"
                value={formData.assigned_user_id || ""}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">Not assigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Add any notes about this VPS..."
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between border-t pt-6">
            <div>
              {!isNew && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Delete VPS
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                to="/vps"
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : isNew ? "Create VPS" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Delete VPS</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this VPS? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "contexts/AuthContext";
import type {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketFormData,
  AdminManagerUser,
  SimpleUser,
} from "types/ticket";
import {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  updateTicketStatus,
  getAdminsAndManagers,
  getAllUsers,
} from "services/ticketService";

type FilterTab = "all" | "my";
type StatusFilter = "all" | TicketStatus;

const emptyFormData: TicketFormData = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  due_date: "",
  assignee_id: "",
  support_assignees: [],
  related_user_id: "",
};

export function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState<TicketFormData>(emptyFormData);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Dropdown data
  const [adminsManagers, setAdminsManagers] = useState<AdminManagerUser[]>([]);
  const [allUsers, setAllUsers] = useState<SimpleUser[]>([]);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDropdownData = useCallback(async () => {
    setDropdownsLoading(true);
    try {
      const [admins, users] = await Promise.all([
        getAdminsAndManagers(),
        getAllUsers(),
      ]);
      setAdminsManagers(admins);
      setAllUsers(users);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    } finally {
      setDropdownsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchDropdownData();
  }, [fetchTickets, fetchDropdownData]);

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    // My tickets filter
    if (filterTab === "my" && user) {
      const isAssignee = ticket.assignee_id === user.id;
      const isSupport = ticket.support_assignees.includes(user.id);
      if (!isAssignee && !isSupport) return false;
    }

    // Status filter
    if (statusFilter !== "all" && ticket.status !== statusFilter) return false;

    return true;
  });

  // Helpers
  const getUserDisplay = (userId: string) => {
    const adminManager = adminsManagers.find((u) => u.id === userId);
    if (adminManager) {
      const name =
        adminManager.firstName || adminManager.lastName
          ? `${adminManager.firstName || ""} ${adminManager.lastName || ""}`.trim()
          : null;
      return name || adminManager.email;
    }
    const simpleUser = allUsers.find((u) => u.id === userId);
    return simpleUser?.email || userId.substring(0, 8) + "...";
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "todo":
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (dueDate: string, status: TicketStatus) => {
    if (status === "complete") return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  // Modal handlers
  const openCreateModal = () => {
    setEditingTicket(null);
    setFormData({
      ...emptyFormData,
      assignee_id: user?.id || "",
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      title: ticket.title,
      description: ticket.description || "",
      status: ticket.status,
      priority: ticket.priority,
      due_date: ticket.due_date,
      assignee_id: ticket.assignee_id,
      support_assignees: ticket.support_assignees,
      related_user_id: ticket.related_user_id || "",
    });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTicket(null);
    setFormData(emptyFormData);
    setFormError(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSupportAssigneeToggle = (userId: string) => {
    setFormData((prev) => {
      const current = prev.support_assignees;
      if (current.includes(userId)) {
        return { ...prev, support_assignees: current.filter((id) => id !== userId) };
      } else {
        return { ...prev, support_assignees: [...current, userId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormLoading(true);
    setFormError(null);

    try {
      if (editingTicket) {
        const updated = await updateTicket(editingTicket.id, formData);
        setTickets((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      } else {
        const created = await createTicket(formData, user.id);
        setTickets((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save ticket"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (ticket: Ticket, newStatus: TicketStatus) => {
    try {
      const updated = await updateTicketStatus(ticket.id, newStatus);
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deletingTicket) return;

    setDeleteLoading(true);
    try {
      await deleteTicket(deletingTicket.id);
      setTickets((prev) => prev.filter((t) => t.id !== deletingTicket.id));
      setDeletingTicket(null);
    } catch (err) {
      console.error("Error deleting ticket:", err);
      alert("Failed to delete ticket");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Count stats
  const myTicketsCount = user
    ? tickets.filter(
        (t) =>
          t.assignee_id === user.id || t.support_assignees.includes(user.id)
      ).length
    : 0;

  const statusCounts = {
    todo: tickets.filter((t) => t.status === "todo").length,
    active: tickets.filter((t) => t.status === "active").length,
    complete: tickets.filter((t) => t.status === "complete").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="mt-1 text-sm text-gray-500">
            {tickets.length} total ticket{tickets.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Refresh"
          >
            <svg
              className={`size-5 ${loading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
          <button
            onClick={openCreateModal}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Create Ticket
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* Tab filter */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setFilterTab("all")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filterTab === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => setFilterTab("my")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filterTab === "my"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My Tickets
            {myTicketsCount > 0 && (
              <span className="ml-1.5 rounded-full bg-teal-500 px-1.5 py-0.5 text-xs text-white">
                {myTicketsCount}
              </span>
            )}
          </button>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="all">All</option>
            <option value="todo">Todo ({statusCounts.todo})</option>
            <option value="active">Active ({statusCounts.active})</option>
            <option value="complete">Complete ({statusCounts.complete})</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
          <button
            onClick={fetchTickets}
            className="ml-4 text-sm font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Assignee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
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
                    Loading tickets...
                  </div>
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  {tickets.length === 0
                    ? "No tickets yet. Create one to get started."
                    : "No tickets match your filters."}
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {ticket.title}
                    </div>
                    {ticket.description && (
                      <div className="mt-1 max-w-xs truncate text-sm text-gray-500">
                        {ticket.description}
                      </div>
                    )}
                    {ticket.related_user_id && (
                      <div className="mt-1 text-xs text-gray-400">
                        Related: {getUserDisplay(ticket.related_user_id)}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        handleStatusChange(
                          ticket,
                          e.target.value as TicketStatus
                        )
                      }
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${getStatusBadge(
                        ticket.status
                      )}`}
                    >
                      <option value="todo">Todo</option>
                      <option value="active">Active</option>
                      <option value="complete">Complete</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${getPriorityBadge(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {getUserDisplay(ticket.assignee_id)}
                    {ticket.support_assignees.length > 0 && (
                      <div className="text-xs text-gray-500">
                        +{ticket.support_assignees.length} support
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={
                        isOverdue(ticket.due_date, ticket.status)
                          ? "font-medium text-red-600"
                          : "text-gray-500"
                      }
                    >
                      {new Date(ticket.due_date).toLocaleDateString()}
                    </span>
                    {isOverdue(ticket.due_date, ticket.status) && (
                      <span className="ml-1 text-xs text-red-500">Overdue</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(ticket)}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingTicket(ticket)}
                        className="font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {editingTicket ? "Edit Ticket" : "Create Ticket"}
            </h3>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  placeholder="e.g., Create VPS for User"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  placeholder="Additional details..."
                />
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  >
                    <option value="todo">Todo</option>
                    <option value="active">Active</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleFormChange}
                  required
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>

              {/* Main Assignee */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assignee <span className="text-red-500">*</span>
                </label>
                <select
                  name="assignee_id"
                  value={formData.assignee_id}
                  onChange={handleFormChange}
                  required
                  disabled={dropdownsLoading}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100"
                >
                  <option value="">Select assignee...</option>
                  {adminsManagers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName || u.lastName
                        ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                        : u.email}{" "}
                      ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Support Assignees */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Support Assignees
                </label>
                <div className="mt-2 max-h-32 space-y-2 overflow-y-auto rounded border border-gray-200 p-2">
                  {adminsManagers.filter((u) => u.id !== formData.assignee_id).length === 0 ? (
                    <p className="text-sm text-gray-500">No other admins/managers available</p>
                  ) : (
                    adminsManagers
                      .filter((u) => u.id !== formData.assignee_id)
                      .map((u) => (
                        <label key={u.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.support_assignees.includes(u.id)}
                            onChange={() => handleSupportAssigneeToggle(u.id)}
                            disabled={dropdownsLoading}
                            className="size-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700">
                            {u.firstName || u.lastName
                              ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                              : u.email}
                          </span>
                        </label>
                      ))
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Optional: Select team members to assist
                </p>
              </div>

              {/* Related User */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Related User (optional)
                </label>
                <select
                  name="related_user_id"
                  value={formData.related_user_id}
                  onChange={handleFormChange}
                  disabled={dropdownsLoading}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100"
                >
                  <option value="">None</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName || u.lastName
                        ? `${u.firstName || ""} ${u.lastName || ""}`.trim() + " - " + u.email
                        : u.email}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  The customer this ticket is about
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || !formData.title || !formData.assignee_id || !formData.due_date}
                  className="rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {formLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      Saving...
                    </span>
                  ) : editingTicket ? (
                    "Update Ticket"
                  ) : (
                    "Create Ticket"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Delete Ticket
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete "{deletingTicket.title}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingTicket(null)}
                disabled={deleteLoading}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

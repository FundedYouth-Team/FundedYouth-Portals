import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import type { AdminNotification } from "types/notification";
import {
  fetchNotifications,
  fetchCompletedNotifications,
  markAsRead,
  markAllAsRead,
  markAsCompleted,
  restoreNotification,
  deleteNotification,
} from "services/notificationService";

type FilterTab = "unread" | "read" | "all" | "completed";

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type: string, isCompleted: boolean = false) {
  if (isCompleted) {
    return (
      <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
        <svg
          className="size-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    );
  }

  switch (type) {
    case "service_enrollment":
      return (
        <div className="flex size-10 items-center justify-center rounded-full bg-teal-100">
          <svg
            className="size-5 text-teal-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      );
    case "billing_added":
      return (
        <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
          <svg
            className="size-5 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
            />
          </svg>
        </div>
      );
    case "service_suspended":
      return (
        <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
          <svg
            className="size-5 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    default:
      return (
        <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="size-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </div>
      );
  }
}

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [completedNotifications, setCompletedNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("unread");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [active, completed] = await Promise.all([
        fetchNotifications(100),
        fetchCompletedNotifications(100),
      ]);
      setNotifications(active);
      setCompletedNotifications(completed);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;
    try {
      await markAsRead(notificationId, user.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString(), read_by: user.id }
            : n
        )
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await markAllAsRead(user.id);
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
          read_by: n.read_by || user.id,
        }))
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleMarkAsCompleted = async (notificationId: string) => {
    if (!user) return;
    try {
      await markAsCompleted(notificationId, user.id);
      // Move from active to completed
      const completedNotif = notifications.find((n) => n.id === notificationId);
      if (completedNotif) {
        const updatedNotif = {
          ...completedNotif,
          completed_at: new Date().toISOString(),
          completed_by: user.id,
          read_at: completedNotif.read_at || new Date().toISOString(),
          read_by: completedNotif.read_by || user.id,
        };
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        setCompletedNotifications((prev) => [updatedNotif, ...prev]);
      }
    } catch (error) {
      console.error("Failed to mark as completed:", error);
    }
  };

  const handleRestore = async (notificationId: string) => {
    try {
      await restoreNotification(notificationId);
      // Move from completed back to active
      const restoredNotif = completedNotifications.find((n) => n.id === notificationId);
      if (restoredNotif) {
        const updatedNotif = {
          ...restoredNotif,
          completed_at: null,
          completed_by: null,
        };
        setCompletedNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        setNotifications((prev) => [updatedNotif, ...prev].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
    } catch (error) {
      console.error("Failed to restore notification:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      await deleteNotification(notificationId);
      setCompletedNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const readCount = notifications.filter((n) => !!n.read_at).length;
  const completedCount = completedNotifications.length;

  const getDisplayedNotifications = () => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.read_at);
      case "read":
        return notifications.filter((n) => !!n.read_at);
      case "all":
        return notifications;
      case "completed":
        return completedNotifications;
    }
  };

  const displayedNotifications = getDisplayedNotifications();

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600"></div>
          <p className="mt-4 text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter Tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === "unread"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === "read"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Open
              {readCount > 0 && (
                <span className="ml-1.5 rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                  {readCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === "completed"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Completed
              {completedCount > 0 && (
                <span className="ml-1.5 rounded-full bg-gray-400 px-1.5 py-0.5 text-xs text-white">
                  {completedCount}
                </span>
              )}
            </button>
          </div>

          {/* Mark All Read Button */}
          {filter !== "completed" && filter !== "read" && unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Mark all read
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={loadNotifications}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
            title="Refresh"
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {displayedNotifications.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <svg
            className="mx-auto size-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            {filter === "completed" ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            )}
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {filter === "unread"
              ? "No unread notifications"
              : filter === "read"
                ? "No open notifications"
                : filter === "completed"
                  ? "No completed notifications"
                  : "No notifications yet"}
          </h3>
          <p className="mt-2 text-gray-500">
            {filter === "unread"
              ? "You're all caught up!"
              : filter === "read"
                ? "Open notifications you've read will appear here."
                : filter === "completed"
                  ? "Completed notifications will appear here after you mark them as resolved."
                  : "Notifications will appear here when users enroll in services or add billing information."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedNotifications.map((notification) => {
            const isCompleted = filter === "completed";
            const isRead = !!notification.read_at;

            return (
              <div
                key={notification.id}
                className={`rounded-lg bg-white p-4 shadow transition-colors ${
                  isCompleted
                    ? "opacity-75"
                    : !isRead
                      ? "ring-2 ring-teal-200"
                      : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {getNotificationIcon(notification.type, isCompleted)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm ${
                              isCompleted
                                ? "text-gray-500"
                                : !isRead
                                  ? "font-semibold text-gray-900"
                                  : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {isCompleted && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className={`mt-1 text-sm ${isCompleted ? "text-gray-400" : "text-gray-600"}`}>
                          {notification.message}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                          <span>{formatTimeAgo(notification.created_at)}</span>
                          <span>
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                          {isCompleted && notification.completed_at && (
                            <span className="text-gray-400">
                              Completed {formatTimeAgo(notification.completed_at)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {isCompleted ? (
                          // Completed tab actions
                          <>
                            <button
                              onClick={() => handleRestore(notification.id)}
                              className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          // Active tab actions
                          <>
                            {!isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                              >
                                Mark read
                              </button>
                            )}
                            {isRead && (
                              <button
                                onClick={() => handleMarkAsCompleted(notification.id)}
                                className="rounded-lg border border-green-300 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50"
                              >
                                Complete
                              </button>
                            )}
                          </>
                        )}
                        <Link
                          to={`/users/${notification.user_id}`}
                          className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
                        >
                          View User
                        </Link>
                      </div>
                    </div>
                    {/* Metadata */}
                    {notification.metadata && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {notification.metadata.service_display_name && (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isCompleted
                              ? "bg-gray-100 text-gray-500"
                              : "bg-teal-50 text-teal-700"
                          }`}>
                            {notification.metadata.service_display_name}
                          </span>
                        )}
                        {notification.metadata.user_email && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            {notification.metadata.user_email}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

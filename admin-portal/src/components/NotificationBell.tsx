import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import type { AdminNotification } from "types/notification";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
  requestNotificationPermission,
  showDesktopNotification,
} from "services/notificationService";

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

function getNotificationIcon(type: string) {
  switch (type) {
    case "service_enrollment":
      return (
        <div className="flex size-8 items-center justify-center rounded-full bg-teal-100">
          <svg
            className="size-4 text-teal-600"
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
        <div className="flex size-8 items-center justify-center rounded-full bg-green-100">
          <svg
            className="size-4 text-green-600"
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
    default:
      return (
        <div className="flex size-8 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="size-4 text-gray-600"
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

export function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications function
  const loadNotifications = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [notifs, count] = await Promise.all([
        fetchNotifications(20),
        fetchUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    loadNotifications();
    // Request notification permission
    requestNotificationPermission();
  }, []);

  // Manual refresh handler
  const handleRefresh = () => {
    loadNotifications(true);
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((newNotification) => {
      // Add to list
      setNotifications((prev) => [newNotification, ...prev].slice(0, 20));
      setUnreadCount((prev) => prev + 1);

      // Show desktop notification
      showDesktopNotification(newNotification.title, newNotification.message, () => {
        // Navigate to user page when clicked
        if (newNotification.user_id) {
          navigate(`/users/${newNotification.user_id}`);
        }
      });
    });

    return unsubscribe;
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: AdminNotification) => {
    // Mark as read if not already
    if (!notification.read_at && user) {
      try {
        await markAsRead(notification.id, user.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, read_at: new Date().toISOString(), read_by: user.id }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }

    // Navigate to user page
    if (notification.user_id) {
      navigate(`/users/${notification.user_id}`);
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
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
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <div className="flex items-center gap-1" ref={dropdownRef}>
      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
        title="Refresh notifications"
      >
        <svg
          className={`size-4 ${refreshing ? "animate-spin" : ""}`}
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
        <span className="hidden sm:inline">Refresh</span>
      </button>

      {/* Bell Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          title="Notifications"
        >
          <svg
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-xl bg-white shadow-xl ring-1 ring-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List - Only show unread */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="size-6 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600" />
              </div>
            ) : unreadCount === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <svg
                  className="mx-auto size-12 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-2">All caught up!</p>
                <p className="text-xs text-gray-400">No unread notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications
                  .filter((n) => !n.read_at)
                  .map((notification) => (
                    <li key={notification.id}>
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className="flex w-full items-start gap-3 bg-teal-50/50 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                      >
                        {getNotificationIcon(notification.type)}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </p>
                          <p className="mt-0.5 truncate text-sm text-gray-500">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                        <span className="mt-1 size-2 rounded-full bg-teal-500" />
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Footer - Always show */}
          <div className="border-t border-gray-100 px-4 py-3">
            <button
              onClick={() => {
                navigate("/notifications");
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-teal-600 hover:text-teal-700"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

import { supabase } from "lib/supabaseClient";
import type { AdminNotification } from "types/notification";

/**
 * Fetch active notifications (not completed), ordered by most recent first
 */
export async function fetchNotifications(
  limit: number = 50
): Promise<AdminNotification[]> {
  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .is("completed_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch completed notifications, ordered by most recent completion first
 */
export async function fetchCompletedNotifications(
  limit: number = 50
): Promise<AdminNotification[]> {
  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching completed notifications:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch unread notifications count (excludes completed)
 */
export async function fetchUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from("admin_notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null)
    .is("completed_at", null);

  if (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }

  return count || 0;
}

/**
 * Fetch notifications for a specific user
 */
export async function fetchUserNotifications(
  userId: string
): Promise<AdminNotification[]> {
  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user notifications:", error);
    throw error;
  }

  return data || [];
}

/**
 * Mark a notification as read
 */
export async function markAsRead(
  notificationId: string,
  adminUserId: string
): Promise<void> {
  const { error } = await supabase
    .from("admin_notifications")
    .update({
      read_at: new Date().toISOString(),
      read_by: adminUserId,
    })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(adminUserId: string): Promise<void> {
  const { error } = await supabase
    .from("admin_notifications")
    .update({
      read_at: new Date().toISOString(),
      read_by: adminUserId,
    })
    .is("read_at", null)
    .is("completed_at", null);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

/**
 * Mark a notification as completed/resolved
 */
export async function markAsCompleted(
  notificationId: string,
  adminUserId: string
): Promise<void> {
  const { error } = await supabase
    .from("admin_notifications")
    .update({
      completed_at: new Date().toISOString(),
      completed_by: adminUserId,
      // Also mark as read if not already
      read_at: new Date().toISOString(),
      read_by: adminUserId,
    })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as completed:", error);
    throw error;
  }
}

/**
 * Restore a completed notification back to active
 */
export async function restoreNotification(
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from("admin_notifications")
    .update({
      completed_at: null,
      completed_by: null,
    })
    .eq("id", notificationId);

  if (error) {
    console.error("Error restoring notification:", error);
    throw error;
  }
}

/**
 * Delete a completed notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from("admin_notifications")
    .delete()
    .eq("id", notificationId)
    .not("completed_at", "is", null); // Only allow deleting completed notifications

  if (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}

/**
 * Subscribe to real-time notification updates
 * Returns an unsubscribe function
 */
export function subscribeToNotifications(
  onNewNotification: (notification: AdminNotification) => void
): () => void {
  const channel = supabase
    .channel("admin_notifications_realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "admin_notifications",
      },
      (payload) => {
        onNewNotification(payload.new as AdminNotification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

/**
 * Show a desktop notification
 */
export function showDesktopNotification(
  title: string,
  body: string,
  onClick?: () => void
): void {
  if (Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: "/favicon.ico",
    tag: "admin-notification",
  });

  if (onClick) {
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }

  // Auto-close after 10 seconds
  setTimeout(() => notification.close(), 10000);
}

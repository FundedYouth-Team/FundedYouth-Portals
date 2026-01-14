/**
 * Admin notification types
 */

export type NotificationType = "service_enrollment" | "billing_added";

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  user_id: string;
  metadata: {
    service_name?: string;
    service_display_name?: string;
    agreement_id?: string;
    user_email?: string;
    billing_customer_id?: string;
  };
  read_at: string | null;
  read_by: string | null;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
}

export interface NotificationStats {
  unreadCount: number;
  total: number;
}

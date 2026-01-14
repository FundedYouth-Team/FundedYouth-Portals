/**
 * Ticket status values
 */
export type TicketStatus = "todo" | "active" | "complete";

/**
 * Ticket priority values
 */
export type TicketPriority = "low" | "medium" | "high";

/**
 * Base ticket from database
 */
export interface Ticket {
  id: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  due_date: string;
  completed_at: string | null;
  assignee_id: string;
  support_assignees: string[];
  related_user_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  read_at: string | null;
  read_by: string | null;
}

/**
 * Ticket with joined user details for display
 */
export interface TicketWithDetails extends Ticket {
  assignee_email?: string;
  assignee_name?: string;
  related_user_email?: string;
  created_by_email?: string;
}

/**
 * Form data for creating/editing a ticket
 */
export interface TicketFormData {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  due_date: string;
  assignee_id: string;
  support_assignees: string[];
  related_user_id: string;
}

/**
 * Admin/Manager user for dropdowns
 */
export interface AdminManagerUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

/**
 * Simple user for related user dropdown
 */
export interface SimpleUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

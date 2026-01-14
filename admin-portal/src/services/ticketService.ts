import { supabase } from "lib/supabaseClient";
import type {
  Ticket,
  TicketFormData,
  AdminManagerUser,
  SimpleUser,
} from "types/ticket";

/**
 * Fetch all tickets
 */
export async function getTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch a single ticket by ID
 */
export async function getTicketById(id: string): Promise<Ticket | null> {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching ticket:", error);
    throw error;
  }

  return data;
}

/**
 * Create a new ticket
 */
export async function createTicket(
  formData: TicketFormData,
  createdBy: string
): Promise<Ticket> {
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      title: formData.title,
      description: formData.description || null,
      status: formData.status,
      priority: formData.priority,
      due_date: formData.due_date,
      assignee_id: formData.assignee_id,
      support_assignees: formData.support_assignees,
      related_user_id: formData.related_user_id || null,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }

  return data;
}

/**
 * Update an existing ticket
 */
export async function updateTicket(
  id: string,
  formData: Partial<TicketFormData> & { completed_at?: string | null }
): Promise<Ticket> {
  const updateData: Record<string, unknown> = {};

  if (formData.title !== undefined) updateData.title = formData.title;
  if (formData.description !== undefined)
    updateData.description = formData.description || null;
  if (formData.status !== undefined) updateData.status = formData.status;
  if (formData.priority !== undefined) updateData.priority = formData.priority;
  if (formData.due_date !== undefined) updateData.due_date = formData.due_date;
  if (formData.assignee_id !== undefined)
    updateData.assignee_id = formData.assignee_id;
  if (formData.support_assignees !== undefined)
    updateData.support_assignees = formData.support_assignees;
  if (formData.related_user_id !== undefined)
    updateData.related_user_id = formData.related_user_id || null;
  if (formData.completed_at !== undefined)
    updateData.completed_at = formData.completed_at;

  const { data, error } = await supabase
    .from("tickets")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating ticket:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a ticket
 */
export async function deleteTicket(id: string): Promise<void> {
  const { error } = await supabase.from("tickets").delete().eq("id", id);

  if (error) {
    console.error("Error deleting ticket:", error);
    throw error;
  }
}

/**
 * Update ticket status (convenience method)
 */
export async function updateTicketStatus(
  id: string,
  status: "todo" | "active" | "complete"
): Promise<Ticket> {
  const updateData: Record<string, unknown> = { status };

  // Set completed_at when marking as complete
  if (status === "complete") {
    updateData.completed_at = new Date().toISOString();
  } else {
    updateData.completed_at = null;
  }

  const { data, error } = await supabase
    .from("tickets")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating ticket status:", error);
    throw error;
  }

  return data;
}

/**
 * Mark a ticket as read
 */
export async function markTicketAsRead(
  ticketId: string,
  userId: string
): Promise<Ticket> {
  const { data, error } = await supabase
    .from("tickets")
    .update({
      read_at: new Date().toISOString(),
      read_by: userId,
    })
    .eq("id", ticketId)
    .select()
    .single();

  if (error) {
    console.error("Error marking ticket as read:", error);
    throw error;
  }

  return data;
}

/**
 * Fetch unread tickets for the current user (where they are assignee or support)
 */
export async function getMyUnreadTickets(userId: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .is("read_at", null)
    .neq("status", "complete")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching unread tickets:", error);
    throw error;
  }

  // Filter to tickets where user is assignee or in support
  return (data || []).filter(
    (ticket) =>
      ticket.assignee_id === userId ||
      ticket.support_assignees.includes(userId)
  );
}

/**
 * Get count of unread tickets for the current user
 */
export async function getMyUnreadTicketCount(userId: string): Promise<number> {
  const tickets = await getMyUnreadTickets(userId);
  return tickets.length;
}

/**
 * Fetch admins and managers for assignee dropdowns
 */
export async function getAdminsAndManagers(): Promise<AdminManagerUser[]> {
  const { data, error } = await supabase.functions.invoke("admin-list-users", {
    body: { page: 1, pageSize: 1000 },
  });

  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }

  if (data.error) {
    throw new Error(data.error);
  }

  // Filter to only admins and managers
  const adminsAndManagers = (data.users || []).filter(
    (user: { role: string | null }) =>
      user.role === "admin" || user.role === "manager"
  );

  return adminsAndManagers.map(
    (user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: string;
    }) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    })
  );
}

/**
 * Fetch all users for related user dropdown
 */
export async function getAllUsers(): Promise<SimpleUser[]> {
  const { data, error } = await supabase.functions.invoke("admin-list-users", {
    body: { page: 1, pageSize: 1000 },
  });

  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return (data.users || []).map(
    (user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
    }) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    })
  );
}

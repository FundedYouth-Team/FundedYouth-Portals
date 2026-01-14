import { supabase } from "lib/supabaseClient";
import { Role } from "lib/roles";

interface AssignRoleRequest {
  targetUserId: string;
  newRole: Role | null;
}

interface AssignRoleResponse {
  success: boolean;
  error?: string;
}

/**
 * Assigns a role to a user via the assign-role Edge Function.
 *
 * SECURITY NOTES:
 * - Frontend NEVER modifies app_metadata directly
 * - Edge Function verifies the requester has admin role
 * - Edge Function uses service role key to update app_metadata
 * - This ensures role assignment can only be done by admins
 */
export async function assignRole(
  targetUserId: string,
  newRole: Role | null,
): Promise<AssignRoleResponse> {
  try {
    // Get current session for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke<AssignRoleResponse>(
      "assign-role",
      {
        body: {
          targetUserId,
          newRole,
        } as AssignRoleRequest,
      },
    );

    if (error) {
      console.error("Edge Function error:", error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "No response from server" };
    }

    return data;
  } catch (err) {
    console.error("assignRole error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

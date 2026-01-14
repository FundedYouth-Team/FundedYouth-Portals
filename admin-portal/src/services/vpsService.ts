import { supabase } from "lib/supabaseClient";
import {
  VpsInstance,
  VpsWithUser,
  VpsCreateInput,
  VpsUpdateInput,
  VpsStatus,
} from "types/vps";

/**
 * Fetch paginated list of VPS instances.
 */
export async function getVpsInstances(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    status?: VpsStatus;
    assignedOnly?: boolean;
    unassignedOnly?: boolean;
    search?: string;
  },
): Promise<{
  vpsInstances: VpsWithUser[];
  totalCount: number;
  totalPages: number;
}> {
  let query = supabase.from("vps_instances").select("*", { count: "exact" });

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.assignedOnly) {
    query = query.not("assigned_user_id", "is", null);
  }

  if (filters?.unassignedOnly) {
    query = query.is("assigned_user_id", null);
  }

  if (filters?.search) {
    query = query.or(
      `provider_vps_name.ilike.%${filters.search}%,ip_address.ilike.%${filters.search}%,host_provider.ilike.%${filters.search}%`,
    );
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to).order("created_at", { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching VPS instances:", error);
    throw error;
  }

  // Fetch user emails for assigned VPS
  const vpsInstances: VpsWithUser[] = data || [];
  const userIds = vpsInstances
    .filter((v) => v.assigned_user_id)
    .map((v) => v.assigned_user_id as string);

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("billing_customers")
      .select("user_id, email")
      .in("user_id", userIds);

    const userMap = new Map(users?.map((u) => [u.user_id, u.email]) || []);

    vpsInstances.forEach((vps) => {
      if (vps.assigned_user_id) {
        vps.assigned_user_email = userMap.get(vps.assigned_user_id);
      }
    });
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return { vpsInstances, totalCount, totalPages };
}

/**
 * Fetch a single VPS instance by ID.
 */
export async function getVpsById(id: string): Promise<VpsWithUser | null> {
  const { data, error } = await supabase
    .from("vps_instances")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching VPS:", error);
    throw error;
  }

  // Fetch user email if assigned
  if (data?.assigned_user_id) {
    const { data: user } = await supabase
      .from("billing_customers")
      .select("email")
      .eq("user_id", data.assigned_user_id)
      .single();

    if (user) {
      (data as VpsWithUser).assigned_user_email = user.email;
    }
  }

  return data;
}

/**
 * Create a new VPS instance.
 */
export async function createVps(input: VpsCreateInput): Promise<VpsInstance> {
  const { data, error } = await supabase
    .from("vps_instances")
    .insert({
      host_provider: input.host_provider,
      provider_vps_name: input.provider_vps_name,
      ip_address: input.ip_address || null,
      port: input.port || null,
      region: input.region,
      operating_system: input.operating_system,
      vcpu: input.vcpu,
      vram_gb: input.vram_gb,
      status: input.status || "pending",
      assigned_user_id: input.assigned_user_id || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating VPS:", error);
    throw error;
  }

  return data;
}

/**
 * Update a VPS instance.
 */
export async function updateVps(
  id: string,
  input: VpsUpdateInput,
): Promise<VpsInstance> {
  const { data, error } = await supabase
    .from("vps_instances")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating VPS:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a VPS instance.
 */
export async function deleteVps(id: string): Promise<void> {
  const { error } = await supabase.from("vps_instances").delete().eq("id", id);

  if (error) {
    console.error("Error deleting VPS:", error);
    throw error;
  }
}

/**
 * Assign a VPS to a user.
 */
export async function assignVpsToUser(
  vpsId: string,
  userId: string | null,
): Promise<VpsInstance> {
  const { data, error } = await supabase
    .from("vps_instances")
    .update({ assigned_user_id: userId })
    .eq("id", vpsId)
    .select()
    .single();

  if (error) {
    console.error("Error assigning VPS:", error);
    throw error;
  }

  return data;
}

/**
 * Update VPS status.
 */
export async function updateVpsStatus(
  id: string,
  status: VpsStatus,
): Promise<VpsInstance> {
  const { data, error } = await supabase
    .from("vps_instances")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating VPS status:", error);
    throw error;
  }

  return data;
}

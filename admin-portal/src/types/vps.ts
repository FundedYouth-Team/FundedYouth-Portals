/**
 * VPS Instance type definitions for Admin Portal.
 * Maps to the vps_instances table in Supabase.
 */

export type VpsStatus = "running" | "pending" | "disabled";

/**
 * VPS Instance from vps_instances table
 */
export interface VpsInstance {
  id: string;
  host_provider: string;
  provider_vps_name: string;
  ip_address: string | null;
  port: number | null;
  region: string;
  operating_system: string;
  vcpu: number;
  vram_gb: number;
  status: VpsStatus;
  assigned_user_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * VPS with joined user data for display
 */
export interface VpsWithUser extends VpsInstance {
  assigned_user_email?: string;
  assigned_user_name?: string;
}

/**
 * Input for creating a new VPS
 */
export interface VpsCreateInput {
  host_provider: string;
  provider_vps_name: string;
  ip_address?: string | null;
  port?: number | null;
  region: string;
  operating_system: string;
  vcpu: number;
  vram_gb: number;
  status?: VpsStatus;
  assigned_user_id?: string | null;
  notes?: string | null;
}

/**
 * Input for updating a VPS
 */
export interface VpsUpdateInput {
  host_provider?: string;
  provider_vps_name?: string;
  ip_address?: string | null;
  port?: number | null;
  region?: string;
  operating_system?: string;
  vcpu?: number;
  vram_gb?: number;
  status?: VpsStatus;
  assigned_user_id?: string | null;
  notes?: string | null;
}

/**
 * Common VPS providers for dropdown
 */
export const VPS_PROVIDERS = [
  "DatabaseMart",
  "DigitalOcean",
  "Linode",
  "Hetzner",
  "AWS",
  "Google Cloud",
  "Azure",
  "Other",
] as const;

/**
 * Common operating systems for dropdown
 */
export const VPS_OPERATING_SYSTEMS = [
  "Windows Server 2022",
  "Windows Server 2019",
  "Windows 11",
  "Windows 10",
  "Ubuntu 22.04 LTS",
  "Ubuntu 20.04 LTS",
  "Debian 12",
  "CentOS Stream 9",
  "Other",
] as const;

/**
 * Common regions for dropdown
 */
export const VPS_REGIONS = [
  "US East (New York)",
  "US East (Miami)",
  "US West (Los Angeles)",
  "US West (Seattle)",
  "US Central (Chicago)",
  "US Central (Dallas)",
  "EU West (London)",
  "EU West (Amsterdam)",
  "EU Central (Frankfurt)",
  "Asia Pacific (Singapore)",
  "Asia Pacific (Tokyo)",
  "Other",
] as const;

/**
 * Get status badge color for VPS status
 */
export function getVpsStatusColor(status: VpsStatus): string {
  switch (status) {
    case "running":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "disabled":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

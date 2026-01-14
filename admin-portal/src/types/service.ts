/**
 * Service definition from services table
 */
export interface Service {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  display_description: string | null;
  version: string;
  enabled: boolean;
  requires_agreement: boolean;
  terms_content: string | null;
  terms_updated_at: string | null;
  required_fields: ServiceField[];
  acknowledgments: ServiceAcknowledgment[];
  features: string[];
  pricing_type: "fixed" | "percentage" | "subscription" | null;
  pricing_amount: number | null;
  pricing_percentage: number | null;
  pricing_period: "weekly" | "monthly" | "yearly" | "one-time" | null;
  max_instances_per_user: number;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/**
 * Acknowledgment checkbox for service enrollment
 */
export interface ServiceAcknowledgment {
  id: string;
  text: string;
  required: boolean;
}

/**
 * Field definition for service agreements
 */
export interface ServiceField {
  name: string;
  label: string;
  type: "text" | "password" | "number" | "email" | "select" | "checkbox";
  required: boolean;
  sensitive?: boolean;
  options?: string[]; // For select type
  placeholder?: string;
  description?: string;
}

/**
 * Suspension reason from suspension_reasons table
 */
export interface SuspensionReason {
  id: string;
  code: string;
  label: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

/**
 * Request to create a new service
 */
export interface CreateServiceRequest {
  name: string;
  display_name: string;
  description?: string;
  version?: string;
  enabled?: boolean;
  requires_agreement?: boolean;
  terms_content?: string;
  required_fields?: ServiceField[];
  settings?: Record<string, unknown>;
}

/**
 * Request to update a service
 */
export interface UpdateServiceRequest {
  id: string;
  display_name?: string;
  description?: string;
  version?: string;
  enabled?: boolean;
  requires_agreement?: boolean;
  terms_content?: string;
  required_fields?: ServiceField[];
  settings?: Record<string, unknown>;
}

/**
 * Request to suspend a user's service
 */
export interface SuspendServiceRequest {
  agreementId: string;
  reasonCode: string;
  notes?: string;
}

/**
 * Request to unsuspend a user's service
 */
export interface UnsuspendServiceRequest {
  agreementId: string;
  notes?: string;
}

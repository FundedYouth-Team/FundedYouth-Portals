import { Role } from "lib/roles";

/**
 * User type for role management.
 * Represents a user from auth.users with their role from app_metadata.
 */
export interface ManagedUser {
  id: string;
  email: string;
  role: Role | null;
  createdAt: string;
  lastSignIn?: string;
}

/**
 * User from auth.users with profile data from user_metadata
 */
export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  // From user_metadata
  firstName?: string;
  lastName?: string;
  phone?: string;
  // From app_metadata
  role?: Role | null;
}

/**
 * Billing customer from billing_customers table
 */
export interface BillingCustomer {
  id: string;
  user_id: string;
  email: string;
  stripe_customer_id: string | null;
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_zip: string | null;
  billing_validated_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Combined user data for admin display
 */
export interface UserWithBilling extends AdminUser {
  billing?: BillingCustomer | null;
  hasSuspendedService?: boolean;
}

/**
 * Broker account from broker_accounts table
 */
export interface BrokerAccount {
  id: string;
  user_id: string;
  broker_name: string;
  broker_account_number: string;
  broker_account_password: string;
  api_key: string | null;
  is_active: boolean;
  service_agreement_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Service agreement from service_agreements table
 */
export interface ServiceAgreement {
  id: string;
  user_id: string;
  service_id: string | null;
  service_name: string;
  service_version: string;
  confirmed_fields: Record<string, boolean>;
  agreed_to_terms: boolean;
  ip_address: string | null;
  user_agent: string | null;
  agreed_at: string;
  status: "active" | "paused" | "cancelled" | "expired" | "suspended";
  cancelled_at: string | null;
  cancellation_reason: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  suspended_by: string | null;
  suspension_notes: string | null;
}

/**
 * Stripe invoice from Stripe API
 */
export interface StripeInvoice {
  id: string;
  number: string | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  due_date: number | null;
  created: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  description: string | null;
}

/**
 * User status derived from service agreements
 */
export type UserStatus = "active" | "inactive" | "suspended";

/**
 * Get user status based on their service agreements
 */
export function getUserStatus(agreements: ServiceAgreement[]): UserStatus {
  if (agreements.length === 0) return "inactive";
  const hasActive = agreements.some((a) => a.status === "active");
  if (hasActive) return "active";
  return "inactive";
}

/**
 * Format user display name
 */
export function formatUserName(user: AdminUser): string {
  if (user.firstName || user.lastName) {
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }
  return user.email.split("@")[0];
}

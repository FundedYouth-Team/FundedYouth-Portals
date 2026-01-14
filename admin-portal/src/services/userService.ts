import { supabase } from "lib/supabaseClient";
import {
  BillingCustomer,
  UserWithBilling,
  BrokerAccount,
  ServiceAgreement,
  StripeInvoice,
} from "types/user";
import { VpsInstance } from "types/vps";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Fetch paginated list of users with billing info.
 * Uses the admin-list-users Edge Function to fetch users from auth.users
 * with firstName/lastName from user_metadata and billing data.
 */
export async function getUsers(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
): Promise<{
  users: UserWithBilling[];
  totalCount: number;
  totalPages: number;
}> {
  const { data, error } = await supabase.functions.invoke("admin-list-users", {
    body: { page, pageSize, search },
  });

  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }

  if (data.error) {
    console.error("Error from Edge Function:", data.error);
    throw new Error(data.error);
  }

  // Transform response to UserWithBilling format
  const users: UserWithBilling[] = (data.users || []).map(
    (user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      phone: string | null;
      role: string | null;
      created_at: string;
      last_sign_in_at: string | null;
      billing: BillingCustomer | null;
      hasSuspendedService: boolean;
    }) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      billing: user.billing,
      hasSuspendedService: user.hasSuspendedService,
    }),
  );

  return {
    users,
    totalCount: data.total || 0,
    totalPages: data.totalPages || 0,
  };
}

/**
 * Fetch a single user by ID with all related data.
 * If no billing_customers record exists, fetches user data from auth.users.
 */
export async function getUserById(userId: string): Promise<{
  user: UserWithBilling | null;
  brokerAccounts: BrokerAccount[];
  serviceAgreements: ServiceAgreement[];
  vpsInstances: VpsInstance[];
}> {
  // Fetch billing customer
  const { data: billing, error: billingError } = await supabase
    .from("billing_customers")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (billingError && billingError.code !== "PGRST116") {
    console.error("Error fetching billing customer:", billingError);
  }

  // Fetch broker accounts
  const { data: brokerAccounts, error: brokerError } = await supabase
    .from("broker_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (brokerError) {
    console.error("Error fetching broker accounts:", brokerError);
  }

  // Fetch service agreements
  const { data: serviceAgreements, error: agreementError } = await supabase
    .from("service_agreements")
    .select("*")
    .eq("user_id", userId)
    .order("agreed_at", { ascending: false });

  if (agreementError) {
    console.error("Error fetching service agreements:", agreementError);
  }

  // Fetch VPS instances assigned to this user
  const { data: vpsInstances, error: vpsError } = await supabase
    .from("vps_instances")
    .select("*")
    .eq("assigned_user_id", userId)
    .order("created_at", { ascending: false });

  if (vpsError) {
    console.error("Error fetching VPS instances:", vpsError);
  }

  // Build user object
  let user: UserWithBilling | null = null;
  if (billing) {
    user = {
      id: billing.user_id,
      email: billing.email,
      created_at: billing.created_at,
      last_sign_in_at: null,
      billing,
    };
  } else {
    // No billing record - fetch user data from auth.users
    const metadata = await getUserMetadata(userId);
    if (metadata && metadata.email) {
      user = {
        id: userId,
        email: metadata.email,
        created_at: metadata.created_at || new Date().toISOString(),
        last_sign_in_at: null,
        billing: null,
      };
    }
  }

  return {
    user,
    brokerAccounts: brokerAccounts || [],
    serviceAgreements: serviceAgreements || [],
    vpsInstances: vpsInstances || [],
  };
}

/**
 * Fetch invoices for a user via the admin Edge Function.
 */
export async function getUserInvoices(
  stripeCustomerId: string,
): Promise<StripeInvoice[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/stripe-admin-get-invoices`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stripe_customer_id: stripeCustomerId }),
    },
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.invoices || [];
}

/**
 * Fetch user metadata (firstName, lastName, phone, email, created_at) from auth.users via Edge Function.
 */
export async function getUserMetadata(userId: string): Promise<{
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  created_at: string | null;
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "admin-get-user-metadata",
      {
        body: { userId },
      },
    );

    if (error) {
      console.error("Error fetching user metadata:", error);
      return null;
    }

    if (data.error) {
      console.error("Error from Edge Function:", data.error);
      return null;
    }

    return data.metadata;
  } catch (err) {
    console.error("Error fetching user metadata:", err);
    return null;
  }
}

/**
 * Get all users for dropdown selection (simplified list).
 */
export async function getAllUsersForSelect(): Promise<
  { id: string; email: string }[]
> {
  const { data, error } = await supabase
    .from("billing_customers")
    .select("user_id, email")
    .order("email", { ascending: true });

  if (error) {
    console.error("Error fetching users for select:", error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.user_id,
    email: row.email,
  }));
}

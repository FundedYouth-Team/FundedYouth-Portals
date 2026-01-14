// Database types for Supabase tables

export interface BillingCustomer {
  id: string
  user_id: string
  email: string
  stripe_customer_id: string | null
  billing_address_line1: string | null
  billing_address_line2: string | null
  billing_city: string | null
  billing_state: string | null
  billing_zip: string | null
  billing_validated_at: string | null
  created_at: string
  updated_at: string
}

export interface BrokerAccount {
  id: string
  user_id: string
  broker_name: string
  broker_account_number: string
  broker_account_password: string
  is_active: boolean
  service_agreement_id: string | null
  created_at: string
  updated_at: string
}

export interface ServiceAgreement {
  id: string
  user_id: string
  service_name: string
  service_version: string
  confirmed_fields: Record<string, boolean>
  agreed_to_terms: boolean
  ip_address: string | null
  user_agent: string | null
  agreed_at: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  cancelled_at: string | null
  cancellation_reason: string | null
}

// Insert types (omit auto-generated fields)
export type BillingCustomerInsert = Omit<
  BillingCustomer,
  'id' | 'created_at' | 'updated_at'
>

export type BrokerAccountInsert = Omit<
  BrokerAccount,
  'id' | 'created_at' | 'updated_at' | 'is_active' | 'service_agreement_id'
> & {
  is_active?: boolean
  service_agreement_id?: string | null
}

export type ServiceAgreementInsert = Omit<
  ServiceAgreement,
  'id' | 'agreed_at' | 'status' | 'cancelled_at' | 'cancellation_reason'
>

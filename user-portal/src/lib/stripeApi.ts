import { supabase } from './supabaseClient'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export interface BillingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
}

export interface StripeInvoice {
  id: string
  number: string | null
  amount_due: number
  amount_paid: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  due_date: number | null
  created: number
  hosted_invoice_url: string | null
  invoice_pdf: string | null
  description: string | null
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session }
  } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  }
}

export async function createStripeCustomer(
  email: string,
  name: string,
  address: BillingAddress
): Promise<{ success: boolean; stripe_customer_id?: string; error?: string }> {
  const headers = await getAuthHeaders()

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/stripe-create-customer`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        name,
        address: { ...address, country: 'US' }
      })
    }
  )

  return response.json()
}

export async function getInvoices(): Promise<{
  invoices: StripeInvoice[]
  error?: string
}> {
  const headers = await getAuthHeaders()

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/stripe-get-invoices`,
    {
      method: 'GET',
      headers
    }
  )

  return response.json()
}

export async function getInvoicePaymentUrl(
  invoiceId: string
): Promise<{ url?: string; error?: string }> {
  const headers = await getAuthHeaders()

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/stripe-create-checkout`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        invoice_id: invoiceId
      })
    }
  )

  return response.json()
}

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { BillingAddressForm } from '../components/BillingAddressForm'
import { InvoiceList } from '../components/InvoiceList'
import {
  createStripeCustomer,
  getInvoices,
  StripeInvoice
} from '../lib/stripeApi'
import type { BillingCustomer } from '../lib/database.types'

type Tab = 'address' | 'invoices'

export function BillingPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('invoices')
  const [billingData, setBillingData] = useState<BillingCustomer | null>(null)
  const [invoices, setInvoices] = useState<StripeInvoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Fetch billing data on mount
  useEffect(() => {
    async function fetchBillingData() {
      if (!user) return

      const { data } = await supabase
        .from('billing_customers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setBillingData(data)
      }
      setIsLoading(false)
    }

    fetchBillingData()
  }, [user])

  // Fetch invoices when on invoices tab and billing is set up
  useEffect(() => {
    async function fetchInvoices() {
      if (activeTab !== 'invoices') return
      if (!billingData?.stripe_customer_id) return
      if (isLoading) return

      setInvoicesLoading(true)
      try {
        const result = await getInvoices()
        if (result.invoices) {
          setInvoices(result.invoices)
        }
      } catch {
        // Silently fail - user will see empty state
      }
      setInvoicesLoading(false)
    }

    fetchInvoices()
  }, [activeTab, billingData?.stripe_customer_id, isLoading])

  const handleAddressSubmit = async (data: {
    line1: string
    line2: string
    city: string
    state: string
    postal_code: string
  }) => {
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    const fullName =
      [user?.user_metadata?.first_name, user?.user_metadata?.last_name]
        .filter(Boolean)
        .join(' ') || 'Customer'

    try {
      const result = await createStripeCustomer(user?.email || '', fullName, {
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Billing address saved successfully')

        // Refresh billing data
        const { data: updated } = await supabase
          .from('billing_customers')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle()

        if (updated) {
          setBillingData(updated)
        }
      }
    } catch {
      setError('Failed to save billing address')
    }

    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600"></div>
      </div>
    )
  }

  const hasValidatedBilling = !!billingData?.billing_validated_at

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">Payments &amp; Billing</h1>
      <p className="mt-2 text-gray-600">
        View and pay your invoices below. Once you add your billing address, we
        automatically create a secure billing account for you through Stripe.
      </p>

      {/* Icon Key */}
      <div className="mt-4 inline-flex max-w-4xl rounded-lg border border-gray-200 bg-gray-100 px-4 py-3">
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="size-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003z"
                className="fill-yellow-100 stroke-yellow-800"
                strokeWidth="1.5"
              />
              <path
                d="M12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                className="fill-yellow-800"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
            <span>Unpaid invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="size-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 1L13.5 7L17 3.5L15 8.5L21 7L16.5 10.5L23 12L16.5 13.5L21 17L15 15.5L17 20.5L13.5 17L12 23L10.5 17L7 20.5L9 15.5L3 17L7.5 13.5L1 12L7.5 10.5L3 7L9 8.5L7 3.5L10.5 7L12 1Z"
                fill="#22c55e"
              />
              <path
                d="M9 12L11 14L15 10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Billing address on file</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-gray-200">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-medium transition-colors ${
              activeTab === 'invoices'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Invoices
            {invoices.some((inv) => inv.status === 'open') && (
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003z"
                  className="fill-yellow-100 stroke-yellow-800"
                  strokeWidth="1.5"
                />
                <path
                  d="M12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  className="fill-yellow-800"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => setActiveTab('address')}
            className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-medium transition-colors ${
              activeTab === 'address'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Billing Address
            {hasValidatedBilling && (
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 1L13.5 7L17 3.5L15 8.5L21 7L16.5 10.5L23 12L16.5 13.5L21 17L15 15.5L17 20.5L13.5 17L12 23L10.5 17L7 20.5L9 15.5L3 17L7.5 13.5L1 12L7.5 10.5L3 7L9 8.5L7 3.5L10.5 7L12 1Z"
                  fill="#22c55e"
                />
                <path
                  d="M9 12L11 14L15 10"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'address' && (
          <div className="max-w-2xl">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Billing Address
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {hasValidatedBilling
                  ? 'Your billing address is on file. Update it if needed.'
                  : 'Please enter your billing address to receive invoices.'}
              </p>

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                  {success}
                </div>
              )}

              <div className="mt-6">
                <BillingAddressForm
                  initialData={{
                    line1: billingData?.billing_address_line1 || '',
                    line2: billingData?.billing_address_line2 || '',
                    city: billingData?.billing_city || '',
                    state: billingData?.billing_state || '',
                    zip: billingData?.billing_zip || ''
                  }}
                  onSubmit={handleAddressSubmit}
                  isLoading={isSubmitting}
                />
              </div>
            </div>

            {hasValidatedBilling && billingData?.stripe_customer_id && (
              <div className="mt-6 rounded-lg bg-green-50 p-4 ring-1 ring-green-200">
                <div className="flex items-center gap-2">
                  <svg
                    className="size-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-green-800">
                    Billing account active
                  </span>
                </div>
                <p className="mt-1 text-sm text-green-700">
                  Your billing account is set up and ready to receive invoices.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="max-w-4xl">
            {!hasValidatedBilling ? (
              <div className="rounded-xl bg-yellow-50 p-6 ring-1 ring-yellow-200">
                <div className="flex items-start gap-3">
                  <svg
                    className="size-6 shrink-0 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      Billing address required
                    </h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      Please add your billing address first to view invoices.
                    </p>
                    <button
                      onClick={() => setActiveTab('address')}
                      className="mt-3 text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                      Add Billing Address &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <InvoiceList invoices={invoices} isLoading={invoicesLoading} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

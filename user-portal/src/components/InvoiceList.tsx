import { useState } from 'react'
import { getInvoicePaymentUrl, StripeInvoice } from '../lib/stripeApi'

interface InvoiceListProps {
  invoices: StripeInvoice[]
  isLoading: boolean
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100)
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function StatusBadge({ status }: { status: StripeInvoice['status'] }) {
  const styles: Record<StripeInvoice['status'], string> = {
    paid: 'bg-green-100 text-green-800',
    open: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800',
    void: 'bg-red-100 text-red-800',
    uncollectible: 'bg-red-100 text-red-800'
  }

  const labels: Record<StripeInvoice['status'], string> = {
    paid: 'Paid',
    open: 'Unpaid',
    draft: 'Draft',
    void: 'Void',
    uncollectible: 'Uncollectible'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

export function InvoiceList({ invoices, isLoading }: InvoiceListProps) {
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handlePayInvoice = async (invoiceId: string) => {
    setPayingInvoiceId(invoiceId)
    setError('')

    try {
      const result = await getInvoicePaymentUrl(invoiceId)

      if (result.url) {
        window.open(result.url, '_blank')
      } else if (result.error) {
        setError(result.error)
      }
    } catch {
      setError('Failed to initiate payment')
    } finally {
      setPayingInvoiceId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600"></div>
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
        <svg
          className="mx-auto size-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <h3 className="mt-4 text-sm font-medium text-gray-900">No invoices</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don&apos;t have any invoices yet.
        </p>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Mobile Card Layout */}
      <div className="space-y-4 md:hidden">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {invoice.number || `INV-${invoice.id.slice(-8)}`}
                </div>
                {invoice.description && (
                  <div className="mt-0.5 text-sm text-gray-500">
                    {invoice.description}
                  </div>
                )}
              </div>
              <StatusBadge status={invoice.status} />
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="text-sm text-gray-500">
                {formatDate(invoice.created)}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(invoice.amount_due, invoice.currency)}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-3 border-t border-gray-100 pt-3">
              {invoice.invoice_pdf && (
                <a
                  href={invoice.invoice_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700"
                >
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  PDF
                </a>
              )}
              {invoice.status === 'open' && (
                <button
                  onClick={() => handlePayInvoice(invoice.id)}
                  disabled={payingInvoiceId === invoice.id}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {payingInvoiceId === invoice.id ? 'Loading...' : 'Pay Now'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.number || `INV-${invoice.id.slice(-8)}`}
                  </div>
                  {invoice.description && (
                    <div className="text-sm text-gray-500">
                      {invoice.description}
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatDate(invoice.created)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {formatCurrency(invoice.amount_due, invoice.currency)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <StatusBadge status={invoice.status} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <div className="flex items-center justify-end gap-3">
                    {invoice.invoice_pdf && (
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700"
                      >
                        <span className="sr-only">Download PDF</span>
                        <svg
                          className="size-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                      </a>
                    )}
                    {invoice.status === 'open' && (
                      <button
                        onClick={() => handlePayInvoice(invoice.id)}
                        disabled={payingInvoiceId === invoice.id}
                        className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {payingInvoiceId === invoice.id
                          ? 'Loading...'
                          : 'Pay Now'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

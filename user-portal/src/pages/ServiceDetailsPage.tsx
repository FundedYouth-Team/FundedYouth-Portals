import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { fetchServiceByName, type ServiceDefinition } from '../lib/serviceApi'

interface ServiceAgreement {
  id: string
  service_name: string
  service_version: string
  confirmed_fields: Record<string, boolean>
  agreed_at: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  cancelled_at: string | null
}

interface BrokerAccount {
  id: string
  broker_name: string
  broker_account_number: string
  is_active: boolean
  created_at: string
}

type ModalType = 'pause' | 'remove' | 'reactivate' | null

export function ServiceDetailsPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const navigate = useNavigate()
  const [agreement, setAgreement] = useState<ServiceAgreement | null>(null)
  const [broker, setBroker] = useState<BrokerAccount | null>(null)
  const [serviceDetails, setServiceDetails] = useState<ServiceDefinition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [reason, setReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (!user) return

        // Fetch the service agreement by ID (UUID)
        const { data: agreementData } = await supabase
          .from('service_agreements')
          .select('*')
          .eq('id', serviceId)
          .eq('user_id', user.id)
          .single()

        if (agreementData) {
          setAgreement(agreementData)

          // Fetch service details from database
          const details = await fetchServiceByName(agreementData.service_name)
          setServiceDetails(details)
        }

        // Fetch the broker account linked to this service agreement
        const { data: brokerData } = await supabase
          .from('broker_accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('service_agreement_id', serviceId)
          .single()

        if (brokerData) {
          setBroker(brokerData)
        }
      } catch (error) {
        console.error('Error fetching service details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [serviceId])

  const handlePauseService = async () => {
    if (!agreement) return

    setIsProcessing(true)
    setError('')

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in')
      }

      // Update service agreement status to paused
      const { error: agreementError } = await supabase
        .from('service_agreements')
        .update({
          status: 'paused',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || null
        })
        .eq('id', agreement.id)
        .eq('user_id', user.id)

      if (agreementError) {
        throw new Error(agreementError.message)
      }

      // Deactivate linked broker account
      if (broker) {
        await supabase
          .from('broker_accounts')
          .update({ is_active: false })
          .eq('id', broker.id)
          .eq('user_id', user.id)
      }

      // Navigate back to dashboard
      navigate('/dashboard', {
        state: { pauseSuccess: true, serviceName: serviceDetails?.display_name }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause service')
      setIsProcessing(false)
    }
  }

  const handleRemoveService = async () => {
    if (!agreement) return

    setIsProcessing(true)
    setError('')

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in')
      }

      // Delete linked broker account first
      if (broker) {
        const { error: brokerError } = await supabase
          .from('broker_accounts')
          .delete()
          .eq('id', broker.id)
          .eq('user_id', user.id)

        if (brokerError) {
          throw new Error(brokerError.message)
        }
      }

      // Delete the service agreement
      const { error: agreementError } = await supabase
        .from('service_agreements')
        .delete()
        .eq('id', agreement.id)
        .eq('user_id', user.id)

      if (agreementError) {
        throw new Error(agreementError.message)
      }

      // Navigate back to dashboard
      navigate('/dashboard', {
        state: { removeSuccess: true, serviceName: serviceDetails?.display_name }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove service')
      setIsProcessing(false)
    }
  }

  const handleReactivateService = async () => {
    if (!agreement) return

    setIsProcessing(true)
    setError('')

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in')
      }

      // Update service agreement status to active
      const { error: agreementError } = await supabase
        .from('service_agreements')
        .update({
          status: 'active',
          cancelled_at: null,
          cancellation_reason: null
        })
        .eq('id', agreement.id)
        .eq('user_id', user.id)

      if (agreementError) {
        throw new Error(agreementError.message)
      }

      // Reactivate linked broker account
      if (broker) {
        await supabase
          .from('broker_accounts')
          .update({ is_active: true })
          .eq('id', broker.id)
          .eq('user_id', user.id)
      }

      // Refresh the page data
      setAgreement({ ...agreement, status: 'active', cancelled_at: null })
      if (broker) {
        setBroker({ ...broker, is_active: true })
      }
      setActiveModal(null)
      setIsProcessing(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to reactivate service'
      )
      setIsProcessing(false)
    }
  }

  const closeModal = () => {
    setActiveModal(null)
    setReason('')
    setError('')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600"></div>
          <p className="mt-4 text-gray-500">Loading service details...</p>
        </div>
      </div>
    )
  }

  if (!agreement) {
    return (
      <div className="p-8">
        <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            Service Not Found
          </h1>
          <p className="mt-2 text-gray-600">
            You are not enrolled in this service.
          </p>
          <Link
            to="/dashboard/services"
            className="mt-6 inline-block rounded-lg bg-teal-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-700"
          >
            Browse Services
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {serviceDetails?.display_name || agreement.service_name}
          </h1>
          <p className="mt-1 text-gray-600">
            {agreement.status === 'paused' ? (
              <>
                Paused on{' '}
                {new Date(agreement.cancelled_at!).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </>
            ) : (
              <>
                Enrolled on{' '}
                {new Date(agreement.agreed_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </>
            )}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            agreement.status === 'active'
              ? 'bg-green-100 text-green-800'
              : agreement.status === 'paused'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Agreement Details */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <svg
              className="size-5 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
            Service Agreement
          </h2>

          <dl className="mt-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <dt className="text-sm text-gray-500">Status</dt>
              <dd className="flex items-center gap-1 text-sm font-medium text-green-600">
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Signed
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <dt className="text-sm text-gray-500">Version</dt>
              <dd className="text-sm font-medium text-gray-900">
                {agreement.service_version}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <dt className="text-sm text-gray-500">Signed Date</dt>
              <dd className="text-sm font-medium text-gray-900">
                {new Date(agreement.agreed_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </dd>
            </div>
          </dl>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">
              Your Commitments
            </h3>
            <ul className="mt-2 space-y-2">
              {Object.entries(agreement.confirmed_fields).map(
                ([key, value]) => {
                  // Find the acknowledgment text from the service details
                  const ack = serviceDetails?.acknowledgments?.find(a => a.id === key)
                  const displayText = ack?.text || key

                  return (
                    <li
                      key={key}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      {value ? (
                        <svg
                          className="size-4 shrink-0 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="size-4 shrink-0 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      <span className="line-clamp-2">{displayText}</span>
                    </li>
                  )
                }
              )}
            </ul>
          </div>
        </div>

        {/* Broker Account Details */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <svg
              className="size-5 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
              />
            </svg>
            Broker Account
          </h2>

          {broker ? (
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <dt className="text-sm text-gray-500">Status</dt>
                <dd>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      broker.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {broker.is_active ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <dt className="text-sm text-gray-500">Broker</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {broker.broker_name}
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <dt className="text-sm text-gray-500">Account Number</dt>
                <dd className="font-mono text-sm font-medium text-gray-900">
                  {broker.broker_account_number}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-500">Connected</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(broker.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              No broker account linked to this service.
            </p>
          )}
        </div>
      </div>

      {/* Service Features */}
      {serviceDetails && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Included Features
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {serviceDetails.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <svg
                  className="size-5 shrink-0 text-teal-500"
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
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reactivate Service Button - Only show for paused services */}
      {agreement.status === 'paused' && (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-lg font-semibold text-green-900">
            Reactivate Service
          </h2>
          <p className="mt-2 text-sm text-green-700">
            Your service is currently paused. Reactivate it to resume using your
            broker account connection.
          </p>
          <button
            type="button"
            onClick={() => setActiveModal('reactivate')}
            className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Reactivate Service
          </button>
        </div>
      )}

      {/* Service Management Actions - Only show for active or paused services */}
      {(agreement.status === 'active' || agreement.status === 'paused') && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Manage Service
          </h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            {/* Pause Service - Only show for active services */}
            {agreement.status === 'active' && (
              <div className="flex-1 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <h3 className="font-medium text-yellow-900">Pause Service</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Temporarily pause your service. You can reactivate it anytime.
                  Your broker account data will be preserved.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveModal('pause')}
                  className="mt-3 rounded-lg border border-yellow-300 bg-white px-4 py-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-100"
                >
                  Pause Service
                </button>
              </div>
            )}

            {/* Remove Service */}
            <div className="flex-1 rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="font-medium text-red-900">Remove Service</h3>
              <p className="mt-1 text-sm text-red-700">
                Permanently remove this service and delete all associated data.
                You can re-enroll later with new broker details.
              </p>
              <button
                type="button"
                onClick={() => setActiveModal('remove')}
                className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
              >
                Remove Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Confirmation Modal */}
      {activeModal === 'pause' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Pause Service?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to pause{' '}
              <strong>{serviceDetails?.display_name || agreement.service_name}</strong>?
              Your broker account will be deactivated but your data will be
              preserved for when you reactivate.
            </p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-4">
              <label
                htmlFor="pauseReason"
                className="block text-sm font-medium text-gray-700"
              >
                Reason for pausing (optional)
              </label>
              <textarea
                id="pauseReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="Tell us why you're pausing..."
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isProcessing}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePauseService}
                disabled={isProcessing}
                className="flex-1 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700 disabled:opacity-50"
              >
                {isProcessing ? 'Pausing...' : 'Yes, Pause'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {activeModal === 'remove' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Remove Service?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to permanently remove{' '}
              <strong>{serviceDetails?.display_name || agreement.service_name}</strong>?
              This will delete your service agreement and broker account data.
              You can re-enroll later with new details.
            </p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isProcessing}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveService}
                disabled={isProcessing}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Confirmation Modal */}
      {activeModal === 'reactivate' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Reactivate Service?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to reactivate{' '}
              <strong>{serviceDetails?.display_name || agreement.service_name}</strong>?
              Your broker account will be reactivated with your existing
              details.
            </p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isProcessing}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReactivateService}
                disabled={isProcessing}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing ? 'Reactivating...' : 'Yes, Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NotificationList, NotificationItem } from '../components/Notification'
import { supabase } from '../lib/supabaseClient'
import { fetchServicesByNames, type ServiceCardData } from '../lib/serviceApi'

interface EnrolledService {
  id: string
  name: string
  enrolledAt: string
  status: 'active' | 'paused' | 'pending' | 'expired' | 'cancelled'
  broker: {
    name: string
    accountNumber: string
  }
}

interface BrokerAccountRow {
  id: string
  broker_name: string
  broker_account_number: string
  is_active: boolean
  created_at: string
  service_agreement_id: string | null
}

interface ServiceAgreementRow {
  id: string
  service_name: string
  agreed_at: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
}

export function DashboardPage() {
  const location = useLocation()
  const [enrolledServices, setEnrolledServices] = useState<EnrolledService[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [hasBillingAddress, setHasBillingAddress] = useState(true)
  const [isProfileComplete, setIsProfileComplete] = useState(true)

  // Fetch enrolled services and broker accounts from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (!user) return

        // Check if profile is complete (has first name, last name, and phone)
        const firstName = user.user_metadata?.first_name || ''
        const lastName = user.user_metadata?.last_name || ''
        const phone = user.user_metadata?.phone || ''
        setIsProfileComplete(Boolean(firstName && lastName && phone))

        // Fetch active and paused service agreements
        const { data: agreements } = await supabase
          .from('service_agreements')
          .select('id, service_name, agreed_at, status')
          .eq('user_id', user.id)
          .in('status', ['active', 'paused'])
          .order('agreed_at', { ascending: false })

        // Fetch all broker accounts (active and inactive for paused services)
        const { data: brokers } = await supabase
          .from('broker_accounts')
          .select(
            'id, broker_name, broker_account_number, is_active, created_at, service_agreement_id'
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        // Combine agreements with broker info
        if (agreements && brokers) {
          // Get service names to fetch from database
          const serviceNames = agreements.map((a) => a.service_name)

          // Fetch service details from database
          let serviceDetailsMap = new Map<string, ServiceCardData>()
          if (serviceNames.length > 0) {
            serviceDetailsMap = await fetchServicesByNames(serviceNames)
          }

          const services: EnrolledService[] = agreements.map(
            (agreement: ServiceAgreementRow) => {
              // Find the service details from database
              const serviceDetails = serviceDetailsMap.get(agreement.service_name)

              // Match with broker account by service_agreement_id
              const broker: BrokerAccountRow | undefined = brokers.find(
                (b) => b.service_agreement_id === agreement.id
              )

              return {
                id: agreement.id,
                name: serviceDetails?.name || agreement.service_name,
                enrolledAt: agreement.agreed_at,
                status: agreement.status,
                broker: {
                  name: broker?.broker_name || 'Unknown',
                  accountNumber: broker?.broker_account_number || ''
                }
              }
            }
          )

          setEnrolledServices(services)
        }

        // Check if billing address is filled
        const { data: billing } = await supabase
          .from('billing_customers')
          .select('billing_validated_at')
          .eq('user_id', user.id)
          .maybeSingle()

        setHasBillingAddress(!!billing?.billing_validated_at)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Check for success messages from navigation state
  useEffect(() => {
    const state = location.state as {
      enrollmentSuccess?: boolean
      pauseSuccess?: boolean
      removeSuccess?: boolean
      serviceName?: string
    } | null

    if (state?.enrollmentSuccess) {
      setSuccessMessage(
        `Successfully enrolled in ${state.serviceName || 'the service'}!`
      )
    } else if (state?.pauseSuccess) {
      setSuccessMessage(
        `Successfully paused ${
          state.serviceName || 'the service'
        }. You can reactivate it anytime.`
      )
    } else if (state?.removeSuccess) {
      setSuccessMessage(
        `Successfully removed ${
          state.serviceName || 'the service'
        }. You can re-enroll anytime.`
      )
    }

    // Clear the state so it doesn't show again on refresh
    if (
      state?.enrollmentSuccess ||
      state?.pauseSuccess ||
      state?.removeSuccess
    ) {
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Build notifications based on enrollment status and billing
  useEffect(() => {
    if (isLoading) return

    const newNotifications: NotificationItem[] = []

    if (!isProfileComplete) {
      newNotifications.push({
        id: 'incomplete-profile',
        type: 'info',
        title: 'Complete Your Profile',
        message:
          'Add your first name, last name, and phone number to activate your account. Go to Profile and fill in your details, then click Save Changes.',
        actionLabel: 'Go to Profile',
        actionHref: '/dashboard/profile',
        dismissible: true
      })
    }

    if (!hasBillingAddress) {
      newNotifications.push({
        id: 'no-billing',
        type: 'warning',
        title: 'Billing Address Required',
        message:
          'Please add your billing address to receive invoices and manage payments.',
        actionLabel: 'Add Billing Address',
        actionHref: '/dashboard/billing',
        dismissible: true
      })
    }

    if (enrolledServices.length === 0) {
      newNotifications.push({
        id: 'no-services',
        type: 'success',
        title: 'Get Started with Our Services',
        message:
          'You have not enrolled in any services yet. Browse our available services to get started.',
        actionLabel: 'View Services',
        actionHref: '/dashboard/services',
        dismissible: true
      })
    }

    setNotifications(newNotifications)
  }, [enrolledServices, isLoading, hasBillingAddress, isProfileComplete])

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleMarkAsRead = (id: string) => {
    console.log('Marked as read:', id)
  }

  const activeCount = enrolledServices.filter(
    (s) => s.status === 'active'
  ).length
  const pausedCount = enrolledServices.filter(
    (s) => s.status === 'paused'
  ).length

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600"></div>
          <p className="mt-4 text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome to your customer portal</p>

      {/* Success Message */}
      {successMessage && (
        <div className="mt-6 flex items-center justify-between rounded-lg bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <svg
              className="size-5 text-green-500"
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
              {successMessage}
            </span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="text-green-500 hover:text-green-700"
          >
            <svg
              className="size-5"
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
          </button>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mt-6">
          <NotificationList
            notifications={notifications}
            onDismiss={handleDismiss}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 flex flex-wrap gap-4">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Active Services</h3>
          <div className="mt-2 text-3xl font-bold text-teal-600">
            {activeCount}
          </div>
        </div>
        {hasBillingAddress && (
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Payments &amp; Billing</h3>
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                Active
              </span>
            </div>
          </div>
        )}
        {pausedCount > 0 && (
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h3 className="text-sm font-medium text-gray-500">
              Paused Services
            </h3>
            <div className="mt-2 text-3xl font-bold text-yellow-600">
              {pausedCount}
            </div>
          </div>
        )}
      </div>

      {/* Enrolled Services */}
      {enrolledServices.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Your Services</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            {enrolledServices.map((service) => (
              <div
                key={service.id}
                className={`rounded-xl bg-white p-6 shadow-sm ring-1 ${
                  service.status === 'paused'
                    ? 'ring-yellow-200'
                    : 'ring-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-full ${
                        service.status === 'paused'
                          ? 'bg-yellow-100'
                          : 'bg-teal-100'
                      }`}
                    >
                      {service.status === 'paused' ? (
                        <svg
                          className="size-5 text-yellow-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                          />
                        </svg>
                      ) : (
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
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Enrolled{' '}
                        {new Date(service.enrolledAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      service.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : service.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800'
                          : service.status === 'pending'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {service.status.charAt(0).toUpperCase() +
                      service.status.slice(1)}
                  </span>
                </div>

                <div className="mt-6 space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Agreement</span>
                    <span className="flex items-center gap-1 font-medium text-green-600">
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
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Broker</span>
                    <span className="font-medium text-gray-900">
                      {service.broker.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Account</span>
                    <span className="font-mono text-gray-900">
                      ****{service.broker.accountNumber.slice(-4)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <Link
                    to={`/dashboard/services/${service.id}`}
                    className={`text-sm font-medium ${
                      service.status === 'paused'
                        ? 'text-yellow-600 hover:text-yellow-700'
                        : 'text-teal-600 hover:text-teal-700'
                    }`}
                  >
                    {service.status === 'paused'
                      ? 'Manage Service →'
                      : 'View Details →'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <svg
              className="mx-auto size-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No services yet
            </h3>
            <p className="mt-2 text-gray-500">
              Get started by enrolling in one of our available services.
            </p>
            <Link
              to="/dashboard/services"
              className="mt-6 inline-block rounded-lg bg-teal-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              Browse Services
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

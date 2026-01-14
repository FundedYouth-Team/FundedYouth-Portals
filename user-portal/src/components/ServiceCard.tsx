import { Link } from 'react-router-dom'

export type PricingPeriod = 'daily' | 'weekly' | 'monthly'

export type ServicePricing =
  | { type: 'fixed'; amount: number; period: PricingPeriod }
  | { type: 'percentage'; percentage: number; period: PricingPeriod }

export interface Service {
  id: string
  name: string
  description: string
  features: string[]
  pricing: ServicePricing
  maxInstancesPerUser?: number
}

type EnrollmentStatus = 'active' | 'paused' | 'available'

interface ServiceCardProps {
  service: Service
  enrollmentStatus?: EnrollmentStatus
  agreementId?: string
  enrollmentCount?: number
  /** @deprecated Use enrollmentStatus instead */
  isEnrolled?: boolean
}

function formatPricing(pricing: ServicePricing): {
  value: string
  label: string
} {
  const periodLabels: Record<PricingPeriod, string> = {
    daily: 'day',
    weekly: 'week',
    monthly: 'month'
  }

  if (pricing.type === 'fixed') {
    return {
      value: `$${pricing.amount}`,
      label: `/${periodLabels[pricing.period]}`
    }
  }

  return {
    value: `${pricing.percentage}%`,
    label: `of ${pricing.period} earnings`
  }
}

function getStatusPill(status: EnrollmentStatus) {
  switch (status) {
    case 'active':
      return {
        bg: 'bg-green-500/20',
        text: 'text-green-600',
        dot: 'bg-green-500',
        label: 'Active'
      }
    case 'paused':
      return {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-600',
        dot: 'bg-yellow-500',
        label: 'Paused'
      }
    case 'available':
    default:
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-600',
        dot: 'bg-blue-500',
        label: 'Available'
      }
  }
}

export function ServiceCard({
  service,
  enrollmentStatus,
  agreementId,
  enrollmentCount = 0,
  isEnrolled = false
}: ServiceCardProps) {
  const { value, label } = formatPricing(service.pricing)

  // Support legacy isEnrolled prop for backwards compatibility
  const status: EnrollmentStatus = enrollmentStatus
    ? enrollmentStatus
    : isEnrolled
      ? 'active'
      : 'available'

  const statusPill = getStatusPill(status)

  // Check if user has reached the enrollment limit
  const maxInstances = service.maxInstancesPerUser ?? 1
  const hasReachedLimit = enrollmentCount >= maxInstances

  // Determine the action button based on status and limits
  const getActionButton = () => {
    // If enrolled (active or paused), show view/manage button
    if (status === 'active') {
      return (
        <Link
          to={`/dashboard/services/${agreementId || service.id}`}
          className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          View Details
        </Link>
      )
    }

    if (status === 'paused') {
      return (
        <Link
          to={`/dashboard/services/${agreementId || service.id}`}
          className="rounded-lg bg-yellow-100 px-6 py-3 text-sm font-medium text-yellow-700 transition-colors hover:bg-yellow-200"
        >
          Manage Service
        </Link>
      )
    }

    // For available status, check if limit is reached
    if (hasReachedLimit) {
      return (
        <span className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-500">
          Limit Reached
        </span>
      )
    }

    // Available and under limit - show Get Started
    return (
      <Link
        to={`/dashboard/services/${service.id}/enroll`}
        className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-700"
      >
        Get Started
      </Link>
    )
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {service.name}
          </h2>
          <p className="mt-2 text-gray-600">{service.description}</p>
        </div>
        {/* Status pill - always visible */}
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusPill.bg} ${statusPill.text}`}
        >
          <span
            className={`mr-1.5 size-2 rounded-full ${statusPill.dot}`}
          ></span>
          {statusPill.label}
        </span>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-900">
          What&apos;s included:
        </h3>
        <ul className="mt-3 space-y-2">
          {service.features.map((feature, index) => (
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

      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
        <div>
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className="text-gray-500"> {label}</span>
        </div>

        {getActionButton()}
      </div>
    </div>
  )
}

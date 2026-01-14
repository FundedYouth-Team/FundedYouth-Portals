import { useState, useEffect } from 'react'
import { ServiceCard } from '../components/ServiceCard'
import { supabase } from '../lib/supabaseClient'
import { fetchAvailableServices, type ServiceCardData } from '../lib/serviceApi'

interface ServiceEnrollment {
  serviceId: string
  status: 'active' | 'paused'
  agreementId: string
}

export function ServicesPage() {
  const [services, setServices] = useState<ServiceCardData[]>([])
  const [enrollments, setEnrollments] = useState<ServiceEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch available services from database
        const availableServices = await fetchAvailableServices()
        setServices(availableServices)

        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (!user) {
          setIsLoading(false)
          return
        }

        // Fetch active and paused service agreements
        const { data: agreements } = await supabase
          .from('service_agreements')
          .select('id, service_name, status')
          .eq('user_id', user.id)
          .in('status', ['active', 'paused'])

        if (agreements) {
          setEnrollments(
            agreements.map((a) => ({
              serviceId: a.service_name,
              status: a.status as 'active' | 'paused',
              agreementId: a.id
            }))
          )
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load services. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getEnrollmentInfo = (
    serviceId: string
  ): {
    status: 'active' | 'paused' | 'available'
    agreementId?: string
    enrollmentCount: number
  } => {
    // Count all enrollments for this service (active + paused)
    const serviceEnrollments = enrollments.filter(
      (e) => e.serviceId === serviceId
    )
    const enrollmentCount = serviceEnrollments.length

    // Find the first enrollment to get agreementId for "View Details" link
    const enrollment = serviceEnrollments[0]
    if (enrollment) {
      return {
        status: enrollment.status,
        agreementId: enrollment.agreementId,
        enrollmentCount
      }
    }
    return { status: 'available', enrollmentCount: 0 }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600"></div>
          <p className="mt-4 text-gray-500">Loading services...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl bg-red-50 p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">Enable Services</h1>
      <p className="mt-2 text-gray-600">
        Browse available services and start your enrollment
      </p>

      {services.length === 0 ? (
        <div className="mt-8 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-500">No services available at this time.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {services.map((service) => {
            const enrollmentInfo = getEnrollmentInfo(service.id)
            return (
              <ServiceCard
                key={service.id}
                service={service}
                enrollmentStatus={enrollmentInfo.status}
                agreementId={enrollmentInfo.agreementId}
                enrollmentCount={enrollmentInfo.enrollmentCount}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

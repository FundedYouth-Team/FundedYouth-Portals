import { supabase } from './supabaseClient'

/**
 * Service acknowledgment checkbox
 */
export interface ServiceAcknowledgment {
  id: string
  text: string
  required: boolean
}

/**
 * Broker option for enrollment
 */
export interface BrokerOption {
  id: string
  name: string
}

/**
 * Service definition from database
 */
export interface ServiceDefinition {
  id: string
  name: string
  display_name: string
  description: string | null
  display_description: string | null
  version: string
  enabled: boolean
  requires_agreement: boolean
  terms_content: string | null
  terms_updated_at: string | null
  features: string[]
  pricing_type: 'fixed' | 'percentage' | 'subscription' | null
  pricing_amount: number | null
  pricing_percentage: number | null
  pricing_period: 'weekly' | 'monthly' | 'yearly' | 'one-time' | null
  max_instances_per_user: number
  acknowledgments: ServiceAcknowledgment[]
}

/**
 * Service for display in service cards
 */
export interface ServiceCardData {
  id: string
  name: string
  description: string
  features: string[]
  pricing: ServicePricing
  maxInstancesPerUser: number
}

export type ServicePricing =
  | { type: 'fixed'; amount: number; period: 'daily' | 'weekly' | 'monthly' }
  | { type: 'percentage'; percentage: number; period: 'daily' | 'weekly' | 'monthly' }

/**
 * Service enrollment data for the enrollment flow
 */
export interface ServiceEnrollmentData {
  name: string
  version: string
  agreement: string
  acknowledgments: ServiceAcknowledgment[]
}

// Default broker options (could be moved to database later)
export const BROKER_OPTIONS: BrokerOption[] = [
  { id: 'trading-com', name: 'Trading.com' },
  { id: 'other', name: 'Other Broker' }
]

/**
 * Convert pricing period from database format to display format
 */
function convertPricingPeriod(period: string | null): 'daily' | 'weekly' | 'monthly' {
  switch (period) {
    case 'daily':
      return 'daily'
    case 'weekly':
      return 'weekly'
    case 'monthly':
    case 'yearly':
    case 'one-time':
    default:
      return 'monthly'
  }
}

/**
 * Convert database service to card display format
 */
function toServiceCardData(service: ServiceDefinition): ServiceCardData {
  let pricing: ServicePricing

  if (service.pricing_type === 'percentage' && service.pricing_percentage !== null) {
    pricing = {
      type: 'percentage',
      percentage: service.pricing_percentage,
      period: convertPricingPeriod(service.pricing_period)
    }
  } else {
    pricing = {
      type: 'fixed',
      amount: service.pricing_amount || 0,
      period: convertPricingPeriod(service.pricing_period)
    }
  }

  return {
    id: service.name, // Use name as ID for URL routing (e.g., 'mt5_service')
    name: service.display_name,
    description: service.display_description || service.description || '',
    features: service.features || [],
    pricing,
    maxInstancesPerUser: service.max_instances_per_user ?? 1
  }
}

/**
 * Fetch all enabled services for the services listing page
 */
export async function fetchAvailableServices(): Promise<ServiceCardData[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('enabled', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching services:', error)
    throw error
  }

  return (data || []).map(toServiceCardData)
}

/**
 * Fetch a single service by name (identifier)
 */
export async function fetchServiceByName(serviceName: string): Promise<ServiceDefinition | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('name', serviceName)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching service:', error)
    throw error
  }

  return data
}

/**
 * Fetch service enrollment data (agreement and acknowledgments) for the enrollment flow
 */
export async function fetchServiceEnrollmentData(serviceName: string): Promise<ServiceEnrollmentData | null> {
  const service = await fetchServiceByName(serviceName)

  if (!service) {
    return null
  }

  return {
    name: service.display_name,
    version: service.version,
    agreement: service.terms_content || '',
    acknowledgments: service.acknowledgments || []
  }
}

/**
 * Fetch service card data for a specific service
 */
export async function fetchServiceCardData(serviceName: string): Promise<ServiceCardData | null> {
  const service = await fetchServiceByName(serviceName)

  if (!service) {
    return null
  }

  return toServiceCardData(service)
}

/**
 * Fetch multiple services by name for dashboard display
 */
export async function fetchServicesByNames(serviceNames: string[]): Promise<Map<string, ServiceCardData>> {
  if (serviceNames.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .in('name', serviceNames)

  if (error) {
    console.error('Error fetching services:', error)
    throw error
  }

  const serviceMap = new Map<string, ServiceCardData>()
  for (const service of data || []) {
    serviceMap.set(service.name, toServiceCardData(service))
  }

  return serviceMap
}

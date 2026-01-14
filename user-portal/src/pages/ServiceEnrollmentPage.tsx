import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import {
  fetchServiceEnrollmentData,
  BROKER_OPTIONS,
  type ServiceEnrollmentData
} from '../lib/serviceApi'
import type {
  BrokerAccountInsert,
  ServiceAgreementInsert
} from '../lib/database.types'

const STEPS = [
  { id: 1, name: 'Agreement' },
  { id: 2, name: 'Acknowledge' },
  { id: 3, name: 'Broker' },
  { id: 4, name: 'Confirm' }
]

function StepIndicator({
  steps,
  currentStep
}: {
  steps: typeof STEPS
  currentStep: number
}) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={`flex items-center ${
              stepIdx !== steps.length - 1 ? 'flex-1' : ''
            }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold ${
                  step.id < currentStep
                    ? 'bg-teal-600 text-white'
                    : step.id === currentStep
                      ? 'border-2 border-teal-600 bg-white text-teal-600'
                      : 'border-2 border-gray-300 bg-white text-gray-400'
                }`}
              >
                {step.id < currentStep ? (
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
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  step.id <= currentStep ? 'text-teal-600' : 'text-gray-400'
                }`}
              >
                {step.name}
              </span>
            </div>
            {stepIdx !== steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-full min-w-[40px] max-w-[80px] ${
                  step.id < currentStep ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function ServiceEnrollmentPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const navigate = useNavigate()

  const [service, setService] = useState<ServiceEnrollmentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [hasReadAgreement, setHasReadAgreement] = useState(false)
  const [acknowledgments, setAcknowledgments] = useState<
    Record<string, boolean>
  >({})
  const [brokerData, setBrokerData] = useState({
    broker: '',
    accountNumber: '',
    accountPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const agreementRef = useRef<HTMLDivElement>(null)

  // Fetch service enrollment data from database
  useEffect(() => {
    async function loadService() {
      if (!serviceId) {
        setIsLoading(false)
        return
      }

      try {
        const data = await fetchServiceEnrollmentData(serviceId)
        setService(data)
      } catch (err) {
        console.error('Error fetching service:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadService()
  }, [serviceId])

  const handleAgreementScroll = useCallback(() => {
    if (agreementRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = agreementRef.current
      // Consider "scrolled to bottom" when within 20px of the bottom
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setHasScrolledToBottom(true)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600"></div>
          <p className="mt-4 text-gray-500">Loading service...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900">Service not found</h1>
        <p className="mt-2 text-gray-600">
          The service you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    )
  }

  const allAcknowledged = service.acknowledgments.every(
    (ack) => acknowledgments[ack.id]
  )

  const brokerValid =
    brokerData.broker && brokerData.accountNumber && brokerData.accountPassword

  const handleNext = () => {
    setError('')

    if (currentStep === 1 && !hasReadAgreement) {
      setError('Please confirm you have read the agreement')
      return
    }

    if (currentStep === 2 && !allAcknowledged) {
      setError('Please acknowledge all items to continue')
      return
    }

    if (currentStep === 3 && !brokerValid) {
      setError('Please fill in all broker information')
      return
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError('')
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      // Get current user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('You must be logged in to enroll')
      }

      // Get broker name from selected broker ID
      const selectedBroker = BROKER_OPTIONS.find(
        (b) => b.id === brokerData.broker
      )

      // Insert service agreement
      const agreementData: ServiceAgreementInsert = {
        user_id: user.id,
        service_name: serviceId || '',
        service_version: service.version,
        confirmed_fields: acknowledgments,
        agreed_to_terms: true,
        ip_address: null,
        user_agent: navigator.userAgent
      }

      const { data: agreementResult, error: agreementError } = await supabase
        .from('service_agreements')
        .insert(agreementData)
        .select('id')
        .single()

      if (agreementError) {
        throw new Error(agreementError.message)
      }

      // Insert broker account linked to the service agreement
      const brokerAccountData: BrokerAccountInsert = {
        user_id: user.id,
        broker_name: selectedBroker?.name || brokerData.broker,
        broker_account_number: brokerData.accountNumber,
        broker_account_password: brokerData.accountPassword,
        service_agreement_id: agreementResult.id
      }

      const { error: brokerError } = await supabase
        .from('broker_accounts')
        .insert(brokerAccountData)

      if (brokerError) {
        throw new Error(brokerError.message)
      }

      // Navigate to dashboard after successful enrollment
      navigate('/dashboard', {
        state: { enrollmentSuccess: true, serviceName: service.name }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Enroll in {service.name}
        </h1>
        <p className="mt-2 text-center text-gray-600">
          Complete the following steps to get started
        </p>

        <div className="mt-8">
          <StepIndicator steps={STEPS} currentStep={currentStep} />

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            {/* Step 1: Agreement */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Software Lease Agreement
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Please read the following agreement carefully
                </p>

                {/* Scroll indicator */}
                {!hasScrolledToBottom && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-800">
                    <svg
                      className="size-5 shrink-0 animate-bounce"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      Please scroll down to read the entire agreement
                    </span>
                  </div>
                )}

                {hasScrolledToBottom && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-800">
                    <svg
                      className="size-5 shrink-0"
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
                    <span className="text-sm font-medium">
                      You have read the full agreement. Please check the box
                      below to continue.
                    </span>
                  </div>
                )}

                <div
                  ref={agreementRef}
                  onScroll={handleAgreementScroll}
                  className="mt-4 h-80 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                    {service.agreement}
                  </pre>
                </div>

                <label
                  className={`mt-6 flex items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                    hasScrolledToBottom
                      ? 'cursor-pointer border-teal-200 bg-teal-50 hover:border-teal-300'
                      : 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={hasReadAgreement}
                    onChange={(e) => setHasReadAgreement(e.target.checked)}
                    disabled={!hasScrolledToBottom}
                    className="mt-0.5 size-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span
                    className={`text-sm font-medium ${
                      hasScrolledToBottom ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    I have read and understand the Software Lease Agreement
                  </span>
                </label>
              </div>
            )}

            {/* Step 2: Acknowledgments */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Acknowledgments
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Please confirm your commitment to the following
                </p>

                {/* Progress indicator */}
                <div className="mt-4">
                  {allAcknowledged ? (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-800">
                      <svg
                        className="size-5 shrink-0"
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
                      <span className="text-sm font-medium">
                        All commitments acknowledged. You may continue.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-800">
                      <svg
                        className="size-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                        />
                      </svg>
                      <span className="text-sm font-medium">
                        Please check all {service.acknowledgments.length} boxes
                        to continue (
                        {Object.values(acknowledgments).filter(Boolean).length}{' '}
                        of {service.acknowledgments.length} checked)
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  {service.acknowledgments.map((ack) => {
                    const isChecked = acknowledgments[ack.id] || false
                    return (
                      <label
                        key={ack.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                          isChecked
                            ? 'border-teal-300 bg-teal-50'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setAcknowledgments({
                              ...acknowledgments,
                              [ack.id]: e.target.checked
                            })
                          }
                          className="mt-0.5 size-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span
                          className={`${
                            isChecked
                              ? 'font-medium text-gray-900'
                              : 'text-gray-700'
                          }`}
                        >
                          {ack.text}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Broker Information */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Broker Information
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your broker account details
                </p>

                {/* Progress indicator */}
                <div className="mt-4">
                  {brokerValid ? (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-800">
                      <svg
                        className="size-5 shrink-0"
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
                      <span className="text-sm font-medium">
                        All broker details entered. You may continue.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-800">
                      <svg
                        className="size-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                        />
                      </svg>
                      <span className="text-sm font-medium">
                        Please fill in all fields to continue
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="broker"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Broker <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="broker"
                      value={brokerData.broker}
                      onChange={(e) =>
                        setBrokerData({ ...brokerData, broker: e.target.value })
                      }
                      className={`mt-1 block w-full rounded-lg border bg-white px-4 py-3 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                        brokerData.broker
                          ? 'border-teal-300 bg-teal-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select your broker</option>
                      {BROKER_OPTIONS.map((broker) => (
                        <option key={broker.id} value={broker.id}>
                          {broker.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="accountNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="accountNumber"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={brokerData.accountNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        setBrokerData({
                          ...brokerData,
                          accountNumber: value
                        })
                      }}
                      className={`mt-1 block w-full rounded-lg border px-4 py-3 font-mono text-gray-900 placeholder:font-sans placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                        brokerData.accountNumber
                          ? 'border-teal-300 bg-teal-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter your broker account number"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="accountPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Account Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <input
                        id="accountPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={brokerData.accountPassword}
                        onChange={(e) =>
                          setBrokerData({
                            ...brokerData,
                            accountPassword: e.target.value
                          })
                        }
                        className={`block w-full rounded-lg border px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 ${
                          brokerData.accountPassword
                            ? 'border-teal-300 bg-teal-50'
                            : 'border-gray-300'
                        }`}
                        placeholder="Enter your broker account password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
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
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
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
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Confirm */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Review & Confirm
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Please review your information before completing enrollment
                </p>

                <div className="mt-6 space-y-6">
                  {/* Agreement Summary */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
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
                      <h3 className="font-medium text-gray-900">
                        Agreement Accepted
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      You have read and accepted the Software Lease Agreement
                    </p>
                  </div>

                  {/* Acknowledgments Summary */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
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
                      <h3 className="font-medium text-gray-900">
                        Commitments Acknowledged
                      </h3>
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      {service.acknowledgments.map((ack) => (
                        <li key={ack.id} className="line-clamp-1">
                          - {ack.text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Broker Summary */}
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
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
                      <h3 className="font-medium text-gray-900">
                        Broker Account
                      </h3>
                    </div>
                    <dl className="mt-2 space-y-1 text-sm">
                      <div className="flex gap-2">
                        <dt className="text-gray-500">Broker:</dt>
                        <dd className="text-gray-900">
                          {BROKER_OPTIONS.find(
                            (b) => b.id === brokerData.broker
                          )?.name || brokerData.broker}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-gray-500">Account Number:</dt>
                        <dd className="font-mono text-gray-900">
                          {brokerData.accountNumber}
                        </dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-gray-500">Account Password:</dt>
                        <dd className="text-gray-900">
                          {'•'.repeat(brokerData.accountPassword.length)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !hasReadAgreement) ||
                    (currentStep === 2 && !allAcknowledged) ||
                    (currentStep === 3 && !brokerValid)
                  }
                  className={`rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
                    (currentStep === 1 && !hasReadAgreement) ||
                    (currentStep === 2 && !allAcknowledged) ||
                    (currentStep === 3 && !brokerValid)
                      ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-lg bg-teal-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Completing Enrollment...'
                    : 'Complete Enrollment'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

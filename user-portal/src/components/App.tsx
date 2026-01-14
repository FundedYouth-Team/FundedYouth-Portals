import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { AuthLayout } from '../layouts/AuthLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { LoginPage } from '../pages/LoginPage'
import { SignupPage } from '../pages/SignupPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ProfilePage } from '../pages/ProfilePage'
import { ServicesPage } from '../pages/ServicesPage'
import { ServiceDetailsPage } from '../pages/ServiceDetailsPage'
import { ServiceEnrollmentPage } from '../pages/ServiceEnrollmentPage'
import { BillingPage } from '../pages/BillingPage'
import { BillingSuccessPage } from '../pages/BillingSuccessPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/services" element={<ServicesPage />} />
            <Route
              path="/dashboard/services/:serviceId"
              element={<ServiceDetailsPage />}
            />
            <Route
              path="/dashboard/services/:serviceId/enroll"
              element={<ServiceEnrollmentPage />}
            />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/billing" element={<BillingPage />} />
            <Route
              path="/dashboard/billing/success"
              element={<BillingSuccessPage />}
            />
          </Route>

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

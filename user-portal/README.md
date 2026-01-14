# USA Software Leasing - Customer Portal

A customer portal for managing software leasing services, built with React, Vite, TypeScript, and Supabase.

## Tech Stack

- **Framework:** React 18 + Vite + TypeScript
- **Styling:** TailwindCSS 3
- **Backend:** Supabase (Auth, Database, Edge Functions)
- **Payments:** Stripe (via Supabase Edge Functions)
- **Routing:** React Router v7
- **Testing:** Vitest + Testing Library
- **Hosting:** Cloudflare Pages

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- Stripe account

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/customer-portal-react-vite-supabase.git
cd customer-portal-react-vite-supabase/frontend
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Start Development Server

```bash
pnpm dev
```

The app will be available at http://localhost:5173

---

## Supabase Setup

### Database Schema

Run the SQL schema in your Supabase SQL Editor:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `../model/supabase_schema.sql`
5. Click **Run**

This creates the following tables:
- `billing_customers` - Stripe integration and billing addresses
- `service_agreements` - Service enrollment and status tracking
- `broker_accounts` - Broker credentials linked to services

### Edge Functions

Deploy the Supabase Edge Functions for Stripe integration via the Dashboard:

#### Step 1: Add Secrets

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Project Settings** → **Edge Functions**
4. Click **Manage Secrets**
5. Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key (`sk_live_xxxxx` or `sk_test_xxxxx`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Found in Project Settings → API → `service_role` key |

#### Step 2: Create Edge Functions

1. Navigate to **Edge Functions** in the left sidebar
2. Click **Create a new function**
3. Create each function with the names and code from `../supabase/functions/`:

| Function Name | Source File |
|---------------|-------------|
| `stripe-create-customer` | `supabase/functions/stripe-create-customer/index.ts` |
| `stripe-get-invoices` | `supabase/functions/stripe-get-invoices/index.ts` |
| `stripe-create-checkout` | `supabase/functions/stripe-create-checkout/index.ts` |

4. For each function:
   - Enter the function name (use lowercase with dashes)
   - Copy the code from the corresponding `index.ts` file
   - Click **Create function**

#### Step 3: Verify Deployment

After creating all functions, they should appear in your Edge Functions list with status "Active".

**Edge Functions overview:**
| Function | Purpose |
|----------|---------|
| `stripe-create-customer` | Creates Stripe customer and saves billing address |
| `stripe-get-invoices` | Fetches invoices for the logged-in user |
| `stripe-create-checkout` | Gets Stripe hosted invoice payment URL |

---

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server at http://localhost:5173 |
| `pnpm build` | TypeScript check + production build |
| `pnpm lint` | Run ESLint (zero warnings allowed) |
| `pnpm lint --fix` | Auto-fix lint issues |
| `pnpm typecheck` | TypeScript check only |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:ui` | Run tests with Vitest UI |

---

## Application Features

### Dashboard (`/dashboard`)

The main dashboard displays:
- **Active Services** count
- **Paused Services** count (if any)
- **Payments & Billing** status badge (when billing is set up)
- **Enrolled Services** list with status, broker info, and management links
- **Notifications** for missing billing address or no services enrolled

### Enable Services (`/dashboard/services`)

Browse and enroll in available services:
- View service descriptions, features, and pricing
- Click "Enable" to start the enrollment flow
- Enrollment includes:
  1. Review service agreement
  2. Check required acknowledgments
  3. Enter broker account credentials
  4. Submit to activate service

### Service Management (`/dashboard/services/:id`)

Manage enrolled services:
- **Pause Service** - Temporarily pause (can reactivate later)
- **Reactivate Service** - Resume a paused service
- **Remove Service** - Permanently remove (can re-enroll later)

### Payments & Billing (`/dashboard/billing`)

Manage billing and view invoices:
- **Invoices Tab** - View all invoices with status (Paid/Unpaid)
  - Pay unpaid invoices via Stripe hosted checkout
  - Download invoice PDFs
- **Billing Address Tab** - Enter/update US billing address
  - Creates Stripe customer automatically when submitted

**Icon Key:**
- Warning triangle = Unpaid invoice exists
- Green star with checkmark = Billing address on file

### Profile (`/dashboard/profile`)

View and edit user profile information.

### Help (External Link)

Links to external help/support resources.

---

## Adding New Services

Services are defined in `src/data/services.ts`. To add a new service:

### 1. Add to AVAILABLE_SERVICES

```typescript
export const AVAILABLE_SERVICES: Service[] = [
  // ... existing services
  {
    id: 'your-service-id',           // Unique identifier (kebab-case)
    name: 'Your Service Name',        // Display name
    description: 'Description of your service...',
    features: [
      'Feature 1',
      'Feature 2',
      'Feature 3'
    ],
    pricing: {
      type: 'percentage',             // 'percentage' or 'fixed'
      percentage: 30,                 // For percentage-based pricing
      // amount: 99,                  // For fixed pricing
      period: 'weekly'                // 'weekly', 'monthly', etc.
    }
  }
]
```

### 2. Add Enrollment Data

```typescript
export const SERVICE_ENROLLMENT_DATA: Record<string, ServiceEnrollmentData> = {
  // ... existing services
  'your-service-id': {
    name: 'Your Service Name',
    agreement: `YOUR SERVICE AGREEMENT

1. TERMS
Your agreement text here...

2. FEES
Fee structure details...

... rest of agreement`,
    acknowledgments: [
      {
        id: 'ack-1',
        text: 'I acknowledge and agree to the first condition.'
      },
      {
        id: 'ack-2',
        text: 'I understand and accept the second condition.'
      },
      {
        id: 'risk',
        text: 'I understand the risks involved with this service.'
      }
    ]
  }
}
```

### 3. Add Broker Options (if needed)

If your service requires different broker options:

```typescript
export const BROKER_OPTIONS: BrokerOption[] = [
  { id: 'trading-com', name: 'Trading.com' },
  { id: 'other-broker', name: 'Other Broker' },
  // Add more brokers as needed
]
```

---

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AuthGuard.tsx    # Protected route wrapper
│   │   ├── BillingAddressForm.tsx
│   │   ├── InvoiceList.tsx
│   │   ├── Notification.tsx
│   │   ├── ServiceCard.tsx
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication context & hooks
│   ├── data/
│   │   └── services.ts      # Service definitions
│   ├── layouts/
│   │   ├── AuthLayout.tsx   # Login/signup layout
│   │   ├── DashboardLayout.tsx  # Main app layout with nav
│   │   └── PublicLayout.tsx # Public pages layout
│   ├── lib/
│   │   ├── database.types.ts    # TypeScript types for Supabase
│   │   ├── stripeApi.ts         # Stripe Edge Function wrappers
│   │   └── supabaseClient.ts    # Supabase client instance
│   ├── pages/
│   │   ├── BillingPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ServiceDetailPage.tsx
│   │   ├── ServiceEnrollPage.tsx
│   │   ├── ServicesPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── ...
│   └── App.tsx              # Route definitions
├── .env.example             # Environment template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Authentication Flow

1. Users sign up/login via Supabase Auth
2. `AuthContext` provides user state via `useAuth()` hook
3. `AuthGuard` component protects dashboard routes
4. Unauthenticated users are redirected to `/login`

---

## Deployment

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `pnpm build`
3. Set output directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## License

Proprietary - USA Software Leasing, Inc.

/* ============================================================
   SUPABASE DATABASE SCHEMA
   Project: USA Software Leasing / Trading Platform
   Version: 3.0

   ============================================================
   INSTRUCTIONS
   ============================================================

   1. Go to your Supabase Dashboard: https://supabase.com/dashboard
   2. Select your project
   3. Navigate to: SQL Editor (left sidebar)
   4. Click "New Query"
   5. Copy and paste this entire file
   6. Click "Run" to execute

   IMPORTANT NOTES:
   - Run this on a NEW project or EMPTY database
   - If tables already exist, you may get errors
   - For existing databases, run migration scripts instead

   ============================================================
   WHAT THIS SCHEMA INCLUDES
   ============================================================

   TABLES:
   - billing_customers: Links users to Stripe, stores billing address
   - service_agreements: Legal service agreement acceptance with status
   - broker_accounts: Broker credentials linked to services

   FEATURES:
   - Stripe billing integration
   - US billing address validation (State 2-char, ZIP 5 or 9 digit)
   - Service pause/reactivate/cancel/remove
   - Full audit trail
   - Row Level Security (RLS) on all tables

   HELPER FUNCTIONS:
   - pause_service_agreement()
   - reactivate_service_agreement()
   - cancel_service_agreement()
   - remove_service_agreement()

   ============================================================ */


/* ============================================================
   EXTENSIONS
   Required for UUID generation
   ============================================================ */
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


/* ============================================================
   TABLE: billing_customers

   Purpose:
   - Link Supabase users to Stripe billing
   - Store billing address (US only)
   - Track when billing was validated
   ============================================================ */
CREATE TABLE billing_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FK to Supabase Auth user (one billing record per user)
  user_id uuid NOT NULL UNIQUE
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  -- Billing contact email
  email text NOT NULL,

  -- Stripe customer ID
  stripe_customer_id text UNIQUE,

  -- Billing address fields (US only)
  billing_address_line1 text,
  billing_address_line2 text,
  billing_city text,
  billing_state text,
  billing_zip text,

  -- When the billing address was validated/submitted
  billing_validated_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Constraints for US addresses
  CONSTRAINT billing_state_format
    CHECK (billing_state IS NULL OR length(billing_state) = 2),
  CONSTRAINT billing_zip_format
    CHECK (billing_zip IS NULL OR billing_zip ~ '^\d{5}(-\d{4})?$')
);

-- Enable Row Level Security
ALTER TABLE billing_customers ENABLE ROW LEVEL SECURITY;

-- Users may view their own billing record
CREATE POLICY "User can view own billing record"
ON billing_customers
FOR SELECT
USING (auth.uid() = user_id);

-- Users may create their own billing record
CREATE POLICY "User can create own billing record"
ON billing_customers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users may update their own billing record
CREATE POLICY "User can update own billing record"
ON billing_customers
FOR UPDATE
USING (auth.uid() = user_id);

-- Index for finding users with validated billing
CREATE INDEX IF NOT EXISTS idx_billing_customers_validated
ON billing_customers (user_id) WHERE billing_validated_at IS NOT NULL;


/* ============================================================
   TABLE: service_agreements

   Purpose:
   - Capture legally defensible agreement acceptance
   - Supports versioned service terms
   - Status management (active, paused, cancelled, expired)
   ============================================================ */
CREATE TABLE service_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FK to Supabase Auth user
  user_id uuid NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  -- Logical service identifier (e.g., 'mt5-auto-trader')
  service_name text NOT NULL,

  -- Version of the agreement presented
  service_version text NOT NULL,

  -- Structured confirmations completed by the user
  -- Example:
  -- {
  --   "read_risk_disclosure": true,
  --   "acknowledge_no_guarantees": true,
  --   "age_confirmed": true
  -- }
  confirmed_fields jsonb NOT NULL,

  -- Final agreement checkbox
  agreed_to_terms boolean NOT NULL DEFAULT false,

  -- Audit metadata
  ip_address inet,
  user_agent text,

  -- Timestamp of acceptance
  agreed_at timestamptz NOT NULL DEFAULT now(),

  -- Service status
  -- 'active'    - Service is currently active
  -- 'paused'    - Service is temporarily paused (can be reactivated)
  -- 'cancelled' - Service is permanently cancelled
  -- 'expired'   - Service has expired
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),

  -- When the service was paused/cancelled
  cancelled_at timestamptz,

  -- Optional reason for pausing/cancelling
  cancellation_reason text,

  -- Enforce that agreement must be explicitly true
  CONSTRAINT agreement_must_be_true
    CHECK (agreed_to_terms = true)
);

-- Enable Row Level Security
ALTER TABLE service_agreements ENABLE ROW LEVEL SECURITY;

-- Users may insert their own agreement records
CREATE POLICY "User can create own agreement"
ON service_agreements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users may view their own agreement history
CREATE POLICY "User can view own agreements"
ON service_agreements
FOR SELECT
USING (auth.uid() = user_id);

-- Users may update their own agreements (for pause/reactivate)
CREATE POLICY "User can update own agreement"
ON service_agreements
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users may delete their own agreements (for remove service)
CREATE POLICY "User can delete own agreement"
ON service_agreements
FOR DELETE
USING (auth.uid() = user_id);

-- Admins may view all agreements
CREATE POLICY "Admins can view all agreements"
ON service_agreements
FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Prevent duplicate active agreement acceptance per service/version
-- Note: This allows re-enrollment after removal since the record is deleted
CREATE UNIQUE INDEX IF NOT EXISTS
  service_agreements_unique_acceptance
ON service_agreements (user_id, service_name, service_version);

-- Index for faster status lookups
CREATE INDEX IF NOT EXISTS idx_service_agreements_status
ON service_agreements (user_id, status);


/* ============================================================
   TABLE: broker_accounts

   Purpose:
   - Store broker credentials per user
   - Links to specific service agreement
   - Supports multiple brokers per user
   ============================================================ */
CREATE TABLE broker_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FK to Supabase Auth user
  user_id uuid NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  -- Broker identifier (Trading.com, Forex.com, etc.)
  broker_name text NOT NULL,

  -- Broker account number / login
  broker_account_number text NOT NULL,

  -- Broker account password
  -- NOTE: Should be ENCRYPTED in production
  broker_account_password text NOT NULL,

  -- Allows disabling accounts without deletion (for paused services)
  is_active boolean NOT NULL DEFAULT true,

  -- Link to the service agreement this broker account belongs to
  service_agreement_id uuid
    REFERENCES service_agreements(id)
    ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE broker_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own broker accounts
CREATE POLICY "User can view own broker accounts"
ON broker_accounts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own broker accounts
CREATE POLICY "User can create own broker accounts"
ON broker_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own broker accounts
CREATE POLICY "User can update own broker accounts"
ON broker_accounts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own broker accounts
CREATE POLICY "User can delete own broker account"
ON broker_accounts
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all broker accounts
CREATE POLICY "Admins can view all broker accounts"
ON broker_accounts
FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Index for the foreign key
CREATE INDEX IF NOT EXISTS idx_broker_accounts_service_agreement
ON broker_accounts (service_agreement_id);


/* ============================================================
   HELPER FUNCTION: pause_service_agreement

   Sets status to 'paused' - can be reactivated later
   Also deactivates linked broker accounts
   ============================================================ */
CREATE OR REPLACE FUNCTION pause_service_agreement(
  p_agreement_id uuid,
  p_user_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the service agreement to paused
  UPDATE service_agreements
  SET
    status = 'paused',
    cancelled_at = now(),
    cancellation_reason = p_reason
  WHERE id = p_agreement_id
    AND user_id = p_user_id
    AND status = 'active';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Deactivate linked broker account(s) but keep the data
  UPDATE broker_accounts
  SET is_active = false
  WHERE service_agreement_id = p_agreement_id
    AND user_id = p_user_id;

  RETURN true;
END;
$$;


/* ============================================================
   HELPER FUNCTION: reactivate_service_agreement

   Sets status back to 'active' and reactivates broker account
   ============================================================ */
CREATE OR REPLACE FUNCTION reactivate_service_agreement(
  p_agreement_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the service agreement to active
  UPDATE service_agreements
  SET
    status = 'active',
    cancelled_at = NULL,
    cancellation_reason = NULL
  WHERE id = p_agreement_id
    AND user_id = p_user_id
    AND status = 'paused';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Reactivate linked broker account(s)
  UPDATE broker_accounts
  SET is_active = true
  WHERE service_agreement_id = p_agreement_id
    AND user_id = p_user_id;

  RETURN true;
END;
$$;


/* ============================================================
   HELPER FUNCTION: cancel_service_agreement

   Sets status to 'cancelled' (permanent) and deactivates broker
   ============================================================ */
CREATE OR REPLACE FUNCTION cancel_service_agreement(
  p_agreement_id uuid,
  p_user_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the service agreement
  UPDATE service_agreements
  SET
    status = 'cancelled',
    cancelled_at = now(),
    cancellation_reason = p_reason
  WHERE id = p_agreement_id
    AND user_id = p_user_id
    AND status = 'active';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Deactivate linked broker account(s)
  UPDATE broker_accounts
  SET is_active = false
  WHERE service_agreement_id = p_agreement_id
    AND user_id = p_user_id;

  RETURN true;
END;
$$;


/* ============================================================
   HELPER FUNCTION: remove_service_agreement

   Deletes both the agreement and broker account records
   Allows user to re-enroll fresh
   ============================================================ */
CREATE OR REPLACE FUNCTION remove_service_agreement(
  p_agreement_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete linked broker account(s) first
  DELETE FROM broker_accounts
  WHERE service_agreement_id = p_agreement_id
    AND user_id = p_user_id;

  -- Delete the service agreement
  DELETE FROM service_agreements
  WHERE id = p_agreement_id
    AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;


/* ============================================================
   TRIGGER: Update updated_at timestamp

   Automatically updates the updated_at column on record changes
   ============================================================ */
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to billing_customers
CREATE TRIGGER update_billing_customers_updated_at
  BEFORE UPDATE ON billing_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to broker_accounts
CREATE TRIGGER update_broker_accounts_updated_at
  BEFORE UPDATE ON broker_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


/* ============================================================
   SUCCESS!

   Your database schema has been created. Next steps:

   1. Set up Supabase Edge Functions for Stripe integration
   2. Add your STRIPE_SECRET_KEY to Supabase secrets:
      supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx

   3. Deploy the edge functions:
      - stripe-create-customer
      - stripe-get-invoices
      - stripe-create-checkout

   ============================================================ */

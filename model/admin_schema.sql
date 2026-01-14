-- ============================================================================
-- ADMIN PORTAL SCHEMA
-- ============================================================================
-- Run this in Supabase SQL Editor to set up production tables for the admin portal.
-- Prerequisites: Supabase project with Auth enabled
-- ============================================================================

-- ============================================================================
-- 1. AUDIT LOGS TABLE
-- ============================================================================
-- Tracks all sensitive operations for compliance and security.

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  actor_email TEXT NOT NULL,
  actor_role TEXT,
  target_id TEXT,
  target_description TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON audit_logs(target_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- No direct client inserts - must use Edge Function with service role
CREATE POLICY "No direct inserts from client"
  ON audit_logs FOR INSERT
  WITH CHECK (false);

-- No updates allowed - audit logs are immutable
CREATE POLICY "No updates allowed"
  ON audit_logs FOR UPDATE
  USING (false);

-- No deletes allowed - audit logs are immutable
CREATE POLICY "No deletes allowed"
  ON audit_logs FOR DELETE
  USING (false);

-- ============================================================================
-- 2. HELPER FUNCTION: Check if user is admin
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. HELPER FUNCTION: Check if user is admin or manager
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := auth.jwt() -> 'app_metadata' ->> 'role';
  RETURN user_role IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. HELPER FUNCTION: Get current user's role
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.jwt() -> 'app_metadata' ->> 'role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. AUDIT LOG INSERT FUNCTION (for Edge Functions)
-- ============================================================================
-- This function is called by Edge Functions using the service role key.
-- It bypasses RLS to insert audit log entries.

CREATE OR REPLACE FUNCTION insert_audit_log(
  p_action TEXT,
  p_actor_id UUID,
  p_actor_email TEXT,
  p_actor_role TEXT,
  p_target_id TEXT DEFAULT NULL,
  p_target_description TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT TRUE,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO audit_logs (
    action,
    actor_id,
    actor_email,
    actor_role,
    target_id,
    target_description,
    details,
    ip_address,
    user_agent,
    success,
    error_message
  ) VALUES (
    p_action,
    p_actor_id,
    p_actor_email,
    p_actor_role,
    p_target_id,
    p_target_description,
    p_details,
    p_ip_address,
    p_user_agent,
    p_success,
    p_error_message
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the setup:

-- Check table exists:
-- SELECT * FROM audit_logs LIMIT 1;

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'audit_logs';

-- Check policies:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'audit_logs';

-- Test helper functions (as authenticated user):
-- SELECT is_admin();
-- SELECT is_admin_or_manager();
-- SELECT get_user_role();

-- ============================================================================
-- 5.5 UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
-- This function automatically updates the updated_at column when a row is modified.
-- It may already exist from supabase_schema.sql, so we use CREATE OR REPLACE.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. VPS INSTANCES TABLE
-- ============================================================================
-- Tracks VPS instances that can be assigned to users.

CREATE TABLE IF NOT EXISTS vps_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- VPS Provider Information
  host_provider TEXT NOT NULL,              -- e.g., "Vultr", "DigitalOcean", "AWS"
  provider_vps_name TEXT NOT NULL,          -- Provider's name/ID for the VPS

  -- Network
  ip_address INET,
  port INTEGER CHECK (port IS NULL OR (port >= 1 AND port <= 65535)),
  region TEXT NOT NULL,

  -- Specifications
  operating_system TEXT NOT NULL,           -- e.g., "Windows Server 2022", "Ubuntu 22.04"
  vcpu INTEGER NOT NULL,
  vram_gb INTEGER NOT NULL,                 -- RAM in GB

  -- Status and Assignment
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('running', 'pending', 'disabled')),
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding VPS by user
CREATE INDEX IF NOT EXISTS idx_vps_instances_assigned_user ON vps_instances(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_vps_instances_status ON vps_instances(status);

-- Enable RLS
ALTER TABLE vps_instances ENABLE ROW LEVEL SECURITY;

-- Admins and managers can view all VPS
CREATE POLICY "Admins and managers can view all VPS"
  ON vps_instances FOR SELECT
  USING (is_admin_or_manager());

-- Admins and managers can insert VPS
CREATE POLICY "Admins and managers can insert VPS"
  ON vps_instances FOR INSERT
  WITH CHECK (is_admin_or_manager());

-- Admins and managers can update VPS
CREATE POLICY "Admins and managers can update VPS"
  ON vps_instances FOR UPDATE
  USING (is_admin_or_manager());

-- Admins and managers can delete VPS
CREATE POLICY "Admins and managers can delete VPS"
  ON vps_instances FOR DELETE
  USING (is_admin_or_manager());

-- Trigger to update updated_at
CREATE TRIGGER update_vps_instances_updated_at
  BEFORE UPDATE ON vps_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. ADDITIONAL RLS POLICIES FOR ADMIN ACCESS
-- ============================================================================
-- These policies allow admins and managers to view data across all users.

-- billing_customers: Allow admin/manager read access
CREATE POLICY "Admins and managers can view all billing customers"
  ON billing_customers FOR SELECT
  USING (is_admin_or_manager());

-- broker_accounts: Admin/manager read access (already exists in main schema,
-- but uses different role check - this ensures consistency)
-- Note: Only add if the existing policy doesn't exist or uses different logic

-- service_agreements: Admin/manager read access (already exists in main schema)
-- Note: Only add if the existing policy doesn't exist or uses different logic

-- ============================================================================
-- 8. VERIFICATION CODES TABLE
-- ============================================================================
-- Stores temporary verification codes for step-up authentication.

CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL,                    -- e.g., 'view_broker_password', 'edit_subscription'
  resource_id TEXT,                         -- Optional: specific resource being accessed
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms')),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_user ON verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);

-- Enable RLS
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- No direct client access - must use Edge Functions with service role
CREATE POLICY "No direct client access to verification codes"
  ON verification_codes FOR ALL
  USING (false);

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- 1. BOOTSTRAP ADMIN USER:
--    After running this schema, set app_metadata.role = 'admin' on your first
--    user via Supabase Dashboard > Authentication > Users.
--
-- 2. DEPLOY EDGE FUNCTIONS:
--    cd supabase
--    supabase functions deploy assign-role
--    supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
--
-- 3. AUDIT LOG ACTIONS:
--    - 'role_change': When admin changes a user's role
--    - 'sensitive_data_access': When viewing broker passwords or editing subscriptions
--    - 'subscription_modify': When subscription changes are made
--    - 'login': Admin portal login events
--    - 'logout': Admin portal logout events
--
-- 4. VPS STATUS VALUES:
--    - 'running': VPS is active and operational
--    - 'pending': VPS is being provisioned or waiting for setup
--    - 'disabled': VPS is disabled/stopped
--

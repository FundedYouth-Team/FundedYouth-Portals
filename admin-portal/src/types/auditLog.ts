/**
 * Audit Log Types
 *
 * Audit logs track sensitive operations in the admin portal:
 * - Role changes
 * - Sensitive data access (broker passwords)
 * - Service modifications (subscription changes)
 */

export type AuditAction =
  | "role_change"
  | "sensitive_data_access"
  | "subscription_modify"
  | "login"
  | "logout";

export interface AuditLogEntry {
  /** Unique log entry ID */
  id: string;
  /** Type of action performed */
  action: AuditAction;
  /** User ID who performed the action */
  actorId: string;
  /** Email of user who performed the action */
  actorEmail: string;
  /** Role of actor at time of action */
  actorRole: string;
  /** Target resource ID (user ID, broker ID, subscription ID, etc.) */
  targetId?: string;
  /** Human-readable description of the target */
  targetDescription?: string;
  /** Additional details about the action */
  details: Record<string, unknown>;
  /** IP address of the actor (if available) */
  ipAddress?: string;
  /** User agent string (if available) */
  userAgent?: string;
  /** Timestamp of the action */
  timestamp: string;
  /** Whether the action was successful */
  success: boolean;
  /** Error message if action failed */
  errorMessage?: string;
}

/**
 * Database schema for audit_logs table.
 * This should be created in Supabase.
 *
 * SQL:
 * ```sql
 * CREATE TABLE audit_logs (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   action TEXT NOT NULL,
 *   actor_id UUID NOT NULL REFERENCES auth.users(id),
 *   actor_email TEXT NOT NULL,
 *   actor_role TEXT,
 *   target_id TEXT,
 *   target_description TEXT,
 *   details JSONB DEFAULT '{}',
 *   ip_address INET,
 *   user_agent TEXT,
 *   timestamp TIMESTAMPTZ DEFAULT NOW(),
 *   success BOOLEAN DEFAULT TRUE,
 *   error_message TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- Index for efficient querying
 * CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
 * CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
 * CREATE INDEX idx_audit_logs_action ON audit_logs(action);
 *
 * -- RLS: Only admins can read audit logs
 * ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
 *
 * CREATE POLICY "Admins can read audit logs"
 *   ON audit_logs FOR SELECT
 *   USING (
 *     auth.jwt() ->> 'role' = 'admin'
 *   );
 *
 * -- No direct inserts from client - use Edge Function
 * CREATE POLICY "No direct inserts"
 *   ON audit_logs FOR INSERT
 *   WITH CHECK (false);
 * ```
 */
export interface AuditLogSchema {
  id: string;
  action: AuditAction;
  actor_id: string;
  actor_email: string;
  actor_role: string | null;
  target_id: string | null;
  target_description: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

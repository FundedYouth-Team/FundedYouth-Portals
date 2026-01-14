/**
 * Step-Up Authentication Types
 *
 * Step-up auth is required for sensitive operations:
 * - Viewing broker passwords
 * - Viewing broker API keys
 * - Modifying options subscriptions
 */

export type StepUpPurpose = "view_broker_password" | "view_broker_api_key" | "edit_subscription";

export interface StepUpSession {
  /** Unique session ID */
  id: string;
  /** Purpose of this step-up session */
  purpose: StepUpPurpose;
  /** Resource ID (e.g., broker account ID, subscription ID) */
  resourceId: string;
  /** When the session was verified */
  verifiedAt: number;
  /** When the session expires (timestamp) */
  expiresAt: number;
}

/** Audit metadata for sensitive data access logging */
export interface StepUpAuditMetadata {
  /** Customer ID whose data is being accessed */
  customerId: string;
  /** Customer email for audit trail */
  customerEmail: string;
}

export interface StepUpRequest {
  purpose: StepUpPurpose;
  resourceId: string;
  /** Human-readable description of what access is being requested */
  description: string;
  /** Optional audit metadata for logging sensitive data access */
  auditMetadata?: StepUpAuditMetadata;
}

export interface StepUpState {
  /** Currently active step-up sessions */
  sessions: StepUpSession[];
  /** Pending request awaiting verification */
  pendingRequest: StepUpRequest | null;
  /** Whether verification modal is open */
  isModalOpen: boolean;
  /** Error message from failed verification */
  error: string | null;
  /** Loading state during verification */
  isVerifying: boolean;
}

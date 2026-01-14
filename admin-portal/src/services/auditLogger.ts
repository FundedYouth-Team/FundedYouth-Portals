import { AuditLogEntry, AuditAction } from "types/auditLog";

/**
 * In-memory audit log storage for development.
 * In production, logs are stored in Supabase via Edge Function.
 */
const auditLogs: AuditLogEntry[] = [];

/**
 * Generate a unique ID for audit log entries.
 */
function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface LogParams {
  action: AuditAction;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  targetId?: string;
  targetDescription?: string;
  details?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Log an audit event.
 *
 * In production, this would call an Edge Function that:
 * 1. Verifies the caller's identity
 * 2. Adds server-side metadata (IP, timestamp)
 * 3. Inserts into the audit_logs table using service role
 */
export function logAuditEvent(params: LogParams): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: generateId(),
    action: params.action,
    actorId: params.actorId,
    actorEmail: params.actorEmail,
    actorRole: params.actorRole,
    targetId: params.targetId,
    targetDescription: params.targetDescription,
    details: params.details || {},
    timestamp: new Date().toISOString(),
    success: params.success ?? true,
    errorMessage: params.errorMessage,
    // These would be set server-side in production
    ipAddress: undefined,
    userAgent: navigator.userAgent,
  };

  // Store in memory for development
  auditLogs.unshift(entry);

  // Console log for visibility during development
  console.log("[AUDIT]", {
    action: entry.action,
    actor: entry.actorEmail,
    target: entry.targetDescription || entry.targetId,
    success: entry.success,
    timestamp: entry.timestamp,
  });

  // TODO: In production, call Edge Function to store in database
  // await supabase.functions.invoke('audit-log', { body: entry });

  return entry;
}

/**
 * Log a role change event.
 */
export function logRoleChange(params: {
  actorId: string;
  actorEmail: string;
  actorRole: string;
  targetUserId: string;
  targetEmail: string;
  previousRole: string | null;
  newRole: string | null;
  success?: boolean;
  errorMessage?: string;
}): AuditLogEntry {
  return logAuditEvent({
    action: "role_change",
    actorId: params.actorId,
    actorEmail: params.actorEmail,
    actorRole: params.actorRole,
    targetId: params.targetUserId,
    targetDescription: `User: ${params.targetEmail}`,
    details: {
      previousRole: params.previousRole,
      newRole: params.newRole,
    },
    success: params.success,
    errorMessage: params.errorMessage,
  });
}

/**
 * Log sensitive data access (e.g., viewing broker password).
 */
export function logSensitiveDataAccess(params: {
  actorId: string;
  actorEmail: string;
  actorRole: string;
  dataType: "broker_password" | "subscription_edit";
  resourceId: string;
  resourceDescription: string;
  customerId: string;
  customerEmail: string;
}): AuditLogEntry {
  return logAuditEvent({
    action: "sensitive_data_access",
    actorId: params.actorId,
    actorEmail: params.actorEmail,
    actorRole: params.actorRole,
    targetId: params.resourceId,
    targetDescription: params.resourceDescription,
    details: {
      dataType: params.dataType,
      customerId: params.customerId,
      customerEmail: params.customerEmail,
    },
  });
}

/**
 * Log subscription modification.
 */
export function logSubscriptionModify(params: {
  actorId: string;
  actorEmail: string;
  actorRole: string;
  subscriptionId: string;
  customerId: string;
  customerEmail: string;
  changes: Record<string, { from: unknown; to: unknown }>;
  success?: boolean;
  errorMessage?: string;
}): AuditLogEntry {
  return logAuditEvent({
    action: "subscription_modify",
    actorId: params.actorId,
    actorEmail: params.actorEmail,
    actorRole: params.actorRole,
    targetId: params.subscriptionId,
    targetDescription: `Subscription for ${params.customerEmail}`,
    details: {
      customerId: params.customerId,
      customerEmail: params.customerEmail,
      changes: params.changes,
    },
    success: params.success,
    errorMessage: params.errorMessage,
  });
}

/**
 * Log login event.
 */
export function logLogin(params: {
  userId: string;
  email: string;
  role: string | null;
  success: boolean;
  errorMessage?: string;
}): AuditLogEntry {
  return logAuditEvent({
    action: "login",
    actorId: params.userId,
    actorEmail: params.email,
    actorRole: params.role || "unknown",
    success: params.success,
    errorMessage: params.errorMessage,
  });
}

/**
 * Log logout event.
 */
export function logLogout(params: {
  userId: string;
  email: string;
  role: string;
}): AuditLogEntry {
  return logAuditEvent({
    action: "logout",
    actorId: params.userId,
    actorEmail: params.email,
    actorRole: params.role,
  });
}

/**
 * Get all audit logs (for admin viewing).
 * In production, this would fetch from Supabase with pagination.
 */
export function getAuditLogs(options?: {
  limit?: number;
  offset?: number;
  action?: AuditAction;
  actorId?: string;
  startDate?: string;
  endDate?: string;
}): { logs: AuditLogEntry[]; total: number } {
  let filtered = [...auditLogs];

  if (options?.action) {
    filtered = filtered.filter((log) => log.action === options.action);
  }

  if (options?.actorId) {
    filtered = filtered.filter((log) => log.actorId === options.actorId);
  }

  if (options?.startDate) {
    filtered = filtered.filter((log) => log.timestamp >= options.startDate!);
  }

  if (options?.endDate) {
    filtered = filtered.filter((log) => log.timestamp <= options.endDate!);
  }

  const total = filtered.length;
  const offset = options?.offset || 0;
  const limit = options?.limit || 50;

  return {
    logs: filtered.slice(offset, offset + limit),
    total,
  };
}


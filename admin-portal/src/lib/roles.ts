/**
 * Role definitions for the admin portal.
 * Roles are stored in auth.users.app_metadata.role (server-side only).
 * Client code can READ roles but NEVER WRITE to app_metadata.
 */

export type Role = "user" | "manager" | "admin";

export const ROLES = {
  USER: "user" as const,
  MANAGER: "manager" as const,
  ADMIN: "admin" as const,
};

/**
 * Check if a role string is a valid Role type.
 * Uses denial-by-default: unknown roles are rejected.
 */
export function isValidRole(role: unknown): role is Role {
  return role === ROLES.USER || role === ROLES.MANAGER || role === ROLES.ADMIN;
}

/**
 * Check if role has admin privileges.
 */
export function isAdmin(role: Role | null): boolean {
  return role === ROLES.ADMIN;
}

/**
 * Check if role has admin or manager privileges.
 */
export function isAdminOrManager(role: Role | null): boolean {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
}

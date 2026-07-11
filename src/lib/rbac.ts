/**
 * Role-Based Access Control — shared types and helpers.
 *
 * This module intentionally avoids server-only imports (next/headers, etc.)
 * so it can be safely imported from Client Components and Server Components
 * alike.
 */

export type UserRole = "admin" | "teacher" | "paid-student" | "unpaid-student";

/** Returns `true` when the role has content-management permissions. */
export function isAdminOrTeacher(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "teacher";
}

/** Returns `true` if the user can access gated student content. */
export function canAccessStudentContent(role: UserRole | null | undefined): boolean {
  return role === "paid-student";
}

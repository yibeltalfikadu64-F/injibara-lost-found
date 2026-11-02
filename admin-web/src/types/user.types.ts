/**
 * Injibara Campus Lost & Found
 * Shared User Types
 *
 * This file contains reusable user-related types for:
 * - Admin dashboard
 * - User management
 * - Authentication
 * - User filtering and searching
 * - User creation and updates
 * - API responses
 */

/* =========================================================
   1. USER ENUMS AND BASIC TYPES
========================================================= */

export type UserRole = "STUDENT" | "STAFF" | "SECURITY" | "ADMIN";

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "PENDING"
  | "BLOCKED";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export type AccountVerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

export type UserSortField =
  | "firstName"
  | "lastName"
  | "email"
  | "createdAt"
  | "updatedAt"
  | "role"
  | "status";

export type SortOrder = "asc" | "desc";

/* =========================================================
   2. USER PROFILE
========================================================= */

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  profileImage?: string | null;
  bio?: string | null;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  studentId: string;
  department?: string | null;
  faculty?: string | null;
  program?: string | null;
  yearOfStudy?: number | null;
  academicLevel?: string | null;
  section?: string | null;
}

export interface StaffProfile {
  employeeId?: string | null;
  department?: string | null;
  position?: string | null;
  office?: string | null;
}

export interface SecurityProfile {
  employeeId?: string | null;
  assignedLocation?: string | null;
  shift?: string | null;
}

/* =========================================================
   3. COMPLETE USER MODEL
========================================================= */

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  profileImage?: string | null;
  role: UserRole;
  status: UserStatus;
  verificationStatus?: AccountVerificationStatus;
  studentId?: string | null;
  employeeId?: string | null;
  department?: string | null;
  faculty?: string | null;
  program?: string | null;
  yearOfStudy?: number | null;
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface UserDetails extends User {
  bio?: string | null;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  address?: string | null;
  studentProfile?: StudentProfile | null;
  staffProfile?: StaffProfile | null;
  securityProfile?: SecurityProfile | null;
  totalReportedItems?: number;
  totalClaims?: number;
  totalSuccessfulRecoveries?: number;
}

/* =========================================================
   4. USER CREATION AND UPDATE
========================================================= */

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
  studentId?: string;
  employeeId?: string;
  department?: string;
  faculty?: string;
  program?: string;
  yearOfStudy?: number;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string | null;
  profileImage?: string | null;
  role?: UserRole;
  status?: UserStatus;
  studentId?: string | null;
  employeeId?: string | null;
  department?: string | null;
  faculty?: string | null;
  program?: string | null;
  yearOfStudy?: number | null;
}

export interface UpdateUserProfileInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  profileImage?: string | null;
  bio?: string | null;
}

export interface ChangeUserRoleInput {
  role: UserRole;
  reason?: string;
}

export interface ChangeUserStatusInput {
  status: UserStatus;
  reason?: string;
}

export interface ResetUserPasswordInput {
  newPassword: string;
  confirmPassword: string;
}

/* =========================================================
   5. USER SEARCH AND FILTERS
========================================================= */

export interface UserFilters {
  search?: string;
  role?: UserRole | "ALL";
  status?: UserStatus | "ALL";
  department?: string;
  faculty?: string;
  verificationStatus?: AccountVerificationStatus;
  isEmailVerified?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UserSortOptions {
  sortBy?: UserSortField;
  sortOrder?: SortOrder;
}

export interface UserQueryOptions extends UserFilters, UserSortOptions {
  page?: number;
  limit?: number;
}

export interface UserSearchResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* =========================================================
   6. PAGINATION
========================================================= */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedUsersResponse {
  data: User[];
  pagination: PaginationMeta;
}

/* =========================================================
   7. USER STATISTICS
========================================================= */

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  students: number;
  staff: number;
  security: number;
  administrators: number;
}

export interface UserRegistrationTrend {
  label: string;
  count: number;
  date?: string;
}

export interface UserRoleDistribution {
  role: UserRole;
  count: number;
  percentage?: number;
}

/* =========================================================
   8. USER ACTIVITY
========================================================= */

export type UserActivityType =
  | "LOGIN"
  | "LOGOUT"
  | "PROFILE_UPDATE"
  | "PASSWORD_CHANGE"
  | "ITEM_REPORTED"
  | "CLAIM_SUBMITTED"
  | "ACCOUNT_CREATED"
  | "ACCOUNT_SUSPENDED"
  | "ROLE_CHANGED";

export interface UserActivity {
  id: string;
  userId: string;
  type: UserActivityType;
  description: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

/* =========================================================
   9. USER API RESPONSES
========================================================= */

export interface UserApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface UserListApiResponse extends UserApiResponse<User[]> {
  pagination?: PaginationMeta;
}

export interface UserDetailsApiResponse extends UserApiResponse<UserDetails> {}

export interface UserStatisticsApiResponse extends UserApiResponse<UserStatistics> {}

/* =========================================================
   10. USER MANAGEMENT ACTIONS
========================================================= */

export interface UserManagementAction {
  userId: string;
  action:
    | "ACTIVATE"
    | "DEACTIVATE"
    | "SUSPEND"
    | "UNSUSPEND"
    | "VERIFY"
    | "DELETE";
  reason?: string;
}

export interface BulkUserAction {
  userIds: string[];
  action: UserManagementAction["action"];
  reason?: string;
}

export interface BulkUserActionResult {
  successful: number;
  failed: number;
  errors?: Array<{
    userId: string;
    message: string;
  }>;
}

/* =========================================================
   11. USER HELPERS
========================================================= */

export const USER_ROLES: UserRole[] = ["STUDENT", "STAFF", "SECURITY", "ADMIN"];

export const USER_STATUSES: UserStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "PENDING",
  "BLOCKED",
];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Student",
  STAFF: "Staff",
  SECURITY: "Security",
  ADMIN: "Administrator",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
  PENDING: "Pending",
  BLOCKED: "Blocked",
};

export function getUserFullName(
  user: Pick<User, "firstName" | "lastName">,
): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getUserInitials(
  user: Pick<User, "firstName" | "lastName">,
): string {
  const first = user.firstName?.trim().charAt(0) ?? "";
  const last = user.lastName?.trim().charAt(0) ?? "";

  return `${first}${last}`.toUpperCase();
}

export function isActiveUser(user: Pick<User, "status">): boolean {
  return user.status === "ACTIVE";
}

export function isAdministrator(user: Pick<User, "role">): boolean {
  return user.role === "ADMIN";
}

export function hasUserRole(user: Pick<User, "role">, role: UserRole): boolean {
  return user.role === role;
}

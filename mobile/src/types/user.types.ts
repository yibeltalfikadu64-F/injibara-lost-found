// mobile/src/types/user.types.ts

// ============================================================
// USER ENUMS
// ============================================================

export enum UserRole {
  STUDENT = "STUDENT",
  STAFF = "STAFF",
  SECURITY = "SECURITY",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
  DELETED = "DELETED",
}

export enum UserGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

// ============================================================
// USER PROFILE
// ============================================================

export interface UserProfile {
  id: string;

  firstName: string;

  lastName: string;

  middleName?: string | null;

  displayName?: string | null;

  avatarUrl?: string | null;

  phoneNumber?: string | null;

  gender?: UserGender | null;

  dateOfBirth?: string | null;

  bio?: string | null;

  department?: string | null;

  faculty?: string | null;

  program?: string | null;

  yearOfStudy?: number | null;

  studentId?: string | null;

  employeeId?: string | null;

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// USER ENTITY
// ============================================================

export interface User {
  id: string;

  email: string;

  username?: string | null;

  firstName: string;

  lastName: string;

  fullName?: string;

  role: UserRole;

  status?: UserStatus;

  phoneNumber?: string | null;

  avatarUrl?: string | null;

  department?: string | null;

  faculty?: string | null;

  program?: string | null;

  studentId?: string | null;

  employeeId?: string | null;

  yearOfStudy?: number | null;

  isEmailVerified: boolean;

  isPhoneVerified?: boolean;

  isActive?: boolean;

  lastLoginAt?: string | null;

  createdAt: string;

  updatedAt: string;

  profile?: UserProfile | null;
}

// ============================================================
// AUTHENTICATED USER
// ============================================================

export interface AuthenticatedUser extends User {
  permissions?: string[];

  accessTokenExpiresAt?: string;
}

// ============================================================
// USER SUMMARY
// ============================================================

export interface UserSummary {
  id: string;

  fullName: string;

  email?: string;

  role: UserRole;

  avatarUrl?: string | null;

  department?: string | null;
}

// ============================================================
// USER PUBLIC PROFILE
// ============================================================

export interface PublicUserProfile {
  id: string;

  firstName: string;

  lastName: string;

  fullName?: string;

  avatarUrl?: string | null;

  role: UserRole;

  department?: string | null;

  faculty?: string | null;
}

// ============================================================
// USER SETTINGS
// ============================================================

export interface UserSettings {
  language: "en" | "am" | "om" | "awn";

  theme: "light" | "dark" | "system";

  notificationsEnabled: boolean;

  emailNotificationsEnabled: boolean;

  pushNotificationsEnabled: boolean;

  biometricLoginEnabled: boolean;

  soundEnabled: boolean;

  vibrationEnabled: boolean;

  showProfilePublicly: boolean;
}

// ============================================================
// USER NOTIFICATION PREFERENCES
// ============================================================

export interface UserNotificationPreferences {
  enabled: boolean;

  itemUpdates: boolean;

  claimUpdates: boolean;

  claimMessages: boolean;

  announcements: boolean;

  securityAlerts: boolean;

  emailNotifications: boolean;

  pushNotifications: boolean;
}

// ============================================================
// USER UPDATE REQUEST
// ============================================================

export interface UpdateUserRequest {
  firstName?: string;

  lastName?: string;

  username?: string | null;

  phoneNumber?: string | null;

  avatarUrl?: string | null;

  department?: string | null;

  faculty?: string | null;

  program?: string | null;

  yearOfStudy?: number | null;

  bio?: string | null;
}

// ============================================================
// UPDATE USER PROFILE REQUEST
// ============================================================

export interface UpdateUserProfileRequest {
  firstName?: string;

  lastName?: string;

  middleName?: string | null;

  phoneNumber?: string | null;

  gender?: UserGender | null;

  dateOfBirth?: string | null;

  bio?: string | null;

  department?: string | null;

  faculty?: string | null;

  program?: string | null;

  yearOfStudy?: number | null;
}

// ============================================================
// USER SETTINGS UPDATE
// ============================================================

export interface UpdateUserSettingsRequest {
  language?: UserSettings["language"];

  theme?: UserSettings["theme"];

  notificationsEnabled?: boolean;

  emailNotificationsEnabled?: boolean;

  pushNotificationsEnabled?: boolean;

  biometricLoginEnabled?: boolean;

  soundEnabled?: boolean;

  vibrationEnabled?: boolean;

  showProfilePublicly?: boolean;
}

// ============================================================
// USER NOTIFICATION PREFERENCES UPDATE
// ============================================================

export interface UpdateNotificationPreferencesRequest {
  enabled?: boolean;

  itemUpdates?: boolean;

  claimUpdates?: boolean;

  claimMessages?: boolean;

  announcements?: boolean;

  securityAlerts?: boolean;

  emailNotifications?: boolean;

  pushNotifications?: boolean;
}

// ============================================================
// CHANGE PASSWORD REQUEST
// ============================================================

export interface ChangePasswordRequest {
  currentPassword: string;

  newPassword: string;

  confirmPassword: string;
}

// ============================================================
// USER SEARCH FILTERS
// ============================================================

export interface UserSearchFilters {
  search?: string;

  role?: UserRole;

  status?: UserStatus;

  department?: string;

  faculty?: string;

  program?: string;

  isEmailVerified?: boolean;

  page?: number;

  limit?: number;

  sortBy?: "createdAt" | "firstName" | "lastName" | "email";

  sortOrder?: "asc" | "desc";
}

// ============================================================
// USER STATISTICS
// ============================================================

export interface UserStatistics {
  totalUsers: number;

  totalStudents: number;

  totalStaff: number;

  totalSecurity: number;

  totalAdmins: number;

  activeUsers: number;

  inactiveUsers: number;

  suspendedUsers: number;

  verifiedUsers: number;

  unverifiedUsers: number;
}

// ============================================================
// USER ADMIN ACTION
// ============================================================

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

export interface UserAdminActionResponse {
  success: boolean;

  message: string;

  user: User;
}

// ============================================================
// USER REGISTRATION DETAILS
// ============================================================

export interface StudentDetails {
  studentId: string;

  department: string;

  faculty?: string;

  program?: string;

  yearOfStudy: number;
}

export interface StaffDetails {
  employeeId: string;

  department: string;

  faculty?: string;

  position?: string;
}

// ============================================================
// USER DEVICE INFORMATION
// ============================================================

export interface UserDevice {
  id: string;

  userId: string;

  deviceName?: string;

  deviceType?: "ANDROID" | "IOS" | "WEB" | "OTHER";

  deviceToken?: string | null;

  lastActiveAt?: string;

  createdAt: string;
}

// ============================================================
// USER ACTIVITY
// ============================================================

export interface UserActivity {
  id: string;

  userId: string;

  action: string;

  description?: string;

  ipAddress?: string;

  userAgent?: string;

  createdAt: string;
}

// ============================================================
// ROLE HELPERS
// ============================================================

export function isAdminRole(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

export function isSecurityRole(role: UserRole): boolean {
  return role === UserRole.SECURITY;
}

export function isStaffRole(role: UserRole): boolean {
  return role === UserRole.STAFF;
}

export function isStudentRole(role: UserRole): boolean {
  return role === UserRole.STUDENT;
}

export function hasAdministrativeAccess(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.SECURITY;
}

// ============================================================
// USER NAME HELPERS
// ============================================================

export function getUserFullName(
  user: Pick<User, "firstName" | "lastName">,
): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getUserInitials(
  user: Pick<User, "firstName" | "lastName">,
): string {
  const first = user.firstName.trim().charAt(0);

  const last = user.lastName.trim().charAt(0);

  return `${first}${last}`.toUpperCase();
}

// ============================================================
// TYPE GUARDS
// ============================================================

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    Object.values(UserRole).includes(value as UserRole)
  );
}

export function isUserStatus(value: unknown): value is UserStatus {
  return (
    typeof value === "string" &&
    Object.values(UserStatus).includes(value as UserStatus)
  );
}

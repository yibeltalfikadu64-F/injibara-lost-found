// mobile/src/types/notification.types.ts

import type { UserSummary } from "./user.types";

import type { ItemSummary } from "./item.types";

import type { ClaimSummary } from "./claim.types";

// ============================================================
// NOTIFICATION ENUMS
// ============================================================

export enum NotificationType {
  ITEM_CREATED = "ITEM_CREATED",
  ITEM_APPROVED = "ITEM_APPROVED",
  ITEM_REJECTED = "ITEM_REJECTED",
  ITEM_UPDATED = "ITEM_UPDATED",
  ITEM_MATCHED = "ITEM_MATCHED",

  CLAIM_CREATED = "CLAIM_CREATED",
  CLAIM_SUBMITTED = "CLAIM_SUBMITTED",
  CLAIM_UPDATED = "CLAIM_UPDATED",
  CLAIM_APPROVED = "CLAIM_APPROVED",
  CLAIM_REJECTED = "CLAIM_REJECTED",
  CLAIM_COMPLETED = "CLAIM_COMPLETED",

  HANDOVER_PENDING = "HANDOVER_PENDING",
  HANDOVER_VERIFIED = "HANDOVER_VERIFIED",
  HANDOVER_COMPLETED = "HANDOVER_COMPLETED",

  ANNOUNCEMENT = "ANNOUNCEMENT",

  SECURITY_ALERT = "SECURITY_ALERT",

  SYSTEM = "SYSTEM",
}

export enum NotificationPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum NotificationChannel {
  IN_APP = "IN_APP",
  PUSH = "PUSH",
  EMAIL = "EMAIL",
}

export enum NotificationStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ",
  FAILED = "FAILED",
}

// ============================================================
// NOTIFICATION ACTION
// ============================================================

export interface NotificationAction {
  label: string;

  action:
    | "OPEN_ITEM"
    | "OPEN_CLAIM"
    | "OPEN_REPORT"
    | "OPEN_ANNOUNCEMENT"
    | "OPEN_SETTINGS"
    | "OPEN_PROFILE"
    | "CUSTOM";

  route?: string;

  params?: Record<string, string | number | boolean>;

  url?: string;
}

// ============================================================
// NOTIFICATION DATA
// ============================================================

export interface NotificationData {
  itemId?: string;

  claimId?: string;

  reportId?: string;

  announcementId?: string;

  userId?: string;

  route?: string;

  params?: Record<string, unknown>;

  [key: string]: unknown;
}

// ============================================================
// MAIN NOTIFICATION ENTITY
// ============================================================

export interface AppNotification {
  id: string;

  userId: string;

  type: NotificationType;

  title: string;

  message: string;

  body?: string;

  priority?: NotificationPriority;

  channel?: NotificationChannel;

  status?: NotificationStatus;

  isRead: boolean;

  readAt?: string | null;

  data?: NotificationData | null;

  actions?: NotificationAction[];

  imageUrl?: string | null;

  senderId?: string | null;

  sender?: UserSummary | null;

  itemId?: string | null;

  item?: ItemSummary | null;

  claimId?: string | null;

  claim?: ClaimSummary | null;

  expiresAt?: string | null;

  createdAt: string;

  updatedAt?: string;
}

// ============================================================
// NOTIFICATION SUMMARY
// ============================================================

export interface NotificationSummary {
  id: string;

  type: NotificationType;

  title: string;

  message: string;

  isRead: boolean;

  createdAt: string;
}

// ============================================================
// NOTIFICATION LIST RESPONSE
// ============================================================

export interface NotificationListResponse {
  success: boolean;

  message?: string;

  notifications: AppNotification[];

  pagination: NotificationPagination;

  unreadCount?: number;
}

// ============================================================
// NOTIFICATION PAGINATION
// ============================================================

export interface NotificationPagination {
  page: number;

  limit: number;

  total: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;
}

// ============================================================
// NOTIFICATION FILTERS
// ============================================================

export interface NotificationFilters {
  type?: NotificationType;

  priority?: NotificationPriority;

  channel?: NotificationChannel;

  status?: NotificationStatus;

  isRead?: boolean;

  fromDate?: string;

  toDate?: string;

  page?: number;

  limit?: number;

  sortBy?: "createdAt" | "updatedAt";

  sortOrder?: "asc" | "desc";
}

// ============================================================
// MARK NOTIFICATION READ REQUEST
// ============================================================

export interface MarkNotificationReadRequest {
  notificationId: string;
}

// ============================================================
// MARK NOTIFICATION READ RESPONSE
// ============================================================

export interface MarkNotificationReadResponse {
  success: boolean;

  message: string;

  notification?: AppNotification;
}

// ============================================================
// MARK ALL NOTIFICATIONS READ REQUEST
// ============================================================

export interface MarkAllNotificationsReadRequest {
  type?: NotificationType;
}

// ============================================================
// MARK ALL NOTIFICATIONS READ RESPONSE
// ============================================================

export interface MarkAllNotificationsReadResponse {
  success: boolean;

  message: string;

  updatedCount: number;

  unreadCount: number;
}

// ============================================================
// DELETE NOTIFICATION REQUEST
// ============================================================

export interface DeleteNotificationRequest {
  notificationId: string;
}

// ============================================================
// DELETE NOTIFICATION RESPONSE
// ============================================================

export interface DeleteNotificationResponse {
  success: boolean;

  message: string;
}

// ============================================================
// CLEAR ALL NOTIFICATIONS RESPONSE
// ============================================================

export interface ClearNotificationsResponse {
  success: boolean;

  message: string;

  deletedCount: number;
}

// ============================================================
// UNREAD COUNT RESPONSE
// ============================================================

export interface UnreadNotificationCountResponse {
  success: boolean;

  unreadCount: number;
}

// ============================================================
// NOTIFICATION PREFERENCES
// ============================================================

export interface NotificationPreferences {
  enabled: boolean;

  inAppEnabled: boolean;

  pushEnabled: boolean;

  emailEnabled: boolean;

  itemUpdates: boolean;

  newItemMatches: boolean;

  claimUpdates: boolean;

  claimMessages: boolean;

  handoverUpdates: boolean;

  announcements: boolean;

  securityAlerts: boolean;

  systemUpdates: boolean;

  soundEnabled: boolean;

  vibrationEnabled: boolean;
}

// ============================================================
// DEFAULT NOTIFICATION PREFERENCES
// ============================================================

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,

  inAppEnabled: true,

  pushEnabled: true,

  emailEnabled: false,

  itemUpdates: true,

  newItemMatches: true,

  claimUpdates: true,

  claimMessages: true,

  handoverUpdates: true,

  announcements: true,

  securityAlerts: true,

  systemUpdates: true,

  soundEnabled: true,

  vibrationEnabled: true,
};

// ============================================================
// UPDATE NOTIFICATION PREFERENCES REQUEST
// ============================================================

export interface UpdateNotificationPreferencesRequest {
  enabled?: boolean;

  inAppEnabled?: boolean;

  pushEnabled?: boolean;

  emailEnabled?: boolean;

  itemUpdates?: boolean;

  newItemMatches?: boolean;

  claimUpdates?: boolean;

  claimMessages?: boolean;

  handoverUpdates?: boolean;

  announcements?: boolean;

  securityAlerts?: boolean;

  systemUpdates?: boolean;

  soundEnabled?: boolean;

  vibrationEnabled?: boolean;
}

// ============================================================
// NOTIFICATION SETTINGS RESPONSE
// ============================================================

export interface NotificationPreferencesResponse {
  success: boolean;

  preferences: NotificationPreferences;
}

// ============================================================
// PUSH NOTIFICATION TOKEN
// ============================================================

export interface PushNotificationToken {
  id?: string;

  userId?: string;

  token: string;

  platform: "ANDROID" | "IOS" | "WEB" | "OTHER";

  deviceName?: string;

  deviceId?: string;

  isActive?: boolean;

  createdAt?: string;

  updatedAt?: string;
}

// ============================================================
// REGISTER PUSH TOKEN REQUEST
// ============================================================

export interface RegisterPushTokenRequest {
  token: string;

  platform: "ANDROID" | "IOS" | "WEB" | "OTHER";

  deviceName?: string;

  deviceId?: string;
}

// ============================================================
// REGISTER PUSH TOKEN RESPONSE
// ============================================================

export interface RegisterPushTokenResponse {
  success: boolean;

  message: string;

  token?: PushNotificationToken;
}

// ============================================================
// REMOVE PUSH TOKEN REQUEST
// ============================================================

export interface RemovePushTokenRequest {
  token: string;
}

// ============================================================
// PUSH NOTIFICATION PAYLOAD
// ============================================================

export interface PushNotificationPayload {
  title: string;

  body: string;

  sound?: string | null;

  badge?: number;

  data?: NotificationData;

  priority?: NotificationPriority;

  channelId?: string;
}

// ============================================================
// RECEIVED PUSH NOTIFICATION
// ============================================================

export interface ReceivedPushNotification {
  requestIdentifier: string;

  title?: string;

  body?: string;

  data?: NotificationData;

  receivedAt: string;
}

// ============================================================
// NOTIFICATION RESPONSE
// ============================================================

export interface NotificationInteraction {
  notificationId: string;

  actionIdentifier: string;

  data?: NotificationData;

  interactedAt: string;
}

// ============================================================
// NOTIFICATION GROUP
// ============================================================

export interface NotificationGroup {
  date: string;

  label: string;

  notifications: AppNotification[];

  unreadCount: number;
}

// ============================================================
// NOTIFICATION STATISTICS
// ============================================================

export interface NotificationStatistics {
  totalNotifications: number;

  unreadNotifications: number;

  readNotifications: number;

  itemNotifications: number;

  claimNotifications: number;

  announcementNotifications: number;

  securityNotifications: number;
}

// ============================================================
// NOTIFICATION VALIDATION ERRORS
// ============================================================

export interface NotificationValidationErrors {
  title?: string;

  message?: string;

  type?: string;

  userId?: string;
}

// ============================================================
// NOTIFICATION DISPLAY CONFIGURATION
// ============================================================

export interface NotificationDisplayConfig {
  title: string;

  icon: string;

  color: string;

  backgroundColor: string;
}

// ============================================================
// NOTIFICATION DISPLAY HELPER
// ============================================================

export function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    [NotificationType.ITEM_CREATED]: "New Item",

    [NotificationType.ITEM_APPROVED]: "Item Approved",

    [NotificationType.ITEM_REJECTED]: "Item Rejected",

    [NotificationType.ITEM_UPDATED]: "Item Updated",

    [NotificationType.ITEM_MATCHED]: "Matching Item Found",

    [NotificationType.CLAIM_CREATED]: "New Claim",

    [NotificationType.CLAIM_SUBMITTED]: "Claim Submitted",

    [NotificationType.CLAIM_UPDATED]: "Claim Updated",

    [NotificationType.CLAIM_APPROVED]: "Claim Approved",

    [NotificationType.CLAIM_REJECTED]: "Claim Rejected",

    [NotificationType.CLAIM_COMPLETED]: "Claim Completed",

    [NotificationType.HANDOVER_PENDING]: "Handover Pending",

    [NotificationType.HANDOVER_VERIFIED]: "Handover Verified",

    [NotificationType.HANDOVER_COMPLETED]: "Handover Completed",

    [NotificationType.ANNOUNCEMENT]: "Announcement",

    [NotificationType.SECURITY_ALERT]: "Security Alert",

    [NotificationType.SYSTEM]: "System Notification",
  };

  return labels[type];
}

// ============================================================
// NOTIFICATION PRIORITY HELPER
// ============================================================

export function isUrgentNotification(
  notification: Pick<AppNotification, "priority">,
): boolean {
  return notification.priority === NotificationPriority.URGENT;
}

// ============================================================
// NOTIFICATION READ HELPER
// ============================================================

export function isUnreadNotification(
  notification: Pick<AppNotification, "isRead">,
): boolean {
  return !notification.isRead;
}

// ============================================================
// NOTIFICATION EXPIRATION HELPER
// ============================================================

export function isNotificationExpired(
  notification: Pick<AppNotification, "expiresAt">,
): boolean {
  if (!notification.expiresAt) {
    return false;
  }

  return new Date(notification.expiresAt).getTime() < Date.now();
}

// ============================================================
// NOTIFICATION DATE GROUP HELPER
// ============================================================

export function getNotificationDateGroup(
  date: string,
): "TODAY" | "YESTERDAY" | "EARLIER" {
  const notificationDate = new Date(date);

  const today = new Date();

  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  const sameDay = (first: Date, second: Date) =>
    first.getDate() === second.getDate() &&
    first.getMonth() === second.getMonth() &&
    first.getFullYear() === second.getFullYear();

  if (sameDay(notificationDate, today)) {
    return "TODAY";
  }

  if (sameDay(notificationDate, yesterday)) {
    return "YESTERDAY";
  }

  return "EARLIER";
}

// ============================================================
// NOTIFICATION TYPE GUARD
// ============================================================

export function isNotificationType(value: unknown): value is NotificationType {
  return (
    typeof value === "string" &&
    Object.values(NotificationType).includes(value as NotificationType)
  );
}

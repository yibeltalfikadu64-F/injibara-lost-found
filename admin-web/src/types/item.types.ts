/**
 * Injibara Campus Lost & Found
 * Shared Item Types
 *
 * Used by:
 * - Item management
 * - Lost item reporting
 * - Found item reporting
 * - Item approval
 * - Item search and filtering
 * - Dashboard statistics
 */

/* =========================================================
   1. ITEM ENUMS
========================================================= */

export type ItemType = "LOST" | "FOUND";

export type ItemStatus = "OPEN" | "CLAIMED" | "RESOLVED" | "ARCHIVED";

export type ItemApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ItemCondition =
  | "NEW"
  | "LIKE_NEW"
  | "GOOD"
  | "FAIR"
  | "POOR"
  | "UNKNOWN";

export type ItemSortField =
  | "title"
  | "dateReported"
  | "createdAt"
  | "updatedAt"
  | "status"
  | "type";

export type ItemSortOrder = "asc" | "desc";

/* =========================================================
   2. CATEGORY
========================================================= */

export interface ItemCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
}

export interface UpdateItemCategoryInput {
  name?: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
}

/* =========================================================
   3. CAMPUS LOCATION
========================================================= */

export interface ItemLocation {
  id: string;
  name: string;
  description?: string | null;
  building?: string | null;
  floor?: string | null;
  room?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemLocationInput {
  name: string;
  description?: string;
  building?: string;
  floor?: string;
  room?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateItemLocationInput {
  name?: string;
  description?: string | null;
  building?: string | null;
  floor?: string | null;
  room?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
}

/* =========================================================
   4. ITEM IMAGES
========================================================= */

export interface ItemImage {
  id?: string;
  url: string;
  thumbnailUrl?: string | null;
  fileName?: string;
  mimeType?: string;
  size?: number;
  uploadedAt?: string;
}

export interface ItemImageUpload {
  file: File;
  previewUrl?: string;
}

export interface ItemAttachment {
  id: string;
  itemId: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

/* =========================================================
   5. REPORTER
========================================================= */

export interface ItemReporter {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string | null;
  role?: string;
}

export interface ItemReporterSummary {
  id: string;
  name: string;
  email?: string;
}

/* =========================================================
   6. ITEM MODEL
========================================================= */

export interface Item {
  id: string;
  title: string;
  description: string;
  type: ItemType;
  status: ItemStatus;

  categoryId: string;
  category?: ItemCategory;

  locationId: string;
  location?: ItemLocation;

  reporterId: string;
  reporter?: ItemReporter;

  imageUrls: string[];
  images?: ItemImage[];

  dateReported: string;
  dateLost?: string | null;
  dateFound?: string | null;

  timeLost?: string | null;
  timeFound?: string | null;

  brand?: string | null;
  color?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  distinguishingFeatures?: string | null;
  condition?: ItemCondition | null;

  approvalStatus: ItemApprovalStatus;
  isApproved: boolean;
  approvedById?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;

  views?: number;
  totalClaims?: number;

  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
}

export interface ItemDetails extends Item {
  reporter: ItemReporter;
  category: ItemCategory;
  location: ItemLocation;
  images?: ItemImage[];
  recentClaims?: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
}

/* =========================================================
   7. CREATE AND UPDATE ITEM
========================================================= */

export interface CreateItemInput {
  title: string;
  description: string;
  type: ItemType;
  categoryId: string;
  locationId: string;
  dateLost?: string;
  dateFound?: string;
  timeLost?: string;
  timeFound?: string;
  brand?: string;
  color?: string;
  model?: string;
  serialNumber?: string;
  distinguishingFeatures?: string;
  condition?: ItemCondition;
  imageUrls?: string[];
}

export interface UpdateItemInput {
  title?: string;
  description?: string;
  type?: ItemType;
  status?: ItemStatus;
  categoryId?: string;
  locationId?: string;
  dateLost?: string | null;
  dateFound?: string | null;
  timeLost?: string | null;
  timeFound?: string | null;
  brand?: string | null;
  color?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  distinguishingFeatures?: string | null;
  condition?: ItemCondition | null;
  imageUrls?: string[];
}

export interface UpdateItemStatusInput {
  status: ItemStatus;
  reason?: string;
}

export interface ApproveItemInput {
  reason?: string;
}

export interface RejectItemInput {
  reason: string;
}

/* =========================================================
   8. ITEM SEARCH AND FILTERS
========================================================= */

export interface ItemFilters {
  search?: string;
  type?: ItemType | "ALL";
  status?: ItemStatus | "ALL";
  approvalStatus?: ItemApprovalStatus | "ALL";
  categoryId?: string;
  locationId?: string;
  reporterId?: string;
  color?: string;
  brand?: string;
  startDate?: string;
  endDate?: string;
  isApproved?: boolean;
}

export interface ItemSortOptions {
  sortBy?: ItemSortField;
  sortOrder?: ItemSortOrder;
}

export interface ItemQueryOptions extends ItemFilters, ItemSortOptions {
  page?: number;
  limit?: number;
}

export interface ItemSearchResult {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* =========================================================
   9. ITEM STATISTICS
========================================================= */

export interface ItemStatistics {
  totalItems: number;
  totalLostItems: number;
  totalFoundItems: number;
  openItems: number;
  claimedItems: number;
  resolvedItems: number;
  archivedItems: number;
  pendingApproval: number;
  approvedItems: number;
  rejectedItems: number;
  recoveredItems: number;
}

export interface ItemTypeDistribution {
  type: ItemType;
  count: number;
  percentage?: number;
}

export interface ItemStatusDistribution {
  status: ItemStatus;
  count: number;
  percentage?: number;
}

export interface ItemCategoryDistribution {
  categoryId: string;
  categoryName: string;
  count: number;
}

export interface ItemTrend {
  label: string;
  lost: number;
  found: number;
  date?: string;
}

/* =========================================================
   10. ITEM MODERATION
========================================================= */

export interface ItemModerationAction {
  itemId: string;
  action: "APPROVE" | "REJECT" | "ARCHIVE" | "RESTORE";
  reason?: string;
}

export interface BulkItemModerationInput {
  itemIds: string[];
  action: "APPROVE" | "REJECT" | "ARCHIVE" | "RESTORE";
  reason?: string;
}

export interface BulkItemModerationResult {
  successful: number;
  failed: number;
  errors?: Array<{
    itemId: string;
    message: string;
  }>;
}

/* =========================================================
   11. PAGINATION AND API RESPONSES
========================================================= */

export interface ItemPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ItemApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface ItemListApiResponse extends ItemApiResponse<Item[]> {
  pagination?: ItemPagination;
}

export interface ItemDetailsApiResponse extends ItemApiResponse<ItemDetails> {}

/* =========================================================
   12. ITEM LABELS AND CONSTANTS
========================================================= */

export const ITEM_TYPES: ItemType[] = ["LOST", "FOUND"];

export const ITEM_STATUSES: ItemStatus[] = [
  "OPEN",
  "CLAIMED",
  "RESOLVED",
  "ARCHIVED",
];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  LOST: "Lost Item",
  FOUND: "Found Item",
};

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  OPEN: "Open",
  CLAIMED: "Claimed",
  RESOLVED: "Resolved",
  ARCHIVED: "Archived",
};

export const ITEM_APPROVAL_LABELS: Record<ItemApprovalStatus, string> = {
  PENDING: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function getItemTypeLabel(type: ItemType): string {
  return ITEM_TYPE_LABELS[type];
}

export function getItemStatusLabel(status: ItemStatus): string {
  return ITEM_STATUS_LABELS[status];
}

export function isLostItem(item: Pick<Item, "type">): boolean {
  return item.type === "LOST";
}

export function isFoundItem(item: Pick<Item, "type">): boolean {
  return item.type === "FOUND";
}

export function isItemOpen(item: Pick<Item, "status">): boolean {
  return item.status === "OPEN";
}

export function isItemApproved(item: Pick<Item, "approvalStatus">): boolean {
  return item.approvalStatus === "APPROVED";
}

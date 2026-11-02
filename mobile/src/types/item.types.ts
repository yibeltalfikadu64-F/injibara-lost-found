// mobile/src/types/item.types.ts

import type { User, UserSummary } from "./user.types";

// ============================================================
// ITEM ENUMS
// ============================================================

export enum ItemType {
  LOST = "LOST",
  FOUND = "FOUND",
}

export enum ItemStatus {
  PENDING = "PENDING",
  OPEN = "OPEN",
  CLAIMED = "CLAIMED",
  RESOLVED = "RESOLVED",
  RETURNED = "RETURNED",
  REJECTED = "REJECTED",
  CLOSED = "CLOSED",
  EXPIRED = "EXPIRED",
}

export enum ItemCondition {
  NEW = "NEW",
  LIKE_NEW = "LIKE_NEW",
  GOOD = "GOOD",
  FAIR = "FAIR",
  POOR = "POOR",
  UNKNOWN = "UNKNOWN",
}

export enum ItemSortBy {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  TITLE = "title",
  LOST_FOUND_DATE = "lostFoundDate",
}

// ============================================================
// ITEM IMAGE
// ============================================================

export interface ItemImage {
  id?: string;

  uri: string;

  url?: string;

  fileName?: string;

  mimeType?: string;

  fileSize?: number;

  width?: number;

  height?: number;

  isPrimary?: boolean;

  createdAt?: string;
}

// ============================================================
// ITEM CATEGORY
// ============================================================

export interface ItemCategory {
  id: string;

  name: string;

  slug?: string;

  description?: string | null;

  icon?: string | null;

  imageUrl?: string | null;

  isActive?: boolean;

  sortOrder?: number;

  createdAt?: string;

  updatedAt?: string;
}

// ============================================================
// ITEM LOCATION
// ============================================================

export interface ItemLocation {
  id: string;

  name: string;

  description?: string | null;

  building?: string | null;

  floor?: string | null;

  roomNumber?: string | null;

  latitude?: number | null;

  longitude?: number | null;

  address?: string | null;

  isActive?: boolean;

  createdAt?: string;

  updatedAt?: string;
}

// ============================================================
// ITEM COORDINATES
// ============================================================

export interface ItemCoordinates {
  latitude: number;

  longitude: number;

  accuracy?: number | null;

  altitude?: number | null;

  heading?: number | null;

  speed?: number | null;
}

// ============================================================
// ITEM OWNER
// ============================================================

export interface ItemOwner {
  id: string;

  firstName: string;

  lastName: string;

  email?: string;

  avatarUrl?: string | null;

  role?: string;
}

// ============================================================
// MAIN ITEM ENTITY
// ============================================================

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

  imageUrls: string[];

  images?: ItemImage[];

  color?: string | null;

  brand?: string | null;

  model?: string | null;

  serialNumber?: string | null;

  identifyingFeatures?: string | null;

  condition?: ItemCondition | null;

  lostFoundDate: string;

  reportedAt?: string;

  expiresAt?: string | null;

  coordinates?: ItemCoordinates | null;

  latitude?: number | null;

  longitude?: number | null;

  contactPreference?: ContactPreference;

  ownerId: string;

  owner?: UserSummary;

  reportedBy?: UserSummary;

  claimedById?: string | null;

  isApproved?: boolean;

  approvedAt?: string | null;

  approvedById?: string | null;

  rejectionReason?: string | null;

  viewCount?: number;

  claimCount?: number;

  isFeatured?: boolean;

  createdAt: string;

  updatedAt: string;

  deletedAt?: string | null;
}

// ============================================================
// ITEM DETAIL
// ============================================================

export interface ItemDetail extends Item {
  owner: User;

  category: ItemCategory;

  location: ItemLocation;

  relatedItems?: Item[];

  isOwner?: boolean;

  canEdit?: boolean;

  canDelete?: boolean;

  canClaim?: boolean;

  canReport?: boolean;

  canWithdraw?: boolean;
}

// ============================================================
// ITEM SUMMARY
// ============================================================

export interface ItemSummary {
  id: string;

  title: string;

  type: ItemType;

  status: ItemStatus;

  imageUrl?: string | null;

  categoryName?: string;

  locationName?: string;

  lostFoundDate: string;

  createdAt: string;
}

// ============================================================
// ITEM CREATION REQUEST
// ============================================================

export type ContactPreference = "IN_APP" | "EMAIL" | "PHONE" | "IN_PERSON";

export interface CreateItemRequest {
  title: string;

  description: string;

  type: ItemType;

  categoryId: string;

  locationId: string;

  imageUrls?: string[];

  color?: string;

  brand?: string;

  model?: string;

  condition?: ItemCondition;

  identifyingFeatures?: string;

  lostFoundDate: string;

  latitude?: number;

  longitude?: number;

  contactPreference?: ContactPreference;
}

// ============================================================
// REPORT LOST ITEM REQUEST
// ============================================================

export interface ReportLostItemRequest extends Omit<CreateItemRequest, "type"> {
  type?: ItemType.LOST;
}

// ============================================================
// REPORT FOUND ITEM REQUEST
// ============================================================

export interface ReportFoundItemRequest extends Omit<
  CreateItemRequest,
  "type"
> {
  type?: ItemType.FOUND;
}

// ============================================================
// UPDATE ITEM REQUEST
// ============================================================

export interface UpdateItemRequest {
  title?: string;

  description?: string;

  categoryId?: string;

  locationId?: string;

  imageUrls?: string[];

  color?: string | null;

  brand?: string | null;

  model?: string | null;

  condition?: ItemCondition | null;

  identifyingFeatures?: string | null;

  lostFoundDate?: string;

  latitude?: number | null;

  longitude?: number | null;

  contactPreference?: ContactPreference;
}

// ============================================================
// ITEM IMAGE UPLOAD REQUEST
// ============================================================

export interface ItemImageUploadRequest {
  uri: string;

  name: string;

  type: string;

  size?: number;
}

// ============================================================
// ITEM IMAGE UPLOAD RESPONSE
// ============================================================

export interface ItemImageUploadResponse {
  success: boolean;

  url: string;

  publicId?: string;

  fileName?: string;

  mimeType?: string;

  size?: number;
}

// ============================================================
// ITEM FILTERS
// ============================================================

export interface ItemFilters {
  search?: string;

  type?: ItemType;

  status?: ItemStatus;

  categoryId?: string;

  locationId?: string;

  ownerId?: string;

  color?: string;

  brand?: string;

  condition?: ItemCondition;

  fromDate?: string;

  toDate?: string;

  latitude?: number;

  longitude?: number;

  radiusKm?: number;

  page?: number;

  limit?: number;

  sortBy?: ItemSortBy;

  sortOrder?: "asc" | "desc";
}

// ============================================================
// ITEM SEARCH REQUEST
// ============================================================

export interface ItemSearchRequest {
  query: string;

  filters?: ItemFilters;

  page?: number;

  limit?: number;
}

// ============================================================
// ITEM SEARCH RESPONSE
// ============================================================

export interface ItemSearchResponse {
  success: boolean;

  items: Item[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;
}

// ============================================================
// ITEM LIST RESPONSE
// ============================================================

export interface ItemListResponse {
  success: boolean;

  message?: string;

  items: Item[];

  pagination: ItemPagination;
}

// ============================================================
// ITEM PAGINATION
// ============================================================

export interface ItemPagination {
  page: number;

  limit: number;

  total: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;
}

// ============================================================
// ITEM APPROVAL REQUEST
// ============================================================

export interface ApproveItemRequest {
  itemId: string;

  note?: string;
}

// ============================================================
// ITEM REJECTION REQUEST
// ============================================================

export interface RejectItemRequest {
  itemId: string;

  reason: string;
}

// ============================================================
// ITEM STATUS UPDATE REQUEST
// ============================================================

export interface UpdateItemStatusRequest {
  status: ItemStatus;

  reason?: string;
}

// ============================================================
// ITEM ADMIN ACTION RESPONSE
// ============================================================

export interface ItemAdminActionResponse {
  success: boolean;

  message: string;

  item: Item;
}

// ============================================================
// ITEM STATISTICS
// ============================================================

export interface ItemStatistics {
  totalItems: number;

  totalLostItems: number;

  totalFoundItems: number;

  totalPendingItems: number;

  totalOpenItems: number;

  totalClaimedItems: number;

  totalResolvedItems: number;

  totalReturnedItems: number;

  totalRejectedItems: number;

  totalClosedItems: number;

  totalExpiredItems: number;
}

// ============================================================
// ITEM CATEGORY STATISTICS
// ============================================================

export interface ItemCategoryStatistics {
  categoryId: string;

  categoryName: string;

  totalItems: number;

  lostItems: number;

  foundItems: number;

  claimedItems: number;
}

// ============================================================
// ITEM LOCATION STATISTICS
// ============================================================

export interface ItemLocationStatistics {
  locationId: string;

  locationName: string;

  totalItems: number;

  lostItems: number;

  foundItems: number;
}

// ============================================================
// RELATED ITEM
// ============================================================

export interface RelatedItem {
  item: Item;

  similarityScore?: number;

  matchingCategory?: boolean;

  matchingLocation?: boolean;

  matchingKeywords?: string[];
}

// ============================================================
// ITEM TIMELINE EVENT
// ============================================================

export interface ItemTimelineEvent {
  id: string;

  itemId: string;

  action: string;

  description: string;

  oldStatus?: ItemStatus | null;

  newStatus?: ItemStatus | null;

  performedBy?: UserSummary | null;

  createdAt: string;
}

// ============================================================
// ITEM REPORT
// ============================================================

export interface ItemReport {
  id: string;

  itemId: string;

  reporterId: string;

  reason: string;

  description?: string;

  status: "PENDING" | "REVIEWED" | "DISMISSED";

  createdAt: string;
}

// ============================================================
// ITEM FAVORITE
// ============================================================

export interface ItemFavorite {
  id: string;

  userId: string;

  itemId: string;

  item?: Item;

  createdAt: string;
}

// ============================================================
// ITEM VIEW
// ============================================================

export interface ItemView {
  id: string;

  itemId: string;

  userId?: string | null;

  viewedAt: string;
}

// ============================================================
// ITEM VALIDATION ERRORS
// ============================================================

export interface ItemValidationErrors {
  title?: string;

  description?: string;

  type?: string;

  categoryId?: string;

  locationId?: string;

  imageUrls?: string;

  lostFoundDate?: string;

  color?: string;

  brand?: string;

  condition?: string;

  identifyingFeatures?: string;
}

// ============================================================
// ITEM FORM STATE
// ============================================================

export interface ItemFormState {
  title: string;

  description: string;

  type: ItemType;

  categoryId: string;

  locationId: string;

  images: ItemImage[];

  color: string;

  brand: string;

  model: string;

  condition: ItemCondition | "";

  identifyingFeatures: string;

  lostFoundDate: Date;

  contactPreference: ContactPreference;
}

// ============================================================
// ITEM DRAFT
// ============================================================

export interface ItemDraft {
  id: string;

  localId: string;

  type: ItemType;

  data: CreateItemRequest;

  localImageUris: string[];

  isSynced: boolean;

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// ITEM SYNC STATUS
// ============================================================

export type ItemSyncStatus = "PENDING" | "SYNCING" | "SYNCED" | "FAILED";

// ============================================================
// ITEM HELPERS
// ============================================================

export function isLostItem(item: Pick<Item, "type">): boolean {
  return item.type === ItemType.LOST;
}

export function isFoundItem(item: Pick<Item, "type">): boolean {
  return item.type === ItemType.FOUND;
}

export function isClaimableItem(item: Pick<Item, "status" | "type">): boolean {
  return item.status === ItemStatus.OPEN && item.type === ItemType.FOUND;
}

export function isEditableItem(item: Pick<Item, "status">): boolean {
  return item.status === ItemStatus.PENDING || item.status === ItemStatus.OPEN;
}

export function getItemTypeLabel(type: ItemType): string {
  return type === ItemType.LOST ? "Lost Item" : "Found Item";
}

export function getItemStatusLabel(status: ItemStatus): string {
  const labels: Record<ItemStatus, string> = {
    [ItemStatus.PENDING]: "Pending Review",
    [ItemStatus.OPEN]: "Available",
    [ItemStatus.CLAIMED]: "Claimed",
    [ItemStatus.RESOLVED]: "Resolved",
    [ItemStatus.RETURNED]: "Returned",
    [ItemStatus.REJECTED]: "Rejected",
    [ItemStatus.CLOSED]: "Closed",
    [ItemStatus.EXPIRED]: "Expired",
  };

  return labels[status];
}

// ============================================================
// TYPE GUARDS
// ============================================================

export function isItemType(value: unknown): value is ItemType {
  return (
    typeof value === "string" &&
    Object.values(ItemType).includes(value as ItemType)
  );
}

export function isItemStatus(value: unknown): value is ItemStatus {
  return (
    typeof value === "string" &&
    Object.values(ItemStatus).includes(value as ItemStatus)
  );
}

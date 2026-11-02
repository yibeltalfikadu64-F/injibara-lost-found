// mobile/src/database/itemCache.ts

import { executeSql, getMany, getOne, withTransaction } from "./database";

import { ensureDatabaseReady } from "./migrations";

// ============================================================
// TYPES
// ============================================================

export type CachedItemType = "LOST" | "FOUND";

export type CachedItemSyncStatus = "SYNCED" | "PENDING" | "FAILED";

export interface CachedItem {
  id: string;

  title: string;

  description: string;

  type: CachedItemType;

  status: string;

  categoryId?: string | null;

  categoryName?: string | null;

  locationId?: string | null;

  locationName?: string | null;

  latitude?: number | null;

  longitude?: number | null;

  imageUrls: string[];

  brand?: string | null;

  color?: string | null;

  identifyingFeatures?: string | null;

  dateLostOrFound?: string | null;

  reporterId?: string | null;

  reporterName?: string | null;

  ownerId?: string | null;

  rawData?: Record<string, unknown>;

  isFavorite?: boolean;

  isDeleted?: boolean;

  syncStatus?: CachedItemSyncStatus;

  serverUpdatedAt?: string | null;

  cachedAt?: string;

  createdAt?: string | null;

  updatedAt?: string | null;
}

interface ItemDatabaseRow {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  category_id: string | null;
  category_name: string | null;
  location_id: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  image_urls: string;
  brand: string | null;
  color: string | null;
  identifying_features: string | null;
  date_lost_or_found: string | null;
  reporter_id: string | null;
  reporter_name: string | null;
  owner_id: string | null;
  raw_data: string;
  is_favorite: number;
  is_deleted: number;
  sync_status: CachedItemSyncStatus;
  server_updated_at: string | null;
  cached_at: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ItemCacheFilters {
  type?: CachedItemType;
  status?: string;
  categoryId?: string;
  locationId?: string;
  search?: string;
  favoriteOnly?: boolean;
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "cachedAt" | "title";
  sortOrder?: "ASC" | "DESC";
}

export interface ItemCacheStatistics {
  total: number;
  lost: number;
  found: number;
  favorites: number;
  pendingSync: number;
  failedSync: number;
}

// ============================================================
// JSON HELPERS
// ============================================================

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function serializeJson(value: unknown): string {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return "{}";
  }
}

// ============================================================
// NORMALIZE SERVER ITEM
// ============================================================

function normalizeItem(input: Record<string, unknown>): CachedItem {
  const id = String(input.id ?? "");

  if (!id) {
    throw new Error("Cannot cache an item without an ID.");
  }

  const type = String(input.type ?? "LOST").toUpperCase();

  if (type !== "LOST" && type !== "FOUND") {
    throw new Error(`Invalid item type: ${type}`);
  }

  const category = input.category as
    | Record<string, unknown>
    | string
    | null
    | undefined;

  const location = input.location as
    | Record<string, unknown>
    | string
    | null
    | undefined;

  const reporter = input.reporter as Record<string, unknown> | null | undefined;

  const owner = input.owner as Record<string, unknown> | null | undefined;

  const imageUrls = Array.isArray(input.imageUrls)
    ? input.imageUrls.map(String)
    : [];

  return {
    id,

    title: String(input.title ?? "Untitled item"),

    description: String(input.description ?? ""),

    type,

    status: String(input.status ?? "OPEN"),

    categoryId:
      typeof category === "object" && category
        ? String(category.id ?? "") || null
        : typeof input.categoryId === "string"
          ? input.categoryId
          : null,

    categoryName:
      typeof category === "object" && category
        ? String(category.name ?? "") || null
        : typeof category === "string"
          ? category
          : null,

    locationId:
      typeof location === "object" && location
        ? String(location.id ?? "") || null
        : typeof input.locationId === "string"
          ? input.locationId
          : null,

    locationName:
      typeof location === "object" && location
        ? String(location.name ?? "") || null
        : typeof location === "string"
          ? location
          : null,

    latitude: typeof input.latitude === "number" ? input.latitude : null,

    longitude: typeof input.longitude === "number" ? input.longitude : null,

    imageUrls,

    brand: typeof input.brand === "string" ? input.brand : null,

    color: typeof input.color === "string" ? input.color : null,

    identifyingFeatures:
      typeof input.identifyingFeatures === "string"
        ? input.identifyingFeatures
        : null,

    dateLostOrFound:
      typeof input.dateLostOrFound === "string" ? input.dateLostOrFound : null,

    reporterId:
      typeof reporter === "object" && reporter
        ? String(reporter.id ?? "") || null
        : typeof input.reporterId === "string"
          ? input.reporterId
          : null,

    reporterName:
      typeof reporter === "object" && reporter
        ? [reporter.firstName, reporter.lastName].filter(Boolean).join(" ") ||
          null
        : null,

    ownerId:
      typeof owner === "object" && owner
        ? String(owner.id ?? "") || null
        : typeof input.ownerId === "string"
          ? input.ownerId
          : null,

    rawData: input,

    serverUpdatedAt:
      typeof input.updatedAt === "string" ? input.updatedAt : null,

    createdAt: typeof input.createdAt === "string" ? input.createdAt : null,

    updatedAt: typeof input.updatedAt === "string" ? input.updatedAt : null,

    cachedAt: new Date().toISOString(),

    syncStatus: "SYNCED",

    isFavorite: false,

    isDeleted: false,
  };
}

// ============================================================
// DATABASE ROW TO ITEM
// ============================================================

function rowToItem(row: ItemDatabaseRow): CachedItem {
  return {
    id: row.id,

    title: row.title,

    description: row.description,

    type: row.type as CachedItemType,

    status: row.status,

    categoryId: row.category_id,

    categoryName: row.category_name,

    locationId: row.location_id,

    locationName: row.location_name,

    latitude: row.latitude,

    longitude: row.longitude,

    imageUrls: parseJson(row.image_urls, []),

    brand: row.brand,

    color: row.color,

    identifyingFeatures: row.identifying_features,

    dateLostOrFound: row.date_lost_or_found,

    reporterId: row.reporter_id,

    reporterName: row.reporter_name,

    ownerId: row.owner_id,

    rawData: parseJson(row.raw_data, {}),

    isFavorite: row.is_favorite === 1,

    isDeleted: row.is_deleted === 1,

    syncStatus: row.sync_status,

    serverUpdatedAt: row.server_updated_at,

    cachedAt: row.cached_at,

    createdAt: row.created_at,

    updatedAt: row.updated_at,
  };
}

// ============================================================
// SAVE ITEM
// ============================================================

export async function saveItem(
  input: Record<string, unknown>,
): Promise<CachedItem> {
  await ensureDatabaseReady();

  const item = normalizeItem(input);

  const existing = await getOne<{
    is_favorite: number;
  }>(
    `SELECT is_favorite
     FROM items
     WHERE id = ?`,
    [item.id],
  );

  await executeSql(
    `INSERT INTO items (
      id,
      title,
      description,
      type,
      status,
      category_id,
      category_name,
      location_id,
      location_name,
      latitude,
      longitude,
      image_urls,
      brand,
      color,
      identifying_features,
      date_lost_or_found,
      reporter_id,
      reporter_name,
      owner_id,
      raw_data,
      is_favorite,
      is_deleted,
      sync_status,
      server_updated_at,
      cached_at,
      created_at,
      updated_at
    )
    VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      type = excluded.type,
      status = excluded.status,
      category_id = excluded.category_id,
      category_name = excluded.category_name,
      location_id = excluded.location_id,
      location_name = excluded.location_name,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      image_urls = excluded.image_urls,
      brand = excluded.brand,
      color = excluded.color,
      identifying_features = excluded.identifying_features,
      date_lost_or_found = excluded.date_lost_or_found,
      reporter_id = excluded.reporter_id,
      reporter_name = excluded.reporter_name,
      owner_id = excluded.owner_id,
      raw_data = excluded.raw_data,
      server_updated_at = excluded.server_updated_at,
      cached_at = excluded.cached_at,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      is_favorite = excluded.is_favorite`,
    [
      item.id,
      item.title,
      item.description,
      item.type,
      item.status,
      item.categoryId ?? null,
      item.categoryName ?? null,
      item.locationId ?? null,
      item.locationName ?? null,
      item.latitude ?? null,
      item.longitude ?? null,
      serializeJson(item.imageUrls),
      item.brand ?? null,
      item.color ?? null,
      item.identifyingFeatures ?? null,
      item.dateLostOrFound ?? null,
      item.reporterId ?? null,
      item.reporterName ?? null,
      item.ownerId ?? null,
      serializeJson(item.rawData),
      existing?.is_favorite ?? 0,
      0,
      "SYNCED",
      item.serverUpdatedAt ?? null,
      item.cachedAt,
      item.createdAt ?? null,
      item.updatedAt ?? null,
    ],
  );

  const saved = await getItemById(item.id);

  if (!saved) {
    throw new Error("The item was saved but could not be retrieved.");
  }

  return saved;
}

// ============================================================
// SAVE MULTIPLE ITEMS
// ============================================================

export async function saveItems(
  inputs: Record<string, unknown>[],
): Promise<number> {
  await ensureDatabaseReady();

  let savedCount = 0;

  await withTransaction(async (database) => {
    for (const input of inputs) {
      const item = normalizeItem(input);

      const existing = await database.getFirstAsync<{
        is_favorite: number;
      }>(
        `SELECT is_favorite
           FROM items
           WHERE id = ?`,
        [item.id],
      );

      await database.runAsync(
        `INSERT INTO items (
          id, title, description, type, status,
          category_id, category_name,
          location_id, location_name,
          latitude, longitude, image_urls,
          brand, color, identifying_features,
          date_lost_or_found,
          reporter_id, reporter_name, owner_id,
          raw_data, is_favorite, is_deleted,
          sync_status, server_updated_at,
          cached_at, created_at, updated_at
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          description = excluded.description,
          type = excluded.type,
          status = excluded.status,
          category_id = excluded.category_id,
          category_name = excluded.category_name,
          location_id = excluded.location_id,
          location_name = excluded.location_name,
          latitude = excluded.latitude,
          longitude = excluded.longitude,
          image_urls = excluded.image_urls,
          brand = excluded.brand,
          color = excluded.color,
          identifying_features = excluded.identifying_features,
          date_lost_or_found = excluded.date_lost_or_found,
          reporter_id = excluded.reporter_id,
          reporter_name = excluded.reporter_name,
          owner_id = excluded.owner_id,
          raw_data = excluded.raw_data,
          server_updated_at = excluded.server_updated_at,
          cached_at = excluded.cached_at,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          is_favorite = excluded.is_favorite`,
        [
          item.id,
          item.title,
          item.description,
          item.type,
          item.status,
          item.categoryId ?? null,
          item.categoryName ?? null,
          item.locationId ?? null,
          item.locationName ?? null,
          item.latitude ?? null,
          item.longitude ?? null,
          serializeJson(item.imageUrls),
          item.brand ?? null,
          item.color ?? null,
          item.identifyingFeatures ?? null,
          item.dateLostOrFound ?? null,
          item.reporterId ?? null,
          item.reporterName ?? null,
          item.ownerId ?? null,
          serializeJson(item.rawData),
          existing?.is_favorite ?? 0,
          0,
          "SYNCED",
          item.serverUpdatedAt ?? null,
          item.cachedAt,
          item.createdAt ?? null,
          item.updatedAt ?? null,
        ],
      );

      savedCount += 1;
    }
  });

  return savedCount;
}

// ============================================================
// GET ITEM BY ID
// ============================================================

export async function getItemById(id: string): Promise<CachedItem | null> {
  await ensureDatabaseReady();

  const row = await getOne<ItemDatabaseRow>(
    `SELECT *
     FROM items
     WHERE id = ?
       AND is_deleted = 0`,
    [id],
  );

  return row ? rowToItem(row) : null;
}

// ============================================================
// GET ALL ITEMS
// ============================================================

export async function getItems(
  filters: ItemCacheFilters = {},
): Promise<CachedItem[]> {
  await ensureDatabaseReady();

  const conditions: string[] = [];

  const params: (string | number | null)[] = [];

  if (!filters.includeDeleted) {
    conditions.push("is_deleted = 0");
  }

  if (filters.type) {
    conditions.push("type = ?");
    params.push(filters.type);
  }

  if (filters.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  if (filters.categoryId) {
    conditions.push("category_id = ?");
    params.push(filters.categoryId);
  }

  if (filters.locationId) {
    conditions.push("location_id = ?");
    params.push(filters.locationId);
  }

  if (filters.favoriteOnly) {
    conditions.push("is_favorite = 1");
  }

  if (filters.search?.trim()) {
    conditions.push(
      `(title LIKE ? OR description LIKE ?
        OR category_name LIKE ?
        OR location_name LIKE ?)`,
    );

    const search = `%${filters.search.trim()}%`;

    params.push(search, search, search, search);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const sortColumns = {
    createdAt: "created_at",
    cachedAt: "cached_at",
    title: "title",
  } as const;

  const sortColumn = sortColumns[filters.sortBy ?? "cachedAt"];

  const sortOrder = filters.sortOrder === "ASC" ? "ASC" : "DESC";

  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);

  const offset = Math.max(filters.offset ?? 0, 0);

  const rows = await getMany<ItemDatabaseRow>(
    `SELECT *
     FROM items
     ${whereClause}
     ORDER BY ${sortColumn} ${sortOrder}
     LIMIT ?
     OFFSET ?`,
    [...params, limit, offset],
  );

  return rows.map(rowToItem);
}

// ============================================================
// SEARCH ITEMS
// ============================================================

export async function searchItems(
  query: string,
  limit = 50,
): Promise<CachedItem[]> {
  return getItems({
    search: query,
    limit,
    sortBy: "cachedAt",
    sortOrder: "DESC",
  });
}

// ============================================================
// GET LOST ITEMS
// ============================================================

export async function getLostItems(limit = 50): Promise<CachedItem[]> {
  return getItems({
    type: "LOST",
    limit,
  });
}

// ============================================================
// GET FOUND ITEMS
// ============================================================

export async function getFoundItems(limit = 50): Promise<CachedItem[]> {
  return getItems({
    type: "FOUND",
    limit,
  });
}

// ============================================================
// UPDATE FAVORITE
// ============================================================

export async function setFavorite(
  id: string,
  favorite: boolean,
): Promise<void> {
  await ensureDatabaseReady();

  const result = await executeSql(
    `UPDATE items
     SET is_favorite = ?
     WHERE id = ?
       AND is_deleted = 0`,
    [favorite ? 1 : 0, id],
  );

  if (result.changes === 0) {
    throw new Error("Item not found in local cache.");
  }
}

// ============================================================
// TOGGLE FAVORITE
// ============================================================

export async function toggleFavorite(id: string): Promise<boolean> {
  const item = await getItemById(id);

  if (!item) {
    throw new Error("Item not found in local cache.");
  }

  const nextValue = !item.isFavorite;

  await setFavorite(id, nextValue);

  return nextValue;
}

// ============================================================
// UPDATE LOCAL ITEM STATUS
// ============================================================

export async function updateLocalItemStatus(
  id: string,
  status: string,
): Promise<void> {
  await ensureDatabaseReady();

  const result = await executeSql(
    `UPDATE items
     SET status = ?,
         sync_status = 'PENDING',
         updated_at = ?
     WHERE id = ?
       AND is_deleted = 0`,
    [status, new Date().toISOString(), id],
  );

  if (result.changes === 0) {
    throw new Error("Item not found in local cache.");
  }
}

// ============================================================
// MARK ITEM AS DELETED
// ============================================================

export async function markItemDeleted(id: string): Promise<void> {
  await ensureDatabaseReady();

  const result = await executeSql(
    `UPDATE items
     SET is_deleted = 1,
         sync_status = 'PENDING',
         updated_at = ?
     WHERE id = ?`,
    [new Date().toISOString(), id],
  );

  if (result.changes === 0) {
    throw new Error("Item not found in local cache.");
  }
}

// ============================================================
// RESTORE DELETED ITEM
// ============================================================

export async function restoreDeletedItem(id: string): Promise<void> {
  await executeSql(
    `UPDATE items
     SET is_deleted = 0,
         sync_status = 'PENDING',
         updated_at = ?
     WHERE id = ?`,
    [new Date().toISOString(), id],
  );
}

// ============================================================
// REMOVE ITEM FROM CACHE
// ============================================================

export async function removeItemFromCache(id: string): Promise<void> {
  await executeSql("DELETE FROM items WHERE id = ?", [id]);
}

// ============================================================
// MARK ITEM SYNCED
// ============================================================

export async function markItemSynced(id: string): Promise<void> {
  await executeSql(
    `UPDATE items
     SET sync_status = 'SYNCED',
         server_updated_at = ?,
         cached_at = ?
     WHERE id = ?`,
    [new Date().toISOString(), new Date().toISOString(), id],
  );
}

// ============================================================
// MARK ITEM SYNC FAILED
// ============================================================

export async function markItemSyncFailed(id: string): Promise<void> {
  await executeSql(
    `UPDATE items
     SET sync_status = 'FAILED'
     WHERE id = ?`,
    [id],
  );
}

// ============================================================
// GET CACHE STATISTICS
// ============================================================

export async function getItemCacheStatistics(): Promise<ItemCacheStatistics> {
  await ensureDatabaseReady();

  const row = await getOne<{
    total: number;
    lost: number;
    found: number;
    favorites: number;
    pending: number;
    failed: number;
  }>(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN type = 'LOST' THEN 1 ELSE 0 END) AS lost,
       SUM(CASE WHEN type = 'FOUND' THEN 1 ELSE 0 END) AS found,
       SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) AS favorites,
       SUM(CASE WHEN sync_status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN sync_status = 'FAILED' THEN 1 ELSE 0 END) AS failed
     FROM items
     WHERE is_deleted = 0`,
  );

  return {
    total: row?.total ?? 0,
    lost: row?.lost ?? 0,
    found: row?.found ?? 0,
    favorites: row?.favorites ?? 0,
    pendingSync: row?.pending ?? 0,
    failedSync: row?.failed ?? 0,
  };
}

// ============================================================
// CLEAR OLD CACHE
// ============================================================

export async function clearOldCache(days = 30): Promise<number> {
  await ensureDatabaseReady();

  const safeDays = Math.max(1, Math.min(days, 365));

  const cutoff = new Date(
    Date.now() - safeDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const result = await executeSql(
    `DELETE FROM items
     WHERE cached_at < ?
       AND is_favorite = 0
       AND sync_status = 'SYNCED'`,
    [cutoff],
  );

  return result.changes;
}

// ============================================================
// EXPORT
// ============================================================

const itemCache = {
  saveItem,
  saveItems,

  getItemById,
  getItems,

  searchItems,
  getLostItems,
  getFoundItems,

  setFavorite,
  toggleFavorite,

  updateLocalItemStatus,

  markItemDeleted,
  restoreDeletedItem,
  removeItemFromCache,

  markItemSynced,
  markItemSyncFailed,

  getItemCacheStatistics,
  clearOldCache,
};

export default itemCache;

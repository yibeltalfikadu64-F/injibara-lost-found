// mobile/src/database/syncService.ts

import NetInfo from "@react-native-community/netinfo";

import { getDatabase, getOne } from "./database";

import { ensureDatabaseReady } from "./migrations";

import {
  DraftAction,
  DraftEntityType,
  DraftQueueEntry,
  getPendingDrafts,
  markDraftSyncing,
  markDraftSynced,
  markDraftFailed,
  recoverInterruptedDrafts,
} from "./draftQueue";

import {
  markItemSynced,
  markItemSyncFailed,
  saveItem,
  removeItemFromCache,
} from "./itemCache";

// ============================================================
// TYPES
// ============================================================

export interface SyncRequest {
  entityType: DraftEntityType;

  entityId: string | null;

  action: DraftAction;

  payload: Record<string, unknown>;

  idempotencyKey: string;

  accessToken: string;
}

export interface SyncResponse {
  success: boolean;

  message?: string;

  data?: unknown;

  serverId?: string;
}

export interface SyncTransport {
  send: (request: SyncRequest) => Promise<SyncResponse>;
}

export interface SyncOptions {
  limit?: number;

  continueOnError?: boolean;

  onlyEntityType?: DraftEntityType;
}

export interface SyncResult {
  startedAt: string;

  finishedAt: string;

  total: number;

  succeeded: number;

  failed: number;

  skipped: number;

  errors: Array<{
    draftId: string;
    message: string;
  }>;

  online: boolean;
}

export interface SyncStatus {
  isSyncing: boolean;

  lastSyncAt: string | null;

  lastError: string | null;

  pendingCount: number;

  failedCount: number;

  lastResult: SyncResult | null;
}

export type AccessTokenProvider = () => Promise<string | null>;

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

const DEFAULT_SYNC_LIMIT = 20;

const REQUEST_TIMEOUT_MS = 30_000;

// ============================================================
// SYNC STATE
// ============================================================

let isSyncing = false;

let lastSyncAt: string | null = null;

let lastError: string | null = null;

let lastResult: SyncResult | null = null;

let accessTokenProvider: AccessTokenProvider = async () => null;

// ============================================================
// CONFIGURE ACCESS TOKEN PROVIDER
// ============================================================

export function configureSyncAuthentication(
  provider: AccessTokenProvider,
): void {
  accessTokenProvider = provider;
}

// Example integration:
//
// configureSyncAuthentication(async () => {
//   return useAuthStore.getState().accessToken;
// });
//
// This lets the sync service use the current access token
// without importing or creating another authentication store.

// ============================================================
// API ERROR
// ============================================================

export class SyncError extends Error {
  public readonly statusCode?: number;

  public readonly retryable: boolean;

  constructor(message: string, statusCode?: number) {
    super(message);

    this.name = "SyncError";

    this.statusCode = statusCode;

    this.retryable =
      statusCode === undefined ||
      statusCode === 408 ||
      statusCode === 425 ||
      statusCode === 429 ||
      statusCode >= 500;
  }
}

// ============================================================
// RESPONSE PARSER
// ============================================================

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {
      message: text,
    };
  }
}

// ============================================================
// ENDPOINT RESOLVER
// ============================================================

function resolveEndpoint(request: SyncRequest): {
  path: string;
  method: "POST" | "PATCH" | "DELETE";
} {
  const encodedId = request.entityId
    ? encodeURIComponent(request.entityId)
    : "";

  switch (request.entityType) {
    case "ITEM": {
      if (request.action === "CREATE") {
        return {
          path: "/items",
          method: "POST",
        };
      }

      if (request.action === "UPDATE") {
        if (!encodedId) {
          throw new SyncError("An item ID is required for an update.");
        }

        return {
          path: `/items/${encodedId}`,
          method: "PATCH",
        };
      }

      if (request.action === "DELETE") {
        if (!encodedId) {
          throw new SyncError("An item ID is required for deletion.");
        }

        return {
          path: `/items/${encodedId}`,
          method: "DELETE",
        };
      }

      break;
    }

    case "CLAIM": {
      if (request.action === "CREATE" || request.action === "SUBMIT") {
        return {
          path: "/claims",
          method: "POST",
        };
      }

      if (request.action === "UPDATE") {
        return {
          path: `/claims/${encodedId}`,
          method: "PATCH",
        };
      }

      if (request.action === "CANCEL" || request.action === "DELETE") {
        return {
          path: `/claims/${encodedId}`,
          method: "DELETE",
        };
      }

      break;
    }

    case "REPORT": {
      if (request.action === "CREATE" || request.action === "SUBMIT") {
        return {
          path: "/reports",
          method: "POST",
        };
      }

      if (request.action === "UPDATE") {
        return {
          path: `/reports/${encodedId}`,
          method: "PATCH",
        };
      }

      if (request.action === "DELETE" || request.action === "CANCEL") {
        return {
          path: `/reports/${encodedId}`,
          method: "DELETE",
        };
      }

      break;
    }

    case "PROFILE": {
      if (request.action === "UPDATE") {
        return {
          path: "/auth/me",
          method: "PATCH",
        };
      }

      break;
    }

    case "FAVORITE": {
      if (!encodedId) {
        throw new SyncError("An item ID is required for a favorite action.");
      }

      return {
        path: `/items/${encodedId}/favorite`,
        method: "POST",
      };
    }

    default:
      break;
  }

  throw new SyncError(
    `Unsupported offline action: ${request.entityType}/${request.action}`,
  );
}

// ============================================================
// DEFAULT HTTP TRANSPORT
// ============================================================

export const httpSyncTransport: SyncTransport = {
  send: async (request) => {
    const endpoint = resolveEndpoint(request);

    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
        method: endpoint.method,

        headers: {
          Accept: "application/json",

          Authorization: `Bearer ${request.accessToken}`,

          "Idempotency-Key": request.idempotencyKey,

          ...(endpoint.method !== "DELETE"
            ? {
                "Content-Type": "application/json",
              }
            : {}),
        },

        ...(endpoint.method !== "DELETE"
          ? {
              body: JSON.stringify(request.payload),
            }
          : {}),

        signal: controller.signal,
      });

      const responseBody = await parseResponse(response);

      if (!response.ok) {
        const message =
          typeof responseBody === "object" &&
          responseBody !== null &&
          "message" in responseBody
            ? String(
                (
                  responseBody as {
                    message: unknown;
                  }
                ).message,
              )
            : `Server returned HTTP ${response.status}.`;

        throw new SyncError(message, response.status);
      }

      const body = responseBody as {
        success?: boolean;
        message?: string;
        data?: unknown;
        item?: unknown;
      };

      return {
        success: true,

        message: body.message,

        data: body.data ?? body.item ?? responseBody,
      };
    } catch (error) {
      if (error instanceof SyncError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new SyncError("The synchronization request timed out.", 408);
      }

      throw new SyncError(
        error instanceof Error ? error.message : "Network request failed.",
      );
    } finally {
      clearTimeout(timeout);
    }
  },
};

// ============================================================
// ACTIVE TRANSPORT
// ============================================================

let activeTransport: SyncTransport = httpSyncTransport;

export function configureSyncTransport(transport: SyncTransport): void {
  activeTransport = transport;
}

// ============================================================
// NETWORK CHECK
// ============================================================

export async function hasInternetConnection(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();

    return state.isConnected === true && state.isInternetReachable !== false;
  } catch {
    return false;
  }
}

// ============================================================
// GET ACCESS TOKEN
// ============================================================

async function getAccessToken(): Promise<string> {
  const token = await accessTokenProvider();

  if (!token) {
    throw new SyncError(
      "You must log in before synchronizing offline changes.",
      401,
    );
  }

  return token;
}

// ============================================================
// UPDATE SYNC METADATA
// ============================================================

async function setSyncMetadata(key: string, value: string): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `INSERT INTO sync_metadata (
      key,
      value,
      updated_at
    )
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at`,
    [key, value, new Date().toISOString()],
  );
}

// ============================================================
// READ SYNC METADATA
// ============================================================

async function getSyncMetadata(key: string): Promise<string | null> {
  const row = await getOne<{
    value: string | null;
  }>(
    `SELECT value
     FROM sync_metadata
     WHERE key = ?`,
    [key],
  );

  return row?.value ?? null;
}

// ============================================================
// UPDATE LOCAL CACHE AFTER SUCCESS
// ============================================================

async function updateLocalCacheAfterSync(
  draft: DraftQueueEntry,
  response: SyncResponse,
): Promise<void> {
  if (draft.entityType !== "ITEM") {
    return;
  }

  if (draft.action === "DELETE") {
    if (draft.entityId) {
      await removeItemFromCache(draft.entityId);
    }

    return;
  }

  if (draft.action === "CREATE" || draft.action === "UPDATE") {
    const data = response.data;

    if (typeof data === "object" && data !== null) {
      const candidate = data as Record<string, unknown>;

      const nestedItem =
        candidate.item && typeof candidate.item === "object"
          ? (candidate.item as Record<string, unknown>)
          : candidate.data && typeof candidate.data === "object"
            ? (candidate.data as Record<string, unknown>)
            : candidate;

      if (
        typeof nestedItem.id === "string" &&
        typeof nestedItem.title === "string"
      ) {
        await saveItem(nestedItem);

        return;
      }
    }

    if (draft.entityId) {
      await markItemSynced(draft.entityId);
    }
  }
}

// ============================================================
// SYNC SINGLE DRAFT
// ============================================================

async function syncSingleDraft(
  draft: DraftQueueEntry,
  accessToken: string,
): Promise<void> {
  await markDraftSyncing(draft.id);

  try {
    const response = await activeTransport.send({
      entityType: draft.entityType,

      entityId: draft.entityId,

      action: draft.action,

      payload: draft.payload,

      idempotencyKey: draft.idempotencyKey,

      accessToken,
    });

    if (!response.success) {
      throw new SyncError(
        response.message ?? "The server did not confirm synchronization.",
      );
    }

    await updateLocalCacheAfterSync(draft, response);

    await markDraftSynced(draft.id);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown synchronization error.";

    if (draft.entityType === "ITEM" && draft.entityId) {
      try {
        await markItemSyncFailed(draft.entityId);
      } catch (cacheError) {
        console.warn("Could not update item cache sync status:", cacheError);
      }
    }

    await markDraftFailed(draft.id, message);

    throw error;
  }
}

// ============================================================
// GET SYNC COUNTS
// ============================================================

export async function getSyncQueueCounts(): Promise<{
  pending: number;
  failed: number;
  syncing: number;
}> {
  await ensureDatabaseReady();

  const database = await getDatabase();

  const result = await database.getFirstAsync<{
    pending: number;
    failed: number;
    syncing: number;
  }>(
    `SELECT
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) AS failed,
        SUM(CASE WHEN status = 'SYNCING' THEN 1 ELSE 0 END) AS syncing
       FROM draft_queue`,
  );

  return {
    pending: result?.pending ?? 0,
    failed: result?.failed ?? 0,
    syncing: result?.syncing ?? 0,
  };
}

// ============================================================
// MAIN SYNCHRONIZATION
// ============================================================

export async function synchronize(
  options: SyncOptions = {},
): Promise<SyncResult> {
  const startedAt = new Date().toISOString();

  const emptyResult: SyncResult = {
    startedAt,

    finishedAt: new Date().toISOString(),

    total: 0,

    succeeded: 0,

    failed: 0,

    skipped: 0,

    errors: [],

    online: false,
  };

  if (isSyncing) {
    throw new Error("Synchronization is already running.");
  }

  isSyncing = true;

  lastError = null;

  let succeeded = 0;

  let failed = 0;

  let skipped = 0;

  const errors: SyncResult["errors"] = [];

  try {
    await ensureDatabaseReady();

    const online = await hasInternetConnection();

    if (!online) {
      lastError = "No internet connection is available.";

      const result: SyncResult = {
        ...emptyResult,

        finishedAt: new Date().toISOString(),

        online: false,
      };

      lastResult = result;

      return result;
    }

    const accessToken = await getAccessToken();

    // Recover drafts left in SYNCING state if the app
    // previously closed while processing them.
    await recoverInterruptedDrafts();

    let drafts = await getPendingDrafts(options.limit ?? DEFAULT_SYNC_LIMIT);

    if (options.onlyEntityType) {
      drafts = drafts.filter(
        (draft) => draft.entityType === options.onlyEntityType,
      );
    }

    for (const draft of drafts) {
      // Check connectivity again during longer sync runs.
      const stillOnline = await hasInternetConnection();

      if (!stillOnline) {
        skipped += drafts.length - succeeded - failed - skipped;

        break;
      }

      try {
        await syncSingleDraft(draft, accessToken);

        succeeded += 1;
      } catch (error) {
        failed += 1;

        errors.push({
          draftId: draft.id,

          message:
            error instanceof Error
              ? error.message
              : "Unknown synchronization error.",
        });

        if (options.continueOnError === false) {
          skipped += drafts.length - succeeded - failed - skipped;

          break;
        }

        // Continue processing other independent drafts.
      }
    }

    const finishedAt = new Date().toISOString();

    const result: SyncResult = {
      startedAt,

      finishedAt,

      total: drafts.length,

      succeeded,

      failed,

      skipped,

      errors,

      online: true,
    };

    lastSyncAt = finishedAt;

    lastResult = result;

    await setSyncMetadata("last_sync_at", finishedAt);

    await setSyncMetadata("last_sync_result", JSON.stringify(result));

    if (failed > 0) {
      lastError = `${failed} offline action(s) could not be synchronized.`;
    }

    return result;
  } catch (error) {
    lastError =
      error instanceof Error ? error.message : "Synchronization failed.";

    throw error;
  } finally {
    isSyncing = false;
  }
}

// ============================================================
// RETRY FAILED DRAFTS
// ============================================================

export async function retryFailedDrafts(): Promise<SyncResult> {
  await ensureDatabaseReady();

  const database = await getDatabase();

  await database.runAsync(
    `UPDATE draft_queue
     SET status = 'PENDING',
         attempts = 0,
         last_error = NULL,
         next_retry_at = NULL,
         updated_at = ?
     WHERE status = 'FAILED'
       AND attempts < max_attempts`,
    [new Date().toISOString()],
  );

  return synchronize();
}

// ============================================================
// GET LAST SYNC TIME
// ============================================================

export async function getLastSyncTime(): Promise<string | null> {
  if (lastSyncAt) {
    return lastSyncAt;
  }

  lastSyncAt = await getSyncMetadata("last_sync_at");

  return lastSyncAt;
}

// ============================================================
// GET LAST SYNC RESULT
// ============================================================

export async function getLastSyncResult(): Promise<SyncResult | null> {
  if (lastResult) {
    return lastResult;
  }

  const stored = await getSyncMetadata("last_sync_result");

  if (!stored) {
    return null;
  }

  try {
    lastResult = JSON.parse(stored) as SyncResult;

    return lastResult;
  } catch {
    return null;
  }
}

// ============================================================
// GET SYNC STATUS
// ============================================================

export async function getSyncStatus(): Promise<SyncStatus> {
  const counts = await getSyncQueueCounts();

  const storedLastSync = await getLastSyncTime();

  return {
    isSyncing,

    lastSyncAt: storedLastSync,

    lastError,

    pendingCount: counts.pending,

    failedCount: counts.failed,

    lastResult,
  };
}

// ============================================================
// CHECK WHETHER SYNC IS RUNNING
// ============================================================

export function isSynchronizationRunning(): boolean {
  return isSyncing;
}

// ============================================================
// SAVE MANUAL SYNC ERROR
// ============================================================

export function clearSyncError(): void {
  lastError = null;
}

// ============================================================
// RESET IN-MEMORY SYNC STATE
// ============================================================

export function resetSyncState(): void {
  if (isSyncing) {
    throw new Error(
      "Cannot reset sync state while synchronization is running.",
    );
  }

  lastError = null;

  lastResult = null;

  lastSyncAt = null;
}

// ============================================================
// AUTOMATIC NETWORK SYNC LISTENER
// ============================================================

let networkUnsubscribe: (() => void) | null = null;

let autoSyncEnabled = false;

export function startAutomaticSync(): void {
  if (networkUnsubscribe) {
    return;
  }

  autoSyncEnabled = true;

  networkUnsubscribe = NetInfo.addEventListener((state) => {
    const online =
      state.isConnected === true && state.isInternetReachable !== false;

    if (!online || !autoSyncEnabled) {
      return;
    }

    // Give the network a short opportunity to stabilize.
    // A failed sync leaves drafts in the queue for retry.
    void synchronize({
      limit: DEFAULT_SYNC_LIMIT,
      continueOnError: true,
    }).catch((error) => {
      console.warn("Automatic synchronization failed:", error);
    });
  });
}

// ============================================================
// STOP AUTOMATIC NETWORK SYNC
// ============================================================

export function stopAutomaticSync(): void {
  autoSyncEnabled = false;

  networkUnsubscribe?.();

  networkUnsubscribe = null;
}

// ============================================================
// EXPORT
// ============================================================

const syncService = {
  configureSyncAuthentication,

  configureSyncTransport,

  hasInternetConnection,

  synchronize,

  retryFailedDrafts,

  getSyncQueueCounts,

  getLastSyncTime,
  getLastSyncResult,
  getSyncStatus,

  isSynchronizationRunning,

  clearSyncError,
  resetSyncState,

  startAutomaticSync,
  stopAutomaticSync,
};

export default syncService;

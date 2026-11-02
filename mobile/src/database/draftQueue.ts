// mobile/src/database/draftQueue.ts

import { executeSql, getMany, getOne, withTransaction } from "./database";

import { ensureDatabaseReady } from "./migrations";

// ============================================================
// TYPES
// ============================================================

export type DraftEntityType =
  | "ITEM"
  | "CLAIM"
  | "REPORT"
  | "PROFILE"
  | "FAVORITE";

export type DraftAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "SUBMIT"
  | "CANCEL"
  | "TOGGLE";

export type DraftStatus =
  | "PENDING"
  | "SYNCING"
  | "SYNCED"
  | "FAILED"
  | "CANCELLED";

export interface DraftQueueEntry<T = Record<string, unknown>> {
  id: string;

  entityType: DraftEntityType;

  entityId: string | null;

  action: DraftAction;

  payload: T;

  status: DraftStatus;

  attempts: number;

  maxAttempts: number;

  lastError: string | null;

  createdAt: string;

  updatedAt: string;

  nextRetryAt: string | null;

  syncedAt: string | null;

  priority: number;

  idempotencyKey: string;
}

interface DraftDatabaseRow {
  id: string;
  entity_type: DraftEntityType;
  entity_id: string | null;
  action: DraftAction;
  payload: string;
  status: DraftStatus;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
  next_retry_at: string | null;
  synced_at: string | null;
  priority: number;
  idempotency_key: string;
}

export interface CreateDraftOptions<T> {
  entityType: DraftEntityType;

  entityId?: string | null;

  action: DraftAction;

  payload: T;

  maxAttempts?: number;

  priority?: number;

  idempotencyKey?: string;
}

export interface DraftQueueFilters {
  status?: DraftStatus;

  entityType?: DraftEntityType;

  entityId?: string;

  limit?: number;

  offset?: number;
}

export interface DraftQueueStatistics {
  total: number;
  pending: number;
  syncing: number;
  synced: number;
  failed: number;
  cancelled: number;
}

// ============================================================
// ID GENERATOR
// ============================================================

function generateId(): string {
  return (
    "draft_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 11)
  );
}

// ============================================================
// IDEMPOTENCY KEY
// ============================================================

function generateIdempotencyKey(): string {
  return (
    "clf_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 14)
  );
}

// ============================================================
// JSON HELPERS
// ============================================================

function parsePayload<T>(payload: string): T {
  try {
    return JSON.parse(payload) as T;
  } catch {
    throw new Error("Unable to read saved offline draft payload.");
  }
}

// ============================================================
// ROW NORMALIZATION
// ============================================================

function rowToDraft<T = Record<string, unknown>>(
  row: DraftDatabaseRow,
): DraftQueueEntry<T> {
  return {
    id: row.id,

    entityType: row.entity_type,

    entityId: row.entity_id,

    action: row.action,

    payload: parsePayload<T>(row.payload),

    status: row.status,

    attempts: row.attempts,

    maxAttempts: row.max_attempts,

    lastError: row.last_error,

    createdAt: row.created_at,

    updatedAt: row.updated_at,

    nextRetryAt: row.next_retry_at,

    syncedAt: row.synced_at,

    priority: row.priority,

    idempotencyKey: row.idempotency_key,
  };
}

// ============================================================
// CREATE DRAFT
// ============================================================

export async function createDraft<T>(
  options: CreateDraftOptions<T>,
): Promise<DraftQueueEntry<T>> {
  await ensureDatabaseReady();

  const now = new Date().toISOString();

  const id = generateId();

  const idempotencyKey = options.idempotencyKey ?? generateIdempotencyKey();

  const maxAttempts = Math.max(1, Math.min(options.maxAttempts ?? 5, 20));

  const priority = Math.max(0, Math.min(options.priority ?? 0, 100));

  await executeSql(
    `INSERT INTO draft_queue (
      id,
      entity_type,
      entity_id,
      action,
      payload,
      status,
      attempts,
      max_attempts,
      last_error,
      created_at,
      updated_at,
      next_retry_at,
      synced_at,
      priority,
      idempotency_key
    )
    VALUES (?, ?, ?, ?, ?, 'PENDING', 0, ?, NULL, ?, ?, NULL, NULL, ?, ?)`,
    [
      id,
      options.entityType,
      options.entityId ?? null,
      options.action,
      JSON.stringify(options.payload),
      maxAttempts,
      now,
      now,
      priority,
      idempotencyKey,
    ],
  );

  const saved = await getDraftById<T>(id);

  if (!saved) {
    throw new Error("Unable to retrieve the newly created offline draft.");
  }

  return saved;
}

// ============================================================
// GET DRAFT BY ID
// ============================================================

export async function getDraftById<T = Record<string, unknown>>(
  id: string,
): Promise<DraftQueueEntry<T> | null> {
  await ensureDatabaseReady();

  const row = await getOne<DraftDatabaseRow>(
    `SELECT *
     FROM draft_queue
     WHERE id = ?`,
    [id],
  );

  return row ? rowToDraft<T>(row) : null;
}

// ============================================================
// GET DRAFT BY IDEMPOTENCY KEY
// ============================================================

export async function getDraftByIdempotencyKey<T = Record<string, unknown>>(
  key: string,
): Promise<DraftQueueEntry<T> | null> {
  await ensureDatabaseReady();

  const row = await getOne<DraftDatabaseRow>(
    `SELECT *
     FROM draft_queue
     WHERE idempotency_key = ?`,
    [key],
  );

  return row ? rowToDraft<T>(row) : null;
}

// ============================================================
// GET DRAFTS
// ============================================================

export async function getDrafts<T = Record<string, unknown>>(
  filters: DraftQueueFilters = {},
): Promise<DraftQueueEntry<T>[]> {
  await ensureDatabaseReady();

  const conditions: string[] = [];

  const params: (string | number | null)[] = [];

  if (filters.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  if (filters.entityType) {
    conditions.push("entity_type = ?");
    params.push(filters.entityType);
  }

  if (filters.entityId) {
    conditions.push("entity_id = ?");
    params.push(filters.entityId);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500);

  const offset = Math.max(filters.offset ?? 0, 0);

  const rows = await getMany<DraftDatabaseRow>(
    `SELECT *
     FROM draft_queue
     ${whereClause}
     ORDER BY priority DESC, created_at ASC
     LIMIT ?
     OFFSET ?`,
    [...params, limit, offset],
  );

  return rows.map((row) => rowToDraft<T>(row));
}

// ============================================================
// GET PENDING DRAFTS
// ============================================================

export async function getPendingDrafts(limit = 50): Promise<DraftQueueEntry[]> {
  await ensureDatabaseReady();

  const now = new Date().toISOString();

  const safeLimit = Math.min(Math.max(limit, 1), 200);

  const rows = await getMany<DraftDatabaseRow>(
    `SELECT *
     FROM draft_queue
     WHERE status = 'PENDING'
       AND attempts < max_attempts
       AND (
         next_retry_at IS NULL
         OR next_retry_at <= ?
       )
     ORDER BY priority DESC, created_at ASC
     LIMIT ?`,
    [now, safeLimit],
  );

  return rows.map(rowToDraft);
}

// ============================================================
// MARK DRAFT AS SYNCING
// ============================================================

export async function markDraftSyncing(id: string): Promise<void> {
  await ensureDatabaseReady();

  const result = await executeSql(
    `UPDATE draft_queue
     SET status = 'SYNCING',
         updated_at = ?
     WHERE id = ?
       AND status IN ('PENDING', 'FAILED')
       AND attempts < max_attempts`,
    [new Date().toISOString(), id],
  );

  if (result.changes === 0) {
    throw new Error(`Draft ${id} cannot be moved to SYNCING.`);
  }
}

// ============================================================
// MARK DRAFT SYNCED
// ============================================================

export async function markDraftSynced(id: string): Promise<void> {
  await ensureDatabaseReady();

  const now = new Date().toISOString();

  const result = await executeSql(
    `UPDATE draft_queue
     SET status = 'SYNCED',
         synced_at = ?,
         updated_at = ?,
         last_error = NULL,
         next_retry_at = NULL
     WHERE id = ?
       AND status = 'SYNCING'`,
    [now, now, id],
  );

  if (result.changes === 0) {
    throw new Error(`Draft ${id} was not in SYNCING state.`);
  }
}

// ============================================================
// CALCULATE RETRY DELAY
// ============================================================

function calculateRetryDate(attempts: number): string {
  const baseDelay = 30_000;

  const maximumDelay = 60 * 60 * 1000;

  const exponentialDelay = Math.min(
    baseDelay * Math.pow(2, Math.max(0, attempts - 1)),
    maximumDelay,
  );

  const jitter = Math.floor(Math.random() * 5000);

  return new Date(Date.now() + exponentialDelay + jitter).toISOString();
}

// ============================================================
// MARK DRAFT FAILED
// ============================================================

export async function markDraftFailed(
  id: string,
  errorMessage: string,
): Promise<void> {
  await ensureDatabaseReady();

  const draft = await getDraftById(id);

  if (!draft) {
    throw new Error("Draft not found.");
  }

  const attempts = draft.attempts + 1;

  const permanentlyFailed = attempts >= draft.maxAttempts;

  const nextStatus: DraftStatus = permanentlyFailed ? "FAILED" : "PENDING";

  const nextRetryAt = permanentlyFailed ? null : calculateRetryDate(attempts);

  await executeSql(
    `UPDATE draft_queue
     SET status = ?,
         attempts = ?,
         last_error = ?,
         next_retry_at = ?,
         updated_at = ?
     WHERE id = ?`,
    [
      nextStatus,
      attempts,
      errorMessage.slice(0, 2000),
      nextRetryAt,
      new Date().toISOString(),
      id,
    ],
  );
}

// ============================================================
// RETRY FAILED DRAFT
// ============================================================

export async function retryDraft(id: string): Promise<void> {
  await ensureDatabaseReady();

  const draft = await getDraftById(id);

  if (!draft) {
    throw new Error("Draft not found.");
  }

  if (draft.status === "SYNCED" || draft.status === "CANCELLED") {
    throw new Error("This draft cannot be retried.");
  }

  await executeSql(
    `UPDATE draft_queue
     SET status = 'PENDING',
         attempts = 0,
         max_attempts = ?,
         last_error = NULL,
         next_retry_at = NULL,
         updated_at = ?
     WHERE id = ?`,
    [Math.max(draft.maxAttempts, 5), new Date().toISOString(), id],
  );
}

// ============================================================
// CANCEL DRAFT
// ============================================================

export async function cancelDraft(id: string): Promise<void> {
  await ensureDatabaseReady();

  const result = await executeSql(
    `UPDATE draft_queue
     SET status = 'CANCELLED',
         updated_at = ?
     WHERE id = ?
       AND status IN ('PENDING', 'FAILED')`,
    [new Date().toISOString(), id],
  );

  if (result.changes === 0) {
    throw new Error("Draft not found or cannot be cancelled.");
  }
}

// ============================================================
// UPDATE DRAFT PAYLOAD
// ============================================================

export async function updateDraftPayload<T>(
  id: string,
  payload: T,
): Promise<void> {
  await ensureDatabaseReady();

  const result = await executeSql(
    `UPDATE draft_queue
     SET payload = ?,
         status = 'PENDING',
         attempts = 0,
         last_error = NULL,
         next_retry_at = NULL,
         updated_at = ?
     WHERE id = ?
       AND status IN ('PENDING', 'FAILED')`,
    [JSON.stringify(payload), new Date().toISOString(), id],
  );

  if (result.changes === 0) {
    throw new Error("Draft cannot be updated.");
  }
}

// ============================================================
// RECOVER INTERRUPTED SYNC
// ============================================================

export async function recoverInterruptedDrafts(): Promise<number> {
  await ensureDatabaseReady();

  const result = await executeSql(
    `UPDATE draft_queue
     SET status = 'PENDING',
         updated_at = ?,
         last_error = 'Previous synchronization was interrupted.'
     WHERE status = 'SYNCING'`,
    [new Date().toISOString()],
  );

  return result.changes;
}

// ============================================================
// GET DRAFT STATISTICS
// ============================================================

export async function getDraftStatistics(): Promise<DraftQueueStatistics> {
  await ensureDatabaseReady();

  const row = await getOne<{
    total: number;
    pending: number;
    syncing: number;
    synced: number;
    failed: number;
    cancelled: number;
  }>(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN status = 'SYNCING' THEN 1 ELSE 0 END) AS syncing,
       SUM(CASE WHEN status = 'SYNCED' THEN 1 ELSE 0 END) AS synced,
       SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) AS failed,
       SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled
     FROM draft_queue`,
  );

  return {
    total: row?.total ?? 0,
    pending: row?.pending ?? 0,
    syncing: row?.syncing ?? 0,
    synced: row?.synced ?? 0,
    failed: row?.failed ?? 0,
    cancelled: row?.cancelled ?? 0,
  };
}

// ============================================================
// CLEAN OLD SYNCED DRAFTS
// ============================================================

export async function cleanOldSyncedDrafts(days = 30): Promise<number> {
  await ensureDatabaseReady();

  const safeDays = Math.max(1, Math.min(days, 365));

  const cutoff = new Date(
    Date.now() - safeDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const result = await executeSql(
    `DELETE FROM draft_queue
     WHERE status IN ('SYNCED', 'CANCELLED')
       AND updated_at < ?`,
    [cutoff],
  );

  return result.changes;
}

// ============================================================
// CLEAR DRAFT QUEUE
// ============================================================

export async function clearDraftQueue(): Promise<void> {
  await ensureDatabaseReady();

  await executeSql(
    `DELETE FROM draft_queue
     WHERE status IN ('SYNCED', 'CANCELLED')`,
  );
}

// ============================================================
// EXPORT
// ============================================================

const draftQueue = {
  createDraft,

  getDraftById,
  getDraftByIdempotencyKey,
  getDrafts,
  getPendingDrafts,

  markDraftSyncing,
  markDraftSynced,
  markDraftFailed,

  retryDraft,
  cancelDraft,
  updateDraftPayload,

  recoverInterruptedDrafts,

  getDraftStatistics,

  cleanOldSyncedDrafts,
  clearDraftQueue,
};

export default draftQueue;

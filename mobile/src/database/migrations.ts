// mobile/src/database/migrations.ts

import { getDatabase, SQLiteDatabase, DATABASE_VERSION } from "./database";

// ============================================================
// TYPES
// ============================================================

export interface Migration {
  version: number;
  name: string;
  description: string;
  sql: string;
}

export interface MigrationResult {
  previousVersion: number;
  currentVersion: number;
  migrationsApplied: number;
}

// ============================================================
// MIGRATION DEFINITIONS
// ============================================================

const MIGRATIONS: Migration[] = [
  // ----------------------------------------------------------
  // VERSION 1: INITIAL OFFLINE DATABASE
  // ----------------------------------------------------------

  {
    version: 1,

    name: "initial_offline_database",

    description:
      "Creates item cache, draft queue, and synchronization metadata.",

    sql: `
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY NOT NULL,

        title TEXT NOT NULL,

        description TEXT NOT NULL DEFAULT '',

        type TEXT NOT NULL
          CHECK (type IN ('LOST', 'FOUND')),

        status TEXT NOT NULL DEFAULT 'OPEN',

        category_id TEXT,

        category_name TEXT,

        location_id TEXT,

        location_name TEXT,

        latitude REAL,

        longitude REAL,

        image_urls TEXT NOT NULL DEFAULT '[]',

        brand TEXT,

        color TEXT,

        identifying_features TEXT,

        date_lost_or_found TEXT,

        reporter_id TEXT,

        reporter_name TEXT,

        owner_id TEXT,

        raw_data TEXT NOT NULL DEFAULT '{}',

        is_favorite INTEGER NOT NULL DEFAULT 0,

        is_deleted INTEGER NOT NULL DEFAULT 0,

        sync_status TEXT NOT NULL DEFAULT 'SYNCED'
          CHECK (
            sync_status IN (
              'SYNCED',
              'PENDING',
              'FAILED'
            )
          ),

        server_updated_at TEXT,

        cached_at TEXT NOT NULL,

        created_at TEXT,

        updated_at TEXT
      );

      CREATE INDEX IF NOT EXISTS
        idx_items_type
      ON items(type);

      CREATE INDEX IF NOT EXISTS
        idx_items_status
      ON items(status);

      CREATE INDEX IF NOT EXISTS
        idx_items_category
      ON items(category_id);

      CREATE INDEX IF NOT EXISTS
        idx_items_location
      ON items(location_id);

      CREATE INDEX IF NOT EXISTS
        idx_items_cached_at
      ON items(cached_at);

      CREATE INDEX IF NOT EXISTS
        idx_items_sync_status
      ON items(sync_status);

      CREATE INDEX IF NOT EXISTS
        idx_items_created_at
      ON items(created_at);


      CREATE TABLE IF NOT EXISTS draft_queue (
        id TEXT PRIMARY KEY NOT NULL,

        entity_type TEXT NOT NULL,

        entity_id TEXT,

        action TEXT NOT NULL,

        payload TEXT NOT NULL,

        status TEXT NOT NULL DEFAULT 'PENDING'
          CHECK (
            status IN (
              'PENDING',
              'SYNCING',
              'SYNCED',
              'FAILED',
              'CANCELLED'
            )
          ),

        attempts INTEGER NOT NULL DEFAULT 0,

        max_attempts INTEGER NOT NULL DEFAULT 5,

        last_error TEXT,

        created_at TEXT NOT NULL,

        updated_at TEXT NOT NULL,

        next_retry_at TEXT,

        synced_at TEXT,

        priority INTEGER NOT NULL DEFAULT 0,

        idempotency_key TEXT NOT NULL UNIQUE
      );

      CREATE INDEX IF NOT EXISTS
        idx_draft_status
      ON draft_queue(status);

      CREATE INDEX IF NOT EXISTS
        idx_draft_created
      ON draft_queue(created_at);

      CREATE INDEX IF NOT EXISTS
        idx_draft_retry
      ON draft_queue(next_retry_at);

      CREATE INDEX IF NOT EXISTS
        idx_draft_priority
      ON draft_queue(priority DESC, created_at ASC);

      CREATE INDEX IF NOT EXISTS
        idx_draft_entity
      ON draft_queue(entity_type, entity_id);


      CREATE TABLE IF NOT EXISTS sync_metadata (
        key TEXT PRIMARY KEY NOT NULL,

        value TEXT,

        updated_at TEXT NOT NULL
      );


      CREATE TABLE IF NOT EXISTS database_migrations (
        version INTEGER PRIMARY KEY NOT NULL,

        name TEXT NOT NULL,

        applied_at TEXT NOT NULL
      );
    `,
  },
];

// ============================================================
// CURRENT DATABASE VERSION
// ============================================================

export async function getCurrentDatabaseVersion(): Promise<number> {
  const database = await getDatabase();

  const result = await database.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");

  return result?.user_version ?? 0;
}

// ============================================================
// GET MIGRATION HISTORY
// ============================================================

export async function getMigrationHistory(): Promise<
  Array<{
    version: number;
    name: string;
    applied_at: string;
  }>
> {
  const database = await getDatabase();

  const table = await database.getFirstAsync<{
    name: string;
  }>(
    `SELECT name
     FROM sqlite_master
     WHERE type = 'table'
       AND name = 'database_migrations'`,
  );

  if (!table) {
    return [];
  }

  return database.getAllAsync<{
    version: number;
    name: string;
    applied_at: string;
  }>(
    `SELECT version, name, applied_at
     FROM database_migrations
     ORDER BY version ASC`,
  );
}

// ============================================================
// APPLY SINGLE MIGRATION
// ============================================================

async function applyMigration(
  database: SQLiteDatabase,
  migration: Migration,
): Promise<void> {
  await database.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.execAsync(migration.sql);

    await transaction.runAsync(
      `INSERT OR IGNORE INTO database_migrations
         (version, name, applied_at)
         VALUES (?, ?, ?)`,
      [migration.version, migration.name, new Date().toISOString()],
    );

    await transaction.execAsync(`PRAGMA user_version = ${migration.version}`);
  });
}

// ============================================================
// RUN MIGRATIONS
// ============================================================

export async function runMigrations(): Promise<MigrationResult> {
  const database = await getDatabase();

  const previousVersion = await getCurrentDatabaseVersion();

  if (previousVersion > DATABASE_VERSION) {
    throw new Error(
      `Database version ${previousVersion} is newer than supported version ${DATABASE_VERSION}.`,
    );
  }

  let applied = 0;

  const pendingMigrations = MIGRATIONS.filter(
    (migration) => migration.version > previousVersion,
  ).sort((a, b) => a.version - b.version);

  for (const migration of pendingMigrations) {
    await applyMigration(database, migration);

    applied += 1;
  }

  const currentVersion = await getCurrentDatabaseVersion();

  return {
    previousVersion,

    currentVersion,

    migrationsApplied: applied,
  };
}

// ============================================================
// ENSURE DATABASE READY
// ============================================================

let initializationPromise: Promise<MigrationResult> | null = null;

export async function initializeDatabase(): Promise<MigrationResult> {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = runMigrations();

  try {
    return await initializationPromise;
  } finally {
    initializationPromise = null;
  }
}

// ============================================================
// CHECK DATABASE INITIALIZATION
// ============================================================

export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const version = await getCurrentDatabaseVersion();

    return version >= DATABASE_VERSION;
  } catch {
    return false;
  }
}

// ============================================================
// ENSURE DATABASE IS INITIALIZED
// ============================================================

export async function ensureDatabaseReady(): Promise<void> {
  const initialized = await isDatabaseInitialized();

  if (!initialized) {
    await initializeDatabase();
  }
}

// ============================================================
// GET PENDING MIGRATIONS
// ============================================================

export function getPendingMigrations(currentVersion: number): Migration[] {
  return MIGRATIONS.filter((migration) => migration.version > currentVersion);
}

// ============================================================
// GET AVAILABLE MIGRATIONS
// ============================================================

export function getAvailableMigrations(): Migration[] {
  return [...MIGRATIONS];
}

// ============================================================
// DATABASE INITIALIZATION REPORT
// ============================================================

export async function getMigrationReport(): Promise<{
  currentVersion: number;
  supportedVersion: number;
  initialized: boolean;
  history: Awaited<ReturnType<typeof getMigrationHistory>>;
}> {
  const currentVersion = await getCurrentDatabaseVersion();

  const history = await getMigrationHistory();

  return {
    currentVersion,

    supportedVersion: DATABASE_VERSION,

    initialized: currentVersion >= DATABASE_VERSION,

    history,
  };
}

// ============================================================
// EXPORT
// ============================================================

const migrationService = {
  initializeDatabase,

  runMigrations,

  ensureDatabaseReady,

  isDatabaseInitialized,

  getCurrentDatabaseVersion,

  getMigrationHistory,

  getPendingMigrations,

  getAvailableMigrations,

  getMigrationReport,
};

export default migrationService;

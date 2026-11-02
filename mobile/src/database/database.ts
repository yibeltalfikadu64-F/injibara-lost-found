// mobile/src/database/database.ts

import * as SQLite from "expo-sqlite";

// ============================================================
// DATABASE CONFIGURATION
// ============================================================

export const DATABASE_NAME = "injibara_lost_found.db";

export const DATABASE_VERSION = 1;

export const DATABASE_CONFIG = {
  enableChangeListener: true,
  useNewConnection: false,
} as const;

// ============================================================
// DATABASE TYPES
// ============================================================

export type SQLiteDatabase = SQLite.SQLiteDatabase;

export interface DatabaseResult {
  lastInsertRowId: number;
  changes: number;
}

export interface DatabaseHealth {
  connected: boolean;
  databaseName: string;
  version: number;
  itemCount: number;
  pendingDraftCount: number;
}

// ============================================================
// DATABASE CONNECTION
// ============================================================

let databaseInstance: SQLiteDatabase | null = null;

let openingPromise: Promise<SQLiteDatabase> | null = null;

// ============================================================
// OPEN DATABASE
// ============================================================

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (databaseInstance) {
    return databaseInstance;
  }

  if (openingPromise) {
    return openingPromise;
  }

  openingPromise = SQLite.openDatabaseAsync(DATABASE_NAME, {
    useNewConnection: DATABASE_CONFIG.useNewConnection,
  });

  try {
    databaseInstance = await openingPromise;

    await configureDatabase(databaseInstance);

    return databaseInstance;
  } catch (error) {
    databaseInstance = null;

    throw new Error(
      `Unable to open local database: ${getDatabaseError(error)}`,
    );
  } finally {
    openingPromise = null;
  }
}

// ============================================================
// DATABASE CONFIGURATION
// ============================================================

async function configureDatabase(database: SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA busy_timeout = 5000;
  `);
}

// ============================================================
// CLOSE DATABASE
// ============================================================

export async function closeDatabase(): Promise<void> {
  if (!databaseInstance) {
    return;
  }

  const currentDatabase = databaseInstance;

  databaseInstance = null;

  await currentDatabase.closeAsync();
}

// ============================================================
// CHECK DATABASE CONNECTION
// ============================================================

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const database = await getDatabase();

    const result = await database.getFirstAsync<{
      result: number;
    }>("SELECT 1 AS result");

    return result?.result === 1;
  } catch (error) {
    console.error("Database connection check failed:", error);

    return false;
  }
}

// ============================================================
// EXECUTE SQL
// ============================================================

export async function executeSql(
  sql: string,
  params: SQLite.SQLiteBindValue[] = [],
): Promise<DatabaseResult> {
  const database = await getDatabase();

  const result = await database.runAsync(sql, params);

  return {
    lastInsertRowId: result.lastInsertRowId,
    changes: result.changes,
  };
}

// ============================================================
// EXECUTE MULTIPLE SQL STATEMENTS
// ============================================================

export async function executeSqlBatch(sql: string): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(sql);
}

// ============================================================
// GET ONE ROW
// ============================================================

export async function getOne<T>(
  sql: string,
  params: SQLite.SQLiteBindValue[] = [],
): Promise<T | null> {
  const database = await getDatabase();

  return database.getFirstAsync<T>(sql, params);
}

// ============================================================
// GET MULTIPLE ROWS
// ============================================================

export async function getMany<T>(
  sql: string,
  params: SQLite.SQLiteBindValue[] = [],
): Promise<T[]> {
  const database = await getDatabase();

  return database.getAllAsync<T>(sql, params);
}

// ============================================================
// RUN TRANSACTION
// ============================================================

export async function withTransaction<T>(
  callback: (database: SQLiteDatabase) => Promise<T>,
): Promise<T> {
  const database = await getDatabase();

  let callbackResult: T | undefined;

  await database.withExclusiveTransactionAsync(async (transaction) => {
    callbackResult = await callback(transaction as SQLiteDatabase);
  });

  return callbackResult as T;
}

// ============================================================
// DATABASE TABLE CHECK
// ============================================================

export async function tableExists(tableName: string): Promise<boolean> {
  const database = await getDatabase();

  const result = await database.getFirstAsync<{
    name: string;
  }>(
    `SELECT name
     FROM sqlite_master
     WHERE type = 'table'
       AND name = ?`,
    [tableName],
  );

  return result !== null;
}

// ============================================================
// DATABASE TABLE INFORMATION
// ============================================================

export async function getTableColumns(tableName: string): Promise<string[]> {
  const database = await getDatabase();

  // Only allow a simple SQL identifier.
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    throw new Error("Invalid table name.");
  }

  const rows = await database.getAllAsync<{
    name: string;
  }>(`PRAGMA table_info(${tableName})`);

  return rows.map((row) => row.name);
}

// ============================================================
// DATABASE HEALTH
// ============================================================

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  const database = await getDatabase();

  const itemResult = await database.getFirstAsync<{
    total: number;
  }>("SELECT COUNT(*) AS total FROM items");

  const draftResult = await database.getFirstAsync<{
    total: number;
  }>(
    `SELECT COUNT(*) AS total
       FROM draft_queue
       WHERE status IN ('PENDING', 'SYNCING', 'FAILED')`,
  );

  const versionResult = await database.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");

  return {
    connected: true,

    databaseName: DATABASE_NAME,

    version: versionResult?.user_version ?? 0,

    itemCount: itemResult?.total ?? 0,

    pendingDraftCount: draftResult?.total ?? 0,
  };
}

// ============================================================
// CLEAR LOCAL DATA
// ============================================================

export async function clearLocalApplicationData(): Promise<void> {
  const database = await getDatabase();

  // This function deliberately does not delete the database
  // file or migration history.
  await withTransaction(async (transaction) => {
    await transaction.runAsync("DELETE FROM draft_queue");

    await transaction.runAsync("DELETE FROM items");
  });
}

// ============================================================
// ERROR NORMALIZATION
// ============================================================

export function getDatabaseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown SQLite database error.";
}

// ============================================================
// EXPORT DEFAULT
// ============================================================

const databaseService = {
  getDatabase,

  closeDatabase,

  checkDatabaseConnection,

  executeSql,
  executeSqlBatch,

  getOne,
  getMany,

  withTransaction,

  tableExists,
  getTableColumns,

  getDatabaseHealth,

  clearLocalApplicationData,

  getDatabaseError,
};

export default databaseService;

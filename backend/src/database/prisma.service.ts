/**
 * Injibara Campus Lost & Found
 *
 * PRISMA DATABASE SERVICE
 *
 * Technology:
 * - Prisma ORM 7
 * - PostgreSQL
 * - @prisma/adapter-pg
 * - pg connection pool
 *
 * Responsibilities:
 * - Initialize Prisma.
 * - Connect to PostgreSQL.
 * - Disconnect safely.
 * - Check database health.
 * - Execute database transactions.
 * - Manage connection-pool settings.
 * - Handle database errors.
 *
 * Generated Prisma client:
 * backend/generated/prisma/client.js
 */

import { PrismaClient, Prisma } from "../../generated/prisma/client.js";

import { PrismaPg } from "@prisma/adapter-pg";

// ======================================================
// 1. SERVICE CONFIGURATION
// ======================================================

export interface PrismaServiceOptions {
  /**
   * PostgreSQL connection string.
   *
   * Example:
   * postgresql://postgres:password@localhost:5432/campus_lost_found
   *
   * Prefer DATABASE_URL from the environment.
   */

  connectionString?: string;

  /**
   * Maximum number of connections in the pool.
   */

  maxConnections?: number;

  /**
   * How long an idle connection remains in the pool.
   */

  idleTimeoutMillis?: number;

  /**
   * How long the application waits for a connection.
   */

  connectionTimeoutMillis?: number;

  /**
   * Prisma log levels.
   */

  logLevels?: Prisma.LogLevel[];
}

// ======================================================
// 2. DATABASE STATUS
// ======================================================

export interface DatabaseHealth {
  status: "connected" | "disconnected" | "error";
  database: "postgresql";
  checkedAt: string;
  responseTimeMs?: number;
  message?: string;
}

// ======================================================
// 3. TRANSACTION OPTIONS
// ======================================================

export interface DatabaseTransactionOptions {
  maxWait?: number;
  timeout?: number;
}

// ======================================================
// 4. PRISMA SERVICE
// ======================================================

export class PrismaService extends PrismaClient {
  private connected = false;

  private disconnecting = false;

  private shutdownPromise: Promise<void> | null = null;

  private readonly databaseName = "postgresql";

  // ====================================================
  // 5. CONSTRUCTOR
  // ====================================================

  constructor(options: PrismaServiceOptions = {}) {
    const connectionString =
      options.connectionString ?? process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        "[DATABASE] DATABASE_URL is not configured. " +
          "Add a valid PostgreSQL connection string to backend/.env.",
      );
    }

    if (
      !connectionString.startsWith("postgresql://") &&
      !connectionString.startsWith("postgres://")
    ) {
      throw new Error(
        "[DATABASE] DATABASE_URL must be a PostgreSQL connection string.",
      );
    }

    /**
     * Prisma 7 requires a driver adapter for this
     * PostgreSQL configuration.
     *
     * PrismaPg uses the node-postgres driver.
     */

    const adapter = new PrismaPg({
      connectionString,

      max: options.maxConnections ?? 10,

      idleTimeoutMillis: options.idleTimeoutMillis ?? 30_000,

      connectionTimeoutMillis: options.connectionTimeoutMillis ?? 10_000,
    });

    super({
      adapter,

      log: options.logLevels ?? ["error", "warn"],
    });
  }

  // ====================================================
  // 6. CONNECT TO DATABASE
  // ====================================================

  /**
   * Establishes a connection to PostgreSQL.
   *
   * Call this once during application startup.
   */

  async onModuleInit(): Promise<void> {
    if (this.connected) {
      return;
    }

    if (this.disconnecting) {
      throw new Error(
        "[DATABASE] Cannot connect while database shutdown is in progress.",
      );
    }

    console.info("[DATABASE] Connecting to PostgreSQL...");

    try {
      await this.$connect();

      this.connected = true;

      console.info(
        "[DATABASE] PostgreSQL connection established successfully.",
      );
    } catch (error) {
      this.connected = false;

      console.error(
        "[DATABASE] PostgreSQL connection failed:",
        this.getSafeErrorMessage(error),
      );

      throw error;
    }
  }

  // ====================================================
  // 7. DISCONNECT FROM DATABASE
  // ====================================================

  /**
   * Safely disconnects Prisma from PostgreSQL.
   *
   * Multiple calls share the same shutdown promise.
   */

  async onModuleDestroy(): Promise<void> {
    if (this.shutdownPromise) {
      return this.shutdownPromise;
    }

    this.disconnecting = true;

    this.shutdownPromise = (async () => {
      try {
        console.info("[DATABASE] Disconnecting from PostgreSQL...");

        await this.$disconnect();

        this.connected = false;

        console.info("[DATABASE] PostgreSQL disconnected successfully.");
      } catch (error) {
        console.error(
          "[DATABASE] Error during disconnection:",
          this.getSafeErrorMessage(error),
        );

        throw error;
      } finally {
        this.connected = false;
      }
    })();

    return this.shutdownPromise;
  }

  // ====================================================
  // 8. CHECK CONNECTION STATUS
  // ====================================================

  isConnected(): boolean {
    return this.connected;
  }

  // ====================================================
  // 9. DATABASE HEALTH CHECK
  // ====================================================

  /**
   * Executes a lightweight SQL query to verify
   * that PostgreSQL is responding.
   */

  async healthCheck(): Promise<DatabaseHealth> {
    const startedAt = Date.now();

    try {
      await this.$queryRaw`
        SELECT 1
      `;

      return {
        status: "connected",
        database: "postgresql",
        checkedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - startedAt,
        message: "Database connection is healthy.",
      };
    } catch (error) {
      return {
        status: "error",
        database: "postgresql",
        checkedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - startedAt,
        message: this.getSafeErrorMessage(error),
      };
    }
  }

  // ====================================================
  // 10. VERIFY DATABASE CONNECTION
  // ====================================================

  /**
   * Throws when PostgreSQL cannot be reached.
   */

  async verifyConnection(): Promise<void> {
    const health = await this.healthCheck();

    if (health.status !== "connected") {
      throw new Error(
        `[DATABASE] Connection verification failed: ${health.message ?? "Unknown error"}`,
      );
    }
  }

  // ====================================================
  // 11. EXECUTE TRANSACTION
  // ====================================================

  /**
   * Runs multiple database operations in one
   * atomic transaction.
   *
   * Example:
   *
   * await prismaService.runInTransaction(
   *   async (transaction) => {
   *     await transaction.user.create(...);
   *     await transaction.auditLog.create(...);
   *   }
   * );
   */

  async runInTransaction<T>(
    callback: (transaction: Prisma.TransactionClient) => Promise<T>,
    options: DatabaseTransactionOptions = {},
  ): Promise<T> {
    if (this.disconnecting) {
      throw new Error("[DATABASE] Cannot start a transaction during shutdown.");
    }

    return this.$transaction(
      async (transaction) => {
        return callback(transaction);
      },
      {
        maxWait: options.maxWait ?? 5000,
        timeout: options.timeout ?? 10000,
      },
    );
  }

  // ====================================================
  // 12. EXECUTE READ-ONLY TRANSACTION
  // ====================================================

  /**
   * Use this for related read operations that should
   * execute inside one transaction.
   *
   * Note: The transaction is not enforced as
   * read-only by PostgreSQL here. Only use it for reads.
   */

  async runReadTransaction<T>(
    callback: (transaction: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(
      async (transaction) => {
        return callback(transaction);
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );
  }

  // ====================================================
  // 13. EXECUTE MULTIPLE OPERATIONS
  // ====================================================

  /**
   * Executes supported Prisma promises in a
   * single transaction.
   *
   * Example:
   *
   * const [users, items] =
   *   await prismaService.executeBatch([
   *     prisma.user.count(),
   *     prisma.item.count(),
   *   ]);
   */

  async executeBatch<T extends readonly unknown[]>(operations: {
    [K in keyof T]: Prisma.PrismaPromise<T[K]>;
  }): Promise<T> {
    return this.$transaction(
      operations as Prisma.PrismaPromise<unknown>[],
    ) as Promise<T>;
  }

  // ====================================================
  // 14. GET DATABASE INFORMATION
  // ====================================================

  async getDatabaseInformation() {
    const result = await this.$queryRaw<
      Array<{
        current_database: string;
        current_user: string;
        server_version: string;
      }>
    >`
      SELECT
        current_database() AS current_database,
        current_user AS current_user,
        version() AS server_version
    `;

    const information = result[0];

    if (!information) {
      throw new Error("[DATABASE] Could not retrieve database information.");
    }

    return {
      database: information.current_database,
      user: information.current_user,
      version: information.server_version,
    };
  }

  // ====================================================
  // 15. CHECK DATABASE RESPONSE TIME
  // ====================================================

  async getResponseTime(): Promise<number> {
    const startedAt = performance.now();

    await this.$queryRaw`
      SELECT 1
    `;

    return Number((performance.now() - startedAt).toFixed(2));
  }

  // ====================================================
  // 16. CHECK REQUIRED DATABASE TABLES
  // ====================================================

  /**
   * Checks that the core tables used by this
   * application exist.
   *
   * This method does not create, modify, or delete
   * any database tables.
   */

  async checkRequiredTables() {
    const requiredTables = [
      "User",
      "Category",
      "Location",
      "Item",
      "Claim",
      "Notification",
      "RefreshToken",
      "PasswordResetToken",
      "Announcement",
      "AuditLog",
    ];

    const existingTables = await this.$queryRaw<
      Array<{
        table_name: string;
      }>
    >`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
      `;

    const existingNames = new Set(
      existingTables.map((table) => table.table_name),
    );

    const missingTables = requiredTables.filter(
      (table) => !existingNames.has(table),
    );

    return {
      success: missingTables.length === 0,
      requiredTables,
      existingTables: [...existingNames],
      missingTables,
    };
  }

  // ====================================================
  // 17. DATABASE AVAILABILITY
  // ====================================================

  async isDatabaseAvailable(): Promise<boolean> {
    try {
      await this.$queryRaw`
        SELECT 1
      `;

      return true;
    } catch {
      return false;
    }
  }

  // ====================================================
  // 18. GET SAFE ERROR MESSAGE
  // ====================================================

  /**
   * Do not return DATABASE_URL or credentials
   * in API responses or normal application logs.
   */

  private getSafeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message;

      /**
       * Remove connection strings if they happen
       * to appear in a driver error message.
       */

      return message.replace(
        /(?:postgresql|postgres):\/\/[^\s]+/gi,
        "[DATABASE_URL REDACTED]",
      );
    }

    return "Unknown database error.";
  }

  // ====================================================
  // 19. GET DATABASE TYPE
  // ====================================================

  getDatabaseType(): string {
    return this.databaseName;
  }

  // ====================================================
  // 20. GET CONNECTION STATE
  // ====================================================

  getConnectionState() {
    return {
      connected: this.connected,
      disconnecting: this.disconnecting,
      database: this.databaseName,
    };
  }
}

// ======================================================
// 21. DEFAULT EXPORT
// ======================================================

export default PrismaService;

/**
 * Injibara Campus Lost & Found
 *
 * PRISMA DATABASE MODULE
 *
 * Responsibilities:
 * - Create PrismaService.
 * - Initialize the database connection.
 * - Expose the Prisma client.
 * - Verify database availability.
 * - Check required database tables.
 * - Manage application shutdown.
 *
 * This is an Express application module,
 * not a NestJS @Module().
 */

import { PrismaService } from "./prisma.service.js";

import type { PrismaServiceOptions, DatabaseHealth } from "./prisma.service.js";

// ======================================================
// 1. MODULE OPTIONS
// ======================================================

export interface PrismaModuleOptions extends PrismaServiceOptions {
  /**
   * Automatically verify the connection
   * after initialization.
   */

  verifyConnection?: boolean;

  /**
   * Check whether the required application
   * tables exist during startup.
   *
   * This does not create or modify tables.
   */

  checkTables?: boolean;
}

// ======================================================
// 2. MODULE STATUS
// ======================================================

export interface PrismaModuleStatus {
  initialized: boolean;
  connected: boolean;
  shuttingDown: boolean;
  database: string;
}

// ======================================================
// 3. INITIALIZATION RESULT
// ======================================================

export interface PrismaInitializationResult {
  success: boolean;
  message: string;
  health: DatabaseHealth;
  tableCheck?: {
    success: boolean;
    missingTables: string[];
  };
}

// ======================================================
// 4. PRISMA MODULE
// ======================================================

export class PrismaModule {
  private readonly prisma: PrismaService;

  private initialized = false;

  private shuttingDown = false;

  private initializationPromise: Promise<PrismaInitializationResult> | null =
    null;

  private shutdownPromise: Promise<void> | null = null;

  private readonly options: PrismaModuleOptions;

  // ====================================================
  // 5. CONSTRUCTOR
  // ====================================================

  constructor(options: PrismaModuleOptions = {}) {
    this.options = options;

    this.prisma = new PrismaService({
      connectionString: options.connectionString,
      maxConnections: options.maxConnections,
      idleTimeoutMillis: options.idleTimeoutMillis,
      connectionTimeoutMillis: options.connectionTimeoutMillis,
      logLevels: options.logLevels,
    });
  }

  // ====================================================
  // 6. INITIALIZE DATABASE MODULE
  // ====================================================

  /**
   * Call once before starting the HTTP server.
   *
   * If initialization is requested more than once,
   * the same promise is reused.
   */

  async initialize(): Promise<PrismaInitializationResult> {
    if (this.shuttingDown) {
      throw new Error(
        "[PRISMA MODULE] Cannot initialize while shutdown is in progress.",
      );
    }

    if (this.initialized) {
      const health = await this.prisma.healthCheck();

      return {
        success: health.status === "connected",
        message: "Database module is already initialized.",
        health,
      };
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();

    try {
      return await this.initializationPromise;
    } catch (error) {
      this.initializationPromise = null;

      throw error;
    }
  }

  // ====================================================
  // 7. PERFORM INITIALIZATION
  // ====================================================

  private async performInitialization(): Promise<PrismaInitializationResult> {
    console.info("[PRISMA MODULE] Initializing database module...");

    try {
      // Connect to PostgreSQL.
      await this.prisma.onModuleInit();

      // Verify the connection if requested.
      if (this.options.verifyConnection !== false) {
        await this.prisma.verifyConnection();
      }

      // Check application tables if requested.
      let tableCheck: PrismaInitializationResult["tableCheck"];

      if (this.options.checkTables === true) {
        tableCheck = await this.prisma.checkRequiredTables();

        if (!tableCheck.success) {
          throw new Error(
            `[PRISMA MODULE] Missing database tables: ${tableCheck.missingTables.join(", ")}. Run your reviewed Prisma migrations before starting the application.`,
          );
        }
      }

      const health = await this.prisma.healthCheck();

      if (health.status !== "connected") {
        throw new Error("[PRISMA MODULE] PostgreSQL health check failed.");
      }

      this.initialized = true;

      console.info("[PRISMA MODULE] Database module initialized successfully.");

      return {
        success: true,
        message: "PostgreSQL database initialized successfully.",
        health,
        tableCheck,
      };
    } catch (error) {
      this.initialized = false;

      console.error(
        "[PRISMA MODULE] Database initialization failed:",
        error instanceof Error ? error.message : "Unknown database error",
      );

      // Release resources if connection was partially
      // established before initialization failed.
      await this.prisma.onModuleDestroy().catch(() => undefined);

      throw error;
    }
  }

  // ====================================================
  // 8. GET PRISMA CLIENT
  // ====================================================

  /**
   * Returns the initialized Prisma client.
   *
   * Other feature modules should receive this same
   * client instead of creating their own instances.
   */

  getClient(): PrismaService {
    if (!this.initialized) {
      throw new Error(
        "[PRISMA MODULE] Database is not initialized. Call initialize() first.",
      );
    }

    if (this.shuttingDown) {
      throw new Error("[PRISMA MODULE] Database is shutting down.");
    }

    return this.prisma;
  }

  // ====================================================
  // 9. GET SERVICE INSTANCE
  // ====================================================

  /**
   * Returns the service instance.
   *
   * Use this only when you need service-specific
   * methods such as healthCheck().
   */

  getService(): PrismaService {
    return this.prisma;
  }

  // ====================================================
  // 10. CHECK DATABASE HEALTH
  // ====================================================

  async healthCheck(): Promise<DatabaseHealth> {
    if (!this.initialized) {
      return {
        status: "disconnected",
        database: "postgresql",
        checkedAt: new Date().toISOString(),
        message: "Database module has not been initialized.",
      };
    }

    return this.prisma.healthCheck();
  }

  // ====================================================
  // 11. VERIFY DATABASE
  // ====================================================

  async verifyConnection(): Promise<boolean> {
    try {
      await this.prisma.verifyConnection();

      return true;
    } catch {
      return false;
    }
  }

  // ====================================================
  // 12. CHECK REQUIRED TABLES
  // ====================================================

  async checkRequiredTables() {
    if (!this.initialized) {
      throw new Error(
        "[PRISMA MODULE] Initialize the database before checking tables.",
      );
    }

    return this.prisma.checkRequiredTables();
  }

  // ====================================================
  // 13. GET DATABASE INFORMATION
  // ====================================================

  async getDatabaseInformation() {
    if (!this.initialized) {
      throw new Error("[PRISMA MODULE] Database is not initialized.");
    }

    return this.prisma.getDatabaseInformation();
  }

  // ====================================================
  // 14. GET CONNECTION STATUS
  // ====================================================

  getStatus(): PrismaModuleStatus {
    return {
      initialized: this.initialized,
      connected: this.prisma.isConnected(),
      shuttingDown: this.shuttingDown,
      database: this.prisma.getDatabaseType(),
    };
  }

  // ====================================================
  // 15. DISCONNECT DATABASE
  // ====================================================

  /**
   * Disconnects PostgreSQL safely.
   *
   * Call this after the HTTP server has stopped
   * accepting requests.
   */

  async shutdown(): Promise<void> {
    if (this.shutdownPromise) {
      return this.shutdownPromise;
    }

    if (this.shuttingDown) {
      return;
    }

    this.shuttingDown = true;

    console.info("[PRISMA MODULE] Starting database shutdown...");

    this.shutdownPromise = (async () => {
      try {
        await this.prisma.onModuleDestroy();

        console.info("[PRISMA MODULE] Database shutdown completed.");
      } catch (error) {
        console.error(
          "[PRISMA MODULE] Database shutdown failed:",
          error instanceof Error ? error.message : "Unknown error",
        );

        throw error;
      } finally {
        this.initialized = false;
      }
    })();

    return this.shutdownPromise;
  }

  // ====================================================
  // 16. DESTROY MODULE
  // ====================================================

  /**
   * Alias for shutdown().
   *
   * Useful when integrating with an application
   * lifecycle manager.
   */

  async destroy(): Promise<void> {
    await this.shutdown();
  }
}

// ======================================================
// 17. MODULE FACTORY
// ======================================================

/**
 * Creates a new PrismaModule instance.
 *
 * Example:
 *
 * const database = createPrismaModule();
 * await database.initialize();
 * const prisma = database.getClient();
 */

export function createPrismaModule(
  options: PrismaModuleOptions = {},
): PrismaModule {
  return new PrismaModule(options);
}

// ======================================================
// 18. DEFAULT EXPORT
// ======================================================

export default PrismaModule;

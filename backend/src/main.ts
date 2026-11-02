/**
 * Injibara Campus Lost & Found
 *
 * Backend Entry Point
 *
 * Responsibilities:
 * - Load environment variables.
 * - Validate server configuration.
 * - Initialize the Express application.
 * - Start the HTTP server.
 * - Handle HTTP server errors.
 * - Handle process-level errors.
 * - Perform graceful shutdown.
 */

// ======================================================
// 1. LOAD ENVIRONMENT VARIABLES
// ======================================================

import "dotenv/config";

// ======================================================
// 2. IMPORTS
// ======================================================

import type { Server } from "node:http";

import { createApp } from "./app.module.js";

// ======================================================
// 3. ENVIRONMENT CONFIGURATION
// ======================================================

const NODE_ENV = process.env.NODE_ENV ?? "development";

const HOST = process.env.HOST ?? "0.0.0.0";

const DEFAULT_PORT = 5000;

const API_PREFIX = process.env.API_PREFIX ?? "/api/v1";

// ======================================================
// 4. PORT VALIDATION
// ======================================================

function getPort(): number {
  const rawPort = process.env.PORT;

  if (!rawPort) {
    return DEFAULT_PORT;
  }

  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid PORT value: ${rawPort}. PORT must be between 1 and 65535.`,
    );
  }

  return port;
}

// ======================================================
// 5. SERVER STATE
// ======================================================

let server: Server | undefined;

let isShuttingDown = false;

// ======================================================
// 6. START APPLICATION
// ======================================================

async function bootstrap(): Promise<void> {
  console.log("\n==========================================");
  console.log("INJIBARA CAMPUS LOST & FOUND");
  console.log("BACKEND STARTING");
  console.log("==========================================\n");

  // ----------------------------------------------
  // Validate configuration
  // ----------------------------------------------

  const port = getPort();

  if (!process.env.DATABASE_URL) {
    console.warn("[WARNING] DATABASE_URL is not configured.");
  }

  console.log(`[INFO] Environment: ${NODE_ENV}`);
  console.log(`[INFO] Host: ${HOST}`);
  console.log(`[INFO] Port: ${port}`);

  // ----------------------------------------------
  // Create Express application
  // ----------------------------------------------

  const app = createApp();

  // ----------------------------------------------
  // Start HTTP server
  // ----------------------------------------------

  server = app.listen(port, HOST, () => {
    console.log("\n==========================================");
    console.log("[SUCCESS] Backend server started.");
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Host: ${HOST}`);
    console.log(`Port: ${port}`);
    console.log(`Local health: http://localhost:${port}/health`);
    console.log(`API base: http://localhost:${port}${API_PREFIX}`);
    console.log("==========================================\n");

    if (HOST === "0.0.0.0") {
      console.log("[INFO] Server is listening on network interfaces.");

      console.log(
        "[INFO] Use your computer's LAN IP address for physical-device testing.",
      );
    }
  });

  // ----------------------------------------------
  // Handle HTTP server errors
  // ----------------------------------------------

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`[FATAL] Port ${port} is already in use.`);
    } else if (error.code === "EACCES") {
      console.error(
        `[FATAL] Permission denied when trying to use port ${port}.`,
      );
    } else {
      console.error("[FATAL] HTTP server error:", error);
    }

    process.exitCode = 1;

    void shutdown("HTTP server error");
  });
}

// ======================================================
// 7. GRACEFUL SHUTDOWN
// ======================================================

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    console.log("[SHUTDOWN] Shutdown is already in progress.");

    return;
  }

  isShuttingDown = true;

  console.log(`\n[SHUTDOWN] Received ${signal}.`);

  if (!server) {
    console.log("[SHUTDOWN] HTTP server was not started.");

    return;
  }

  server.close((error?: Error) => {
    if (error) {
      console.error("[SHUTDOWN] Server shutdown failed:", error);

      process.exitCode = 1;

      return;
    }

    console.log("[SHUTDOWN] HTTP server closed successfully.");

    console.log("[SHUTDOWN] Application stopped.");
  });
}

// ======================================================
// 8. PROCESS SIGNAL HANDLERS
// ======================================================

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

// ======================================================
// 9. UNHANDLED REJECTION HANDLER
// ======================================================

process.on("unhandledRejection", (reason: unknown) => {
  console.error("[UNHANDLED REJECTION]", reason);

  process.exitCode = 1;

  void shutdown("unhandledRejection");
});

// ======================================================
// 10. UNCAUGHT EXCEPTION HANDLER
// ======================================================

process.once("uncaughtException", (error: Error) => {
  console.error("[UNCAUGHT EXCEPTION]", error);

  process.exit(1);
});

// ======================================================
// 11. BOOTSTRAP APPLICATION
// ======================================================

bootstrap().catch((error: unknown) => {
  console.error("\n[STARTUP ERROR]", error);

  process.exitCode = 1;

  void shutdown("startup error");
});

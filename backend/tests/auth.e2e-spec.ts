/**
 * Injibara Campus Lost & Found
 *
 * AUTHENTICATION END-TO-END TESTS
 *
 * Test runner: Node.js test runner
 * TypeScript runner: tsx
 *
 * Tests:
 * - API availability
 * - Successful login
 * - Access token response
 * - Current authenticated user
 * - Invalid login credentials
 * - Protected route authorization
 * - Missing token handling
 *
 * Environment:
 * E2E_BASE_URL
 * E2E_EMAIL
 * E2E_PASSWORD
 *
 * Optional:
 * E2E_LOGIN_PATH
 * E2E_ME_PATH
 * E2E_INVALID_PASSWORD
 */

import { describe, it, before } from "node:test";

import assert from "node:assert/strict";

// ======================================================
// 1. TEST CONFIGURATION
// ======================================================

const BASE_URL = (process.env.E2E_BASE_URL ?? "http://localhost:5000").replace(
  /\/+$/,
  "",
);

const API_PREFIX = "/api/v1";

const LOGIN_PATH = process.env.E2E_LOGIN_PATH ?? `${API_PREFIX}/auth/login`;

const ME_PATH = process.env.E2E_ME_PATH ?? `${API_PREFIX}/auth/me`;

const TEST_EMAIL = process.env.E2E_EMAIL ?? "";

const TEST_PASSWORD = process.env.E2E_PASSWORD ?? "";

const INVALID_PASSWORD =
  process.env.E2E_INVALID_PASSWORD ?? "DefinitelyWrongPassword_123!";

const TESTS_ENABLED = Boolean(TEST_EMAIL && TEST_PASSWORD);

// ======================================================
// 2. RESPONSE TYPES
// ======================================================

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  data?: unknown;
  accessToken?: string;
  token?: string;
  user?: Record<string, unknown>;
  [key: string]: unknown;
}

interface HttpResult {
  status: number;
  ok: boolean;
  headers: Headers;
  body: ApiResponse;
  rawText: string;
}

// ======================================================
// 3. HTTP REQUEST HELPER
// ======================================================

async function request(
  path: string,
  options: RequestInit = {},
): Promise<HttpResult> {
  const url = `${BASE_URL}${path}`;

  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    signal: options.signal ?? AbortSignal.timeout(15_000),
  });

  const rawText = await response.text();

  let body: ApiResponse = {};

  if (rawText) {
    try {
      body = JSON.parse(rawText) as ApiResponse;
    } catch {
      body = {
        message: rawText,
      };
    }
  }

  return {
    status: response.status,
    ok: response.ok,
    headers: response.headers,
    body,
    rawText,
  };
}

// ======================================================
// 4. JSON POST HELPER
// ======================================================

async function postJson(
  path: string,
  data: Record<string, unknown>,
): Promise<HttpResult> {
  return request(path, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(data),
  });
}

// ======================================================
// 5. TOKEN EXTRACTION
// ======================================================

/**
 * Supports common API response structures:
 *
 * {
 *   accessToken: "..."
 * }
 *
 * {
 *   data: {
 *     accessToken: "..."
 *   }
 * }
 *
 * {
 *   data: {
 *     tokens: {
 *       accessToken: "..."
 *     }
 *   }
 * }
 *
 * The test deliberately does not print the token.
 */

function extractAccessToken(value: unknown, depth = 0): string | null {
  if (!value || typeof value !== "object" || depth > 5) {
    return null;
  }

  const record = value as Record<string, unknown>;

  const candidates = [record.accessToken, record.access_token];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 20) {
      return candidate;
    }
  }

  for (const key of ["data", "tokens", "result", "authentication"]) {
    const token = extractAccessToken(record[key], depth + 1);

    if (token) {
      return token;
    }
  }

  return null;
}

// ======================================================
// 6. AUTHORIZATION HELPER
// ======================================================

function bearerHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// ======================================================
// 7. TEST STATE
// ======================================================

let accessToken: string | null = null;

let loginResponse: HttpResult | null = null;

// ======================================================
// 8. AUTHENTICATION TEST SUITE
// ======================================================

describe(
  "Authentication API - End-to-End Tests",
  {
    skip: !TESTS_ENABLED
      ? "Set E2E_EMAIL and E2E_PASSWORD to enable authentication tests."
      : false,
  },
  () => {
    // ==================================================
    // 9. BEFORE ALL TESTS
    // ==================================================

    before(async () => {
      assert.ok(TEST_EMAIL, "E2E_EMAIL must be configured.");

      assert.ok(TEST_PASSWORD, "E2E_PASSWORD must be configured.");

      assert.ok(
        BASE_URL.startsWith("http://") || BASE_URL.startsWith("https://"),
        "E2E_BASE_URL must be a valid HTTP URL.",
      );

      loginResponse = await postJson(LOGIN_PATH, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      assert.equal(
        loginResponse.status,
        200,
        `Login failed with HTTP ${loginResponse.status}. Check the test credentials and API response.`,
      );

      accessToken = extractAccessToken(loginResponse.body);

      assert.ok(
        accessToken,
        "Login response did not contain an access token in a recognized response field.",
      );
    });

    // ==================================================
    // 10. API AVAILABILITY
    // ==================================================

    it("should connect to the authentication API", async () => {
      assert.ok(loginResponse, "Login request was not executed.");

      assert.ok(
        loginResponse.status >= 200 && loginResponse.status < 300,
        "Authentication API did not return a successful login.",
      );
    });

    // ==================================================
    // 11. SUCCESSFUL LOGIN
    // ==================================================

    it("should authenticate the configured test account", async () => {
      assert.ok(loginResponse);

      assert.equal(loginResponse.status, 200);

      assert.ok(loginResponse.body, "Login response body is missing.");
    });

    // ==================================================
    // 12. ACCESS TOKEN
    // ==================================================

    it("should return a usable access token", async () => {
      assert.ok(accessToken, "Access token was not extracted.");

      assert.ok(accessToken.length > 20, "Access token appears too short.");
    });

    // ==================================================
    // 13. CURRENT USER
    // ==================================================

    it("should return the authenticated user profile", async () => {
      assert.ok(accessToken);

      const result = await request(ME_PATH, {
        method: "GET",
        headers: bearerHeaders(accessToken),
      });

      assert.equal(
        result.status,
        200,
        `Profile request returned HTTP ${result.status}.`,
      );

      assert.ok(result.body, "Profile response is empty.");
    });

    // ==================================================
    // 14. PROFILE RESPONSE
    // ==================================================

    it("should return JSON for the authenticated profile", async () => {
      assert.ok(accessToken);

      const result = await request(ME_PATH, {
        headers: bearerHeaders(accessToken),
      });

      assert.ok(
        result.headers.get("content-type")?.includes("application/json"),
        "Profile endpoint should return JSON.",
      );

      assert.equal(result.status, 200);
    });

    // ==================================================
    // 15. INVALID LOGIN CREDENTIALS
    // ==================================================

    it("should reject an incorrect password", async () => {
      const result = await postJson(LOGIN_PATH, {
        email: TEST_EMAIL,
        password: INVALID_PASSWORD,
      });

      assert.ok(
        [400, 401, 403].includes(result.status),
        `Expected an authentication failure but received HTTP ${result.status}.`,
      );

      assert.equal(
        extractAccessToken(result.body),
        null,
        "Invalid credentials must not return an access token.",
      );
    });

    // ==================================================
    // 16. MISSING ACCESS TOKEN
    // ==================================================

    it("should reject a request without an access token", async () => {
      const result = await request(ME_PATH, {
        method: "GET",
      });

      assert.ok(
        [401, 403].includes(result.status),
        `Expected unauthorized response, received ${result.status}.`,
      );
    });

    // ==================================================
    // 17. INVALID ACCESS TOKEN
    // ==================================================

    it("should reject an invalid access token", async () => {
      const result = await request(ME_PATH, {
        headers: {
          Authorization: "Bearer invalid.test.token",
        },
      });

      assert.ok(
        [401, 403].includes(result.status),
        `Expected invalid-token rejection, received ${result.status}.`,
      );
    });

    // ==================================================
    // 18. INVALID AUTHORIZATION HEADER
    // ==================================================

    it("should reject a malformed authorization header", async () => {
      const result = await request(ME_PATH, {
        headers: {
          Authorization: "InvalidHeader",
        },
      });

      assert.ok(
        [401, 403].includes(result.status),
        `Expected malformed-header rejection, received ${result.status}.`,
      );
    });
  },
);

// ======================================================
// 19. TEST CONFIGURATION SUMMARY
// ======================================================

if (!TESTS_ENABLED) {
  console.info(
    "[AUTH E2E] Tests skipped. Configure E2E_EMAIL and E2E_PASSWORD.",
  );
}

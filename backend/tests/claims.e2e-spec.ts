/**
 * Injibara Campus Lost & Found
 *
 * CLAIMS END-TO-END TESTS
 *
 * Tests:
 * - Claims API availability
 * - Current user's claims
 * - Claims JSON response
 * - Claim details
 * - Invalid claim ID
 * - Missing authentication
 * - Invalid access token
 * - Pagination
 * - Claim status query
 *
 * Environment:
 * E2E_BASE_URL
 * E2E_EMAIL
 * E2E_PASSWORD
 *
 * Optional:
 * E2E_CLAIMS_PATH
 * E2E_CLAIM_ID
 */

import { describe, it, before } from "node:test";

import assert from "node:assert/strict";

// ======================================================
// 1. CONFIGURATION
// ======================================================

const BASE_URL = (process.env.E2E_BASE_URL ?? "http://localhost:5000").replace(
  /\/+$/,
  "",
);

const API_PREFIX = "/api/v1";

const LOGIN_PATH = process.env.E2E_LOGIN_PATH ?? `${API_PREFIX}/auth/login`;

const CLAIMS_PATH = process.env.E2E_CLAIMS_PATH ?? `${API_PREFIX}/claims`;

const MY_CLAIMS_PATH = process.env.E2E_MY_CLAIMS_PATH ?? `${CLAIMS_PATH}/my`;

const CLAIM_ID = process.env.E2E_CLAIM_ID ?? "";

const EMAIL = process.env.E2E_EMAIL ?? "";

const PASSWORD = process.env.E2E_PASSWORD ?? "";

const ENABLED = Boolean(EMAIL && PASSWORD);

// ======================================================
// 2. RESPONSE TYPES
// ======================================================

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  data?: unknown;
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
// 3. REQUEST HELPER
// ======================================================

async function apiRequest(
  path: string,
  options: RequestInit = {},
): Promise<HttpResult> {
  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
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
// 4. TOKEN EXTRACTION
// ======================================================

function findAccessToken(value: unknown, depth = 0): string | null {
  if (!value || typeof value !== "object" || depth > 5) {
    return null;
  }

  const object = value as Record<string, unknown>;

  for (const key of ["accessToken", "access_token"]) {
    const candidate = object[key];

    if (typeof candidate === "string" && candidate.length > 20) {
      return candidate;
    }
  }

  for (const key of ["data", "tokens", "result"]) {
    const token = findAccessToken(object[key], depth + 1);

    if (token) {
      return token;
    }
  }

  return null;
}

// ======================================================
// 5. LOGIN HELPER
// ======================================================

async function login(): Promise<string> {
  const result = await apiRequest(LOGIN_PATH, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
    }),
  });

  assert.equal(
    result.status,
    200,
    `Claims test authentication failed with HTTP ${result.status}.`,
  );

  const token = findAccessToken(result.body);

  assert.ok(token, "Login response did not include an access token.");

  return token;
}

// ======================================================
// 6. AUTHORIZATION HELPER
// ======================================================

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// ======================================================
// 7. UUID VALIDATION
// ======================================================

const INVALID_UUID = "invalid-claim-identifier";

// ======================================================
// 8. TEST STATE
// ======================================================

let accessToken = "";

// ======================================================
// 9. CLAIMS TEST SUITE
// ======================================================

describe(
  "Claims API - End-to-End Tests",
  {
    skip: !ENABLED
      ? "Set E2E_EMAIL and E2E_PASSWORD to enable claims tests."
      : false,
  },
  () => {
    // ==================================================
    // 10. INITIALIZE AUTHENTICATION
    // ==================================================

    before(async () => {
      accessToken = await login();
    });

    // ==================================================
    // 11. GET MY CLAIMS
    // ==================================================

    it("should return the current user claims", async () => {
      const result = await apiRequest(MY_CLAIMS_PATH, {
        method: "GET",
        headers: authHeaders(accessToken),
      });

      assert.equal(
        result.status,
        200,
        `My claims endpoint returned HTTP ${result.status}. Check the configured claims route.`,
      );

      assert.ok(result.body, "My claims response is empty.");
    });

    // ==================================================
    // 12. JSON RESPONSE
    // ==================================================

    it("should return JSON for my claims", async () => {
      const result = await apiRequest(MY_CLAIMS_PATH, {
        headers: authHeaders(accessToken),
      });

      assert.ok(
        result.headers.get("content-type")?.includes("application/json"),
        "Claims endpoint should return JSON.",
      );

      assert.equal(result.status, 200);
    });

    // ==================================================
    // 13. CLAIM LIST PAGINATION
    // ==================================================

    it("should handle valid pagination parameters", async () => {
      const query = new URLSearchParams({
        page: "1",
        limit: "10",
      });

      const result = await apiRequest(`${MY_CLAIMS_PATH}?${query.toString()}`, {
        headers: authHeaders(accessToken),
      });

      assert.ok(
        [200, 400, 422].includes(result.status),
        `Unexpected pagination response: ${result.status}.`,
      );
    });

    // ==================================================
    // 14. INVALID PAGINATION
    // ==================================================

    it("should safely handle invalid pagination values", async () => {
      const query = new URLSearchParams({
        page: "-10",
        limit: "not-a-number",
      });

      const result = await apiRequest(`${MY_CLAIMS_PATH}?${query.toString()}`, {
        headers: authHeaders(accessToken),
      });

      assert.ok(
        [200, 400, 422].includes(result.status),
        `Unexpected invalid pagination response: ${result.status}.`,
      );
    });

    // ==================================================
    // 15. CLAIM DETAILS
    // ==================================================

    it(
      "should return an existing claim by ID",
      {
        skip: !CLAIM_ID ? "Set E2E_CLAIM_ID to test claim details." : false,
      },
      async () => {
        const result = await apiRequest(
          `${CLAIMS_PATH}/${encodeURIComponent(CLAIM_ID)}`,
          {
            headers: authHeaders(accessToken),
          },
        );

        assert.equal(
          result.status,
          200,
          `Claim details returned HTTP ${result.status}. Check E2E_CLAIM_ID and claim ownership.`,
        );

        assert.ok(result.body, "Claim detail response is empty.");
      },
    );

    // ==================================================
    // 16. INVALID CLAIM ID
    // ==================================================

    it("should reject an invalid claim ID", async () => {
      const result = await apiRequest(`${CLAIMS_PATH}/${INVALID_UUID}`, {
        headers: authHeaders(accessToken),
      });

      assert.ok(
        [400, 404, 422].includes(result.status),
        `Expected invalid claim ID rejection, received ${result.status}.`,
      );
    });

    // ==================================================
    // 17. MISSING AUTHENTICATION
    // ==================================================

    it("should reject requests without authentication", async () => {
      const result = await apiRequest(MY_CLAIMS_PATH);

      assert.ok(
        [401, 403].includes(result.status),
        `Expected unauthorized response, received ${result.status}.`,
      );
    });

    // ==================================================
    // 18. INVALID TOKEN
    // ==================================================

    it("should reject an invalid access token", async () => {
      const result = await apiRequest(MY_CLAIMS_PATH, {
        headers: {
          Authorization: "Bearer invalid.test.token",
        },
      });

      assert.ok(
        [401, 403].includes(result.status),
        `Expected invalid token rejection, received ${result.status}.`,
      );
    });

    // ==================================================
    // 19. CLAIM DETAILS AUTHORIZATION
    // ==================================================

    it(
      "should protect individual claim details",
      {
        skip: !CLAIM_ID
          ? "Set E2E_CLAIM_ID to test claim detail protection."
          : false,
      },
      async () => {
        const result = await apiRequest(
          `${CLAIMS_PATH}/${encodeURIComponent(CLAIM_ID)}`,
        );

        assert.ok(
          [401, 403].includes(result.status),
          `Expected unauthorized claim detail response, received ${result.status}.`,
        );
      },
    );

    // ==================================================
    // 20. CLAIMS ROUTE METHOD PROTECTION
    // ==================================================

    it("should not accept unsupported HTTP methods", async () => {
      const result = await apiRequest(MY_CLAIMS_PATH, {
        method: "TRACE",
        headers: authHeaders(accessToken),
      });

      assert.ok(
        [404, 405].includes(result.status),
        `Unexpected TRACE method response: ${result.status}.`,
      );
    });

    // ==================================================
    // 21. CLAIM LIST RESPONSE
    // ==================================================

    it("should return a successful response without exposing tokens", async () => {
      const result = await apiRequest(MY_CLAIMS_PATH, {
        headers: authHeaders(accessToken),
      });

      assert.equal(result.status, 200);

      assert.equal(
        findAccessToken(result.body),
        null,
        "Claims response should not expose an access token.",
      );
    });
  },
);

// ======================================================
// 22. TEST CONFIGURATION MESSAGE
// ======================================================

if (!ENABLED) {
  console.info(
    "[CLAIMS E2E] Tests skipped. Configure E2E_EMAIL and E2E_PASSWORD.",
  );
}

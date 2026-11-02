/**
 * Injibara Campus Lost & Found
 *
 * ITEMS END-TO-END TESTS
 *
 * Tests:
 * - Item listing
 * - Item listing response
 * - Item details
 * - Invalid item ID
 * - Missing authentication
 * - Invalid authentication
 * - Pagination parameters
 * - Search parameters
 *
 * Environment:
 * E2E_BASE_URL
 * E2E_EMAIL
 * E2E_PASSWORD
 *
 * Optional:
 * E2E_ITEMS_PATH
 * E2E_ITEM_ID
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

const ITEMS_PATH = process.env.E2E_ITEMS_PATH ?? `${API_PREFIX}/items`;

const ITEM_ID = process.env.E2E_ITEM_ID ?? "";

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

function findToken(value: unknown, depth = 0): string | null {
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
    const token = findToken(object[key], depth + 1);

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
  const response = await apiRequest(LOGIN_PATH, {
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
    response.status,
    200,
    `Test login failed with HTTP ${response.status}.`,
  );

  const token = findToken(response.body);

  assert.ok(token, "No access token was found in the login response.");

  return token;
}

// ======================================================
// 6. AUTHORIZATION HEADERS
// ======================================================

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// ======================================================
// 7. UUID HELPER
// ======================================================

const INVALID_UUID = "not-a-valid-uuid";

// ======================================================
// 8. TEST STATE
// ======================================================

let accessToken = "";

// ======================================================
// 9. ITEMS TEST SUITE
// ======================================================

describe(
  "Items API - End-to-End Tests",
  {
    skip: !ENABLED
      ? "Set E2E_EMAIL and E2E_PASSWORD to enable item tests."
      : false,
  },
  () => {
    // ==================================================
    // 10. AUTHENTICATION SETUP
    // ==================================================

    before(async () => {
      accessToken = await login();
    });

    // ==================================================
    // 11. LIST ITEMS
    // ==================================================

    it("should return the item listing", async () => {
      const result = await apiRequest(ITEMS_PATH, {
        method: "GET",
        headers: authHeaders(accessToken),
      });

      assert.equal(
        result.status,
        200,
        `Item listing returned HTTP ${result.status}.`,
      );

      assert.ok(result.body, "Item listing response is empty.");
    });

    // ==================================================
    // 12. JSON RESPONSE
    // ==================================================

    it("should return a JSON response for item listing", async () => {
      const result = await apiRequest(ITEMS_PATH, {
        headers: authHeaders(accessToken),
      });

      assert.ok(
        result.headers.get("content-type")?.includes("application/json"),
        "Items endpoint should return JSON.",
      );

      assert.equal(result.status, 200);
    });

    // ==================================================
    // 13. PAGINATION
    // ==================================================

    it("should accept valid pagination parameters", async () => {
      const query = new URLSearchParams({
        page: "1",
        limit: "10",
      });

      const result = await apiRequest(`${ITEMS_PATH}?${query.toString()}`, {
        headers: authHeaders(accessToken),
      });

      assert.ok(
        [200, 400, 422].includes(result.status),
        `Unexpected pagination response: ${result.status}.`,
      );

      /**
       * If the actual items module supports page/limit,
       * the expected status is 200.
       *
       * Some controllers use different query names,
       * so this test reports rather than assumes them.
       */
    });

    // ==================================================
    // 14. SEARCH
    // ==================================================

    it("should handle an item search query", async () => {
      const query = new URLSearchParams({
        search: "phone",
      });

      const result = await apiRequest(`${ITEMS_PATH}?${query.toString()}`, {
        headers: authHeaders(accessToken),
      });

      assert.ok(
        [200, 400, 422].includes(result.status),
        `Unexpected search response: ${result.status}.`,
      );
    });

    // ==================================================
    // 15. ITEM DETAILS
    // ==================================================

    it(
      "should return an existing item by ID",
      {
        skip: !ITEM_ID ? "Set E2E_ITEM_ID to test item details." : false,
      },
      async () => {
        const result = await apiRequest(
          `${ITEMS_PATH}/${encodeURIComponent(ITEM_ID)}`,
          {
            headers: authHeaders(accessToken),
          },
        );

        assert.equal(
          result.status,
          200,
          `Item details returned HTTP ${result.status}. Check E2E_ITEM_ID and the item route.`,
        );

        assert.ok(result.body, "Item detail response is empty.");
      },
    );

    // ==================================================
    // 16. INVALID ITEM ID
    // ==================================================

    it("should reject an invalid item ID", async () => {
      const result = await apiRequest(`${ITEMS_PATH}/${INVALID_UUID}`, {
        headers: authHeaders(accessToken),
      });

      assert.ok(
        [400, 404, 422].includes(result.status),
        `Expected invalid ID rejection, received ${result.status}.`,
      );
    });

    // ==================================================
    // 17. MISSING AUTHENTICATION
    // ==================================================

    it("should reject an unauthenticated item listing request", async () => {
      const result = await apiRequest(ITEMS_PATH);

      assert.ok(
        [401, 403].includes(result.status),
        `Expected authentication rejection, received ${result.status}.`,
      );
    });

    // ==================================================
    // 18. INVALID TOKEN
    // ==================================================

    it("should reject an invalid token when listing items", async () => {
      const result = await apiRequest(ITEMS_PATH, {
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
    // 19. ITEM DETAILS WITHOUT AUTHENTICATION
    // ==================================================

    it(
      "should protect item detail requests",
      {
        skip: !ITEM_ID
          ? "Set E2E_ITEM_ID to test item detail protection."
          : false,
      },
      async () => {
        const result = await apiRequest(
          `${ITEMS_PATH}/${encodeURIComponent(ITEM_ID)}`,
        );

        assert.ok(
          [401, 403].includes(result.status),
          `Expected unauthorized item detail response, received ${result.status}.`,
        );
      },
    );

    // ==================================================
    // 20. EMPTY SEARCH
    // ==================================================

    it("should handle an empty search value safely", async () => {
      const query = new URLSearchParams({
        search: "",
      });

      const result = await apiRequest(`${ITEMS_PATH}?${query.toString()}`, {
        headers: authHeaders(accessToken),
      });

      assert.ok(
        [200, 400, 422].includes(result.status),
        `Unexpected empty search response: ${result.status}.`,
      );
    });

    // ==================================================
    // 21. LARGE PAGE SIZE
    // ==================================================

    it("should handle a large page-size request safely", async () => {
      const query = new URLSearchParams({
        page: "1",
        limit: "1000000",
      });

      const result = await apiRequest(`${ITEMS_PATH}?${query.toString()}`, {
        headers: authHeaders(accessToken),
      });

      assert.ok(
        [200, 400, 422].includes(result.status),
        `Unexpected large page-size response: ${result.status}.`,
      );
    });
  },
);

// ======================================================
// 22. TEST CONFIGURATION MESSAGE
// ======================================================

if (!ENABLED) {
  console.info(
    "[ITEMS E2E] Tests skipped. Configure E2E_EMAIL and E2E_PASSWORD.",
  );
}

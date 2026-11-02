// mobile/src/services/tokenService.ts

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================
// TYPES
// ============================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenMetadata {
  expiresAt?: number;
  issuedAt?: number;
}

export interface StoredAuthSession {
  accessToken: string;
  refreshToken: string;
  metadata?: TokenMetadata;
}

type TokenType = "access" | "refresh";

// ============================================================
// STORAGE KEYS
// ============================================================

const STORAGE_KEYS = {
  ACCESS_TOKEN: "campus_lost_found_access_token",
  REFRESH_TOKEN: "campus_lost_found_refresh_token",
  TOKEN_METADATA: "campus_lost_found_token_metadata",
  AUTH_SESSION: "campus_lost_found_auth_session",
} as const;

// ============================================================
// STORAGE CONFIGURATION
// ============================================================

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

// ============================================================
// STORAGE HELPERS
// ============================================================

async function setStoredValue(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
}

async function getStoredValue(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function removeStoredValue(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

// ============================================================
// TOKEN VALIDATION
// ============================================================

function validateToken(token: string, tokenType: TokenType): void {
  if (typeof token !== "string" || !token.trim()) {
    throw new Error(
      `Invalid ${tokenType} token. A non-empty token is required.`,
    );
  }

  if (token.length > 10000) {
    throw new Error(`${tokenType} token exceeds the supported length.`);
  }
}

// ============================================================
// JWT PAYLOAD DECODING
// ============================================================

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");

  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  if (typeof globalThis.atob === "function") {
    return decodeURIComponent(
      Array.from(globalThis.atob(padded))
        .map((character) => {
          return `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`;
        })
        .join(""),
    );
  }

  throw new Error("Base64 decoding is not available in this environment.");
}

export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = decodeBase64Url(parts[1]);

    const parsed: unknown = JSON.parse(payload);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }

    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ============================================================
// EXPIRATION HELPERS
// ============================================================

export function getTokenExpiration(token: string): number | null {
  const payload = decodeJwtPayload(token);

  if (!payload || typeof payload.exp !== "number") {
    return null;
  }

  return payload.exp * 1000;
}

export function isTokenExpired(
  token: string,
  clockToleranceMs = 30_000,
): boolean {
  const expiration = getTokenExpiration(token);

  // The server remains authoritative. If the token is opaque
  // or its payload cannot be decoded, do not assume expiration.
  if (expiration === null) {
    return false;
  }

  return Date.now() >= expiration - clockToleranceMs;
}

export function getTokenRemainingTime(token: string): number | null {
  const expiration = getTokenExpiration(token);

  if (expiration === null) {
    return null;
  }

  return Math.max(0, expiration - Date.now());
}

// ============================================================
// ACCESS TOKEN
// ============================================================

async function saveAccessToken(token: string): Promise<void> {
  validateToken(token, "access");

  await setStoredValue(STORAGE_KEYS.ACCESS_TOKEN, token);
}

async function getAccessToken(): Promise<string | null> {
  return getStoredValue(STORAGE_KEYS.ACCESS_TOKEN);
}

async function removeAccessToken(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.ACCESS_TOKEN);
}

// ============================================================
// REFRESH TOKEN
// ============================================================

async function saveRefreshToken(token: string): Promise<void> {
  validateToken(token, "refresh");

  await setStoredValue(STORAGE_KEYS.REFRESH_TOKEN, token);
}

async function getRefreshToken(): Promise<string | null> {
  return getStoredValue(STORAGE_KEYS.REFRESH_TOKEN);
}

async function removeRefreshToken(): Promise<void> {
  await removeStoredValue(STORAGE_KEYS.REFRESH_TOKEN);
}

// ============================================================
// SAVE BOTH TOKENS
// ============================================================

async function saveTokens(tokens: AuthTokens): Promise<void> {
  validateToken(tokens.accessToken, "access");

  validateToken(tokens.refreshToken, "refresh");

  const metadata: TokenMetadata = {
    issuedAt: Date.now(),

    expiresAt: getTokenExpiration(tokens.accessToken) ?? undefined,
  };

  // Save the session object first, then the individual values.
  // All errors are propagated so callers cannot assume success.
  const session: StoredAuthSession = {
    accessToken: tokens.accessToken,

    refreshToken: tokens.refreshToken,

    metadata,
  };

  await setStoredValue(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));

  await Promise.all([
    saveAccessToken(tokens.accessToken),
    saveRefreshToken(tokens.refreshToken),
    setStoredValue(STORAGE_KEYS.TOKEN_METADATA, JSON.stringify(metadata)),
  ]);
}

// ============================================================
// READ BOTH TOKENS
// ============================================================

async function getTokens(): Promise<AuthTokens | null> {
  const [accessToken, refreshToken] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
  ]);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

// ============================================================
// READ AUTH SESSION
// ============================================================

async function getAuthSession(): Promise<StoredAuthSession | null> {
  const storedSession = await getStoredValue(STORAGE_KEYS.AUTH_SESSION);

  if (storedSession) {
    try {
      const parsed: unknown = JSON.parse(storedSession);

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "accessToken" in parsed &&
        "refreshToken" in parsed &&
        typeof parsed.accessToken === "string" &&
        typeof parsed.refreshToken === "string"
      ) {
        return parsed as StoredAuthSession;
      }
    } catch {
      // Fall back to the individual token keys.
    }
  }

  const tokens = await getTokens();

  if (!tokens) {
    return null;
  }

  return tokens;
}

// ============================================================
// TOKEN METADATA
// ============================================================

async function getTokenMetadata(): Promise<TokenMetadata | null> {
  const stored = await getStoredValue(STORAGE_KEYS.TOKEN_METADATA);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as TokenMetadata;
  } catch {
    return null;
  }
}

// ============================================================
// CLEAR SESSION
// ============================================================

async function clearTokens(): Promise<void> {
  await Promise.all([
    removeAccessToken(),
    removeRefreshToken(),
    removeStoredValue(STORAGE_KEYS.TOKEN_METADATA),
    removeStoredValue(STORAGE_KEYS.AUTH_SESSION),
  ]);
}

// ============================================================
// SESSION CHECK
// ============================================================

async function hasValidAccessToken(): Promise<boolean> {
  const token = await getAccessToken();

  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
}

async function hasRefreshToken(): Promise<boolean> {
  const token = await getRefreshToken();

  return Boolean(token);
}

// ============================================================
// TOKEN UPDATE
// ============================================================

async function updateAccessToken(accessToken: string): Promise<void> {
  validateToken(accessToken, "access");

  await saveAccessToken(accessToken);

  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    await setStoredValue(
      STORAGE_KEYS.AUTH_SESSION,
      JSON.stringify({
        accessToken,
        refreshToken,
        metadata: {
          issuedAt: Date.now(),
          expiresAt: getTokenExpiration(accessToken) ?? undefined,
        },
      } satisfies StoredAuthSession),
    );
  }
}

// ============================================================
// EXPORT SERVICE
// ============================================================

const tokenService = {
  saveAccessToken,
  getAccessToken,
  removeAccessToken,

  saveRefreshToken,
  getRefreshToken,
  removeRefreshToken,

  saveTokens,
  getTokens,
  getAuthSession,

  getTokenMetadata,

  clearTokens,

  hasValidAccessToken,
  hasRefreshToken,

  updateAccessToken,

  decodeJwtPayload,
  getTokenExpiration,
  isTokenExpired,
  getTokenRemainingTime,
};

export default tokenService;

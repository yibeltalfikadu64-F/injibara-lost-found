/**
 * Shared authentication hook.
 *
 * The implementation lives in:
 * features/auth/hooks/useAuth.ts
 *
 * Re-exporting avoids creating a second authentication
 * store or duplicating login and logout logic.
 */

export { useAuth } from "../features/auth/hooks/useAuth";

export type {
  AuthUser,
  AuthState,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  UserRole,
} from "../features/auth/types/auth.types";

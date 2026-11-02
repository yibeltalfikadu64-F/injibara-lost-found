// mobile/src/hooks/useBiometrics.ts

import { useCallback, useEffect, useState } from "react";

import * as LocalAuthentication from "expo-local-authentication";

// ============================================================
// TYPES
// ============================================================

export type BiometricMethod = "fingerprint" | "facial" | "iris" | "unknown";

export type BiometricSecurityLevel = "none" | "secret" | "biometric";

export type BiometricError =
  | "NOT_SUPPORTED"
  | "NOT_ENROLLED"
  | "USER_CANCEL"
  | "SYSTEM_CANCEL"
  | "LOCKOUT"
  | "APP_CANCEL"
  | "AUTHENTICATION_FAILED"
  | "UNKNOWN";

export interface BiometricStatus {
  isAvailable: boolean;

  hasHardware: boolean;

  isEnrolled: boolean;

  isLoading: boolean;

  supportedMethods: BiometricMethod[];

  securityLevel: BiometricSecurityLevel;

  error: string | null;

  checkedAt: Date | null;
}

export interface BiometricAuthenticationOptions {
  promptMessage?: string;

  cancelLabel?: string;

  fallbackLabel?: string;

  disableDeviceFallback?: boolean;

  requireConfirmation?: boolean;

  biometricsSecurityLevel?: "weak" | "strong";
}

export interface BiometricAuthenticationResult {
  success: boolean;

  cancelled: boolean;

  error: BiometricError | null;

  message: string;

  authenticationType: string | null;

  warning: string | null;
}

export interface UseBiometricsOptions {
  /**
   * Check biometric availability when the hook mounts.
   */
  checkOnMount?: boolean;

  /**
   * Automatically allow device passcode fallback.
   */
  allowDeviceFallback?: boolean;

  /**
   * Called after successful authentication.
   */
  onSuccess?: () => void;

  /**
   * Called after unsuccessful authentication.
   */
  onFailure?: (result: BiometricAuthenticationResult) => void;
}

// ============================================================
// INITIAL STATUS
// ============================================================

const initialBiometricStatus: BiometricStatus = {
  isAvailable: false,

  hasHardware: false,

  isEnrolled: false,

  isLoading: true,

  supportedMethods: [],

  securityLevel: "none",

  error: null,

  checkedAt: null,
};

// ============================================================
// ERROR MESSAGE HELPER
// ============================================================

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected biometric error occurred.";
}

// ============================================================
// MAP AUTHENTICATION ERRORS
// ============================================================

function normalizeBiometricError(
  error: string | undefined,
): BiometricError | null {
  if (!error) {
    return null;
  }

  switch (error) {
    case "not_available":
      return "NOT_SUPPORTED";

    case "not_enrolled":
      return "NOT_ENROLLED";

    case "user_cancel":
      return "USER_CANCEL";

    case "system_cancel":
      return "SYSTEM_CANCEL";

    case "lockout":
    case "lockout_permanent":
      return "LOCKOUT";

    case "app_cancel":
      return "APP_CANCEL";

    case "authentication_failed":
      return "AUTHENTICATION_FAILED";

    default:
      return "UNKNOWN";
  }
}

// ============================================================
// ERROR MESSAGE BY TYPE
// ============================================================

function getBiometricErrorMessage(error: BiometricError | null): string {
  switch (error) {
    case "NOT_SUPPORTED":
      return "Biometric authentication is not supported on this device.";

    case "NOT_ENROLLED":
      return "No fingerprint or face recognition is enrolled on this device.";

    case "USER_CANCEL":
      return "Authentication was cancelled by the user.";

    case "SYSTEM_CANCEL":
      return "Authentication was cancelled by the system.";

    case "LOCKOUT":
      return "Biometric authentication is temporarily locked. Use your device passcode if available.";

    case "APP_CANCEL":
      return "Authentication was interrupted by the application.";

    case "AUTHENTICATION_FAILED":
      return "Biometric authentication failed. Please try again.";

    case "UNKNOWN":
      return "An unknown authentication error occurred.";

    default:
      return "Authentication was not completed.";
  }
}

// ============================================================
// MAP BIOMETRIC AUTHENTICATION TYPE
// ============================================================

function mapAuthenticationType(type: number): BiometricMethod {
  if (type === LocalAuthentication.AuthenticationType.FINGERPRINT) {
    return "fingerprint";
  }

  if (type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
    return "facial";
  }

  if (type === LocalAuthentication.AuthenticationType.IRIS) {
    return "iris";
  }

  return "unknown";
}

// ============================================================
// GET SECURITY LEVEL
// ============================================================

async function getBiometricSecurityLevel(): Promise<BiometricSecurityLevel> {
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();

    switch (level) {
      case LocalAuthentication.SecurityLevel.BIOMETRIC:
        return "biometric";

      case LocalAuthentication.SecurityLevel.SECRET:
        return "secret";

      default:
        return "none";
    }
  } catch {
    return "none";
  }
}

// ============================================================
// CHECK BIOMETRIC AVAILABILITY
// ============================================================

export async function checkBiometricAvailability(): Promise<BiometricStatus> {
  try {
    const [hasHardware, isEnrolled, supportedTypes, securityLevel] =
      await Promise.all([
        LocalAuthentication.hasHardwareAsync(),

        LocalAuthentication.isEnrolledAsync(),

        LocalAuthentication.supportedAuthenticationTypesAsync(),

        getBiometricSecurityLevel(),
      ]);

    const supportedMethods = supportedTypes.map(mapAuthenticationType);

    const isAvailable = hasHardware && isEnrolled;

    return {
      isAvailable,

      hasHardware,

      isEnrolled,

      isLoading: false,

      supportedMethods,

      securityLevel,

      error: null,

      checkedAt: new Date(),
    };
  } catch (error) {
    return {
      ...initialBiometricStatus,

      isLoading: false,

      error: getErrorMessage(error),

      checkedAt: new Date(),
    };
  }
}

// ============================================================
// BIOMETRIC METHOD LABEL
// ============================================================

export function getBiometricMethodLabel(method: BiometricMethod): string {
  switch (method) {
    case "fingerprint":
      return "Fingerprint";

    case "facial":
      return "Face Recognition";

    case "iris":
      return "Iris Recognition";

    default:
      return "Biometric Authentication";
  }
}

// ============================================================
// AVAILABLE BIOMETRIC LABEL
// ============================================================

export function getAvailableBiometricLabel(methods: BiometricMethod[]): string {
  if (methods.length === 0) {
    return "No biometric method available";
  }

  const uniqueMethods = [...new Set(methods)];

  return uniqueMethods.map(getBiometricMethodLabel).join(" or ");
}

// ============================================================
// MAIN BIOMETRIC HOOK
// ============================================================

export function useBiometrics(options: UseBiometricsOptions = {}) {
  const {
    checkOnMount = true,

    allowDeviceFallback = true,

    onSuccess,

    onFailure,
  } = options;

  const [status, setStatus] = useState<BiometricStatus>(initialBiometricStatus);

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [lastResult, setLastResult] =
    useState<BiometricAuthenticationResult | null>(null);

  const [authenticationAttempts, setAuthenticationAttempts] = useState(0);

  // ----------------------------------------------------------
  // REFRESH BIOMETRIC STATUS
  // ----------------------------------------------------------

  const refreshStatus = useCallback(async (): Promise<BiometricStatus> => {
    setStatus((previous) => ({
      ...previous,
      isLoading: true,
      error: null,
    }));

    const nextStatus = await checkBiometricAvailability();

    setStatus(nextStatus);

    return nextStatus;
  }, []);

  // ----------------------------------------------------------
  // CHECK HARDWARE SUPPORT
  // ----------------------------------------------------------

  const checkHardware = useCallback(async (): Promise<boolean> => {
    try {
      return await LocalAuthentication.hasHardwareAsync();
    } catch {
      return false;
    }
  }, []);

  // ----------------------------------------------------------
  // CHECK ENROLLMENT
  // ----------------------------------------------------------

  const checkEnrollment = useCallback(async (): Promise<boolean> => {
    try {
      return await LocalAuthentication.isEnrolledAsync();
    } catch {
      return false;
    }
  }, []);

  // ----------------------------------------------------------
  // CHECK IF BIOMETRICS ARE AVAILABLE
  // ----------------------------------------------------------

  const checkAvailability = useCallback(async (): Promise<boolean> => {
    const result = await checkBiometricAvailability();

    setStatus(result);

    return result.isAvailable;
  }, []);

  // ----------------------------------------------------------
  // GET AVAILABLE METHODS
  // ----------------------------------------------------------

  const getSupportedMethods = useCallback(async (): Promise<
    BiometricMethod[]
  > => {
    try {
      const methods =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      return methods.map(mapAuthenticationType);
    } catch {
      return [];
    }
  }, []);

  // ----------------------------------------------------------
  // AUTHENTICATION RESULT BUILDER
  // ----------------------------------------------------------

  const createResult = useCallback(
    (
      success: boolean,
      error: BiometricError | null,
      authenticationType: string | null = null,
      warning: string | null = null,
    ): BiometricAuthenticationResult => {
      return {
        success,

        cancelled:
          error === "USER_CANCEL" ||
          error === "SYSTEM_CANCEL" ||
          error === "APP_CANCEL",

        error,

        message: success
          ? "Authentication successful."
          : getBiometricErrorMessage(error),

        authenticationType,

        warning,
      };
    },
    [],
  );

  // ----------------------------------------------------------
  // AUTHENTICATE USER
  // ----------------------------------------------------------

  const authenticate = useCallback(
    async (
      authenticationOptions: BiometricAuthenticationOptions = {},
    ): Promise<BiometricAuthenticationResult> => {
      if (isAuthenticating) {
        return createResult(false, "UNKNOWN");
      }

      setIsAuthenticating(true);

      setAuthenticationAttempts((previous) => previous + 1);

      try {
        // Check device hardware first.
        const hasHardware = await LocalAuthentication.hasHardwareAsync();

        if (!hasHardware) {
          const result = createResult(false, "NOT_SUPPORTED");

          setLastResult(result);

          onFailure?.(result);

          return result;
        }

        // Check whether a biometric method is enrolled.
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!isEnrolled) {
          const result = createResult(false, "NOT_ENROLLED");

          setLastResult(result);

          onFailure?.(result);

          return result;
        }

        // Configure the native authentication prompt.
        const {
          promptMessage = "Authenticate to continue",
          cancelLabel = "Cancel",
          fallbackLabel = "Use device passcode",
          disableDeviceFallback = !allowDeviceFallback,
          requireConfirmation = false,
          biometricsSecurityLevel = "strong",
        } = authenticationOptions;

        const nativeOptions = {
          promptMessage,

          cancelLabel,

          disableDeviceFallback,

          requireConfirmation,
        };

        const result = await LocalAuthentication.authenticateAsync({
          ...nativeOptions,

          ...(disableDeviceFallback ? {} : { fallbackLabel }),

          biometricsSecurityLevel,
        });

        // Authentication succeeded.
        if (result.success) {
          const successResult = createResult(
            true,
            null,
            result.authenticationType ===
              LocalAuthentication.AuthenticationType.FINGERPRINT
              ? "Fingerprint"
              : result.authenticationType ===
                  LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
                ? "Face Recognition"
                : result.authenticationType ===
                    LocalAuthentication.AuthenticationType.IRIS
                  ? "Iris Recognition"
                  : "Device Authentication",
            result.warning ?? null,
          );

          setLastResult(successResult);

          onSuccess?.();

          return successResult;
        }

        // Authentication failed or was cancelled.
        const normalizedError = normalizeBiometricError(result.error);

        const failureResult = createResult(false, normalizedError);

        setLastResult(failureResult);

        onFailure?.(failureResult);

        return failureResult;
      } catch (error) {
        const failureResult = createResult(false, "UNKNOWN");

        setLastResult({
          ...failureResult,

          message: getErrorMessage(error),
        });

        onFailure?.(failureResult);

        return {
          ...failureResult,

          message: getErrorMessage(error),
        };
      } finally {
        setIsAuthenticating(false);
      }
    },
    [isAuthenticating, allowDeviceFallback, createResult, onSuccess, onFailure],
  );

  // ----------------------------------------------------------
  // AUTHENTICATE FOR APP UNLOCK
  // ----------------------------------------------------------

  const authenticateForAppUnlock = useCallback(async () => {
    return authenticate({
      promptMessage: "Authenticate to unlock Campus Lost & Found",

      cancelLabel: "Cancel",

      fallbackLabel: "Use device passcode",

      disableDeviceFallback: !allowDeviceFallback,

      requireConfirmation: false,

      biometricsSecurityLevel: "strong",
    });
  }, [authenticate, allowDeviceFallback]);

  // ----------------------------------------------------------
  // AUTHENTICATE FOR SENSITIVE ACTION
  // ----------------------------------------------------------

  const authenticateForSensitiveAction = useCallback(
    async (actionName = "continue") => {
      return authenticate({
        promptMessage: `Authenticate to ${actionName}`,

        cancelLabel: "Cancel",

        fallbackLabel: "Use device passcode",

        disableDeviceFallback: !allowDeviceFallback,

        requireConfirmation: true,

        biometricsSecurityLevel: "strong",
      });
    },
    [authenticate, allowDeviceFallback],
  );

  // ----------------------------------------------------------
  // RESET LAST RESULT
  // ----------------------------------------------------------

  const resetResult = useCallback(() => {
    setLastResult(null);
  }, []);

  // ----------------------------------------------------------
  // BIOMETRIC STATUS HELPERS
  // ----------------------------------------------------------

  const hasFingerprint = status.supportedMethods.includes("fingerprint");

  const hasFaceRecognition = status.supportedMethods.includes("facial");

  const hasIrisRecognition = status.supportedMethods.includes("iris");

  const biometricLabel = getAvailableBiometricLabel(status.supportedMethods);

  // ----------------------------------------------------------
  // INITIAL CHECK
  // ----------------------------------------------------------

  useEffect(() => {
    if (checkOnMount) {
      void refreshStatus();
    }
  }, [checkOnMount, refreshStatus]);

  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------

  return {
    // Status
    ...status,

    // Authentication state
    isAuthenticating,

    lastResult,

    authenticationAttempts,

    // Supported methods
    hasFingerprint,

    hasFaceRecognition,

    hasIrisRecognition,

    biometricLabel,

    // Checks
    refreshStatus,

    checkHardware,

    checkEnrollment,

    checkAvailability,

    getSupportedMethods,

    // Authentication
    authenticate,

    authenticateForAppUnlock,

    authenticateForSensitiveAction,

    // Helpers
    resetResult,
  };
}

// ============================================================
// SIMPLE BIOMETRIC AVAILABILITY HOOK
// ============================================================

export function useBiometricAvailability() {
  const [isAvailable, setIsAvailable] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const available = await LocalAuthentication.hasHardwareAsync();

        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (mounted) {
          setIsAvailable(available && enrolled);
        }
      } catch {
        if (mounted) {
          setIsAvailable(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void check();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    isAvailable,
    isLoading,
  };
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default useBiometrics;

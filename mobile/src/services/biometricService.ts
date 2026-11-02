// mobile/src/services/biometricService.ts

import * as LocalAuthentication from 'expo-local-authentication';

// ============================================================
// TYPES
// ============================================================

export type BiometricType =
  | 'FINGERPRINT'
  | 'FACE'
  | 'IRIS'
  | 'UNKNOWN';

export interface BiometricAvailability {
  hardwareAvailable: boolean;
  enrolled: boolean;
  supportedTypes: BiometricType[];
  securityLevel: LocalAuthentication.SecurityLevel;
  available: boolean;
}

export interface BiometricAuthenticationOptions {
  promptMessage?: string;
  cancelLabel?: string;
  disableDeviceFallback?: boolean;
  fallbackLabel?: string;
}

export interface BiometricAuthenticationResult {
  success: boolean;
  error?: string;
  warning?: string;
  authenticationType?: BiometricType;
}

// ============================================================
// DEFAULT CONFIGURATION
// ============================================================

const DEFAULT_PROMPT =
  'Authenticate to access your account';

const DEFAULT_CANCEL_LABEL = 'Cancel';

// ============================================================
// BIOMETRIC TYPE NORMALIZATION
// ============================================================

function normalizeBiometricType(
  type: LocalAuthentication.AuthenticationType,
): BiometricType {
  switch (type) {
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return 'FINGERPRINT';

    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
      return 'FACE';

    case LocalAuthentication.AuthenticationType.IRIS:
      return 'IRIS';

    default:
      return 'UNKNOWN';
  }
}

// ============================================================
// CHECK HARDWARE
// ============================================================

async function hasHardware(): Promise<boolean> {
  try {
    return LocalAuthentication.hasHardwareAsync();
  } catch {
    return false;
  }
}

// ============================================================
// CHECK ENROLLMENT
// ============================================================

async function isEnrolled(): Promise<boolean> {
  try {
    return LocalAuthentication.isEnrolledAsync();
  } catch {
    return false;
  }
}

// ============================================================
// GET SUPPORTED TYPES
// ============================================================

async function getSupportedTypes(): Promise<BiometricType[]> {
  try {
    const types =
      await LocalAuthentication.supportedAuthenticationTypesAsync();

    return types.map(normalizeBiometricType);
  } catch {
    return [];
  }
}

// ============================================================
// GET SECURITY LEVEL
// ============================================================

async function getSecurityLevel(): Promise<
  LocalAuthentication.SecurityLevel
> {
  try {
    return LocalAuthentication.getEnrolledLevelAsync();
  } catch {
    return LocalAuthentication.SecurityLevel.NONE;
  }
}

// ============================================================
// CHECK AVAILABILITY
// ============================================================

async function getAvailability(): Promise<BiometricAvailability> {
  const [
    hardwareAvailable,
    enrolled,
    supportedTypes,
    securityLevel,
  ] = await Promise.all([
    hasHardware(),
    isEnrolled(),
    getSupportedTypes(),
    getSecurityLevel(),
  ]);

  return {
    hardwareAvailable,

    enrolled,

    supportedTypes,

    securityLevel,

    available:
      hardwareAvailable &&
      enrolled &&
      supportedTypes.length > 0 &&
      securityLevel !==
        LocalAuthentication.SecurityLevel.NONE,
  };
}

// ============================================================
// BIOMETRIC LABEL
// ============================================================

function getBiometricLabel(
  types: BiometricType[],
): string {
  if (types.includes('FACE')) {
    return 'Face Recognition';
  }

  if (types.includes('FINGERPRINT')) {
    return 'Fingerprint';
  }

  if (types.includes('IRIS')) {
    return 'Iris Recognition';
  }

  return 'Biometric Authentication';
}

// ============================================================
// ERROR MESSAGE
// ============================================================

function getAuthenticationErrorMessage(
  error?: string,
): string {
  switch (error) {
    case 'not_available':
      return 'Biometric authentication is not available on this device.';

    case 'not_enrolled':
      return 'No fingerprint or face authentication is enrolled on this device.';

    case 'user_cancel':
      return 'Authentication was cancelled.';

    case 'app_cancel':
      return 'Authentication was interrupted because the application was closed or moved to the background.';

    case 'system_cancel':
      return 'Authentication was cancelled by the device operating system.';

    case 'lockout':
      return 'Too many failed attempts. Use your device passcode or try again later.';

    case 'lockout_permanent':
      return 'Biometric authentication is temporarily locked. Unlock your device using its passcode.';

    case 'authentication_failed':
      return 'Authentication failed. Please try again.';

    case 'passcode_not_set':
      return 'Set a device passcode before using biometric authentication.';

    case 'user_fallback':
      return 'You selected another authentication method.';

    default:
      return error
        ? `Authentication failed: ${error}`
        : 'Biometric authentication could not be completed.';
  }
}

// ============================================================
// AUTHENTICATE
// ============================================================

async function authenticate(
  options: BiometricAuthenticationOptions = {},
): Promise<BiometricAuthenticationResult> {
  try {
    const availability = await getAvailability();

    if (!availability.hardwareAvailable) {
      return {
        success: false,

        error: getAuthenticationErrorMessage(
          'not_available',
        ),
      };
    }

    if (!availability.enrolled) {
      return {
        success: false,

        error: getAuthenticationErrorMessage(
          'not_enrolled',
        ),
      };
    }

    if (!availability.available) {
      return {
        success: false,

        error:
          'Biometric authentication is not currently available.',
      };
    }

    const result =
      await LocalAuthentication.authenticateAsync({
        promptMessage:
          options.promptMessage ?? DEFAULT_PROMPT,

        cancelLabel:
          options.cancelLabel ?? DEFAULT_CANCEL_LABEL,

        disableDeviceFallback:
          options.disableDeviceFallback ?? false,

        fallbackLabel:
          options.fallbackLabel ?? 'Use device passcode',
      });

    if (!result.success) {
      return {
        success: false,

        error: getAuthenticationErrorMessage(
          result.error,
        ),
      };
    }

    const supportedType =
      availability.supportedTypes[0];

    return {
      success: true,

      authenticationType: supportedType,
    };
  } catch (error) {
    return {
      success: false,

      error:
        error instanceof Error
          ? error.message
          : 'An unexpected biometric authentication error occurred.',
    };
  }
}

// ============================================================
// REQUIRE BIOMETRIC AUTHENTICATION
// ============================================================

async function requireAuthentication(
  promptMessage = 'Verify your identity to continue',
): Promise<void> {
  const result = await authenticate({
    promptMessage,
  });

  if (!result.success) {
    throw new Error(
      result.error ??
        'Biometric authentication failed.',
    );
  }
}

// ============================================================
// CHECK DEVICE ENROLLMENT STATUS
// ============================================================

async function canUseBiometrics(): Promise<boolean> {
  const availability = await getAvailability();

  return availability.available;
}

// ============================================================
// CHECK IF DEVICE PASSCODE IS ENROLLED
// ============================================================

async function hasDeviceAuthentication(): Promise<boolean> {
  const level = await getSecurityLevel();

  return (
    level !== LocalAuthentication.SecurityLevel.NONE
  );
}

// ============================================================
// EXPORT
// ============================================================

const biometricService = {
  hasHardware,
  isEnrolled,

  getSupportedTypes,
  getSecurityLevel,

  getAvailability,
  getBiometricLabel,

  getAuthenticationErrorMessage,

  authenticate,
  requireAuthentication,

  canUseBiometrics,
  hasDeviceAuthentication,
};

export default biometricService;
// mobile/src/hooks/usePermissions.ts

import { useCallback, useEffect, useState } from "react";

import { Camera } from "expo-camera";

import * as ImagePicker from "expo-image-picker";

import * as Location from "expo-location";

import * as Notifications from "expo-notifications";

// ============================================================
// PERMISSION TYPES
// ============================================================

export type PermissionName =
  | "camera"
  | "photoLibrary"
  | "location"
  | "notifications";

export type PermissionStatus =
  | "granted"
  | "denied"
  | "undetermined"
  | "unavailable";

export interface PermissionSnapshot {
  name: PermissionName;

  status: PermissionStatus;

  granted: boolean;

  canAskAgain: boolean;

  isAvailable: boolean;

  message: string;

  checkedAt: Date | null;
}

export type PermissionMap = Record<PermissionName, PermissionSnapshot>;

export interface PermissionResult {
  success: boolean;

  permission: PermissionName;

  status: PermissionStatus;

  granted: boolean;

  canAskAgain: boolean;

  message: string;
}

export interface UsePermissionsOptions {
  /**
   * Check permission statuses when the hook mounts.
   * This does not show a permission prompt.
   */
  checkOnMount?: boolean;

  /**
   * Called when a permission is granted.
   */
  onGranted?: (permission: PermissionName) => void;

  /**
   * Called when a permission is denied.
   */
  onDenied?: (permission: PermissionName) => void;
}

// ============================================================
// INITIAL PERMISSION SNAPSHOT
// ============================================================

function createInitialPermission(name: PermissionName): PermissionSnapshot {
  return {
    name,

    status: "undetermined",

    granted: false,

    canAskAgain: true,

    isAvailable: true,

    message: "Permission has not been checked.",

    checkedAt: null,
  };
}

// ============================================================
// INITIAL PERMISSION MAP
// ============================================================

function createInitialPermissionMap(): PermissionMap {
  return {
    camera: createInitialPermission("camera"),

    photoLibrary: createInitialPermission("photoLibrary"),

    location: createInitialPermission("location"),

    notifications: createInitialPermission("notifications"),
  };
}

// ============================================================
// PERMISSION RESPONSE NORMALIZER
// ============================================================

interface NativePermissionResponse {
  granted: boolean;

  canAskAgain: boolean;

  status: string;

  expires?: string | number;
}

function normalizePermission(
  name: PermissionName,
  response: NativePermissionResponse,
): PermissionSnapshot {
  let status: PermissionStatus;

  if (response.granted) {
    status = "granted";
  } else if (response.status === "undetermined") {
    status = "undetermined";
  } else {
    status = "denied";
  }

  return {
    name,

    status,

    granted: response.granted,

    canAskAgain: response.canAskAgain,

    isAvailable: true,

    message: response.granted
      ? "Permission granted."
      : response.canAskAgain
        ? "Permission has not been granted."
        : "Permission is denied. Enable it in device settings.",

    checkedAt: new Date(),
  };
}

// ============================================================
// UNAVAILABLE PERMISSION
// ============================================================

function createUnavailablePermission(
  name: PermissionName,
  message: string,
): PermissionSnapshot {
  return {
    name,

    status: "unavailable",

    granted: false,

    canAskAgain: false,

    isAvailable: false,

    message,

    checkedAt: new Date(),
  };
}

// ============================================================
// CHECK CAMERA PERMISSION
// ============================================================

async function checkCameraPermission(): Promise<PermissionSnapshot> {
  try {
    const response = await Camera.getCameraPermissionsAsync();

    return normalizePermission("camera", response);
  } catch {
    return createUnavailablePermission(
      "camera",
      "Unable to check camera permission.",
    );
  }
}

// ============================================================
// REQUEST CAMERA PERMISSION
// ============================================================

async function requestCameraPermission(): Promise<PermissionSnapshot> {
  try {
    const response = await Camera.requestCameraPermissionsAsync();

    return normalizePermission("camera", response);
  } catch {
    return createUnavailablePermission(
      "camera",
      "Unable to request camera permission.",
    );
  }
}

// ============================================================
// CHECK PHOTO LIBRARY PERMISSION
// ============================================================

async function checkPhotoLibraryPermission(): Promise<PermissionSnapshot> {
  try {
    const response = await ImagePicker.getMediaLibraryPermissionsAsync();

    return normalizePermission("photoLibrary", response);
  } catch {
    return createUnavailablePermission(
      "photoLibrary",
      "Unable to check photo library permission.",
    );
  }
}

// ============================================================
// REQUEST PHOTO LIBRARY PERMISSION
// ============================================================

async function requestPhotoLibraryPermission(): Promise<PermissionSnapshot> {
  try {
    const response = await ImagePicker.requestMediaLibraryPermissionsAsync();

    return normalizePermission("photoLibrary", response);
  } catch {
    return createUnavailablePermission(
      "photoLibrary",
      "Unable to request photo library permission.",
    );
  }
}

// ============================================================
// CHECK LOCATION PERMISSION
// ============================================================

async function checkLocationPermission(): Promise<PermissionSnapshot> {
  try {
    const response = await Location.getForegroundPermissionsAsync();

    return normalizePermission("location", response);
  } catch {
    return createUnavailablePermission(
      "location",
      "Unable to check location permission.",
    );
  }
}

// ============================================================
// REQUEST LOCATION PERMISSION
// ============================================================

async function requestLocationPermission(): Promise<PermissionSnapshot> {
  try {
    const response = await Location.requestForegroundPermissionsAsync();

    return normalizePermission("location", response);
  } catch {
    return createUnavailablePermission(
      "location",
      "Unable to request location permission.",
    );
  }
}

// ============================================================
// CHECK NOTIFICATION PERMISSION
// ============================================================

async function checkNotificationPermission(): Promise<PermissionSnapshot> {
  try {
    const response = await Notifications.getPermissionsAsync();

    return normalizePermission("notifications", response);
  } catch {
    return createUnavailablePermission(
      "notifications",
      "Unable to check notification permission.",
    );
  }
}

// ============================================================
// REQUEST NOTIFICATION PERMISSION
// ============================================================

async function requestNotificationPermission(): Promise<PermissionSnapshot> {
  try {
    const response = await Notifications.requestPermissionsAsync();

    return normalizePermission("notifications", response);
  } catch {
    return createUnavailablePermission(
      "notifications",
      "Unable to request notification permission.",
    );
  }
}

// ============================================================
// CHECK PERMISSION DISPATCHER
// ============================================================

async function checkPermission(
  name: PermissionName,
): Promise<PermissionSnapshot> {
  switch (name) {
    case "camera":
      return checkCameraPermission();

    case "photoLibrary":
      return checkPhotoLibraryPermission();

    case "location":
      return checkLocationPermission();

    case "notifications":
      return checkNotificationPermission();

    default: {
      const exhaustiveCheck: never = name;

      throw new Error(`Unsupported permission: ${exhaustiveCheck}`);
    }
  }
}

// ============================================================
// REQUEST PERMISSION DISPATCHER
// ============================================================

async function requestPermission(
  name: PermissionName,
): Promise<PermissionSnapshot> {
  switch (name) {
    case "camera":
      return requestCameraPermission();

    case "photoLibrary":
      return requestPhotoLibraryPermission();

    case "location":
      return requestLocationPermission();

    case "notifications":
      return requestNotificationPermission();

    default: {
      const exhaustiveCheck: never = name;

      throw new Error(`Unsupported permission: ${exhaustiveCheck}`);
    }
  }
}

// ============================================================
// RESULT CONVERTER
// ============================================================

function createPermissionResult(
  permission: PermissionSnapshot,
): PermissionResult {
  return {
    success: permission.granted,

    permission: permission.name,

    status: permission.status,

    granted: permission.granted,

    canAskAgain: permission.canAskAgain,

    message: permission.message,
  };
}

// ============================================================
// MAIN PERMISSIONS HOOK
// ============================================================

export function usePermissions(options: UsePermissionsOptions = {}) {
  const { checkOnMount = true, onGranted, onDenied } = options;

  const [permissions, setPermissions] = useState<PermissionMap>(
    createInitialPermissionMap,
  );

  const [isLoading, setIsLoading] = useState(false);

  const [requestingPermission, setRequestingPermission] =
    useState<PermissionName | null>(null);

  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------------------------
  // UPDATE ONE PERMISSION
  // ----------------------------------------------------------

  const updatePermission = useCallback(
    (permission: PermissionSnapshot) => {
      setPermissions((previous) => ({
        ...previous,

        [permission.name]: permission,
      }));

      if (permission.granted) {
        onGranted?.(permission.name);
      } else if (permission.status === "denied") {
        onDenied?.(permission.name);
      }
    },
    [onGranted, onDenied],
  );

  // ----------------------------------------------------------
  // CHECK ONE PERMISSION
  // ----------------------------------------------------------

  const check = useCallback(
    async (name: PermissionName): Promise<PermissionResult> => {
      try {
        const result = await checkPermission(name);

        updatePermission(result);

        return createPermissionResult(result);
      } catch (exception) {
        const message =
          exception instanceof Error
            ? exception.message
            : "Permission check failed.";

        setError(message);

        return {
          success: false,
          permission: name,
          status: "unavailable",
          granted: false,
          canAskAgain: false,
          message,
        };
      }
    },
    [updatePermission],
  );

  // ----------------------------------------------------------
  // REQUEST ONE PERMISSION
  // ----------------------------------------------------------

  const request = useCallback(
    async (name: PermissionName): Promise<PermissionResult> => {
      setRequestingPermission(name);

      setError(null);

      try {
        const result = await requestPermission(name);

        updatePermission(result);

        return createPermissionResult(result);
      } catch (exception) {
        const message =
          exception instanceof Error
            ? exception.message
            : "Permission request failed.";

        setError(message);

        return {
          success: false,
          permission: name,
          status: "unavailable",
          granted: false,
          canAskAgain: false,
          message,
        };
      } finally {
        setRequestingPermission(null);
      }
    },
    [updatePermission],
  );

  // ----------------------------------------------------------
  // CHECK ALL PERMISSIONS
  // ----------------------------------------------------------

  const checkAll = useCallback(async (): Promise<PermissionMap> => {
    setIsLoading(true);

    setError(null);

    try {
      const names: PermissionName[] = [
        "camera",
        "photoLibrary",
        "location",
        "notifications",
      ];

      const results = await Promise.all(
        names.map((name) => checkPermission(name)),
      );

      const nextPermissions = results.reduce<PermissionMap>(
        (map, permission) => {
          map[permission.name] = permission;

          return map;
        },
        createInitialPermissionMap(),
      );

      setPermissions(nextPermissions);

      return nextPermissions;
    } catch (exception) {
      const message =
        exception instanceof Error
          ? exception.message
          : "Unable to check permissions.";

      setError(message);

      throw exception;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ----------------------------------------------------------
  // REQUEST MULTIPLE PERMISSIONS
  // ----------------------------------------------------------

  const requestMultiple = useCallback(
    async (names: PermissionName[]): Promise<PermissionResult[]> => {
      const results: PermissionResult[] = [];

      for (const name of names) {
        const result = await request(name);

        results.push(result);
      }

      return results;
    },
    [request],
  );

  // ----------------------------------------------------------
  // CHECK IF A PERMISSION IS GRANTED
  // ----------------------------------------------------------

  const isGranted = useCallback(
    (name: PermissionName): boolean => {
      return permissions[name].granted;
    },
    [permissions],
  );

  // ----------------------------------------------------------
  // CHECK IF A PERMISSION CAN BE REQUESTED
  // ----------------------------------------------------------

  const canRequest = useCallback(
    (name: PermissionName): boolean => {
      const permission = permissions[name];

      return (
        permission.isAvailable && permission.canAskAgain && !permission.granted
      );
    },
    [permissions],
  );

  // ----------------------------------------------------------
  // GET PERMISSION DETAILS
  // ----------------------------------------------------------

  const getPermission = useCallback(
    (name: PermissionName): PermissionSnapshot => {
      return permissions[name];
    },
    [permissions],
  );

  // ----------------------------------------------------------
  // REQUEST REQUIRED CAMERA AND PHOTO ACCESS
  // ----------------------------------------------------------

  const requestImagePermissions = useCallback(async () => {
    return requestMultiple(["camera", "photoLibrary"]);
  }, [requestMultiple]);

  // ----------------------------------------------------------
  // REQUEST LOCATION ACCESS
  // ----------------------------------------------------------

  const requestLocationAccess = useCallback(async () => {
    return request("location");
  }, [request]);

  // ----------------------------------------------------------
  // REQUEST NOTIFICATION ACCESS
  // ----------------------------------------------------------

  const requestNotificationAccess = useCallback(async () => {
    return request("notifications");
  }, [request]);

  // ----------------------------------------------------------
  // PERMISSION SUMMARY
  // ----------------------------------------------------------

  const grantedCount = Object.values(permissions).filter(
    (permission) => permission.granted,
  ).length;

  const totalCount = Object.keys(permissions).length;

  const allGranted = grantedCount === totalCount;

  // ----------------------------------------------------------
  // INITIAL CHECK
  // ----------------------------------------------------------

  useEffect(() => {
    if (checkOnMount) {
      void checkAll().catch(() => {
        // The error is stored in hook state.
      });
    }
  }, [checkOnMount, checkAll]);

  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------

  return {
    permissions,

    isLoading,

    requestingPermission,

    error,

    grantedCount,

    totalCount,

    allGranted,

    check,
    checkAll,

    request,
    requestMultiple,

    isGranted,
    canRequest,
    getPermission,

    requestImagePermissions,
    requestLocationAccess,
    requestNotificationAccess,
  };
}

// ============================================================
// CAMERA PERMISSION HOOK
// ============================================================

export function useCameraPermission() {
  const { permissions, check, request, isGranted, canRequest } =
    usePermissions();

  const permission = permissions.camera;

  const checkCamera = useCallback(() => check("camera"), [check]);

  const requestCamera = useCallback(() => request("camera"), [request]);

  return {
    ...permission,

    isGranted: isGranted("camera"),

    canRequest: canRequest("camera"),

    checkCamera,

    requestCamera,
  };
}

// ============================================================
// PHOTO LIBRARY PERMISSION HOOK
// ============================================================

export function usePhotoLibraryPermission() {
  const { permissions, check, request, isGranted, canRequest } =
    usePermissions();

  const permission = permissions.photoLibrary;

  const checkPhotoLibrary = useCallback(() => check("photoLibrary"), [check]);

  const requestPhotoLibrary = useCallback(
    () => request("photoLibrary"),
    [request],
  );

  return {
    ...permission,

    isGranted: isGranted("photoLibrary"),

    canRequest: canRequest("photoLibrary"),

    checkPhotoLibrary,

    requestPhotoLibrary,
  };
}

// ============================================================
// LOCATION PERMISSION HOOK
// ============================================================

export function useLocationPermission() {
  const { permissions, check, request, isGranted, canRequest } =
    usePermissions();

  const permission = permissions.location;

  const checkLocation = useCallback(() => check("location"), [check]);

  const requestLocation = useCallback(() => request("location"), [request]);

  return {
    ...permission,

    isGranted: isGranted("location"),

    canRequest: canRequest("location"),

    checkLocation,

    requestLocation,
  };
}

// ============================================================
// NOTIFICATION PERMISSION HOOK
// ============================================================

export function useNotificationPermission() {
  const { permissions, check, request, isGranted, canRequest } =
    usePermissions();

  const permission = permissions.notifications;

  const checkNotifications = useCallback(() => check("notifications"), [check]);

  const requestNotifications = useCallback(
    () => request("notifications"),
    [request],
  );

  return {
    ...permission,

    isGranted: isGranted("notifications"),

    canRequest: canRequest("notifications"),

    checkNotifications,

    requestNotifications,
  };
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default usePermissions;

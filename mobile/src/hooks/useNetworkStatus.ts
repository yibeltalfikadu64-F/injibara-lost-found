// mobile/src/hooks/useNetworkStatus.ts

import { useCallback, useEffect, useRef, useState } from "react";

import NetInfo, {
  type NetInfoState,
  type NetInfoSubscription,
} from "@react-native-community/netinfo";

// ============================================================
// TYPES
// ============================================================

export type NetworkConnectionType =
  | "none"
  | "unknown"
  | "wifi"
  | "cellular"
  | "ethernet"
  | "bluetooth"
  | "vpn"
  | "other";

export type CellularGeneration = "2g" | "3g" | "4g" | "5g" | null;

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isOnline: boolean;
  isOffline: boolean;

  connectionType: NetworkConnectionType;

  isWifi: boolean;
  isCellular: boolean;
  isEthernet: boolean;

  cellularGeneration: CellularGeneration;

  isConnectionExpensive: boolean | null;

  details: NetInfoState | null;

  isLoading: boolean;
  error: string | null;

  lastUpdated: Date | null;
}

export interface UseNetworkStatusOptions {
  /**
   * Check connectivity when the hook first mounts.
   */
  fetchOnMount?: boolean;

  /**
   * Subscribe to connectivity changes.
   */
  listenToChanges?: boolean;

  /**
   * Callback called when online status changes.
   */
  onOnline?: () => void;

  /**
   * Callback called when offline status changes.
   */
  onOffline?: () => void;

  /**
   * Callback called whenever network information changes.
   */
  onNetworkChange?: (status: NetworkStatus) => void;
}

// ============================================================
// INITIAL STATE
// ============================================================

const initialNetworkStatus: NetworkStatus = {
  isConnected: false,
  isInternetReachable: null,
  isOnline: false,
  isOffline: true,

  connectionType: "unknown",

  isWifi: false,
  isCellular: false,
  isEthernet: false,

  cellularGeneration: null,

  isConnectionExpensive: null,

  details: null,

  isLoading: true,
  error: null,

  lastUpdated: null,
};

// ============================================================
// CONNECTION TYPE HELPER
// ============================================================

function normalizeConnectionType(
  type: NetInfoState["type"],
): NetworkConnectionType {
  switch (type) {
    case "none":
      return "none";

    case "unknown":
      return "unknown";

    case "wifi":
      return "wifi";

    case "cellular":
      return "cellular";

    case "ethernet":
      return "ethernet";

    case "bluetooth":
      return "bluetooth";

    case "vpn":
      return "vpn";

    case "other":
      return "other";

    default:
      return "unknown";
  }
}

// ============================================================
// CELLULAR GENERATION HELPER
// ============================================================

function getCellularGeneration(state: NetInfoState): CellularGeneration {
  if (state.type !== "cellular") {
    return null;
  }

  return state.details.cellularGeneration ?? null;
}

// ============================================================
// NETWORK STATUS CONVERTER
// ============================================================

function convertNetworkState(state: NetInfoState): NetworkStatus {
  const isConnected = state.isConnected === true;

  const isInternetReachable = state.isInternetReachable;

  // When internet reachability is unknown, use
  // connection status as a temporary indication.
  const isOnline = isConnected && isInternetReachable !== false;

  const connectionType = normalizeConnectionType(state.type);

  const isWifi = state.type === "wifi";

  const isCellular = state.type === "cellular";

  const isEthernet = state.type === "ethernet";

  const cellularGeneration = getCellularGeneration(state);

  const isConnectionExpensive =
    "isConnectionExpensive" in state.details
      ? state.details.isConnectionExpensive
      : null;

  return {
    isConnected,
    isInternetReachable,

    isOnline,
    isOffline: !isOnline,

    connectionType,

    isWifi,
    isCellular,
    isEthernet,

    cellularGeneration,

    isConnectionExpensive,

    details: state,

    isLoading: false,
    error: null,

    lastUpdated: new Date(),
  };
}

// ============================================================
// ERROR HELPER
// ============================================================

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to retrieve network information.";
}

// ============================================================
// MAIN HOOK
// ============================================================

export function useNetworkStatus(options: UseNetworkStatusOptions = {}) {
  const {
    fetchOnMount = true,
    listenToChanges = true,
    onOnline,
    onOffline,
    onNetworkChange,
  } = options;

  const [networkStatus, setNetworkStatus] =
    useState<NetworkStatus>(initialNetworkStatus);

  const [refreshing, setRefreshing] = useState(false);

  const previousOnlineState = useRef<boolean | null>(null);

  const mounted = useRef(false);

  // ----------------------------------------------------------
  // UPDATE NETWORK STATE
  // ----------------------------------------------------------

  const updateNetworkStatus = useCallback(
    (state: NetInfoState) => {
      const nextStatus = convertNetworkState(state);

      setNetworkStatus(nextStatus);

      if (!mounted.current) {
        return;
      }

      const previous = previousOnlineState.current;

      if (previous !== null && previous !== nextStatus.isOnline) {
        if (nextStatus.isOnline) {
          onOnline?.();
        } else {
          onOffline?.();
        }
      }

      previousOnlineState.current = nextStatus.isOnline;

      onNetworkChange?.(nextStatus);
    },
    [onOnline, onOffline, onNetworkChange],
  );

  // ----------------------------------------------------------
  // FETCH CURRENT NETWORK STATUS
  // ----------------------------------------------------------

  const refresh = useCallback(async () => {
    setRefreshing(true);

    try {
      const state = await NetInfo.fetch();

      updateNetworkStatus(state);

      return state;
    } catch (error) {
      const message = getErrorMessage(error);

      setNetworkStatus((previous) => ({
        ...previous,
        isLoading: false,
        error: message,
        lastUpdated: new Date(),
      }));

      throw error;
    } finally {
      setRefreshing(false);
    }
  }, [updateNetworkStatus]);

  // ----------------------------------------------------------
  // CHECK INTERNET CONNECTION
  // ----------------------------------------------------------

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();

      updateNetworkStatus(state);

      return state.isConnected === true && state.isInternetReachable !== false;
    } catch (error) {
      setNetworkStatus((previous) => ({
        ...previous,
        error: getErrorMessage(error),
      }));

      return false;
    }
  }, [updateNetworkStatus]);

  // ----------------------------------------------------------
  // SUBSCRIBE TO NETWORK CHANGES
  // ----------------------------------------------------------

  useEffect(() => {
    mounted.current = true;

    let unsubscribe: NetInfoSubscription | undefined;

    if (fetchOnMount) {
      void refresh().catch(() => {
        // The hook exposes the error in its state.
      });
    }

    if (listenToChanges) {
      unsubscribe = NetInfo.addEventListener((state) => {
        updateNetworkStatus(state);
      });
    }

    return () => {
      mounted.current = false;
      unsubscribe?.();
    };
  }, [fetchOnMount, listenToChanges, refresh, updateNetworkStatus]);

  // ----------------------------------------------------------
  // CONNECTION HELPERS
  // ----------------------------------------------------------

  const isWifiConnected = useCallback(
    () => networkStatus.isWifi && networkStatus.isOnline,
    [networkStatus.isWifi, networkStatus.isOnline],
  );

  const isMobileDataConnected = useCallback(
    () => networkStatus.isCellular && networkStatus.isOnline,
    [networkStatus.isCellular, networkStatus.isOnline],
  );

  const isInternetAvailable = useCallback(
    () =>
      networkStatus.isConnected && networkStatus.isInternetReachable !== false,
    [networkStatus.isConnected, networkStatus.isInternetReachable],
  );

  const isExpensiveConnection = useCallback(
    () => networkStatus.isConnectionExpensive === true,
    [networkStatus.isConnectionExpensive],
  );

  // ----------------------------------------------------------
  // RETURN HOOK API
  // ----------------------------------------------------------

  return {
    ...networkStatus,

    refreshing,

    refresh,
    checkConnection,

    isWifiConnected,
    isMobileDataConnected,
    isInternetAvailable,
    isExpensiveConnection,
  };
}

// ============================================================
// SIMPLE ONLINE/OFFLINE HOOK
// ============================================================

export function useIsOnline(): boolean {
  const { isOnline } = useNetworkStatus();

  return isOnline;
}

// ============================================================
// SIMPLE OFFLINE HOOK
// ============================================================

export function useIsOffline(): boolean {
  const { isOffline } = useNetworkStatus();

  return isOffline;
}

// ============================================================
// CONNECTION TYPE HOOK
// ============================================================

export function useConnectionType(): NetworkConnectionType {
  const { connectionType } = useNetworkStatus();

  return connectionType;
}

// ============================================================
// WIFI STATUS HOOK
// ============================================================

export function useWifiStatus(): boolean {
  const { isWifi, isOnline } = useNetworkStatus();

  return isWifi && isOnline;
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default useNetworkStatus;

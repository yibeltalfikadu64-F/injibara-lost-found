// mobile/src/services/networkService.ts

import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
  NetInfoStateType,
} from "@react-native-community/netinfo";

// ============================================================
// TYPES
// ============================================================

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoStateType;
  isWifiEnabled: boolean;
  isCellular: boolean;
  isWifi: boolean;
  isOffline: boolean;
  details: NetInfoState["details"];
}

export type NetworkListener = (status: NetworkStatus) => void;

export interface NetworkChangeOptions {
  onlyWhenChanged?: boolean;
}

// ============================================================
// STATE
// ============================================================

let currentStatus: NetworkStatus | null = null;

let networkSubscription: NetInfoSubscription | null = null;

const listeners = new Set<NetworkListener>();

// ============================================================
// CONVERT NETWORK STATE
// ============================================================

function normalizeNetworkState(state: NetInfoState): NetworkStatus {
  const isConnected = state.isConnected === true;

  const isInternetReachable = state.isInternetReachable;

  const isOffline = !isConnected || isInternetReachable === false;

  return {
    isConnected,

    isInternetReachable,

    type: state.type,

    isWifiEnabled: state.type === "wifi",

    isCellular: state.type === "cellular",

    isWifi: state.type === "wifi",

    isOffline,

    details: state.details,
  };
}

// ============================================================
// STATUS COMPARISON
// ============================================================

function hasStatusChanged(
  first: NetworkStatus | null,
  second: NetworkStatus,
): boolean {
  if (!first) {
    return true;
  }

  return (
    first.isConnected !== second.isConnected ||
    first.isInternetReachable !== second.isInternetReachable ||
    first.type !== second.type ||
    first.isOffline !== second.isOffline
  );
}

// ============================================================
// NOTIFY LISTENERS
// ============================================================

function notifyListeners(status: NetworkStatus): void {
  listeners.forEach((listener) => {
    try {
      listener(status);
    } catch (error) {
      // One listener must not prevent the others
      // from receiving network updates.
      console.warn("Network listener error:", error);
    }
  });
}

// ============================================================
// GET CURRENT STATUS
// ============================================================

async function getNetworkStatus(): Promise<NetworkStatus> {
  const state = await NetInfo.fetch();

  const status = normalizeNetworkState(state);

  currentStatus = status;

  return status;
}

// ============================================================
// CONNECTIVITY CHECK
// ============================================================

async function isConnected(): Promise<boolean> {
  const status = await getNetworkStatus();

  return status.isConnected;
}

// ============================================================
// INTERNET REACHABILITY CHECK
// ============================================================

async function isInternetReachable(): Promise<boolean> {
  const status = await getNetworkStatus();

  return status.isConnected && status.isInternetReachable !== false;
}

// ============================================================
// OFFLINE CHECK
// ============================================================

async function isOffline(): Promise<boolean> {
  const status = await getNetworkStatus();

  return status.isOffline;
}

// ============================================================
// WIFI CHECK
// ============================================================

async function isUsingWifi(): Promise<boolean> {
  const status = await getNetworkStatus();

  return status.isWifi;
}

// ============================================================
// CELLULAR CHECK
// ============================================================

async function isUsingCellular(): Promise<boolean> {
  const status = await getNetworkStatus();

  return status.isCellular;
}

// ============================================================
// SUBSCRIBE TO NETWORK CHANGES
// ============================================================

function subscribe(
  listener: NetworkListener,
  options: NetworkChangeOptions = {},
): () => void {
  listeners.add(listener);

  if (!networkSubscription) {
    networkSubscription = NetInfo.addEventListener((state) => {
      const nextStatus = normalizeNetworkState(state);

      const changed = hasStatusChanged(currentStatus, nextStatus);

      currentStatus = nextStatus;

      if (!options.onlyWhenChanged || changed) {
        notifyListeners(nextStatus);
      }
    });
  }

  // Deliver the most recently known status immediately.
  if (currentStatus) {
    listener(currentStatus);
  } else {
    void getNetworkStatus()
      .then(listener)
      .catch((error) => {
        console.warn("Unable to retrieve network status:", error);
      });
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      networkSubscription?.();

      networkSubscription = null;
    }
  };
}

// ============================================================
// START MONITORING
// ============================================================

function startMonitoring(): void {
  if (networkSubscription) {
    return;
  }

  networkSubscription = NetInfo.addEventListener((state) => {
    const nextStatus = normalizeNetworkState(state);

    const changed = hasStatusChanged(currentStatus, nextStatus);

    currentStatus = nextStatus;

    if (changed) {
      notifyListeners(nextStatus);
    }
  });
}

// ============================================================
// STOP MONITORING
// ============================================================

function stopMonitoring(): void {
  networkSubscription?.();

  networkSubscription = null;

  listeners.clear();
}

// ============================================================
// REFRESH NETWORK STATUS
// ============================================================

async function refreshNetworkStatus(): Promise<NetworkStatus> {
  const state = await NetInfo.refresh();

  const status = normalizeNetworkState(state);

  const changed = hasStatusChanged(currentStatus, status);

  currentStatus = status;

  if (changed) {
    notifyListeners(status);
  }

  return status;
}

// ============================================================
// CURRENT CACHED STATUS
// ============================================================

function getCachedNetworkStatus(): NetworkStatus | null {
  return currentStatus;
}

// ============================================================
// CONNECTION TYPE LABEL
// ============================================================

function getConnectionTypeLabel(type: NetInfoStateType): string {
  switch (type) {
    case "wifi":
      return "Wi-Fi";

    case "cellular":
      return "Mobile Data";

    case "ethernet":
      return "Ethernet";

    case "bluetooth":
      return "Bluetooth";

    case "vpn":
      return "VPN";

    case "none":
      return "No Connection";

    case "unknown":
    default:
      return "Unknown Connection";
  }
}

// ============================================================
// CONNECTION QUALITY
// ============================================================

function getConnectionQuality(
  status: NetworkStatus,
): "OFFLINE" | "UNKNOWN" | "CONNECTED" {
  if (status.isOffline) {
    return "OFFLINE";
  }

  if (status.isInternetReachable === null) {
    return "UNKNOWN";
  }

  return "CONNECTED";
}

// ============================================================
// WAIT FOR CONNECTION
// ============================================================

function waitForConnection(timeoutMs = 15_000): Promise<NetworkStatus> {
  return new Promise((resolve, reject) => {
    let finished = false;

    let unsubscribe: (() => void) | null = null;

    const timeout = setTimeout(() => {
      if (finished) {
        return;
      }

      finished = true;

      unsubscribe?.();

      reject(new Error("Timed out waiting for an internet connection."));
    }, timeoutMs);

    unsubscribe = subscribe((status) => {
      if (finished || status.isOffline) {
        return;
      }

      finished = true;

      clearTimeout(timeout);

      unsubscribe?.();

      resolve(status);
    });
  });
}

// ============================================================
// EXPORT
// ============================================================

const networkService = {
  getNetworkStatus,

  isConnected,
  isInternetReachable,
  isOffline,

  isUsingWifi,
  isUsingCellular,

  subscribe,

  startMonitoring,
  stopMonitoring,

  refreshNetworkStatus,

  getCachedNetworkStatus,

  getConnectionTypeLabel,
  getConnectionQuality,

  waitForConnection,
};

export default networkService;

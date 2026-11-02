// mobile/src/services/notificationService.ts

import { Platform } from "react-native";

import * as Notifications from "expo-notifications";

import * as Device from "expo-device";

import Constants from "expo-constants";

import api from "./apiClient";

// ============================================================
// TYPES
// ============================================================

export interface NotificationPermissionResult {
  granted: boolean;
  status: Notifications.PermissionStatus;
  canAskAgain: boolean;
}

export interface PushTokenResult {
  token: string;
  type: "expo";
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: boolean;
  channelId?: string;
}

export interface NotificationRegistrationPayload {
  token: string;
  platform: "ios" | "android" | "web";
  deviceName?: string;
}

export interface NotificationListenerCallbacks {
  onReceived?: (notification: Notifications.Notification) => void;

  onResponse?: (response: Notifications.NotificationResponse) => void;
}

// ============================================================
// NOTIFICATION CHANNELS
// ============================================================

export const NOTIFICATION_CHANNELS = {
  DEFAULT: "default",

  CLAIMS: "claims",

  ITEMS: "items",

  SECURITY: "security",

  ANNOUNCEMENTS: "announcements",
} as const;

// ============================================================
// INITIALIZATION
// ============================================================

let isInitialized = false;

let receivedSubscription: Notifications.EventSubscription | null = null;

let responseSubscription: Notifications.EventSubscription | null = null;

// ============================================================
// FOREGROUND BEHAVIOR
// ============================================================

function configureForegroundNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,

      shouldShowList: true,

      shouldPlaySound: true,

      shouldSetBadge: true,
    }),
  });
}

// ============================================================
// ANDROID CHANNELS
// ============================================================

async function createAndroidChannels(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    NOTIFICATION_CHANNELS.DEFAULT,
    {
      name: "General Notifications",

      importance: Notifications.AndroidImportance.HIGH,

      vibrationPattern: [0, 250, 250, 250],

      lightColor: "#2563EB",

      sound: "default",
    },
  );

  await Notifications.setNotificationChannelAsync(
    NOTIFICATION_CHANNELS.CLAIMS,
    {
      name: "Claim Updates",

      description: "Notifications about item ownership claims.",

      importance: Notifications.AndroidImportance.HIGH,

      vibrationPattern: [0, 200, 150, 200],

      sound: "default",
    },
  );

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.ITEMS, {
    name: "Lost and Found Items",

    description: "Notifications about matching and item updates.",

    importance: Notifications.AndroidImportance.DEFAULT,

    sound: "default",
  });

  await Notifications.setNotificationChannelAsync(
    NOTIFICATION_CHANNELS.SECURITY,
    {
      name: "Security Notifications",

      description: "Important campus security and handover updates.",

      importance: Notifications.AndroidImportance.MAX,

      vibrationPattern: [0, 300, 150, 300],

      sound: "default",
    },
  );

  await Notifications.setNotificationChannelAsync(
    NOTIFICATION_CHANNELS.ANNOUNCEMENTS,
    {
      name: "Campus Announcements",

      importance: Notifications.AndroidImportance.DEFAULT,
    },
  );
}

// ============================================================
// INITIALIZE
// ============================================================

async function initialize(): Promise<void> {
  if (isInitialized) {
    return;
  }

  configureForegroundNotifications();

  await createAndroidChannels();

  isInitialized = true;
}

// ============================================================
// DEVICE CHECK
// ============================================================

function isPhysicalDevice(): boolean {
  return Device.isDevice;
}

// ============================================================
// PERMISSION STATUS
// ============================================================

async function getPermissionStatus(): Promise<NotificationPermissionResult> {
  const permissions = await Notifications.getPermissionsAsync();

  return {
    granted: permissions.granted,

    status: permissions.status,

    canAskAgain: permissions.canAskAgain,
  };
}

// ============================================================
// REQUEST PERMISSION
// ============================================================

async function requestPermission(): Promise<NotificationPermissionResult> {
  await initialize();

  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return {
      granted: true,

      status: current.status,

      canAskAgain: current.canAskAgain,
    };
  }

  if (!current.canAskAgain) {
    return {
      granted: false,

      status: current.status,

      canAskAgain: false,
    };
  }

  const requested = await Notifications.requestPermissionsAsync();

  return {
    granted: requested.granted,

    status: requested.status,

    canAskAgain: requested.canAskAgain,
  };
}

// ============================================================
// PROJECT ID
// ============================================================

function getEasProjectId(): string | undefined {
  return (
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId
  );
}

// ============================================================
// GET EXPO PUSH TOKEN
// ============================================================

async function getPushToken(): Promise<PushTokenResult | null> {
  if (!isPhysicalDevice()) {
    throw new Error(
      "Push notifications require a physical device for this setup.",
    );
  }

  const permission = await requestPermission();

  if (!permission.granted) {
    return null;
  }

  const projectId = getEasProjectId();

  if (!projectId) {
    throw new Error(
      "Expo project ID is missing. Configure extra.eas.projectId in app.json or app.config.ts.",
    );
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return {
    token: token.data,

    type: "expo",
  };
}

// ============================================================
// REGISTER DEVICE WITH BACKEND
// ============================================================

async function registerDeviceWithBackend(): Promise<string | null> {
  const pushToken = await getPushToken();

  if (!pushToken) {
    return null;
  }

  const payload: NotificationRegistrationPayload = {
    token: pushToken.token,

    platform:
      Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : "web",

    deviceName: Device.deviceName ?? undefined,
  };

  await api.instance.post("/notifications/register-device", payload);

  return pushToken.token;
}

// ============================================================
// UNREGISTER DEVICE
// ============================================================

async function unregisterDevice(token?: string): Promise<void> {
  if (!token) {
    return;
  }

  await api.instance.post("/notifications/unregister-device", {
    token,
  });
}

// ============================================================
// LOCAL NOTIFICATION
// ============================================================

async function scheduleLocalNotification(
  payload: NotificationPayload,
  seconds = 1,
): Promise<string> {
  await initialize();

  if (!payload.title.trim()) {
    throw new Error("Notification title is required.");
  }

  if (!payload.body.trim()) {
    throw new Error("Notification body is required.");
  }

  const channelId = payload.channelId ?? NOTIFICATION_CHANNELS.DEFAULT;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: payload.title,

      body: payload.body,

      data: payload.data ?? {},

      sound: payload.sound === false ? undefined : "default",

      ...(Platform.OS === "android" ? { channelId } : {}),
    },

    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,

      seconds: Math.max(1, seconds),
    },
  });

  return identifier;
}

// ============================================================
// IMMEDIATE LOCAL NOTIFICATION
// ============================================================

async function showLocalNotification(
  payload: NotificationPayload,
): Promise<string> {
  return scheduleLocalNotification(payload, 1);
}

// ============================================================
// CANCEL NOTIFICATION
// ============================================================

async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// ============================================================
// CANCEL ALL SCHEDULED NOTIFICATIONS
// ============================================================

async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ============================================================
// GET SCHEDULED NOTIFICATIONS
// ============================================================

async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return Notifications.getAllScheduledNotificationsAsync();
}

// ============================================================
// CLEAR DISPLAYED NOTIFICATIONS
// ============================================================

async function clearDisplayedNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

// ============================================================
// SET BADGE COUNT
// ============================================================

async function setBadgeCount(count: number): Promise<void> {
  const safeCount = Math.max(0, Math.floor(count));

  await Notifications.setBadgeCountAsync(safeCount);
}

// ============================================================
// GET BADGE COUNT
// ============================================================

async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

// ============================================================
// LISTENERS
// ============================================================

function addNotificationListeners(
  callbacks: NotificationListenerCallbacks,
): () => void {
  const subscriptions: Notifications.EventSubscription[] = [];

  if (callbacks.onReceived) {
    subscriptions.push(
      Notifications.addNotificationReceivedListener(callbacks.onReceived),
    );
  }

  if (callbacks.onResponse) {
    subscriptions.push(
      Notifications.addNotificationResponseReceivedListener(
        callbacks.onResponse,
      ),
    );
  }

  return () => {
    subscriptions.forEach((subscription) => {
      subscription.remove();
    });
  };
}

// ============================================================
// GLOBAL LISTENERS
// ============================================================

function startGlobalListeners(callbacks: NotificationListenerCallbacks): void {
  stopGlobalListeners();

  if (callbacks.onReceived) {
    receivedSubscription = Notifications.addNotificationReceivedListener(
      callbacks.onReceived,
    );
  }

  if (callbacks.onResponse) {
    responseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        callbacks.onResponse,
      );
  }
}

function stopGlobalListeners(): void {
  receivedSubscription?.remove();

  responseSubscription?.remove();

  receivedSubscription = null;

  responseSubscription = null;
}

// ============================================================
// LAST NOTIFICATION RESPONSE
// ============================================================

async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return Notifications.getLastNotificationResponseAsync();
}

// ============================================================
// NOTIFICATION DATA
// ============================================================

function getNotificationData(
  notification: Notifications.Notification,
): Record<string, unknown> {
  return notification.request.content.data as Record<string, unknown>;
}

// ============================================================
// CLAIM NOTIFICATION
// ============================================================

async function notifyClaimUpdate(
  claimId: string,
  message: string,
): Promise<string> {
  return showLocalNotification({
    title: "Claim Update",

    body: message,

    channelId: NOTIFICATION_CHANNELS.CLAIMS,

    data: {
      type: "CLAIM_UPDATE",
      claimId,
    },
  });
}

// ============================================================
// ITEM MATCH NOTIFICATION
// ============================================================

async function notifyItemMatch(
  itemId: string,
  itemTitle: string,
): Promise<string> {
  return showLocalNotification({
    title: "Possible Item Match",

    body: `A possible match was found for ${itemTitle}.`,

    channelId: NOTIFICATION_CHANNELS.ITEMS,

    data: {
      type: "ITEM_MATCH",
      itemId,
    },
  });
}

// ============================================================
// SECURITY NOTIFICATION
// ============================================================

async function notifySecurityUpdate(
  title: string,
  message: string,
  data: Record<string, unknown> = {},
): Promise<string> {
  return showLocalNotification({
    title,

    body: message,

    channelId: NOTIFICATION_CHANNELS.SECURITY,

    data: {
      type: "SECURITY_UPDATE",
      ...data,
    },
  });
}

// ============================================================
// EXPORT
// ============================================================

const notificationService = {
  initialize,

  isPhysicalDevice,

  getPermissionStatus,
  requestPermission,

  getPushToken,
  registerDeviceWithBackend,
  unregisterDevice,

  scheduleLocalNotification,
  showLocalNotification,

  cancelNotification,
  cancelAllScheduledNotifications,
  getScheduledNotifications,

  clearDisplayedNotifications,

  setBadgeCount,
  getBadgeCount,

  addNotificationListeners,
  startGlobalListeners,
  stopGlobalListeners,

  getLastNotificationResponse,
  getNotificationData,

  notifyClaimUpdate,
  notifyItemMatch,
  notifySecurityUpdate,

  NOTIFICATION_CHANNELS,
};

export default notificationService;

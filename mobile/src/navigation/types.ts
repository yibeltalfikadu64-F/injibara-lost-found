import type { NavigatorScreenParams } from "@react-navigation/native";

/*
|--------------------------------------------------------------------------
| IMPORT STACK PARAMETER TYPES
|--------------------------------------------------------------------------
*/

import type { AuthStackParamList } from "./AuthNavigator";
import type { HomeStackParamList } from "./HomeStack";
import type { SearchStackParamList } from "./SearchStack";
import type { ReportStackParamList } from "./ReportStack";
import type { ActivityStackParamList } from "./ActivityStack";
import type { ProfileStackParamList } from "./ProfileStack";
import type { SecurityStackParamList } from "./SecurityNavigator";
import type { MainTabParamList, AdminStackParamList } from "./MainTabNavigator";

/*
|--------------------------------------------------------------------------
| ROOT NAVIGATION TYPES
|--------------------------------------------------------------------------
*/

export type RootNavigationParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;

  Main: NavigatorScreenParams<MainTabParamList>;

  Security: NavigatorScreenParams<SecurityStackParamList>;

  Unauthorized: undefined;

  NotFound: undefined;
};

/*
|--------------------------------------------------------------------------
| MAIN TAB NAVIGATION TYPES
|--------------------------------------------------------------------------
*/

export type MainNavigationParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;

  SearchTab: NavigatorScreenParams<SearchStackParamList>;

  ReportTab: NavigatorScreenParams<ReportStackParamList>;

  ActivityTab: NavigatorScreenParams<ActivityStackParamList>;

  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;

  AdminTab: NavigatorScreenParams<AdminStackParamList>;

  SecurityTab: NavigatorScreenParams<SecurityStackParamList>;
};

/*
|--------------------------------------------------------------------------
| INDIVIDUAL STACK TYPES
|--------------------------------------------------------------------------
*/

export type {
  AuthStackParamList,
  HomeStackParamList,
  SearchStackParamList,
  ReportStackParamList,
  ActivityStackParamList,
  ProfileStackParamList,
  SecurityStackParamList,
  AdminStackParamList,
  MainTabParamList,
};

/*
|--------------------------------------------------------------------------
| COMMON NAVIGATION PARAMETERS
|--------------------------------------------------------------------------
*/

export type ItemNavigationParams = {
  itemId: string;
  itemTitle?: string;
};

export type ClaimNavigationParams = {
  claimId: string;
};

export type CreateItemNavigationParams = {
  itemType?: "LOST" | "FOUND";
};

export type CreateClaimNavigationParams = {
  itemId: string;
  itemTitle?: string;
};

/*
|--------------------------------------------------------------------------
| NAVIGATION ROLE TYPES
|--------------------------------------------------------------------------
*/

export type NavigationUserRole = "STUDENT" | "STAFF" | "SECURITY" | "ADMIN";

/*
|--------------------------------------------------------------------------
| NAVIGATION PERMISSION TYPES
|--------------------------------------------------------------------------
*/

export interface NavigationPermission {
  role: NavigationUserRole;
  canReportLostItems: boolean;
  canReportFoundItems: boolean;
  canSubmitClaims: boolean;
  canReviewClaims: boolean;
  canVerifyOwnership: boolean;
  canManageUsers: boolean;
  canManageCategories: boolean;
  canManageLocations: boolean;
  canViewAuditLogs: boolean;
  canCompleteHandovers: boolean;
}

/*
|--------------------------------------------------------------------------
| ROLE PERMISSIONS
|--------------------------------------------------------------------------
|
| These permissions are for controlling application navigation.
| The backend must independently enforce the same permissions.
|
*/

export const NAVIGATION_PERMISSIONS: Record<
  NavigationUserRole,
  NavigationPermission
> = {
  STUDENT: {
    role: "STUDENT",
    canReportLostItems: true,
    canReportFoundItems: true,
    canSubmitClaims: true,
    canReviewClaims: false,
    canVerifyOwnership: false,
    canManageUsers: false,
    canManageCategories: false,
    canManageLocations: false,
    canViewAuditLogs: false,
    canCompleteHandovers: false,
  },

  STAFF: {
    role: "STAFF",
    canReportLostItems: true,
    canReportFoundItems: true,
    canSubmitClaims: true,
    canReviewClaims: false,
    canVerifyOwnership: false,
    canManageUsers: false,
    canManageCategories: false,
    canManageLocations: false,
    canViewAuditLogs: false,
    canCompleteHandovers: false,
  },

  SECURITY: {
    role: "SECURITY",
    canReportLostItems: true,
    canReportFoundItems: true,
    canSubmitClaims: false,
    canReviewClaims: true,
    canVerifyOwnership: true,
    canManageUsers: false,
    canManageCategories: false,
    canManageLocations: false,
    canViewAuditLogs: false,
    canCompleteHandovers: true,
  },

  ADMIN: {
    role: "ADMIN",
    canReportLostItems: true,
    canReportFoundItems: true,
    canSubmitClaims: true,
    canReviewClaims: true,
    canVerifyOwnership: true,
    canManageUsers: true,
    canManageCategories: true,
    canManageLocations: true,
    canViewAuditLogs: true,
    canCompleteHandovers: true,
  },
};

/*
|--------------------------------------------------------------------------
| GET USER NAVIGATION PERMISSIONS
|--------------------------------------------------------------------------
*/

export const getNavigationPermissions = (
  role: NavigationUserRole,
): NavigationPermission => {
  return NAVIGATION_PERMISSIONS[role];
};

/*
|--------------------------------------------------------------------------
| CHECK NAVIGATION PERMISSION
|--------------------------------------------------------------------------
*/

export const hasNavigationPermission = (
  role: NavigationUserRole,
  permission: keyof Omit<NavigationPermission, "role">,
): boolean => {
  return NAVIGATION_PERMISSIONS[role][permission];
};

/*
|--------------------------------------------------------------------------
| CHECK VALID USER ROLE
|--------------------------------------------------------------------------
*/

export const isValidNavigationRole = (
  role: string,
): role is NavigationUserRole => {
  return (
    role === "STUDENT" ||
    role === "STAFF" ||
    role === "SECURITY" ||
    role === "ADMIN"
  );
};

/*
|--------------------------------------------------------------------------
| GLOBAL NAVIGATION DECLARATION
|--------------------------------------------------------------------------
|
| Enables React Navigation's global TypeScript route checking.
|
*/

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootNavigationParamList {}
  }
}

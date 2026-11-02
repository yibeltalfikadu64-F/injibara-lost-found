/**
 * Shared dashboard hook.
 *
 * The implementation lives in:
 * features/dashboard/hooks/useDashboard.ts
 *
 * Dashboard caching, automatic refresh, loading state,
 * error handling and data fetching remain centralized
 * in the feature implementation.
 */

export {
  useDashboard,
  dashboardKeys,
} from "../features/dashboard/hooks/useDashboard";

export type {
  DashboardStats,
  DashboardActivity,
  DashboardItem,
  DashboardClaim,
  DashboardOverview,
  DashboardData,
  DashboardTrend,
  DashboardClaimTrend,
  DashboardQueryOptions,
} from "../features/dashboard/types/dashboard.types";

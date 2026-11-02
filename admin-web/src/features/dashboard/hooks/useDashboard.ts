import { useQuery, useQueryClient } from "@tanstack/react-query";

import { dashboardApi } from "../services/dashboardApi";

import type { DashboardQueryOptions } from "../types/dashboard.types";

export const dashboardKeys = {
  all: ["admin-dashboard"] as const,

  overview: () => [...dashboardKeys.all, "overview"] as const,

  activity: (limit: number) =>
    [...dashboardKeys.all, "activity", limit] as const,

  items: (limit: number) => [...dashboardKeys.all, "items", limit] as const,

  claims: (limit: number) => [...dashboardKeys.all, "claims", limit] as const,

  complete: (options: DashboardQueryOptions) =>
    [...dashboardKeys.all, "complete", options] as const,
};

export function useDashboard(options: DashboardQueryOptions = {}) {
  const queryClient = useQueryClient();

  const { activityLimit = 8, itemLimit = 5, claimLimit = 5 } = options;

  const query = useQuery({
    queryKey: dashboardKeys.complete({
      activityLimit,
      itemLimit,
      claimLimit,
    }),

    queryFn: () =>
      dashboardApi.getDashboardData({
        activityLimit,
        itemLimit,
        claimLimit,
      }),

    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: 1,
  });

  const refreshDashboard = async () => {
    await queryClient.invalidateQueries({
      queryKey: dashboardKeys.all,
    });
  };

  return {
    data: query.data,
    overview: query.data?.overview,
    stats: query.data?.overview.stats,
    recentActivity: query.data?.recentActivity ?? [],
    recentItems: query.data?.recentItems ?? [],
    recentClaims: query.data?.recentClaims ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    errorMessage:
      query.error instanceof Error
        ? query.error.message
        : "Unable to load dashboard data.",
    refreshDashboard,
    refetch: query.refetch,
  };
}

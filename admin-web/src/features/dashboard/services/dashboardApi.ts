import { apiClient } from "../../../lib/apiClient";

import type {
  DashboardActivity,
  DashboardClaim,
  DashboardItem,
  DashboardOverview,
  DashboardQueryOptions,
} from "../types/dashboard.types";

interface ApiList<T> {
  data?: T;
  items?: T;
  claims?: T;
  logs?: T;
  activities?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function unwrap<T>(response: unknown): T {
  const result = response as {
    data?: T;
  };

  if (
    result &&
    typeof result === "object" &&
    "data" in result &&
    result.data !== undefined
  ) {
    return result.data;
  }

  return response as T;
}

function extractList<T>(response: unknown, keys: string[]): T[] {
  const result = unwrap<unknown>(response);

  if (Array.isArray(result)) {
    return result as T[];
  }

  if (result && typeof result === "object") {
    const record = result as Record<string, unknown>;

    for (const key of keys) {
      if (Array.isArray(record[key])) {
        return record[key] as T[];
      }
    }

    const nested = record.data;

    if (nested && typeof nested === "object") {
      const nestedRecord = nested as Record<string, unknown>;

      for (const key of keys) {
        if (Array.isArray(nestedRecord[key])) {
          return nestedRecord[key] as T[];
        }
      }
    }
  }

  return [];
}

export const dashboardApi = {
  async getOverview(): Promise<DashboardOverview> {
    const response = await apiClient.get("/admin/dashboard");

    return unwrap<DashboardOverview>(response.data);
  },

  async getRecentActivity(limit = 8): Promise<DashboardActivity[]> {
    const response = await apiClient.get("/audit/recent", {
      params: { limit },
    });

    return extractList<DashboardActivity>(response.data, [
      "activities",
      "logs",
      "items",
    ]);
  },

  async getRecentItems(limit = 5): Promise<DashboardItem[]> {
    const response = await apiClient.get("/admin/items", {
      params: {
        page: 1,
        limit,
        sortBy: "dateReported",
        sortOrder: "desc",
      },
    });

    return extractList<DashboardItem>(response.data, ["items", "results"]);
  },

  async getRecentClaims(limit = 5): Promise<DashboardClaim[]> {
    const response = await apiClient.get("/admin/claims", {
      params: {
        page: 1,
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    });

    return extractList<DashboardClaim>(response.data, [
      "claims",
      "items",
      "results",
    ]);
  },

  async getDashboardData(options: DashboardQueryOptions = {}) {
    const { activityLimit = 8, itemLimit = 5, claimLimit = 5 } = options;

    const [overview, recentActivity, recentItems, recentClaims] =
      await Promise.all([
        this.getOverview(),
        this.getRecentActivity(activityLimit),
        this.getRecentItems(itemLimit),
        this.getRecentClaims(claimLimit),
      ]);

    return {
      overview,
      recentActivity,
      recentItems,
      recentClaims,
    };
  },
};

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalItems: number;
  lostItems: number;
  foundItems: number;
  openItems: number;
  claimedItems: number;
  recoveredItems: number;
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
}

export interface DashboardTrend {
  label: string;
  lost: number;
  found: number;
}

export interface DashboardClaimTrend {
  label: string;
  pending: number;
  approved: number;
  completed: number;
}

export interface DashboardActivity {
  id: string;
  action: string;
  description: string;
  entity?: string;
  entityId?: string;
  actorName?: string | null;
  actorEmail?: string | null;
  createdAt: string;
}

export interface DashboardItem {
  id: string;
  title: string;
  type: "LOST" | "FOUND";
  status: "OPEN" | "CLAIMED" | "RESOLVED" | "ARCHIVED";
  imageUrls?: string[];
  dateReported: string;
  reporter?: {
    id: string;
    fullName: string;
    email?: string;
  };
  category?: {
    id: string;
    name: string;
  } | null;
  location?: {
    id: string;
    name: string;
  } | null;
  isApproved: boolean;
}

export interface DashboardClaim {
  id: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  item?: {
    id: string;
    title: string;
    type: "LOST" | "FOUND";
  };
  claimant?: {
    id: string;
    fullName: string;
    email?: string;
  };
}

export interface DashboardOverview {
  stats: DashboardStats;
  itemTrends: DashboardTrend[];
  claimTrends: DashboardClaimTrend[];
}

export interface DashboardData {
  overview: DashboardOverview;
  recentActivity: DashboardActivity[];
  recentItems: DashboardItem[];
  recentClaims: DashboardClaim[];
}

export interface DashboardQueryOptions {
  activityLimit?: number;
  itemLimit?: number;
  claimLimit?: number;
}

export interface DashboardApiResponse<T> {
  data?: T;
  message?: string;
}

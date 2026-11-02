import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

// ======================================================
// 1. APPLICATION CONFIGURATION
// ======================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

const TOKEN_STORAGE_KEY = "injibara_admin_access_token";

const USER_STORAGE_KEY = "injibara_admin_user";

// ======================================================
// 2. TYPESCRIPT TYPES
// ======================================================

type PageName =
  | "dashboard"
  | "users"
  | "items"
  | "claims"
  | "announcements"
  | "audit";

type UserRole = "STUDENT" | "STAFF" | "SECURITY" | "ADMIN";

interface AdminUser {
  id?: string;
  fullName?: string;
  email?: string;
  role?: UserRole | string;
  avatarUrl?: string | null;
}

interface ApiError {
  message?: string;
  error?: string;
  statusCode?: number;
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  result?: T;
  accessToken?: string;
  access_token?: string;
  token?: string;
  user?: AdminUser;
  [key: string]: unknown;
}

interface DashboardStats {
  totalUsers: number;
  totalItems: number;
  lostItems: number;
  foundItems: number;
  pendingClaims: number;
  resolvedItems: number;
  activeUsers: number;
  totalClaims: number;
}

interface NavigationItem {
  id: PageName;
  label: string;
  icon: string;
  description: string;
}

interface TableColumn {
  key: string;
  label: string;
}

interface AnnouncementForm {
  title: string;
  content: string;
}

interface NotificationMessage {
  type: "success" | "error" | "info";
  text: string;
}

// ======================================================
// 3. NAVIGATION CONFIGURATION
// ======================================================

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "▦",
    description: "Overview and statistics",
  },
  {
    id: "users",
    label: "Users",
    icon: "♙",
    description: "Campus user management",
  },
  {
    id: "items",
    label: "Lost & Found Items",
    icon: "▣",
    description: "Reported campus items",
  },
  {
    id: "claims",
    label: "Claims",
    icon: "◇",
    description: "Ownership verification",
  },
  {
    id: "announcements",
    label: "Announcements",
    icon: "◉",
    description: "Campus announcements",
  },
  {
    id: "audit",
    label: "Audit Logs",
    icon: "▤",
    description: "System activity history",
  },
];

// ======================================================
// 4. DEFAULT DASHBOARD DATA
// ======================================================

const EMPTY_STATS: DashboardStats = {
  totalUsers: 0,
  totalItems: 0,
  lostItems: 0,
  foundItems: 0,
  pendingClaims: 0,
  resolvedItems: 0,
  activeUsers: 0,
  totalClaims: 0,
};

// ======================================================
// 5. API RESPONSE HELPERS
// ======================================================

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNestedValue(value: unknown, keys: string[]): unknown {
  let current: unknown = value;

  for (const key of keys) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[key];
  }

  return current;
}

function extractAccessToken(response: unknown, depth = 0): string | null {
  if (!isRecord(response) || depth > 5) {
    return null;
  }

  for (const key of ["accessToken", "access_token", "token"]) {
    const candidate = response[key];

    if (typeof candidate === "string" && candidate.length > 20) {
      return candidate;
    }
  }

  for (const key of ["data", "result", "tokens", "authentication"]) {
    const result = extractAccessToken(response[key], depth + 1);

    if (result) {
      return result;
    }
  }

  return null;
}

function extractUser(response: unknown): AdminUser | null {
  if (!isRecord(response)) {
    return null;
  }

  const candidates = [
    response.user,
    getNestedValue(response, ["data", "user"]),
    getNestedValue(response, ["data"]),
    response.result,
  ];

  for (const candidate of candidates) {
    if (
      isRecord(candidate) &&
      (typeof candidate.email === "string" ||
        typeof candidate.fullName === "string")
    ) {
      return candidate as AdminUser;
    }
  }

  return null;
}

function extractList(response: unknown): Record<string, unknown>[] {
  if (Array.isArray(response)) {
    return response.filter(isRecord);
  }

  if (!isRecord(response)) {
    return [];
  }

  const possibleLists = [
    response.data,
    response.items,
    response.users,
    response.claims,
    response.announcements,
    response.logs,
    response.results,
    getNestedValue(response, ["data", "items"]),
    getNestedValue(response, ["data", "users"]),
    getNestedValue(response, ["data", "claims"]),
    getNestedValue(response, ["data", "announcements"]),
    getNestedValue(response, ["data", "logs"]),
    getNestedValue(response, ["data", "results"]),
  ];

  for (const candidate of possibleLists) {
    if (Array.isArray(candidate)) {
      return candidate.filter(isRecord);
    }
  }

  return [];
}

// ======================================================
// 6. HTTP API CLIENT
// ======================================================

async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: options.signal ?? AbortSignal.timeout(20_000),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The server request timed out.");
    }

    throw new Error(
      "Cannot connect to the backend. Check that your API server is running.",
    );
  }

  const rawText = await response.text();

  let result: unknown = {};

  if (rawText) {
    try {
      result = JSON.parse(rawText);
    } catch {
      result = {
        message: rawText,
      };
    }
  }

  if (!response.ok) {
    const errorObject = isRecord(result) ? (result as ApiError) : {};

    const message =
      errorObject.message ??
      errorObject.error ??
      `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return result as T;
}

// ======================================================
// 7. DASHBOARD STATISTICS NORMALIZER
// ======================================================

function numberValue(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function findNumber(source: unknown, possibleKeys: string[]): number {
  if (!isRecord(source)) {
    return 0;
  }

  for (const key of possibleKeys) {
    if (source[key] !== undefined) {
      return numberValue(source[key]);
    }
  }

  return 0;
}

function normalizeStats(response: unknown): DashboardStats {
  const root = isRecord(response) ? response : {};

  const data = isRecord(root.data) ? root.data : root;

  const users = isRecord(data.users) ? data.users : {};

  const items = isRecord(data.items) ? data.items : {};

  const claims = isRecord(data.claims) ? data.claims : {};

  const stats = isRecord(data.statistics) ? data.statistics : data;

  return {
    totalUsers:
      findNumber(stats, ["totalUsers", "usersCount", "userCount"]) ||
      findNumber(users, ["total", "count"]),

    totalItems:
      findNumber(stats, ["totalItems", "itemsCount", "itemCount"]) ||
      findNumber(items, ["total", "count"]),

    lostItems:
      findNumber(stats, ["lostItems", "totalLostItems"]) ||
      findNumber(items, ["lost", "lostCount"]),

    foundItems:
      findNumber(stats, ["foundItems", "totalFoundItems"]) ||
      findNumber(items, ["found", "foundCount"]),

    pendingClaims:
      findNumber(stats, ["pendingClaims", "totalPendingClaims"]) ||
      findNumber(claims, ["pending", "pendingCount"]),

    resolvedItems:
      findNumber(stats, ["resolvedItems", "totalResolvedItems"]) ||
      findNumber(items, ["resolved", "resolvedCount"]),

    activeUsers:
      findNumber(stats, ["activeUsers", "totalActiveUsers"]) ||
      findNumber(users, ["active", "activeCount"]),

    totalClaims:
      findNumber(stats, ["totalClaims", "claimsCount", "claimCount"]) ||
      findNumber(claims, ["total", "count"]),
  };
}

// ======================================================
// 8. FORMATTING HELPERS
// ======================================================

function formatDate(value: unknown): string {
  if (!value) {
    return "—";
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatLabel(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function getInitials(name?: string): string {
  if (!name) {
    return "AD";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// ======================================================
// 9. STATUS BADGE
// ======================================================

function StatusBadge({ value }: { value: unknown }) {
  const status = String(value ?? "UNKNOWN").toUpperCase();

  const normalized = status.toLowerCase();

  let color = "neutral";

  if (
    ["approved", "completed", "resolved", "active", "published"].includes(
      normalized,
    )
  ) {
    color = "success";
  } else if (["pending", "claimed", "reviewing"].includes(normalized)) {
    color = "warning";
  } else if (
    ["rejected", "cancelled", "archived", "inactive", "suspended"].includes(
      normalized,
    )
  ) {
    color = "danger";
  }

  return (
    <span className={`status-badge ${color}`}>
      <span className="status-dot" />
      {formatLabel(status)}
    </span>
  );
}

// ======================================================
// 10. ICON COMPONENT
// ======================================================

function Icon({ name }: { name: string }) {
  return (
    <span className="icon" aria-hidden="true">
      {name}
    </span>
  );
}

// ======================================================
// 11. LOADING COMPONENT
// ======================================================

function LoadingState({
  message = "Loading information...",
}: {
  message?: string;
}) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}

// ======================================================
// 12. EMPTY STATE
// ======================================================

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">◇</div>

      <h3>{title}</h3>

      <p>{description}</p>
    </div>
  );
}

// ======================================================
// 13. ERROR STATE
// ======================================================

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="error-state">
      <div className="error-symbol">!</div>

      <h3>Unable to load information</h3>

      <p>{message}</p>

      <button className="button button-primary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

// ======================================================
// 14. STATISTIC CARD
// ======================================================

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
  subtitle: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div>
          <p className="stat-title">{title}</p>

          <h2 className="stat-value">{value.toLocaleString()}</h2>
        </div>

        <div className={`stat-icon ${color}`}>
          <Icon name={icon} />
        </div>
      </div>

      <p className="stat-subtitle">{subtitle}</p>
    </div>
  );
}

// ======================================================
// 15. GENERIC DATA TABLE
// ======================================================

function DataTable({
  rows,
  columns,
  loading,
  emptyTitle,
  emptyDescription,
}: {
  rows: Record<string, unknown>[];
  columns: TableColumn[];
  loading: boolean;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (loading) {
    return <LoadingState />;
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? row._id ?? index)}>
              {columns.map((column) => {
                const value = row[column.key];

                const isStatus =
                  column.key.toLowerCase().includes("status") ||
                  column.key === "role";

                return (
                  <td key={column.key}>
                    {isStatus ? (
                      <StatusBadge value={value} />
                    ) : (
                      <span
                        className="table-cell-text"
                        title={formatCell(value)}
                      >
                        {formatCell(value)}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ======================================================
// 16. TABLE COLUMN DEFINITIONS
// ======================================================

const TABLE_COLUMNS: Record<Exclude<PageName, "dashboard">, TableColumn[]> = {
  users: [
    {
      key: "fullName",
      label: "Full Name",
    },
    {
      key: "email",
      label: "Email Address",
    },
    {
      key: "role",
      label: "Role",
    },
    {
      key: "department",
      label: "Department",
    },
    {
      key: "isActive",
      label: "Active",
    },
    {
      key: "createdAt",
      label: "Registered",
    },
  ],

  items: [
    {
      key: "title",
      label: "Item Title",
    },
    {
      key: "type",
      label: "Type",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "color",
      label: "Color",
    },
    {
      key: "dateReported",
      label: "Reported Date",
    },
    {
      key: "isApproved",
      label: "Approved",
    },
  ],

  claims: [
    {
      key: "id",
      label: "Claim ID",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "itemId",
      label: "Item ID",
    },
    {
      key: "claimantId",
      label: "Claimant ID",
    },
    {
      key: "createdAt",
      label: "Created",
    },
  ],

  announcements: [
    {
      key: "title",
      label: "Title",
    },
    {
      key: "isPublished",
      label: "Published",
    },
    {
      key: "publishedAt",
      label: "Published Date",
    },
    {
      key: "createdAt",
      label: "Created",
    },
  ],

  audit: [
    {
      key: "action",
      label: "Action",
    },
    {
      key: "entity",
      label: "Entity",
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "actorId",
      label: "Actor",
    },
    {
      key: "createdAt",
      label: "Date",
    },
  ],
};

// ======================================================
// 17. PAGE TITLE CONFIGURATION
// ======================================================

const PAGE_TITLES: Record<
  PageName,
  {
    title: string;
    subtitle: string;
  }
> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Overview of campus lost and found activities.",
  },

  users: {
    title: "User Management",
    subtitle: "View and monitor registered campus users.",
  },

  items: {
    title: "Lost & Found Items",
    subtitle: "Monitor reported lost and found belongings.",
  },

  claims: {
    title: "Claims Management",
    subtitle: "Review and monitor ownership claims.",
  },

  announcements: {
    title: "Announcements",
    subtitle: "Manage important campus announcements.",
  },

  audit: {
    title: "Audit Logs",
    subtitle: "Monitor administrative and system activity.",
  },
};

// ======================================================
// 18. LOGIN SCREEN
// ======================================================

function LoginScreen({
  onLogin,
  loading,
  error,
}: {
  onLogin: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onLogin(email.trim(), password);
  }

  return (
    <div className="login-page">
      <div className="login-decoration decoration-one" />
      <div className="login-decoration decoration-two" />

      <div className="login-card">
        <div className="login-brand">
          <div className="brand-logo large">
            <Icon name="◇" />
          </div>

          <div>
            <h1>Injibara</h1>
            <p>Campus Lost & Found</p>
          </div>
        </div>

        <div className="login-heading">
          <span className="eyebrow">ADMINISTRATION PORTAL</span>

          <h2>Welcome back</h2>

          <p>Sign in to manage campus lost and found activities.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Email address</label>

          <input
            id="admin-email"
            type="email"
            placeholder="admin@injibara.edu.et"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="username"
          />

          <label htmlFor="admin-password">Password</label>

          <div className="password-field">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="button button-primary login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in to Dashboard"}
          </button>
        </form>

        <div className="login-footer">
          <span>Secure administration access</span>
          <span>© {new Date().getFullYear()} Injibara Campus</span>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// 19. SIDEBAR COMPONENT
// ======================================================

function Sidebar({
  activePage,
  onNavigate,
  user,
  onLogout,
  mobileOpen,
  onClose,
}: {
  activePage: PageName;
  onNavigate: (page: PageName) => void;
  user: AdminUser | null;
  onLogout: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Icon name="◇" />
          </div>

          <div className="sidebar-brand-text">
            <strong>Injibara</strong>
            <span>Lost & Found</span>
          </div>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-navigation">
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activePage === item.id ? "nav-item-active" : ""
              }`}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              title={item.description}
            >
              <span className="nav-icon">{item.icon}</span>

              <span>{item.label}</span>

              {activePage === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">?</div>

            <div>
              <strong>Need help?</strong>
              <span>Contact system support.</span>
            </div>
          </div>

          <div className="sidebar-user">
            <div className="avatar">{getInitials(user?.fullName)}</div>

            <div className="sidebar-user-info">
              <strong>{user?.fullName ?? "Administrator"}</strong>

              <span>{user?.role ?? "ADMIN"}</span>
            </div>

            <button
              className="logout-button"
              onClick={onLogout}
              title="Sign out"
            >
              ↪
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ======================================================
// 20. TOP BAR
// ======================================================

function TopBar({
  activePage,
  user,
  onMenu,
  onRefresh,
  refreshing,
}: {
  activePage: PageName;
  user: AdminUser | null;
  onMenu: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const page = PAGE_TITLES[activePage];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-button"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div>
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        <button
          className="refresh-button"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <span className={refreshing ? "refresh-spin" : ""}>↻</span>

          <span>{refreshing ? "Refreshing" : "Refresh"}</span>
        </button>

        <div className="topbar-divider" />

        <div className="topbar-profile">
          <div className="avatar small">{getInitials(user?.fullName)}</div>

          <div className="topbar-profile-info">
            <strong>{user?.fullName ?? "Administrator"}</strong>

            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ======================================================
// 21. DASHBOARD OVERVIEW
// ======================================================

function DashboardPage({
  stats,
  loading,
  rows,
}: {
  stats: DashboardStats;
  loading: boolean;
  rows: Record<string, unknown>[];
}) {
  return (
    <div className="page-content">
      <div className="welcome-banner">
        <div>
          <span className="welcome-label">CAMPUS MANAGEMENT</span>

          <h2>Welcome to your admin dashboard</h2>

          <p>Monitor lost and found activities across Injibara Campus.</p>
        </div>

        <div className="welcome-art">
          <div className="welcome-art-circle">◇</div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Campus overview</h2>
          <p>Current system statistics</p>
        </div>

        <span className="updated-label">Live API data</span>
      </div>

      {loading ? (
        <LoadingState message="Loading dashboard statistics..." />
      ) : (
        <div className="stats-grid">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="♙"
            color="blue"
            subtitle="Registered campus users"
          />

          <StatCard
            title="Total Items"
            value={stats.totalItems}
            icon="▣"
            color="purple"
            subtitle="Reported campus belongings"
          />

          <StatCard
            title="Lost Items"
            value={stats.lostItems}
            icon="⌕"
            color="orange"
            subtitle="Items reported as lost"
          />

          <StatCard
            title="Found Items"
            value={stats.foundItems}
            icon="✓"
            color="green"
            subtitle="Items reported as found"
          />

          <StatCard
            title="Pending Claims"
            value={stats.pendingClaims}
            icon="◷"
            color="yellow"
            subtitle="Claims awaiting review"
          />

          <StatCard
            title="Resolved Items"
            value={stats.resolvedItems}
            icon="✓"
            color="teal"
            subtitle="Successfully resolved items"
          />

          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon="♧"
            color="blue"
            subtitle="Currently active accounts"
          />

          <StatCard
            title="Total Claims"
            value={stats.totalClaims}
            icon="◇"
            color="pink"
            subtitle="Submitted ownership claims"
          />
        </div>
      )}

      <div className="dashboard-bottom-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent activity</h3>
              <p>Latest records returned by the API</p>
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No recent activity"
              description="There are no recent records available from the dashboard endpoint."
            />
          ) : (
            <div className="activity-list">
              {rows.slice(0, 5).map((row, index) => (
                <div className="activity-row" key={String(row.id ?? index)}>
                  <div className="activity-icon">◇</div>

                  <div className="activity-description">
                    <strong>
                      {formatCell(
                        row.title ?? row.action ?? row.description ?? row.name,
                      )}
                    </strong>

                    <span>{formatDate(row.createdAt ?? row.dateReported)}</span>
                  </div>

                  <StatusBadge value={row.status ?? row.action ?? "Recorded"} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Item summary</h3>
              <p>Lost and found overview</p>
            </div>
          </div>

          <div className="summary-list">
            <SummaryRow
              label="Lost items"
              value={stats.lostItems}
              total={stats.totalItems}
              color="orange"
            />

            <SummaryRow
              label="Found items"
              value={stats.foundItems}
              total={stats.totalItems}
              color="green"
            />

            <SummaryRow
              label="Resolved items"
              value={stats.resolvedItems}
              total={stats.totalItems}
              color="blue"
            />
          </div>

          <div className="summary-note">
            <span>i</span>
            <p>
              Statistics are based on the data returned by your backend API.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

// ======================================================
// 22. SUMMARY ROW
// ======================================================

function SummaryRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage =
    total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;

  return (
    <div className="summary-row">
      <div className="summary-row-heading">
        <span>{label}</span>

        <strong>{value.toLocaleString()}</strong>
      </div>

      <div className="progress-track">
        <div
          className={`progress-fill ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <span className="summary-percentage">{percentage}% of total items</span>
    </div>
  );
}

// ======================================================
// 23. GENERIC MANAGEMENT PAGE
// ======================================================

function ManagementPage({
  page,
  rows,
  loading,
  error,
  search,
  onSearch,
  onRetry,
}: {
  page: Exclude<PageName, "dashboard">;
  rows: Record<string, unknown>[];
  loading: boolean;
  error: string;
  search: string;
  onSearch: (value: string) => void;
  onRetry: () => void;
}) {
  const filteredRows = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      Object.values(row).some((value) =>
        formatCell(value).toLowerCase().includes(query),
      ),
    );
  }, [rows, search]);

  const pageInfo = {
    users: {
      title: "Registered users",
      description:
        "Review registered student, staff, security, and administrator accounts.",
      emptyTitle: "No users found",
      emptyDescription:
        "User records will appear here when available from the backend.",
    },

    items: {
      title: "Reported items",
      description: "Monitor lost and found reports submitted by campus users.",
      emptyTitle: "No items found",
      emptyDescription:
        "Item reports will appear here when available from the backend.",
    },

    claims: {
      title: "Ownership claims",
      description: "Monitor claims submitted for lost and found belongings.",
      emptyTitle: "No claims found",
      emptyDescription:
        "Claim records will appear here when available from the backend.",
    },

    announcements: {
      title: "Campus announcements",
      description: "Review announcements published for the campus community.",
      emptyTitle: "No announcements found",
      emptyDescription:
        "Announcements will appear here when available from the backend.",
    },

    audit: {
      title: "System activity",
      description: "Review administrative actions and system audit records.",
      emptyTitle: "No audit records found",
      emptyDescription:
        "Audit records will appear here when available from the backend.",
    },
  }[page];

  return (
    <div className="page-content">
      <section className="panel management-panel">
        <div className="management-header">
          <div>
            <h2>{pageInfo.title}</h2>
            <p>{pageInfo.description}</p>
          </div>

          <div className="record-count">
            {filteredRows.length.toLocaleString()} records
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-field">
            <span>⌕</span>

            <input
              type="search"
              placeholder={`Search ${page}...`}
              value={search}
              onChange={(event) => onSearch(event.target.value)}
            />
          </div>

          <button
            className="button button-secondary"
            onClick={onRetry}
            disabled={loading}
          >
            ↻ Refresh data
          </button>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : (
          <DataTable
            rows={filteredRows}
            columns={TABLE_COLUMNS[page]}
            loading={loading}
            emptyTitle={pageInfo.emptyTitle}
            emptyDescription={pageInfo.emptyDescription}
          />
        )}
      </section>
    </div>
  );
}

// ======================================================
// 24. ANNOUNCEMENT COMPOSER
// ======================================================

function AnnouncementComposer({
  onCreate,
  loading,
}: {
  onCreate: (announcement: AnnouncementForm) => Promise<void>;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onCreate({
      title: title.trim(),
      content: content.trim(),
    });

    setTitle("");
    setContent("");
    setOpen(false);
  }

  return (
    <>
      <button className="button button-primary" onClick={() => setOpen(true)}>
        + New announcement
      </button>

      {open && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Create announcement</h2>
                <p>Share important information with campus users.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={submit} className="announcement-form">
              <label htmlFor="announcement-title">Announcement title</label>

              <input
                id="announcement-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter announcement title"
                maxLength={160}
                required
              />

              <label htmlFor="announcement-content">Announcement content</label>

              <textarea
                id="announcement-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write the announcement..."
                rows={6}
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={loading || !title.trim() || !content.trim()}
                >
                  {loading ? "Publishing..." : "Publish announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ======================================================
// 25. ANNOUNCEMENTS PAGE
// ======================================================

function AnnouncementsPage({
  rows,
  loading,
  error,
  onRetry,
  onCreate,
  creating,
}: {
  rows: Record<string, unknown>[];
  loading: boolean;
  error: string;
  onRetry: () => void;
  onCreate: (announcement: AnnouncementForm) => Promise<void>;
  creating: boolean;
}) {
  return (
    <div className="page-content">
      <section className="panel">
        <div className="management-header">
          <div>
            <h2>Campus announcements</h2>
            <p>Create and review announcements for Injibara Campus.</p>
          </div>

          <AnnouncementComposer onCreate={onCreate} loading={creating} />
        </div>

        {error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : loading ? (
          <LoadingState />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No announcements available"
            description="Create an announcement to share information with campus users."
          />
        ) : (
          <div className="announcement-list">
            {rows.map((row, index) => (
              <article
                className="announcement-card"
                key={String(row.id ?? index)}
              >
                <div className="announcement-card-top">
                  <div className="announcement-symbol">◉</div>

                  <StatusBadge
                    value={row.isPublished ? "Published" : "Draft"}
                  />
                </div>

                <h3>{formatCell(row.title)}</h3>

                <p className="announcement-content">
                  {formatCell(row.content)}
                </p>

                <div className="announcement-meta">
                  <span>Created: {formatDate(row.createdAt)}</span>

                  <span>Published: {formatDate(row.publishedAt)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ======================================================
// 26. NOTIFICATION TOAST
// ======================================================

function Toast({
  notification,
  onClose,
}: {
  notification: NotificationMessage | null;
  onClose: () => void;
}) {
  if (!notification) {
    return null;
  }

  return (
    <div className={`toast toast-${notification.type}`} role="status">
      <span>
        {notification.type === "success"
          ? "✓"
          : notification.type === "error"
            ? "!"
            : "i"}
      </span>

      <p>{notification.text}</p>

      <button onClick={onClose} aria-label="Close notification">
        ×
      </button>
    </div>
  );
}

// ======================================================
// 27. API ENDPOINT CONFIGURATION
// ======================================================

const PAGE_ENDPOINTS: Record<Exclude<PageName, "dashboard">, string> = {
  users: "/admin/users",
  items: "/admin/items",
  claims: "/admin/claims",
  announcements: "/admin/announcements",
  audit: "/admin/audit",
};

// ======================================================
// 28. MAIN APPLICATION
// ======================================================

export default function App() {
  // ----------------------------------------------------
  // AUTHENTICATION STATE
  // ----------------------------------------------------

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );

  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved) as AdminUser;
    } catch {
      return null;
    }
  });

  const [loginLoading, setLoginLoading] = useState(false);

  const [loginError, setLoginError] = useState("");

  // ----------------------------------------------------
  // NAVIGATION STATE
  // ----------------------------------------------------

  const [activePage, setActivePage] = useState<PageName>("dashboard");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ----------------------------------------------------
  // DATA STATE
  // ----------------------------------------------------

  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);

  const [dashboardRows, setDashboardRows] = useState<Record<string, unknown>[]>(
    [],
  );

  const [pageRows, setPageRows] = useState<Record<string, unknown>[]>([]);

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [dataError, setDataError] = useState("");

  const [search, setSearch] = useState("");

  // ----------------------------------------------------
  // ANNOUNCEMENT STATE
  // ----------------------------------------------------

  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);

  // ----------------------------------------------------
  // TOAST STATE
  // ----------------------------------------------------

  const [notification, setNotification] = useState<NotificationMessage | null>(
    null,
  );

  // ====================================================
  // 29. SHOW NOTIFICATION
  // ====================================================

  const notify = useCallback(
    (type: NotificationMessage["type"], text: string) => {
      setNotification({
        type,
        text,
      });
    },
    [],
  );

  // ====================================================
  // 30. SAVE AUTHENTICATION
  // ====================================================

  const saveAuthentication = useCallback(
    (accessToken: string, adminUser: AdminUser | null) => {
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);

      if (adminUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(adminUser));
      }

      setToken(accessToken);
      setUser(adminUser);
    },
    [],
  );

  // ====================================================
  // 31. LOGIN FUNCTION
  // ====================================================

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setLoginLoading(true);
      setLoginError("");

      try {
        const response = await apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const accessToken = extractAccessToken(response);

        if (!accessToken) {
          throw new Error(
            "The login response did not contain an access token.",
          );
        }

        const adminUser = extractUser(response);

        if (adminUser?.role && adminUser.role !== "ADMIN") {
          throw new Error(
            "Access denied. This account does not have the ADMIN role.",
          );
        }

        saveAuthentication(accessToken, adminUser);

        setActivePage("dashboard");

        notify("success", "Successfully signed in.");
      } catch (error) {
        setLoginError(
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.",
        );
      } finally {
        setLoginLoading(false);
      }
    },
    [saveAuthentication, notify],
  );

  // ====================================================
  // 32. LOGOUT FUNCTION
  // ====================================================

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);

    localStorage.removeItem(USER_STORAGE_KEY);

    setToken(null);
    setUser(null);

    setStats(EMPTY_STATS);
    setDashboardRows([]);
    setPageRows([]);

    setActivePage("dashboard");
    setDataError("");
    setLoginError("");

    notify("info", "You have signed out.");
  }, [notify]);

  // ====================================================
  // 33. LOAD DASHBOARD DATA
  // ====================================================

  const loadDashboard = useCallback(async (accessToken: string) => {
    const response = await apiRequest("/admin/dashboard", {}, accessToken);

    const normalized = normalizeStats(response);

    setStats(normalized);

    const recent = [
      getNestedValue(response, ["data", "recentActivity"]),
      getNestedValue(response, ["recentActivity"]),
      getNestedValue(response, ["data", "recentItems"]),
      getNestedValue(response, ["recentItems"]),
    ].find(Array.isArray);

    setDashboardRows(Array.isArray(recent) ? recent.filter(isRecord) : []);
  }, []);

  // ====================================================
  // 34. LOAD MANAGEMENT DATA
  // ====================================================

  const loadManagementData = useCallback(
    async (page: Exclude<PageName, "dashboard">, accessToken: string) => {
      const endpoint = PAGE_ENDPOINTS[page];

      const response = await apiRequest(endpoint, {}, accessToken);

      setPageRows(extractList(response));
    },
    [],
  );

  // ====================================================
  // 35. LOAD CURRENT PAGE
  // ====================================================

  const loadCurrentPage = useCallback(
    async (accessToken: string, page: PageName) => {
      setLoading(true);
      setDataError("");

      try {
        if (page === "dashboard") {
          await loadDashboard(accessToken);
        } else {
          await loadManagementData(page, accessToken);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load data.";

        setDataError(message);

        if (
          message.toLowerCase().includes("unauthorized") ||
          message.toLowerCase().includes("invalid token")
        ) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    },
    [loadDashboard, loadManagementData, handleLogout],
  );

  // ====================================================
  // 36. LOAD USER PROFILE
  // ====================================================

  const loadProfile = useCallback(
    async (accessToken: string) => {
      try {
        const response = await apiRequest("/auth/me", {}, accessToken);

        const currentUser = extractUser(response);

        if (currentUser) {
          if (currentUser.role && currentUser.role !== "ADMIN") {
            throw new Error("This account is not an administrator.");
          }

          setUser(currentUser);

          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.toLowerCase().includes("not an administrator")
        ) {
          handleLogout();
        }
      }
    },
    [handleLogout],
  );

  // ====================================================
  // 37. INITIAL AUTHENTICATION CHECK
  // ====================================================

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadProfile(token);
  }, [token, loadProfile]);

  // ====================================================
  // 38. LOAD DATA WHEN PAGE CHANGES
  // ====================================================

  useEffect(() => {
    if (!token) {
      return;
    }

    void loadCurrentPage(token, activePage);
  }, [token, activePage, loadCurrentPage]);

  // ====================================================
  // 39. REFRESH CURRENT PAGE
  // ====================================================

  const handleRefresh = useCallback(async () => {
    if (!token) {
      return;
    }

    setRefreshing(true);

    try {
      await loadCurrentPage(token, activePage);

      notify("success", "Data refresh completed.");
    } finally {
      setRefreshing(false);
    }
  }, [token, activePage, loadCurrentPage, notify]);

  // ====================================================
  // 40. CREATE ANNOUNCEMENT
  // ====================================================

  const handleCreateAnnouncement = useCallback(
    async (announcement: AnnouncementForm) => {
      if (!token) {
        return;
      }

      setCreatingAnnouncement(true);

      try {
        await apiRequest(
          "/admin/announcements",
          {
            method: "POST",
            body: JSON.stringify({
              title: announcement.title,
              content: announcement.content,
              isPublished: true,
            }),
          },
          token,
        );

        notify("success", "Announcement created successfully.");

        await loadManagementData("announcements", token);
      } catch (error) {
        notify(
          "error",
          error instanceof Error
            ? error.message
            : "Unable to create announcement.",
        );

        throw error;
      } finally {
        setCreatingAnnouncement(false);
      }
    },
    [token, loadManagementData, notify],
  );

  // ====================================================
  // 41. PAGE NAVIGATION
  // ====================================================

  const handleNavigate = useCallback((page: PageName) => {
    setActivePage(page);
    setSearch("");
    setDataError("");
  }, []);

  // ====================================================
  // 42. RENDER LOGIN SCREEN
  // ====================================================

  if (!token) {
    return (
      <>
        <GlobalStyles />

        <LoginScreen
          onLogin={handleLogin}
          loading={loginLoading}
          error={loginError}
        />
      </>
    );
  }

  // ====================================================
  // 43. RENDER MAIN APPLICATION
  // ====================================================

  let pageContent: ReactNode;

  if (activePage === "dashboard") {
    pageContent = dataError ? (
      <div className="page-content">
        <ErrorState
          message={dataError}
          onRetry={() => {
            void handleRefresh();
          }}
        />
      </div>
    ) : (
      <DashboardPage stats={stats} loading={loading} rows={dashboardRows} />
    );
  } else if (activePage === "announcements") {
    pageContent = (
      <AnnouncementsPage
        rows={pageRows}
        loading={loading}
        error={dataError}
        onRetry={() => {
          void handleRefresh();
        }}
        onCreate={handleCreateAnnouncement}
        creating={creatingAnnouncement}
      />
    );
  } else {
    pageContent = (
      <ManagementPage
        page={activePage}
        rows={pageRows}
        loading={loading}
        error={dataError}
        search={search}
        onSearch={setSearch}
        onRetry={() => {
          void handleRefresh();
        }}
      />
    );
  }

  return (
    <>
      <GlobalStyles />

      <div className="admin-app">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        <main className="main-area">
          <TopBar
            activePage={activePage}
            user={user}
            onMenu={() => setMobileSidebarOpen(true)}
            onRefresh={() => {
              void handleRefresh();
            }}
            refreshing={refreshing}
          />

          <div className="main-content">{pageContent}</div>

          <footer className="app-footer">
            <span>
              © {new Date().getFullYear()} Injibara Campus Lost & Found
            </span>

            <span>Administration Portal</span>
          </footer>
        </main>
      </div>

      <Toast
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </>
  );
}

// ======================================================
// 44. GLOBAL STYLES
// ======================================================

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

      :root {
        font-family: 'DM Sans', Arial, sans-serif;
        color: #172033;
        background: #f5f7fb;
        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        --primary: #2457d6;
        --primary-dark: #1945b5;
        --text: #172033;
        --muted: #778198;
        --border: #e8ebf2;
        --surface: #ffffff;
        --background: #f5f7fb;
        --sidebar-width: 260px;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-width: 320px;
        min-height: 100vh;
        background: var(--background);
      }

      button,
      input,
      textarea {
        font: inherit;
      }

      button {
        cursor: pointer;
      }

      button:disabled {
        opacity: .6;
        cursor: not-allowed;
      }

      .admin-app {
        min-height: 100vh;
      }

      /* LOGIN */

      .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 30px 18px;
        position: relative;
        overflow: hidden;
        background:
          radial-gradient(
            circle at 12% 15%,
            rgba(56, 104, 218, .12),
            transparent 34%
          ),
          radial-gradient(
            circle at 90% 85%,
            rgba(27, 164, 132, .10),
            transparent 35%
          ),
          #f4f7fc;
      }

      .login-decoration {
        position: absolute;
        border-radius: 50%;
        border: 1px solid rgba(36, 87, 214, .12);
        pointer-events: none;
      }

      .decoration-one {
        width: 430px;
        height: 430px;
        top: -220px;
        right: -120px;
      }

      .decoration-two {
        width: 520px;
        height: 520px;
        bottom: -330px;
        left: -190px;
      }

      .login-card {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 455px;
        padding: 38px;
        border-radius: 22px;
        background: #fff;
        box-shadow: 0 22px 70px rgba(25, 45, 90, .10);
        border: 1px solid rgba(255, 255, 255, .9);
      }

      .login-brand {
        display: flex;
        align-items: center;
        gap: 13px;
        margin-bottom: 43px;
      }

      .login-brand h1 {
        font-family: Manrope, sans-serif;
        font-size: 20px;
        margin: 0;
        font-weight: 800;
      }

      .login-brand p {
        margin: 3px 0 0;
        color: var(--muted);
        font-size: 12px;
      }

      .brand-logo {
        width: 42px;
        height: 42px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        border-radius: 13px;
        color: white;
        background: linear-gradient(145deg, #326be7, #1745b7);
        font-size: 25px;
        box-shadow: 0 7px 18px rgba(36, 87, 214, .24);
      }

      .brand-logo.large {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        font-size: 30px;
      }

      .login-heading {
        margin-bottom: 27px;
      }

      .eyebrow,
      .welcome-label {
        color: #3767d4;
        font-size: 10px;
        letter-spacing: 1.7px;
        font-weight: 800;
      }

      .login-heading h2 {
        font-family: Manrope, sans-serif;
        font-size: 29px;
        margin: 12px 0 8px;
        letter-spacing: -.8px;
      }

      .login-heading p {
        color: var(--muted);
        font-size: 13px;
        line-height: 1.7;
        margin: 0;
      }

      .login-form {
        display: flex;
        flex-direction: column;
      }

      .login-form label,
      .announcement-form label {
        font-size: 12px;
        font-weight: 700;
        margin: 15px 0 8px;
        color: #303c52;
      }

      .login-form input,
      .announcement-form input,
      .announcement-form textarea {
        width: 100%;
        padding: 13px 14px;
        border: 1px solid #e2e7f0;
        outline: none;
        border-radius: 9px;
        background: #fbfcfe;
        color: var(--text);
        font-size: 13px;
        transition: .2s;
      }

      .login-form input:focus,
      .announcement-form input:focus,
      .announcement-form textarea:focus {
        border-color: #7093e8;
        box-shadow: 0 0 0 3px rgba(36, 87, 214, .08);
      }

      .password-field {
        position: relative;
      }

      .password-field input {
        padding-right: 62px;
      }

      .password-toggle {
        position: absolute;
        right: 11px;
        top: 50%;
        transform: translateY(-50%);
        border: 0;
        background: transparent;
        color: var(--primary);
        font-size: 11px;
        font-weight: 700;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 15px;
        min-height: 39px;
        border-radius: 8px;
        border: 1px solid transparent;
        font-size: 12px;
        font-weight: 700;
        transition: .2s;
      }

      .button-primary {
        background: var(--primary);
        color: #fff;
      }

      .button-primary:hover:not(:disabled) {
        background: var(--primary-dark);
        transform: translateY(-1px);
      }

      .button-secondary {
        color: #34415a;
        background: white;
        border-color: var(--border);
      }

      .button-secondary:hover:not(:disabled) {
        background: #f7f9fd;
      }

      .login-button {
        margin-top: 25px;
        min-height: 47px;
        width: 100%;
        font-size: 13px;
        box-shadow: 0 8px 18px rgba(36, 87, 214, .16);
      }

      .login-footer {
        border-top: 1px solid #edf0f5;
        padding-top: 18px;
        margin-top: 27px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
        color: #929bad;
        font-size: 10px;
      }

      /* SIDEBAR */

      .sidebar {
        position: fixed;
        inset: 0 auto 0 0;
        width: var(--sidebar-width);
        display: flex;
        flex-direction: column;
        z-index: 20;
        color: #dce5fb;
        background: #17284b;
        box-shadow: 8px 0 30px rgba(21, 37, 72, .05);
      }

      .sidebar-brand {
        height: 82px;
        padding: 0 22px;
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid rgba(255,255,255,.08);
      }

      .sidebar-brand-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .sidebar-brand-text strong {
        font-family: Manrope, sans-serif;
        font-size: 15px;
        color: #fff;
      }

      .sidebar-brand-text span {
        font-size: 10px;
        color: #aab9d7;
      }

      .sidebar-close {
        display: none;
        margin-left: auto;
        border: 0;
        color: white;
        background: transparent;
        font-size: 25px;
      }

      .sidebar-section-label {
        padding: 29px 23px 13px;
        color: #8195bd;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1.6px;
      }

      .sidebar-navigation {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 0 12px;
      }

      .nav-item {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 12px 13px;
        text-align: left;
        color: #b7c5e1;
        background: transparent;
        border: 0;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        transition: .2s;
      }

      .nav-item:hover {
        color: #fff;
        background: rgba(255,255,255,.07);
      }

      .nav-item-active {
        color: #fff;
        background: #2856b6;
        box-shadow: 0 5px 14px rgba(0,0,0,.12);
      }

      .nav-icon {
        width: 20px;
        text-align: center;
        font-size: 17px;
      }

      .nav-indicator {
        position: absolute;
        right: 0;
        top: 10px;
        bottom: 10px;
        width: 3px;
        border-radius: 4px 0 0 4px;
        background: #83b6ff;
      }

      .sidebar-bottom {
        margin-top: auto;
        padding: 14px 13px 17px;
      }

      .sidebar-help {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 13px 10px;
        margin-bottom: 16px;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 9px;
        background: rgba(255,255,255,.04);
      }

      .help-icon {
        width: 27px;
        height: 27px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: rgba(111, 157, 246, .22);
        color: #b6d1ff;
        font-weight: 800;
      }

      .sidebar-help strong,
      .sidebar-help span {
        display: block;
      }

      .sidebar-help strong {
        font-size: 11px;
        color: #fff;
      }

      .sidebar-help span {
        margin-top: 4px;
        font-size: 9px;
        color: #9eafd0;
      }

      .sidebar-user {
        display: flex;
        align-items: center;
        gap: 9px;
        padding-top: 15px;
        border-top: 1px solid rgba(255,255,255,.10);
      }

      .avatar {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 11px;
        color: #244d9e;
        background: #dce9ff;
        font-size: 12px;
        font-weight: 800;
      }

      .avatar.small {
        width: 34px;
        height: 34px;
        border-radius: 50%;
      }

      .sidebar-user-info {
        min-width: 0;
        flex: 1;
      }

      .sidebar-user-info strong,
      .sidebar-user-info span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .sidebar-user-info strong {
        font-size: 10px;
        color: white;
      }

      .sidebar-user-info span {
        font-size: 9px;
        margin-top: 4px;
        color: #98aed4;
      }

      .logout-button {
        width: 30px;
        height: 30px;
        border: 0;
        border-radius: 7px;
        color: #c3d1eb;
        background: transparent;
        font-size: 19px;
      }

      .logout-button:hover {
        background: rgba(255,255,255,.09);
        color: white;
      }

      /* MAIN AREA */

      .main-area {
        min-height: 100vh;
        margin-left: var(--sidebar-width);
        display: flex;
        flex-direction: column;
      }

      .topbar {
        position: sticky;
        top: 0;
        z-index: 10;
        min-height: 82px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
        padding: 14px 32px;
        background: rgba(255,255,255,.96);
        border-bottom: 1px solid var(--border);
        backdrop-filter: blur(12px);
      }

      .topbar-left,
      .topbar-right {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .topbar-left h1 {
        margin: 0;
        font-family: Manrope, sans-serif;
        font-size: 18px;
        letter-spacing: -.3px;
      }

      .topbar-left p {
        margin: 5px 0 0;
        color: var(--muted);
        font-size: 11px;
      }

      .menu-button {
        display: none;
        border: 0;
        background: transparent;
        color: #34415a;
        font-size: 22px;
      }

      .refresh-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        color: #47546b;
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
      }

      .refresh-button:hover {
        background: #f8faff;
      }

      .refresh-button span:first-child {
        font-size: 17px;
      }

      .refresh-spin {
        display: inline-block;
        animation: spin .8s linear infinite;
      }

      .topbar-divider {
        height: 33px;
        width: 1px;
        background: var(--border);
      }

      .topbar-profile {
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .topbar-profile-info strong,
      .topbar-profile-info span {
        display: block;
      }

      .topbar-profile-info strong {
        font-size: 11px;
      }

      .topbar-profile-info span {
        margin-top: 3px;
        color: var(--muted);
        font-size: 9px;
      }

      .main-content {
        flex: 1;
      }

      .page-content {
        max-width: 1600px;
        margin: 0 auto;
        padding: 27px 32px 36px;
      }

      /* WELCOME BANNER */

      .welcome-banner {
        min-height: 180px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        overflow: hidden;
        padding: 27px 34px;
        color: #fff;
        border-radius: 15px;
        background: linear-gradient(110deg, #1c438f, #3269d5 65%, #4c85e8);
        box-shadow: 0 9px 24px rgba(38, 83, 170, .14);
      }

      .welcome-banner h2 {
        margin: 12px 0 8px;
        font-family: Manrope, sans-serif;
        font-size: 23px;
        letter-spacing: -.6px;
      }

      .welcome-banner p {
        margin: 0;
        color: #d9e5ff;
        font-size: 12px;
      }

      .welcome-label {
        color: #c5d8ff;
      }

      .welcome-art {
        width: 140px;
        height: 140px;
        display: grid;
        place-items: center;
        margin-right: 35px;
        border-radius: 50%;
        border: 1px solid rgba(255,255,255,.25);
        background: rgba(255,255,255,.06);
      }

      .welcome-art-circle {
        width: 90px;
        height: 90px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: #fff;
        background: rgba(255,255,255,.13);
        border: 1px solid rgba(255,255,255,.3);
        font-size: 54px;
      }

      /* SECTIONS AND STATISTICS */

      .section-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 30px 0 17px;
      }

      .section-heading h2 {
        margin: 0;
        font-family: Manrope, sans-serif;
        font-size: 16px;
      }

      .section-heading p {
        margin: 5px 0 0;
        color: var(--muted);
        font-size: 11px;
      }

      .updated-label {
        color: #42836d;
        background: #e9f7f0;
        border-radius: 20px;
        padding: 6px 10px;
        font-size: 9px;
        font-weight: 700;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 15px;
      }

      .stat-card {
        padding: 19px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: #fff;
        transition: .2s;
      }

      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 9px 24px rgba(28, 47, 83, .06);
      }

      .stat-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }

      .stat-title {
        margin: 0;
        color: #788399;
        font-size: 10px;
        font-weight: 600;
      }

      .stat-value {
        margin: 9px 0 0;
        font-family: Manrope, sans-serif;
        font-size: 25px;
        letter-spacing: -.8px;
      }

      .stat-icon {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        font-size: 18px;
      }

      .stat-icon.blue {
        background: #eaf0ff;
        color: #3264d3;
      }

      .stat-icon.purple {
        background: #f1eaff;
        color: #8756ce;
      }

      .stat-icon.orange {
        background: #fff0e5;
        color: #db8739;
      }

      .stat-icon.green {
        background: #e7f7ef;
        color: #2e9b6b;
      }

      .stat-icon.yellow {
        background: #fff8df;
        color: #bd9825;
      }

      .stat-icon.teal {
        background: #e3f7f5;
        color: #299d95;
      }

      .stat-icon.pink {
        background: #ffeaf2;
        color: #d45a91;
      }

      .stat-subtitle {
        margin: 13px 0 0;
        color: #98a1b2;
        font-size: 9px;
      }

      /* PANELS */

      .dashboard-bottom-grid {
        display: grid;
        grid-template-columns: 1.45fr 1fr;
        gap: 16px;
        margin-top: 20px;
      }

      .panel {
        min-width: 0;
        padding: 21px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: #fff;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
        border-bottom: 1px solid #eff1f5;
      }

      .panel-header h3 {
        margin: 0;
        font-family: Manrope, sans-serif;
        font-size: 13px;
      }

      .panel-header p {
        margin: 5px 0 0;
        color: var(--muted);
        font-size: 10px;
      }

      .activity-list {
        display: flex;
        flex-direction: column;
      }

      .activity-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 13px 0;
        border-bottom: 1px solid #f0f2f6;
      }

      .activity-row:last-child {
        border-bottom: 0;
      }

      .activity-icon {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        color: #3868d3;
        background: #edf2ff;
        border-radius: 9px;
      }

      .activity-description {
        flex: 1;
        min-width: 0;
      }

      .activity-description strong,
      .activity-description span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .activity-description strong {
        font-size: 10px;
      }

      .activity-description span {
        margin-top: 5px;
        color: var(--muted);
        font-size: 9px;
      }

      /* SUMMARY */

      .summary-list {
        padding-top: 18px;
      }

      .summary-row {
        margin-bottom: 22px;
      }

      .summary-row-heading {
        display: flex;
        justify-content: space-between;
        margin-bottom: 9px;
        color: #536077;
        font-size: 10px;
      }

      .summary-row-heading strong {
        color: var(--text);
      }

      .progress-track {
        height: 7px;
        overflow: hidden;
        border-radius: 20px;
        background: #edf0f5;
      }

      .progress-fill {
        height: 100%;
        border-radius: inherit;
      }

      .progress-fill.orange {
        background: #e9a15d;
      }

      .progress-fill.green {
        background: #45b487;
      }

      .progress-fill.blue {
        background: #4d7ce0;
      }

      .summary-percentage {
        display: block;
        margin-top: 7px;
        color: #98a1b2;
        font-size: 9px;
      }

      .summary-note {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 11px;
        border-radius: 8px;
        background: #f3f6fd;
      }

      .summary-note span {
        width: 17px;
        height: 17px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: #3868d3;
        background: #dfe9ff;
        font-size: 10px;
        font-weight: 800;
      }

      .summary-note p {
        margin: 0;
        color: #748098;
        font-size: 9px;
        line-height: 1.6;
      }

      /* MANAGEMENT TABLES */

      .management-panel {
        min-height: 400px;
      }

      .management-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 15px;
      }

      .management-header h2 {
        margin: 0;
        font-family: Manrope, sans-serif;
        font-size: 16px;
      }

      .management-header p {
        margin: 6px 0 0;
        color: var(--muted);
        font-size: 11px;
        line-height: 1.6;
      }

      .record-count {
        padding: 7px 11px;
        color: #4d6080;
        background: #f0f3fa;
        border-radius: 7px;
        font-size: 10px;
        font-weight: 700;
      }

      .table-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin: 22px 0 17px;
        padding-top: 17px;
        border-top: 1px solid #eff1f5;
      }

      .search-field {
        width: 300px;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 0 12px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: #fff;
      }

      .search-field span {
        color: #8a96aa;
        font-size: 20px;
      }

      .search-field input {
        width: 100%;
        height: 37px;
        border: 0;
        outline: 0;
        background: transparent;
        color: var(--text);
        font-size: 11px;
      }

      .table-scroll {
        width: 100%;
        overflow-x: auto;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }

      .data-table th {
        padding: 13px 12px;
        color: #7d899f;
        background: #f7f9fc;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: .5px;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .data-table th:first-child {
        border-radius: 7px 0 0 7px;
      }

      .data-table th:last-child {
        border-radius: 0 7px 7px 0;
      }

      .data-table td {
        padding: 15px 12px;
        border-bottom: 1px solid #eff1f5;
        color: #536078;
        font-size: 10px;
        vertical-align: middle;
      }

      .data-table tbody tr:hover {
        background: #fafbfe;
      }

      .table-cell-text {
        display: inline-block;
        max-width: 210px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: middle;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 8px;
        border-radius: 20px;
        white-space: nowrap;
        font-size: 9px;
        font-weight: 700;
      }

      .status-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: currentColor;
      }

      .status-badge.success {
        color: #23845c;
        background: #e8f7ef;
      }

      .status-badge.warning {
        color: #a67a1b;
        background: #fff5dc;
      }

      .status-badge.danger {
        color: #c44c5a;
        background: #ffedf0;
      }

      .status-badge.neutral {
        color: #66748c;
        background: #eff2f7;
      }

      /* ANNOUNCEMENTS */

      .announcement-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 15px;
        margin-top: 22px;
      }

      .announcement-card {
        min-width: 0;
        padding: 19px;
        border: 1px solid var(--border);
        border-radius: 10px;
        transition: .2s;
      }

      .announcement-card:hover {
        border-color: #cdd9f5;
        box-shadow: 0 8px 22px rgba(31, 55, 96, .05);
      }

      .announcement-card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .announcement-symbol {
        width: 33px;
        height: 33px;
        display: grid;
        place-items: center;
        color: #3567d3;
        background: #edf2ff;
        border-radius: 9px;
        font-size: 17px;
      }

      .announcement-card h3 {
        margin: 15px 0 8px;
        font-family: Manrope, sans-serif;
        font-size: 14px;
      }

      .announcement-content {
        min-height: 45px;
        color: #69758c;
        font-size: 11px;
        line-height: 1.7;
        overflow-wrap: anywhere;
      }

      .announcement-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 15px;
        padding-top: 12px;
        border-top: 1px solid #eff1f5;
        color: #98a1b2;
        font-size: 9px;
      }

      /* MODAL */

      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: grid;
        place-items: center;
        padding: 18px;
        background: rgba(15, 27, 49, .52);
        backdrop-filter: blur(3px);
      }

      .modal {
        width: 100%;
        max-width: 510px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 25px;
        border-radius: 14px;
        background: white;
        box-shadow: 0 20px 70px rgba(0,0,0,.18);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }

      .modal-header h2 {
        margin: 0;
        font-family: Manrope, sans-serif;
        font-size: 17px;
      }

      .modal-header p {
        margin: 6px 0 0;
        color: var(--muted);
        font-size: 10px;
        line-height: 1.6;
      }

      .modal-close {
        width: 30px;
        height: 30px;
        border: 0;
        border-radius: 7px;
        background: #f0f3f8;
        color: #58657b;
        font-size: 21px;
      }

      .announcement-form {
        display: flex;
        flex-direction: column;
        margin-top: 13px;
      }

      .announcement-form textarea {
        resize: vertical;
        line-height: 1.6;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 9px;
        margin-top: 22px;
      }

      /* STATES */

      .loading-state,
      .empty-state,
      .error-state {
        min-height: 190px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        text-align: center;
      }

      .loading-state p,
      .empty-state p,
      .error-state p {
        color: var(--muted);
        font-size: 11px;
        line-height: 1.7;
        max-width: 380px;
      }

      .spinner {
        width: 29px;
        height: 29px;
        border: 3px solid #e6ebf5;
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin .8s linear infinite;
      }

      .empty-icon,
      .error-symbol {
        width: 43px;
        height: 43px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: #5378c8;
        background: #edf2ff;
        font-size: 23px;
      }

      .error-symbol {
        color: #c24e5b;
        background: #ffedf0;
        font-weight: 800;
      }

      .empty-state h3,
      .error-state h3 {
        margin: 12px 0 0;
        font-size: 13px;
      }

      .error-state .button {
        margin-top: 10px;
      }

      .alert {
        padding: 11px 12px;
        border-radius: 8px;
        font-size: 11px;
        line-height: 1.6;
      }

      .alert-error {
        color: #a73545;
        background: #fff0f1;
        border: 1px solid #ffdbdf;
      }

      .toast {
        position: fixed;
        right: 24px;
        bottom: 23px;
        z-index: 100;
        width: min(390px, calc(100vw - 32px));
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 13px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: white;
        box-shadow: 0 12px 35px rgba(22, 39, 75, .14);
      }

      .toast > span {
        width: 25px;
        height: 25px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        border-radius: 50%;
        font-weight: 800;
        background: #edf2ff;
        color: #3264d3;
      }

      .toast-success > span {
        background: #e8f7ef;
        color: #23845c;
      }

      .toast-error > span {
        background: #ffedf0;
        color: #c44c5a;
      }

      .toast p {
        flex: 1;
        margin: 0;
        color: #46536b;
        font-size: 11px;
        line-height: 1.5;
      }

      .toast button {
        border: 0;
        background: transparent;
        color: #7d899e;
        font-size: 19px;
      }

      /* FOOTER */

      .app-footer {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 18px 32px;
        color: #98a1b2;
        border-top: 1px solid var(--border);
        background: #fff;
        font-size: 9px;
      }

      /* ANIMATIONS */

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* RESPONSIVE DESIGN */

      @media (max-width: 1200px) {
        .stats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .dashboard-bottom-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 900px) {
        .sidebar {
          transform: translateX(-100%);
          transition: transform .25s ease;
        }

        .sidebar.sidebar-open {
          transform: translateX(0);
        }

        .sidebar-close {
          display: block;
        }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 19;
          border: 0;
          background: rgba(14, 25, 45, .48);
        }

        .main-area {
          margin-left: 0;
        }

        .menu-button {
          display: block;
        }

        .topbar {
          padding-left: 20px;
          padding-right: 20px;
        }

        .page-content {
          padding-left: 20px;
          padding-right: 20px;
        }
      }

      @media (max-width: 600px) {
        .topbar {
          min-height: 72px;
          padding: 11px 14px;
        }

        .topbar-left h1 {
          font-size: 15px;
        }

        .topbar-left p {
          max-width: 190px;
          font-size: 9px;
        }

        .topbar-profile-info,
        .topbar-divider,
        .refresh-button span:last-child {
          display: none;
        }

        .refresh-button {
          width: 35px;
          height: 35px;
          justify-content: center;
          padding: 0;
        }

        .page-content {
          padding: 17px 13px 25px;
        }

        .welcome-banner {
          min-height: 155px;
          padding: 22px 19px;
        }

        .welcome-banner h2 {
          max-width: 260px;
          font-size: 18px;
          line-height: 1.4;
        }

        .welcome-banner p {
          max-width: 250px;
          font-size: 10px;
          line-height: 1.6;
        }

        .welcome-art {
          position: absolute;
          right: -72px;
          margin: 0;
          opacity: .35;
        }

        .stats-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .stat-card {
          padding: 13px;
        }

        .stat-value {
          font-size: 21px;
        }

        .stat-title {
          font-size: 9px;
        }

        .stat-subtitle {
          font-size: 8px;
          line-height: 1.5;
        }

        .stat-icon {
          width: 30px;
          height: 30px;
          font-size: 15px;
        }

        .section-heading {
          margin-top: 24px;
        }

        .panel {
          padding: 14px;
        }

        .table-toolbar {
          align-items: stretch;
          flex-direction: column;
        }

        .search-field {
          width: 100%;
        }

        .table-toolbar .button {
          width: 100%;
        }

        .announcement-list {
          grid-template-columns: 1fr;
        }

        .management-header {
          align-items: flex-start;
          flex-direction: column;
        }

        .login-card {
          padding: 25px 20px;
        }

        .login-brand {
          margin-bottom: 32px;
        }

        .login-heading h2 {
          font-size: 25px;
        }

        .app-footer {
          padding: 14px;
          flex-direction: column;
        }

        .toast {
          right: 16px;
          bottom: 16px;
        }
      }

      @media (max-width: 370px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }

        .welcome-banner h2 {
          font-size: 16px;
        }

        .login-footer {
          flex-direction: column;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          scroll-behavior: auto !important;
          animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .01ms !important;
        }
      }
    `}</style>
  );
}

import React, { useEffect, useState } from "react";
import type { AdminPage } from "../layouts/Sidebar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface DashboardPageProps {
  token: string;
  onNavigate?: (page: AdminPage) => void;
}

interface DashboardData {
  totalUsers?: number;
  totalItems?: number;
  lostItems?: number;
  foundItems?: number;
  pendingClaims?: number;
  completedClaims?: number;
  recoveredItems?: number;
  recentItems?: Array<Record<string, unknown>>;
  recentClaims?: Array<Record<string, unknown>>;
}

async function requestDashboard(token: string): Promise<DashboardData> {
  const response = await fetch(`${API_URL}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Dashboard request failed (${response.status}).`);
  }

  const result = await response.json();
  return result.data ?? result;
}

function numberValue(value?: number): string {
  return new Intl.NumberFormat().format(value ?? 0);
}

function displayDate(value: unknown): string {
  if (typeof value !== "string") return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

export default function DashboardPage({
  token,
  onNavigate,
}: DashboardPageProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await requestDashboard(token);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [token]);

  const stats = [
    {
      label: "Total users",
      value: data?.totalUsers,
      icon: "♙",
      color: "#2563eb",
      page: "users" as AdminPage,
    },
    {
      label: "Total items",
      value: data?.totalItems,
      icon: "▣",
      color: "#0891b2",
      page: "items" as AdminPage,
    },
    {
      label: "Lost items",
      value: data?.lostItems,
      icon: "⌕",
      color: "#d97706",
      page: "items" as AdminPage,
    },
    {
      label: "Found items",
      value: data?.foundItems,
      icon: "✓",
      color: "#059669",
      page: "items" as AdminPage,
    },
    {
      label: "Pending claims",
      value: data?.pendingClaims,
      icon: "◷",
      color: "#9333ea",
      page: "claims" as AdminPage,
    },
    {
      label: "Recovered items",
      value: data?.recoveredItems ?? data?.completedClaims,
      icon: "♧",
      color: "#0f766e",
      page: "claims" as AdminPage,
    },
  ];

  return (
    <section>
      <style>{`
        .dashboard-stat:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(15,23,42,.07);
        }
        .dashboard-quick:hover { background: #eff6ff !important; }
      `}</style>

      <div style={styles.heading}>
        <div>
          <h1 style={styles.title}>Campus overview</h1>
          <p style={styles.subtitle}>
            Monitor lost items, found belongings, claims, and campus users.
          </p>
        </div>
        <button onClick={() => void loadDashboard()} style={styles.refresh}>
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div role="alert" style={styles.error}>
          {error}
          <button onClick={() => void loadDashboard()} style={styles.retry}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Loading dashboard statistics...</div>
      ) : (
        <>
          <div style={styles.grid}>
            {stats.map((stat) => (
              <button
                type="button"
                key={stat.label}
                className="dashboard-stat"
                onClick={() => onNavigate?.(stat.page)}
                style={styles.statCard}
              >
                <div
                  style={{
                    ...styles.statIcon,
                    background: `${stat.color}15`,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </div>
                <div style={styles.statLabel}>{stat.label}</div>
                <div style={styles.statValue}>{numberValue(stat.value)}</div>
                <div style={styles.statLink}>View details →</div>
              </button>
            ))}
          </div>

          <div style={styles.sectionGrid}>
            <div style={styles.panel}>
              <div style={styles.panelHeading}>
                <div>
                  <h2 style={styles.panelTitle}>Recent reported items</h2>
                  <p style={styles.panelSubtitle}>Latest activity on campus</p>
                </div>
                <button
                  onClick={() => onNavigate?.("items")}
                  style={styles.link}
                >
                  View all
                </button>
              </div>

              {(data?.recentItems ?? []).length === 0 ? (
                <div style={styles.empty}>
                  No recent items were returned by the API.
                </div>
              ) : (
                (data?.recentItems ?? []).slice(0, 6).map((item, index) => (
                  <div key={String(item.id ?? index)} style={styles.listRow}>
                    <div style={styles.rowIcon}>▣</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={styles.rowTitle}>
                        {String(item.title ?? "Untitled item")}
                      </strong>
                      <div style={styles.rowMeta}>
                        {String(item.type ?? "ITEM")} ·{" "}
                        {displayDate(item.dateReported)}
                      </div>
                    </div>
                    <span style={styles.status}>
                      {String(item.status ?? "OPEN")}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div style={styles.panel}>
              <div style={styles.panelHeading}>
                <div>
                  <h2 style={styles.panelTitle}>Recent claims</h2>
                  <p style={styles.panelSubtitle}>Ownership requests</p>
                </div>
                <button
                  onClick={() => onNavigate?.("claims")}
                  style={styles.link}
                >
                  View all
                </button>
              </div>

              {(data?.recentClaims ?? []).length === 0 ? (
                <div style={styles.empty}>
                  No recent claims were returned by the API.
                </div>
              ) : (
                (data?.recentClaims ?? []).slice(0, 6).map((claim, index) => (
                  <div key={String(claim.id ?? index)} style={styles.listRow}>
                    <div style={styles.rowIcon}>✓</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={styles.rowTitle}>
                        {String(
                          claim.itemTitle ?? claim.itemId ?? "Item claim",
                        )}
                      </strong>
                      <div style={styles.rowMeta}>
                        {displayDate(claim.createdAt)}
                      </div>
                    </div>
                    <span style={styles.status}>
                      {String(claim.status ?? "PENDING")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={styles.quickPanel}>
            <h2 style={styles.panelTitle}>Quick actions</h2>
            <div style={styles.quickGrid}>
              {[
                ["▣", "Manage items", "items"],
                ["✓", "Review claims", "claims"],
                ["♙", "Manage users", "users"],
                ["▧", "Create announcement", "announcements"],
              ].map(([icon, label, page]) => (
                <button
                  type="button"
                  className="dashboard-quick"
                  key={page}
                  onClick={() => onNavigate?.(page as AdminPage)}
                  style={styles.quickButton}
                >
                  <span style={{ fontSize: 21 }}>{icon}</span>
                  <span>{label}</span>
                  <span style={{ marginLeft: "auto" }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    marginBottom: 25,
  },
  title: { fontSize: 24, color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 7 },
  refresh: {
    padding: "9px 14px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    borderRadius: 8,
    cursor: "pointer",
    color: "#334155",
  },
  error: {
    padding: 14,
    background: "#fef2f2",
    color: "#b91c1c",
    borderRadius: 9,
    marginBottom: 18,
    fontSize: 13,
  },
  retry: {
    marginLeft: 12,
    border: 0,
    background: "transparent",
    color: "#991b1b",
    fontWeight: 700,
    cursor: "pointer",
  },
  loading: { padding: 50, textAlign: "center", color: "#64748b" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
    gap: 16,
  },
  statCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    background: "#fff",
    textAlign: "left",
    padding: 18,
    cursor: "pointer",
    transition: "all .2s",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    fontSize: 21,
    marginBottom: 15,
  },
  statLabel: { color: "#64748b", fontSize: 12 },
  statValue: { color: "#0f172a", fontSize: 27, fontWeight: 800, marginTop: 5 },
  statLink: { color: "#2563eb", fontSize: 10, marginTop: 12 },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: 18,
    marginTop: 22,
  },
  panel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 18,
    minWidth: 0,
  },
  panelHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  panelTitle: { color: "#0f172a", fontSize: 15, margin: 0 },
  panelSubtitle: { color: "#94a3b8", fontSize: 11, margin: "5px 0 0" },
  link: {
    color: "#2563eb",
    border: 0,
    background: "transparent",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
  },
  empty: { padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 12 },
  listRow: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "12px 0",
    borderTop: "1px solid #f1f5f9",
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: "grid",
    placeItems: "center",
    background: "#eff6ff",
    color: "#2563eb",
  },
  rowTitle: {
    color: "#334155",
    fontSize: 12,
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rowMeta: { color: "#94a3b8", fontSize: 10, marginTop: 4 },
  status: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "5px 7px",
    borderRadius: 6,
    fontSize: 9,
    whiteSpace: "nowrap",
  },
  quickPanel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 18,
    marginTop: 20,
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: 10,
    marginTop: 15,
  },
  quickButton: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    border: "1px solid #e2e8f0",
    background: "#fff",
    padding: 13,
    borderRadius: 9,
    cursor: "pointer",
    color: "#334155",
    fontSize: 12,
    textAlign: "left",
  },
};

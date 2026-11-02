import React from "react";

export type AdminPage =
  | "dashboard"
  | "users"
  | "items"
  | "claims"
  | "categories"
  | "locations"
  | "announcements"
  | "notifications"
  | "audit"
  | "settings";

export interface SidebarUser {
  id?: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

export interface SidebarProps {
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  user: SidebarUser | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
  isMobile?: boolean;
}

interface NavigationItem {
  id: AdminPage;
  label: string;
  icon: string;
  description?: string;
  badge?: string;
  allowedRoles?: string[];
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "▦",
        description: "Campus overview",
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        id: "users",
        label: "Users",
        icon: "♙",
        description: "Manage campus users",
        allowedRoles: ["ADMIN"],
      },
      {
        id: "items",
        label: "Lost & Found Items",
        icon: "▣",
        description: "Manage reported items",
      },
      {
        id: "claims",
        label: "Claims",
        icon: "✓",
        description: "Review ownership claims",
      },
      {
        id: "categories",
        label: "Categories",
        icon: "▤",
        description: "Manage item categories",
        allowedRoles: ["ADMIN"],
      },
      {
        id: "locations",
        label: "Locations",
        icon: "⌖",
        description: "Manage campus locations",
        allowedRoles: ["ADMIN"],
      },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      {
        id: "announcements",
        label: "Announcements",
        icon: "▧",
        description: "Campus announcements",
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: "♢",
        description: "System notifications",
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        id: "audit",
        label: "Audit Logs",
        icon: "◷",
        description: "System activity records",
        allowedRoles: ["ADMIN"],
      },
      {
        id: "settings",
        label: "Settings",
        icon: "⚙",
        description: "Admin preferences",
      },
    ],
  },
];

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 260,
    minWidth: 260,
    height: "100%",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    background: "#0f172a",
    color: "#cbd5e1",
    transition: "width 200ms ease, min-width 200ms ease",
    overflow: "hidden",
    boxSizing: "border-box",
    zIndex: 100,
  },

  brand: {
    height: 76,
    minHeight: 76,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 20px",
    borderBottom: "1px solid rgba(148,163,184,0.13)",
  },

  logo: {
    width: 39,
    height: 39,
    minWidth: 39,
    borderRadius: 11,
    background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
    color: "#ffffff",
    display: "grid",
    placeItems: "center",
    fontSize: 20,
    fontWeight: 800,
  },

  brandTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: "-0.3px",
    whiteSpace: "nowrap",
  },

  brandSubtitle: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 4,
    whiteSpace: "nowrap",
  },

  navigation: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "15px 12px",
  },

  groupTitle: {
    fontSize: 10,
    fontWeight: 800,
    color: "#64748b",
    letterSpacing: "1px",
    padding: "13px 10px 8px",
  },

  navItem: {
    width: "100%",
    minHeight: 43,
    display: "flex",
    alignItems: "center",
    gap: 12,
    border: "none",
    borderRadius: 8,
    padding: "10px 12px",
    marginBottom: 3,
    background: "transparent",
    color: "#94a3b8",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "inherit",
    transition: "all 150ms ease",
    boxSizing: "border-box",
  },

  activeItem: {
    background:
      "linear-gradient(90deg, rgba(37,99,235,0.27), rgba(37,99,235,0.12))",
    color: "#ffffff",
    boxShadow: "inset 3px 0 #3b82f6",
    fontWeight: 700,
  },

  navIcon: {
    width: 22,
    minWidth: 22,
    height: 22,
    display: "grid",
    placeItems: "center",
    fontSize: 18,
  },

  navLabel: {
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  footer: {
    padding: 14,
    borderTop: "1px solid rgba(148,163,184,0.13)",
  },

  userCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 9,
    background: "rgba(148,163,184,0.08)",
  },

  avatar: {
    width: 35,
    height: 35,
    minWidth: 35,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
    overflow: "hidden",
  },

  userName: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: 700,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  userRole: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 3,
    textTransform: "capitalize",
  },
};

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "A"
  );
}

function normalizeRole(role: string): string {
  return role.trim().toUpperCase();
}

export default function Sidebar({
  activePage,
  onNavigate,
  user,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  onLogout,
  isMobile = false,
}: SidebarProps) {
  const userRole = normalizeRole(user?.role ?? "ADMIN");

  const visibleGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.allowedRoles || item.allowedRoles.includes(userRole),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const effectiveCollapsed = collapsed && !isMobile;

  const handleNavigation = (page: AdminPage) => {
    onNavigate(page);

    if (isMobile) {
      onCloseMobile?.();
    }
  };

  const sidebarWidth = effectiveCollapsed ? 76 : 260;

  return (
    <>
      <style>
        {`
          .admin-sidebar-scroll::-webkit-scrollbar {
            width: 5px;
          }

          .admin-sidebar-scroll::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 10px;
          }

          .admin-nav-button:hover {
            background: rgba(148,163,184,0.12) !important;
            color: #ffffff !important;
          }

          .admin-nav-button.admin-nav-active:hover {
            background: rgba(37,99,235,0.30) !important;
          }

          .admin-sidebar-action:hover {
            color: #ffffff !important;
            background: rgba(148,163,184,0.12) !important;
          }
        `}
      </style>

      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobile}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 199,
            border: "none",
            background: "rgba(15,23,42,0.55)",
            cursor: "pointer",
          }}
        />
      )}

      <aside
        aria-label="Admin navigation"
        style={{
          ...styles.sidebar,
          width: isMobile ? 270 : sidebarWidth,
          minWidth: isMobile ? 270 : sidebarWidth,
          position: isMobile ? "fixed" : "relative",
          top: 0,
          bottom: 0,
          left: 0,
          height: isMobile ? "100dvh" : "100%",
          transform: isMobile
            ? mobileOpen
              ? "translateX(0)"
              : "translateX(-100%)"
            : "none",
          transition: "transform 200ms ease, width 200ms ease",
          boxShadow:
            isMobile && mobileOpen ? "8px 0 30px rgba(15,23,42,0.18)" : "none",
        }}
      >
        <div style={styles.brand}>
          <div style={styles.logo}>I</div>

          {!effectiveCollapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={styles.brandTitle}>INJIBARA CAMPUS</div>
              <div style={styles.brandSubtitle}>
                Lost & Found Administration
              </div>
            </div>
          )}

          {!isMobile && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              style={{
                border: "none",
                background: "transparent",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: 19,
                padding: 4,
              }}
            >
              {collapsed ? "»" : "«"}
            </button>
          )}

          {isMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
              style={{
                marginLeft: "auto",
                border: "none",
                background: "transparent",
                color: "#94a3b8",
                fontSize: 24,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          )}
        </div>

        <nav className="admin-sidebar-scroll" style={styles.navigation}>
          {visibleGroups.map((group) => (
            <div key={group.title}>
              {!effectiveCollapsed && (
                <div style={styles.groupTitle}>{group.title}</div>
              )}

              {group.items.map((item) => {
                const active = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    title={effectiveCollapsed ? item.label : item.description}
                    aria-current={active ? "page" : undefined}
                    onClick={() => handleNavigation(item.id)}
                    className={`admin-nav-button ${
                      active ? "admin-nav-active" : ""
                    }`}
                    style={{
                      ...styles.navItem,
                      ...(active ? styles.activeItem : {}),
                      justifyContent: effectiveCollapsed
                        ? "center"
                        : "flex-start",
                      padding: effectiveCollapsed ? 10 : "10px 12px",
                    }}
                  >
                    <span style={styles.navIcon} aria-hidden="true">
                      {item.icon}
                    </span>

                    {!effectiveCollapsed && (
                      <>
                        <span style={styles.navLabel}>{item.label}</span>

                        {item.badge && (
                          <span
                            style={{
                              background: "#2563eb",
                              color: "#ffffff",
                              borderRadius: 20,
                              padding: "2px 7px",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={styles.footer}>
          {user && !effectiveCollapsed && (
            <div style={styles.userCard}>
              <div style={styles.avatar}>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  getInitials(user.fullName)
                )}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={styles.userName}>{user.fullName}</div>
                <div style={styles.userRole}>
                  {user.role.replace(/_/g, " ")}
                </div>
              </div>
            </div>
          )}

          {onLogout && (
            <button
              type="button"
              className="admin-sidebar-action"
              onClick={onLogout}
              title="Sign out"
              style={{
                ...styles.navItem,
                color: "#fca5a5",
                marginTop: 9,
                justifyContent: effectiveCollapsed ? "center" : "flex-start",
              }}
            >
              <span style={styles.navIcon} aria-hidden="true">
                ⇥
              </span>
              {!effectiveCollapsed && <span>Sign out</span>}
            </button>
          )}

          {!effectiveCollapsed && (
            <div
              style={{
                textAlign: "center",
                color: "#64748b",
                fontSize: 9,
                marginTop: 12,
              }}
            >
              INJIBARA CAMPUS · ADMIN PANEL
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

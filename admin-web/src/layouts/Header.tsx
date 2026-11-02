import React, { useEffect, useRef, useState } from "react";
import type { AdminPage, SidebarUser } from "./Sidebar";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type?: string;
}

export interface HeaderProps {
  user: SidebarUser | null;
  activePage: AdminPage;
  onMenuClick?: () => void;
  onLogout?: () => void;
  notifications?: AdminNotification[];
  onNotificationClick?: (notification: AdminNotification) => void;
  onMarkAllRead?: () => void;
  onViewAllNotifications?: () => void;
}

const pageInformation: Record<
  AdminPage,
  { title: string; description: string }
> = {
  dashboard: {
    title: "Dashboard",
    description: "Overview of campus lost and found activities",
  },
  users: {
    title: "User Management",
    description: "Manage students, staff, and administrators",
  },
  items: {
    title: "Lost & Found Items",
    description: "Review and manage reported campus items",
  },
  claims: {
    title: "Claim Management",
    description: "Review ownership requests and handovers",
  },
  categories: {
    title: "Categories",
    description: "Manage lost and found item categories",
  },
  locations: {
    title: "Campus Locations",
    description: "Manage campus reporting locations",
  },
  announcements: {
    title: "Announcements",
    description: "Publish important campus announcements",
  },
  notifications: {
    title: "Notifications",
    description: "Review system and campus notifications",
  },
  audit: {
    title: "Audit Logs",
    description: "Monitor administrative activity",
  },
  settings: {
    title: "Settings",
    description: "Manage your administrator preferences",
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

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "Recently";

  const difference = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day(s) ago`;

  return date.toLocaleDateString();
}

export default function Header({
  user,
  activePage,
  onMenuClick,
  onLogout,
  notifications = [],
  onNotificationClick,
  onMarkAllRead,
  onViewAllNotifications,
}: HeaderProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const page = pageInformation[activePage];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    setNotificationOpen(false);
    setProfileOpen(false);
  }, [activePage]);

  return (
    <>
      <style>
        {`
          .admin-header-action:hover {
            background: #f1f5f9 !important;
          }

          .admin-dropdown-item:hover {
            background: #f8fafc !important;
          }

          .admin-notification-item:hover {
            background: #f8fafc !important;
          }

          @media (max-width: 640px) {
            .admin-header-description {
              display: none !important;
            }

            .admin-header-title {
              font-size: 17px !important;
            }

            .admin-header {
              padding-left: 12px !important;
              padding-right: 12px !important;
            }
          }
        `}
      </style>

      <header
        className="admin-header"
        style={{
          height: 76,
          minHeight: 76,
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 15,
          padding: "0 26px",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            minWidth: 0,
          }}
        >
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="admin-header-action"
            style={{
              display: "grid",
              placeItems: "center",
              width: 38,
              height: 38,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              borderRadius: 8,
              color: "#334155",
              fontSize: 20,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ☰
          </button>

          <div style={{ minWidth: 0 }}>
            <div
              className="admin-header-title"
              style={{
                color: "#0f172a",
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {page.title}
            </div>

            <div
              className="admin-header-description"
              style={{
                color: "#94a3b8",
                fontSize: 11,
                marginTop: 4,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Home / Administration / {page.title}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div ref={notificationRef} style={{ position: "relative" }}>
            <button
              type="button"
              className="admin-header-action"
              onClick={() => {
                setNotificationOpen((value) => !value);
                setProfileOpen(false);
              }}
              aria-label={`Notifications, ${unreadCount} unread`}
              aria-expanded={notificationOpen}
              style={{
                width: 39,
                height: 39,
                display: "grid",
                placeItems: "center",
                border: "1px solid #e2e8f0",
                borderRadius: 9,
                background: "#ffffff",
                color: "#475569",
                cursor: "pointer",
                position: "relative",
                fontSize: 19,
              }}
            >
              ♧
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    minWidth: 17,
                    height: 17,
                    padding: "0 3px",
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 20,
                    background: "#ef4444",
                    color: "#ffffff",
                    border: "2px solid #ffffff",
                    fontSize: 9,
                    fontWeight: 800,
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 49,
                  right: 0,
                  width: "min(360px, calc(100vw - 24px))",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  boxShadow: "0 15px 45px rgba(15,23,42,0.15)",
                  overflow: "hidden",
                  zIndex: 200,
                }}
              >
                <div
                  style={{
                    padding: "15px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <strong style={{ fontSize: 14, color: "#0f172a" }}>
                    Notifications
                  </strong>

                  <span
                    style={{
                      fontSize: 11,
                      color: "#2563eb",
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount} unread
                  </span>
                </div>

                <div style={{ maxHeight: 330, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div
                      style={{
                        padding: 30,
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: 12,
                      }}
                    >
                      <div style={{ fontSize: 26, marginBottom: 8 }}>♧</div>
                      You are all caught up.
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        className="admin-notification-item"
                        onClick={() => {
                          onNotificationClick?.(notification);
                          setNotificationOpen(false);
                        }}
                        style={{
                          display: "flex",
                          width: "100%",
                          gap: 10,
                          textAlign: "left",
                          padding: 13,
                          border: "none",
                          borderBottom: "1px solid #f1f5f9",
                          background: notification.isRead
                            ? "#ffffff"
                            : "#eff6ff",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            minWidth: 8,
                            borderRadius: "50%",
                            marginTop: 5,
                            background: notification.isRead
                              ? "#cbd5e1"
                              : "#2563eb",
                          }}
                        />

                        <span style={{ minWidth: 0, flex: 1 }}>
                          <strong
                            style={{
                              display: "block",
                              fontSize: 12,
                              color: "#334155",
                            }}
                          >
                            {notification.title}
                          </strong>

                          <span
                            style={{
                              display: "block",
                              fontSize: 11,
                              color: "#64748b",
                              marginTop: 4,
                              lineHeight: 1.5,
                            }}
                          >
                            {notification.message}
                          </span>

                          <span
                            style={{
                              display: "block",
                              color: "#94a3b8",
                              fontSize: 10,
                              marginTop: 5,
                            }}
                          >
                            {formatRelativeDate(notification.createdAt)}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: 12,
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onMarkAllRead?.();
                    }}
                    style={smallActionStyle}
                  >
                    Mark all read
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onViewAllNotifications?.();
                      setNotificationOpen(false);
                    }}
                    style={{
                      ...smallActionStyle,
                      color: "#2563eb",
                    }}
                  >
                    View all
                  </button>
                </div>
              </div>
            )}
          </div>

          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              type="button"
              className="admin-header-action"
              onClick={() => {
                setProfileOpen((value) => !value);
                setNotificationOpen(false);
              }}
              aria-expanded={profileOpen}
              aria-label="Open administrator profile menu"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "5px 9px 5px 6px",
                background: "#ffffff",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 12,
                  overflow: "hidden",
                }}
              >
                {user?.avatarUrl ? (
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
                  getInitials(user?.fullName ?? "Administrator")
                )}
              </div>

              <div
                className="admin-profile-label"
                style={{
                  textAlign: "left",
                  maxWidth: 125,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    color: "#334155",
                    fontSize: 11,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.fullName ?? "Administrator"}
                </strong>

                <span
                  style={{
                    display: "block",
                    color: "#94a3b8",
                    fontSize: 10,
                    marginTop: 3,
                    textTransform: "capitalize",
                  }}
                >
                  {user?.role?.toLowerCase().replace(/_/g, " ") ?? "Admin"}
                </span>
              </div>

              <span style={{ color: "#94a3b8", fontSize: 11 }}>⌄</span>
            </button>

            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 50,
                  right: 0,
                  width: 220,
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 11,
                  padding: 7,
                  boxShadow: "0 15px 45px rgba(15,23,42,0.15)",
                  zIndex: 200,
                }}
              >
                <div
                  style={{
                    padding: "11px 10px",
                    borderBottom: "1px solid #f1f5f9",
                    marginBottom: 5,
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      color: "#0f172a",
                      fontSize: 12,
                    }}
                  >
                    {user?.fullName ?? "Administrator"}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      color: "#94a3b8",
                      fontSize: 10,
                      marginTop: 4,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {user?.email ?? ""}
                  </span>
                </div>

                <button
                  type="button"
                  className="admin-dropdown-item"
                  onClick={() => setProfileOpen(false)}
                  style={dropdownItemStyle}
                >
                  <span>♙</span>
                  My account
                </button>

                <button
                  type="button"
                  className="admin-dropdown-item"
                  onClick={() => setProfileOpen(false)}
                  style={dropdownItemStyle}
                >
                  <span>⚙</span>
                  Preferences
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout?.();
                  }}
                  style={{
                    ...dropdownItemStyle,
                    color: "#dc2626",
                    marginTop: 4,
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <span>⇥</span>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

const smallActionStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#64748b",
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
  padding: 5,
};

const dropdownItemStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px",
  border: "none",
  borderRadius: 7,
  background: "transparent",
  color: "#475569",
  textAlign: "left",
  fontSize: 12,
  cursor: "pointer",
};

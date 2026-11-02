import React, { useEffect, useState } from "react";

import Sidebar, { type AdminPage, type SidebarUser } from "./Sidebar";

import Header, { type AdminNotification } from "./Header";

export interface AdminLayoutProps {
  children: React.ReactNode;
  user: SidebarUser | null;
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
  notifications?: AdminNotification[];
  onNotificationClick?: (notification: AdminNotification) => void;
  onMarkAllRead?: () => void;
  onViewAllNotifications?: () => void;
  pagePadding?: number;
  contentMaxWidth?: number;
  showFooter?: boolean;
}

export default function AdminLayout({
  children,
  user,
  activePage,
  onNavigate,
  onLogout,
  notifications = [],
  onNotificationClick,
  onMarkAllRead,
  onViewAllNotifications,
  pagePadding = 26,
  contentMaxWidth = 1600,
  showFooter = true,
}: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateScreenSize = () => {
      const mobile = window.innerWidth <= 900;

      setIsMobile(mobile);

      if (!mobile) {
        setMobileOpen(false);
      }
    };

    updateScreenSize();

    window.addEventListener("resize", updateScreenSize);

    return () => {
      window.removeEventListener("resize", updateScreenSize);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [activePage]);

  useEffect(() => {
    if (!isMobile || !mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, mobileOpen]);

  const handleNavigate = (page: AdminPage) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    setMobileOpen(false);
    onLogout();
  };

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          html, body, #root {
            min-height: 100%;
            margin: 0;
          }

          body {
            font-family: Inter, -apple-system, BlinkMacSystemFont,
              "Segoe UI", sans-serif;
            background: #f8fafc;
            color: #0f172a;
          }

          button, input, textarea, select {
            font-family: inherit;
          }

          .admin-layout-root {
            width: 100%;
            height: 100vh;
            height: 100dvh;
            min-height: 500px;
            display: flex;
            overflow: hidden;
            background: #f8fafc;
          }

          .admin-layout-main {
            flex: 1;
            min-width: 0;
            min-height: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .admin-layout-content {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
            background: #f8fafc;
          }

          .admin-layout-page {
            width: 100%;
            margin: 0 auto;
          }

          .admin-layout-footer {
            padding: 15px 0 5px;
            color: #94a3b8;
            font-size: 11px;
            text-align: center;
          }

          @media (max-width: 640px) {
            .admin-layout-page {
              padding-left: 14px !important;
              padding-right: 14px !important;
            }

            .admin-layout-footer {
              padding-bottom: 16px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              scroll-behavior: auto !important;
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>

      <div className="admin-layout-root">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          user={user}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onLogout={handleLogout}
          isMobile={isMobile}
        />

        <div className="admin-layout-main">
          <Header
            user={user}
            activePage={activePage}
            onMenuClick={() => {
              if (isMobile) {
                setMobileOpen((value) => !value);
              } else {
                setCollapsed((value) => !value);
              }
            }}
            onLogout={handleLogout}
            notifications={notifications}
            onNotificationClick={onNotificationClick}
            onMarkAllRead={onMarkAllRead}
            onViewAllNotifications={onViewAllNotifications}
          />

          <main className="admin-layout-content">
            <div
              className="admin-layout-page"
              style={{
                maxWidth: contentMaxWidth,
                padding: pagePadding,
              }}
            >
              {children}

              {showFooter && (
                <footer className="admin-layout-footer">
                  <div>
                    © {new Date().getFullYear()} Injibara Campus Lost & Found
                  </div>
                  <div style={{ marginTop: 4 }}>
                    Administration Dashboard · All rights reserved
                  </div>
                </footer>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

import type { UserRole } from "../types/auth.types";

interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const authenticated =
    Boolean(accessToken) && isAuthenticated && Boolean(user);

  if (!authenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (user && !user.isActive) {
    return <Navigate to="/account-disabled" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

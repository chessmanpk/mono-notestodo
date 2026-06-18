import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import type { UserRole } from "../types";

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: UserRole[] }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-sm text-[var(--muted)]">Loading workspace...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

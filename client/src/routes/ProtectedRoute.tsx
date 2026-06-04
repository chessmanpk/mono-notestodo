import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export function ProtectedRoute() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-sm text-[var(--muted)]">Loading workspace...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

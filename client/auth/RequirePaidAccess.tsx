import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";

export function RequirePaidAccess() {
  const { user, hasPaidAccess, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Checking your billing...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!hasPaidAccess) {
    return <Navigate to="/checkout" replace />;
  }

  return <Outlet />;
}

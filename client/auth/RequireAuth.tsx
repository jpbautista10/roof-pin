import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";

export function RequireAuth() {
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Checking your session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  return <Outlet />;
}

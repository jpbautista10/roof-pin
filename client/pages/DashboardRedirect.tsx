import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";

export default function DashboardRedirect() {
  const { dbUser, company, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!dbUser?.onboarding_completed_at || !company?.slug) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to={`/dashboard/${company.slug}`} replace />;
}

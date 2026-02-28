import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";

export function RequireOnboarding() {
  const { companySlug } = useParams();
  const { user, dbUser, company, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Checking your account...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!dbUser?.onboarding_completed_at || !company?.slug) {
    return <Navigate to="/onboarding" replace />;
  }

  if (companySlug && companySlug !== company.slug) {
    return <Navigate to={`/dashboard/${company.slug}`} replace />;
  }

  return <Outlet />;
}

export function OnboardingOnly() {
  const { user, dbUser, company, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Checking your account...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (dbUser?.onboarding_completed_at && company?.slug) {
    return <Navigate to={`/dashboard/${company.slug}`} replace />;
  }

  return <Outlet />;
}

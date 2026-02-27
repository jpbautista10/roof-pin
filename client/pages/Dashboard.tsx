import { Navigate, useParams } from "react-router-dom";
import { Building2, Palette, ShieldCheck } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";

export default function Dashboard() {
  const { companySlug } = useParams();
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

  if (companySlug !== company.slug) {
    return <Navigate to={`/dashboard/${company.slug}`} replace />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Tenant dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {company.name}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Company slug: /dashboard/{company.slug}
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Building2 className="h-5 w-5 text-slate-700" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              Workspace ready
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Your multi-tenant workspace is linked to this account.
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Palette className="h-5 w-5 text-slate-700" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              Brand colors stored
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: company.brand_primary_color }}
              />
              <span
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: company.brand_secondary_color }}
              />
              <span
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: company.brand_accent_color }}
              />
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <ShieldCheck className="h-5 w-5 text-slate-700" />
            </div>
            <p className="text-sm font-medium text-slate-900">
              Onboarding enforced
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Users without onboarding are always redirected to /onboarding.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}

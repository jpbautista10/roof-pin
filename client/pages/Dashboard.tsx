import { useState } from "react";
import { Copy, Check, MapPin, Code2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useData } from "@/data/DataContext";

export default function Dashboard() {
  const { tenant, pins } = useData();
  const tenantPins = pins.filter((p) => p.tenant_id === tenant.id);
  const embedCode = `<iframe src="https://${tenant.slug}.neighborhoodproof.com" width="100%" height="500" frameborder="0"></iframe>`;

  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <DashboardLayout>
      <div className="px-6 py-8 md:px-10 md:py-10 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, {tenant.company_name}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-slate-500">Total Pins</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{tenantPins.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-teal-600" />
              </div>
              <p className="text-sm font-medium text-slate-500">Embed Status</p>
            </div>
            <p className="text-lg font-bold text-teal-600">Ready</p>
          </div>
        </div>

        {/* Embed Code */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Embed Code</h2>
          <p className="text-sm text-slate-500 mb-4">
            Copy and paste this snippet into your website to display your project map.
          </p>
          <div className="relative">
            <pre className="bg-slate-900 text-slate-300 rounded-lg p-4 pr-14 text-sm overflow-x-auto font-mono">
              {embedCode}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-teal-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ImportResult {
  rowIndex: number;
  projectName: string;
  status: "success" | "error";
  error?: string;
}

interface ImportResultsProps {
  results: ImportResult[];
}

export default function ImportResults({ results }: ImportResultsProps) {
  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {successCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {successCount} imported
            </span>
          </div>
        )}
        {errorCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              {errorCount} failed
            </span>
          </div>
        )}
      </div>

      {errorCount > 0 && (
        <div className="rounded-lg border border-slate-200 overflow-auto max-h-[300px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                  Row
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                  Project
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">
                  Error
                </th>
              </tr>
            </thead>
            <tbody>
              {results
                .filter((r) => r.status === "error")
                .map((r) => (
                  <tr key={r.rowIndex} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-400">
                      {r.rowIndex + 1}
                    </td>
                    <td className="px-3 py-2">{r.projectName}</td>
                    <td className="px-3 py-2">
                      <Badge variant="destructive" className="text-xs">
                        {r.error}
                      </Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

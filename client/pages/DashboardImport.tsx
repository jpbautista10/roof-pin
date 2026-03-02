import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { Upload, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createLocation } from "@/lib/locations";
import { useQueryClient } from "@tanstack/react-query";
import {
  type ParsedRow,
  type ValidatedRow,
  validateRow,
  downloadSampleCsv,
} from "./import/csv-template";
import ImportPreviewTable from "./import/ImportPreviewTable";
import ImportResults, { type ImportResult } from "./import/ImportResults";

type ImportPhase = "upload" | "preview" | "importing" | "done";

export default function DashboardImport() {
  const { user, company } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<ImportPhase>("upload");
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const validRows = rows.filter((r) => r.errors.length === 0);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file.");
      return;
    }

    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(parseResult) {
        if (parseResult.data.length === 0) {
          toast.error("CSV file is empty.");
          return;
        }

        if (parseResult.data.length > 200) {
          toast.error("Maximum 200 rows per import.");
          return;
        }

        const validated = parseResult.data.map((row, i) =>
          validateRow(row, i),
        );
        setRows(validated);
        setPhase("preview");
      },
      error() {
        toast.error("Failed to parse CSV file.");
      },
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleImport = async () => {
    if (!company || !user) {
      toast.error("You must be logged in.");
      return;
    }

    setPhase("importing");
    setProgress(0);

    // Step 1: Batch geocode via server
    const importRows = validRows.map((r) => ({
      project_name: r.project_name.trim(),
      address: r.address.trim(),
      work_type: r.work_type?.trim() || undefined,
      date_completed: r.date_completed?.trim() || undefined,
      privacy_mode: r.privacy_mode?.trim() === "true",
    }));

    let geocodedResults: Array<{
      row_index: number;
      status: "success" | "error";
      error?: string;
      data?: {
        project_name: string;
        place_label: string;
        latitude: number;
        longitude: number;
        geocode_latitude: number;
        geocode_longitude: number;
        address_json: Record<string, string | null>;
        work_type?: string;
        date_completed?: string;
        privacy_mode?: boolean;
      };
    }>;

    try {
      const response = await fetch("/api/import/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: importRows }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || "Geocoding request failed");
      }

      const payload = await response.json();
      geocodedResults = payload.results;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Geocoding failed.",
      );
      setPhase("preview");
      return;
    }

    // Step 2: Insert each geocoded row into Supabase
    const importResults: ImportResult[] = [];
    const total = geocodedResults.length;

    for (let i = 0; i < total; i++) {
      const geo = geocodedResults[i];
      const originalRow = validRows[i];
      setProgress(Math.round(((i + 1) / total) * 100));

      if (geo.status === "error" || !geo.data) {
        importResults.push({
          rowIndex: originalRow.rowIndex,
          projectName: originalRow.project_name,
          status: "error",
          error: geo.error || "Geocoding failed",
        });
        continue;
      }

      try {
        await createLocation({
          company_id: company.id,
          created_by_user_id: user.id,
          project_name: geo.data.project_name,
          place_label: geo.data.place_label,
          latitude: geo.data.latitude,
          longitude: geo.data.longitude,
          geocode_latitude: geo.data.geocode_latitude,
          geocode_longitude: geo.data.geocode_longitude,
          address_json: geo.data.address_json,
          work_type: geo.data.work_type ?? null,
          date_completed: geo.data.date_completed ?? null,
          privacy_mode: geo.data.privacy_mode ?? false,
        });

        importResults.push({
          rowIndex: originalRow.rowIndex,
          projectName: geo.data.project_name,
          status: "success",
        });
      } catch (err) {
        importResults.push({
          rowIndex: originalRow.rowIndex,
          projectName: geo.data.project_name,
          status: "error",
          error:
            err instanceof Error ? err.message : "Failed to save location",
        });
      }
    }

    setResults(importResults);
    setPhase("done");

    const successCount = importResults.filter(
      (r) => r.status === "success",
    ).length;

    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success(`${successCount} location(s) imported successfully.`);
    }
  };

  const handleReset = () => {
    setPhase("upload");
    setRows([]);
    setProgress(0);
    setResults([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Import Locations
          </h2>
          <p className="text-sm text-slate-500">
            Bulk import project locations from a CSV file.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadSampleCsv}>
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Upload Phase */}
      {phase === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-slate-300 bg-slate-50 hover:border-slate-400"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Upload className="h-6 w-6 text-slate-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              Drag & drop your CSV file here
            </p>
            <p className="text-xs text-slate-500 mt-1">or click to browse</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {/* Preview Phase */}
      {phase === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              <span className="font-medium">{rows.length}</span> rows found
              {rows.length !== validRows.length && (
                <>
                  {" "}
                  &middot;{" "}
                  <span className="text-red-600 font-medium">
                    {rows.length - validRows.length} with errors
                  </span>
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={validRows.length === 0}
                onClick={handleImport}
              >
                Import {validRows.length} Location
                {validRows.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
          <ImportPreviewTable rows={rows} />
        </div>
      )}

      {/* Importing Phase */}
      {phase === "importing" && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-slate-700">
            Geocoding and importing locations...
          </p>
          <div className="w-full max-w-sm">
            <Progress value={progress} className="h-2" />
          </div>
          <p className="text-xs text-slate-500">{progress}% complete</p>
        </div>
      )}

      {/* Done Phase */}
      {phase === "done" && (
        <div className="space-y-4">
          <ImportResults results={results} />
          <Button variant="outline" size="sm" onClick={handleReset}>
            Import More
          </Button>
        </div>
      )}
    </div>
  );
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ValidatedRow } from "./csv-template";

interface ImportPreviewTableProps {
  rows: ValidatedRow[];
}

export default function ImportPreviewTable({ rows }: ImportPreviewTableProps) {
  return (
    <div className="rounded-lg border border-slate-200 overflow-auto max-h-[420px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Project Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Work Type</TableHead>
            <TableHead>Date Completed</TableHead>
            <TableHead>Privacy</TableHead>
            <TableHead className="w-28">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const hasErrors = row.errors.length > 0;

            return (
              <TableRow
                key={row.rowIndex}
                className={hasErrors ? "bg-red-50" : ""}
              >
                <TableCell className="text-xs text-slate-400">
                  {row.rowIndex + 1}
                </TableCell>
                <TableCell
                  className={
                    !row.project_name?.trim() ? "text-red-500 italic" : ""
                  }
                >
                  {row.project_name?.trim() || "—"}
                </TableCell>
                <TableCell
                  className={
                    !row.address?.trim() ? "text-red-500 italic" : ""
                  }
                >
                  {row.address?.trim() || "—"}
                </TableCell>
                <TableCell className="text-slate-600">
                  {row.work_type?.trim() || "—"}
                </TableCell>
                <TableCell className="text-slate-600">
                  {row.date_completed?.trim() || "—"}
                </TableCell>
                <TableCell className="text-slate-600">
                  {row.privacy_mode?.trim() === "true" ? "Yes" : "No"}
                </TableCell>
                <TableCell>
                  {hasErrors ? (
                    <Badge variant="destructive" className="text-xs">
                      {row.errors.join(", ")}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-50 text-green-700 text-xs"
                    >
                      Ready
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export const CSV_HEADERS = [
  "project_name",
  "address",
  "work_type",
  "date_completed",
  "privacy_mode",
] as const;

export const SAMPLE_CSV = `project_name,address,work_type,date_completed,privacy_mode
Smith Roof Replacement,"123 Main St, Decatur GA 30030",Shingle,June 2024,false
Jones Gutters,"456 Oak Ave, Atlanta GA 30301",Metal,March 2025,false
Quick Fix,"789 Pine St, Marietta GA",,,`;

export interface ParsedRow {
  project_name: string;
  address: string;
  work_type: string;
  date_completed: string;
  privacy_mode: string;
}

export interface ValidatedRow extends ParsedRow {
  rowIndex: number;
  errors: string[];
}

export function validateRow(row: ParsedRow, index: number): ValidatedRow {
  const errors: string[] = [];

  if (!row.project_name?.trim()) {
    errors.push("Missing project name");
  }

  if (!row.address?.trim()) {
    errors.push("Missing address");
  }

  return { ...row, rowIndex: index, errors };
}

export function downloadSampleCsv() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "import-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

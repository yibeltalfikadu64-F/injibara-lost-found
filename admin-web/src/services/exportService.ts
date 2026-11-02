export type ExportFormat = "csv" | "json";

export interface ExportColumn<T> {
  key: keyof T | string;
  label: string;
  formatter?: (value: unknown, row: T) => string | number;
}

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: boolean;
  delimiter?: string;
}

export interface ExportResult {
  filename: string;
  format: ExportFormat;
  recordCount: number;
  success: boolean;
}

function getNestedValue(object: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, object);
}

/**
 * Convert a value to a safe text representation.
 */
function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Prevent spreadsheet formula injection.
 */
function preventFormulaInjection(value: string): string {
  const normalized = value.replace(/^[\u0000-\u0020]+/, "");

  if (/^[=+\-@]/.test(normalized)) {
    return `'${value}`;
  }

  return value;
}

/**
 * Escape CSV cells.
 */
function escapeCsvCell(value: unknown, delimiter = ","): string {
  const text = preventFormulaInjection(stringifyValue(value));

  const escaped = text.replace(/"/g, '""');

  if (
    escaped.includes('"') ||
    escaped.includes("\n") ||
    escaped.includes("\r") ||
    escaped.includes(delimiter)
  ) {
    return `"${escaped}"`;
  }

  return escaped;
}

/**
 * Convert records into CSV text.
 */
export function convertToCSV<T extends object>(
  records: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions = {},
): string {
  const { includeHeaders = true, delimiter = "," } = options;

  const rows: string[] = [];

  if (includeHeaders) {
    rows.push(
      columns
        .map((column) => escapeCsvCell(column.label, delimiter))
        .join(delimiter),
    );
  }

  for (const record of records) {
    const row = columns.map((column) => {
      const key = String(column.key);

      const rawValue = getNestedValue(record, key);

      const formattedValue = column.formatter
        ? column.formatter(rawValue, record)
        : rawValue;

      return escapeCsvCell(formattedValue, delimiter);
    });

    rows.push(row.join(delimiter));
  }

  return rows.join("\r\n");
}

/**
 * Create a temporary browser download.
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Normalize filenames.
 */
function normalizeFilename(filename: string): string {
  return (
    filename
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
      .replace(/\s+/g, "_")
      .replace(/^\.+/, "") || "campus-report"
  );
}

/**
 * Export data as CSV.
 */
export function exportCSV<T extends object>(
  records: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions = {},
): ExportResult {
  const filename = normalizeFilename(options.filename || "campus-report");

  const csv = convertToCSV(records, columns, options);

  // UTF-8 BOM helps spreadsheet software recognize Unicode.
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  downloadBlob(blob, `${filename}.csv`);

  return {
    filename: `${filename}.csv`,
    format: "csv",
    recordCount: records.length,
    success: true,
  };
}

/**
 * Export data as JSON.
 */
export function exportJSON<T>(
  records: T[],
  options: ExportOptions = {},
): ExportResult {
  const filename = normalizeFilename(options.filename || "campus-report");

  const json = JSON.stringify(records, null, 2);

  const blob = new Blob([json], {
    type: "application/json;charset=utf-8;",
  });

  downloadBlob(blob, `${filename}.json`);

  return {
    filename: `${filename}.json`,
    format: "json",
    recordCount: records.length,
    success: true,
  };
}

/**
 * Export a simple HTML report for printing.
 */
export function printReport(title: string, content: string): void {
  const printWindow = window.open("", "_blank", "width=1000,height=750");

  if (!printWindow) {
    throw new Error(
      "The print window was blocked. Allow pop-ups and try again.",
    );
  }

  const safeTitle = escapeHtml(title);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${safeTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 32px;
            color: #1f2937;
          }

          h1 {
            margin-bottom: 8px;
          }

          .report-date {
            color: #64748b;
            margin-bottom: 24px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            padding: 10px;
            text-align: left;
            border: 1px solid #e2e8f0;
          }

          th {
            background: #f1f5f9;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <h1>${safeTitle}</h1>
        <p class="report-date">
          Generated: ${new Date().toLocaleString()}
        </p>
        ${content}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  printWindow.onload = () => {
    printWindow.print();
  };
}

/**
 * Escape HTML values.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Create HTML table content from data.
 */
export function createPrintableTable<T extends object>(
  records: T[],
  columns: ExportColumn<T>[],
): string {
  const header = columns
    .map((column) => `<th>${escapeHtml(column.label)}</th>`)
    .join("");

  const rows = records
    .map((record) => {
      const cells = columns
        .map((column) => {
          const rawValue = getNestedValue(record, String(column.key));

          const value = column.formatter
            ? column.formatter(rawValue, record)
            : rawValue;

          return `<td>${escapeHtml(stringifyValue(value))}</td>`;
        })
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `
    <table>
      <thead><tr>${header}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

const exportService = {
  convertToCSV,
  exportCSV,
  exportJSON,
  printReport,
  createPrintableTable,
  escapeHtml,
};

export default exportService;

import React, { useMemo, useState } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  accessor?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string | number;
  minWidth?: string | number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: keyof T | ((row: T) => string | number);
  loading?: boolean;
  error?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  pageSizeOptions?: number[];
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  getRowLabel?: (row: T) => string;
}

function getValue<T>(row: T, key: keyof T): unknown {
  return row[key];
}

function normalizeSearchValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value).toLowerCase();
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) return value.toISOString().toLowerCase();
  return "";
}

function getKey<T>(
  row: T,
  rowKey: keyof T | ((row: T) => string | number),
): string {
  const value = typeof rowKey === "function" ? rowKey(row) : row[rowKey];
  return String(value);
}

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  error,
  emptyTitle = "No records found",
  emptyDescription = "There are no records to display right now.",
  searchable = true,
  searchPlaceholder = "Search records...",
  searchKeys,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  actions,
  toolbar,
  footer,
  getRowLabel,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const searchableKeys =
    searchKeys ??
    columns
      .filter((column) => column.accessor)
      .map((column) => column.accessor as keyof T);

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data;

    return data.filter((row) =>
      searchableKeys.some((key) =>
        normalizeSearchValue(getValue(row, key)).includes(query),
      ),
    );
  }, [data, search, searchableKeys]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    const column = columns.find((item) => item.key === sortKey);
    if (!column?.accessor) return filteredData;

    return [...filteredData].sort((a, b) => {
      const left = getValue(a, column.accessor!);
      const right = getValue(b, column.accessor!);

      const leftValue = normalizeSearchValue(left);
      const rightValue = normalizeSearchValue(right);

      const comparison = leftValue.localeCompare(rightValue, undefined, {
        numeric: true,
        sensitivity: "base",
      });

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / localPageSize));

  const currentPage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * localPageSize;
    return sortedData.slice(start, start + localPageSize);
  }, [sortedData, currentPage, localPageSize]);

  const selectedSet = new Set(selectedRows);
  const visibleKeys = paginatedData.map((row) => getKey(row, rowKey));
  const allVisibleSelected =
    visibleKeys.length > 0 && visibleKeys.every((key) => selectedSet.has(key));

  const toggleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable || !column.accessor) return;

    if (sortKey === column.key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column.key);
      setSortDirection("asc");
    }
  };

  const toggleRow = (key: string) => {
    const next = selectedSet.has(key)
      ? selectedRows.filter((item) => item !== key)
      : [...selectedRows, key];

    onSelectionChange?.(next);
  };

  const toggleVisibleRows = () => {
    if (allVisibleSelected) {
      onSelectionChange?.(
        selectedRows.filter((key) => !visibleKeys.includes(key)),
      );
    } else {
      onSelectionChange?.(
        Array.from(new Set([...selectedRows, ...visibleKeys])),
      );
    }
  };

  const startRecord =
    sortedData.length === 0 ? 0 : (currentPage - 1) * localPageSize + 1;

  const endRecord = Math.min(currentPage * localPageSize, sortedData.length);

  return (
    <section
      style={{
        width: "100%",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {(searchable || toolbar) && (
        <div
          style={{
            padding: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          {searchable && (
            <div style={{ position: "relative", flex: "1 1 230px" }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: 10,
                  color: "#94a3b8",
                }}
                aria-hidden="true"
              >
                ⌕
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                aria-label="Search table records"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  height: 38,
                  padding: "8px 12px 8px 35px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  outline: "none",
                  fontSize: 13,
                }}
              />
            </div>
          )}

          {toolbar && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {toolbar}
            </div>
          )}
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            padding: 14,
            color: "#991b1b",
            background: "#fef2f2",
            borderBottom: "1px solid #fecaca",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ overflowX: "auto", width: "100%" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: 13,
          }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {selectable && (
                <th
                  style={{
                    width: 45,
                    padding: 14,
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleVisibleRows}
                    aria-label="Select all visible rows"
                  />
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => toggleSort(column)}
                  aria-sort={
                    sortKey === column.key
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  style={{
                    padding: "14px 16px",
                    color: "#64748b",
                    fontWeight: 700,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid #e2e8f0",
                    whiteSpace: "nowrap",
                    textAlign: column.align ?? "left",
                    width: column.width,
                    minWidth: column.minWidth,
                    cursor: column.sortable ? "pointer" : "default",
                  }}
                >
                  {column.header}
                  {column.sortable && (
                    <span style={{ marginLeft: 6 }}>
                      {sortKey === column.key
                        ? sortDirection === "asc"
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  )}
                </th>
              ))}

              {actions && (
                <th
                  style={{
                    padding: "14px 16px",
                    color: "#64748b",
                    fontSize: 11,
                    textTransform: "uppercase",
                    borderBottom: "1px solid #e2e8f0",
                    whiteSpace: "nowrap",
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                  }
                  style={{ padding: 45, textAlign: "center" }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 25,
                      height: 25,
                      border: "3px solid #dbeafe",
                      borderTopColor: "#2563eb",
                      borderRadius: "50%",
                      animation: "table-spin 0.8s linear infinite",
                    }}
                  />
                  <p style={{ color: "#64748b", margin: "12px 0 0" }}>
                    Loading records...
                  </p>
                  <style>
                    {`
                      @keyframes table-spin {
                        to { transform: rotate(360deg); }
                      }
                    `}
                  </style>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)
                  }
                  style={{
                    padding: "55px 20px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
                  <strong style={{ color: "#334155", fontSize: 15 }}>
                    {emptyTitle}
                  </strong>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: 13,
                      margin: "7px 0 0",
                    }}
                  >
                    {search ? "Try another search term." : emptyDescription}
                  </p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const key = getKey(row, rowKey);
                const selected = selectedSet.has(key);

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    style={{
                      background: selected ? "#eff6ff" : "#ffffff",
                      cursor: onRowClick ? "pointer" : "default",
                      transition: "background 120ms ease",
                    }}
                    onMouseEnter={(event) => {
                      if (!selected) {
                        event.currentTarget.style.background = "#f8fafc";
                      }
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = selected
                        ? "#eff6ff"
                        : "#ffffff";
                    }}
                  >
                    {selectable && (
                      <td
                        style={{
                          padding: 14,
                          borderBottom: "1px solid #f1f5f9",
                        }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleRow(key)}
                          aria-label={`Select ${getRowLabel?.(row) ?? key}`}
                        />
                      </td>
                    )}

                    {columns.map((column) => (
                      <td
                        key={column.key}
                        style={{
                          padding: "14px 16px",
                          color: "#334155",
                          borderBottom: "1px solid #f1f5f9",
                          textAlign: column.align ?? "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {column.render
                          ? column.render(row, index)
                          : column.accessor
                            ? String(getValue(row, column.accessor) ?? "—")
                            : "—"}
                      </td>
                    ))}

                    {actions && (
                      <td
                        style={{
                          padding: "10px 16px",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          {actions(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: "13px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <div style={{ color: "#64748b", fontSize: 12 }}>
          Showing <strong>{startRecord}</strong>–<strong>{endRecord}</strong> of{" "}
          <strong>{sortedData.length}</strong> records
          {selectedRows.length > 0 && (
            <span> · {selectedRows.length} selected</span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#64748b",
            }}
          >
            Rows
            <select
              value={localPageSize}
              onChange={(event) => {
                setLocalPageSize(Number(event.target.value));
                setPage(1);
              }}
              style={{
                padding: "5px 7px",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                background: "#ffffff",
              }}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            style={paginationButtonStyle(currentPage <= 1)}
          >
            Previous
          </button>

          <span style={{ color: "#475569", fontSize: 12 }}>
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            style={paginationButtonStyle(currentPage >= totalPages)}
          >
            Next
          </button>
        </div>
      </div>

      {footer}
    </section>
  );
}

function paginationButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    border: "1px solid #e2e8f0",
    background: disabled ? "#f8fafc" : "#ffffff",
    color: disabled ? "#cbd5e1" : "#334155",
    borderRadius: 7,
    padding: "7px 10px",
    fontSize: 12,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

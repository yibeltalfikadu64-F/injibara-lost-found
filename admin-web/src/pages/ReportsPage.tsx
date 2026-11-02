import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface ReportsPageProps {
  token: string;
}

interface ItemRecord {
  id: string;
  title: string;
  type: "LOST" | "FOUND";
  status: string;
  isApproved?: boolean;
  dateReported?: string;
  createdAt?: string;
}

interface ClaimRecord {
  id: string;
  status: string;
  createdAt: string;
  item?: { title?: string };
}

interface ReportData {
  items: ItemRecord[];
  claims: ClaimRecord[];
}

async function fetchRows<T>(path: string, token: string): Promise<T[]> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Request to ${path} failed (${response.status}).`);
  }

  const result = await response.json();
  const rows =
    result.data?.items ??
    result.data?.claims ??
    result.items ??
    result.claims ??
    result.data ??
    result;

  return Array.isArray(rows) ? rows : [];
}

function exportCSV(rows: Array<Record<string, string | number>>) {
  if (rows.length === 0) return;

  const columns = Object.keys(rows[0]);
  const escapeCSV = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const content = [
    columns.map(escapeCSV).join(","),
    ...rows.map((row) =>
      columns.map((column) => escapeCSV(row[column])).join(","),
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF", content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `injibara-campus-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage({ token }: ReportsPageProps) {
  const [data, setData] = useState<ReportData>({ items: [], claims: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportType, setReportType] = useState("ALL");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [items, claims] = await Promise.all([
        fetchRows<ItemRecord>("/admin/items", token),
        fetchRows<ClaimRecord>("/admin/claims", token),
      ]);

      setData({ items, claims });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const filteredItems = useMemo(
    () =>
      data.items.filter((item) => {
        const date = new Date(item.dateReported ?? item.createdAt ?? "");
        if (Number.isNaN(date.getTime())) return !fromDate && !toDate;
        const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
        const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

        return (!from || date >= from) && (!to || date <= to);
      }),
    [data.items, fromDate, toDate],
  );

  const filteredClaims = useMemo(
    () =>
      data.claims.filter((claim) => {
        const date = new Date(claim.createdAt);
        if (Number.isNaN(date.getTime())) return !fromDate && !toDate;
        const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
        const to = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

        return (!from || date >= from) && (!to || date <= to);
      }),
    [data.claims, fromDate, toDate],
  );

  const lost = filteredItems.filter((item) => item.type === "LOST").length;
  const found = filteredItems.filter((item) => item.type === "FOUND").length;
  const completed = filteredClaims.filter(
    (claim) => claim.status === "COMPLETED",
  ).length;
  const pending = filteredClaims.filter(
    (claim) => claim.status === "PENDING",
  ).length;
  const approved = filteredClaims.filter(
    (claim) => claim.status === "APPROVED",
  ).length;
  const rejected = filteredClaims.filter(
    (claim) => claim.status === "REJECTED",
  ).length;

  const itemExportRows = filteredItems.map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    status: item.status,
    approved: item.isApproved ? "Yes" : "No",
    reportedAt: item.dateReported ?? item.createdAt ?? "",
  }));

  const claimExportRows = filteredClaims.map((claim) => ({
    id: claim.id,
    item: claim.item?.title ?? "",
    status: claim.status,
    createdAt: claim.createdAt,
  }));

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setReportType("ALL");
  };

  return (
    <section>
      <div style={s.heading}>
        <div>
          <h1 style={s.title}>Reports & Analytics</h1>
          <p style={s.subtitle}>
            Review item reports and claim outcomes over a selected period.
          </p>
        </div>
        <button style={s.secondary} onClick={() => void load()}>
          ↻ Refresh data
        </button>
      </div>

      <div style={s.filters}>
        <div>
          <label style={s.label}>From date</label>
          <input
            style={s.input}
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <label style={s.label}>To date</label>
          <input
            style={s.input}
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div>
          <label style={s.label}>Report type</label>
          <select
            style={s.input}
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="ALL">All reports</option>
            <option value="ITEMS">Item reports</option>
            <option value="CLAIMS">Claim reports</option>
          </select>
        </div>
        <button style={s.reset} onClick={resetFilters}>
          Reset filters
        </button>
      </div>

      {error && (
        <div role="alert" style={s.error}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={s.empty}>Preparing reports...</div>
      ) : (
        <>
          <div style={s.metrics}>
            <Metric label="Reported items" value={filteredItems.length} />
            <Metric label="Lost items" value={lost} />
            <Metric label="Found items" value={found} />
            <Metric label="Pending claims" value={pending} />
            <Metric label="Approved claims" value={approved} />
            <Metric label="Completed handovers" value={completed} />
          </div>

          <div style={s.panel}>
            <div style={s.panelHead}>
              <div>
                <h2 style={s.panelTitle}>Item report summary</h2>
                <p style={s.subtitle}>
                  Distribution of lost and found reports in the selected period.
                </p>
              </div>
              <button
                style={s.primary}
                disabled={
                  reportType === "CLAIMS" || itemExportRows.length === 0
                }
                onClick={() => exportCSV(itemExportRows)}
              >
                ↓ Export items CSV
              </button>
            </div>

            {reportType !== "CLAIMS" && (
              <>
                <Bar
                  label="Lost items"
                  value={lost}
                  total={Math.max(filteredItems.length, 1)}
                  color="#f59e0b"
                />
                <Bar
                  label="Found items"
                  value={found}
                  total={Math.max(filteredItems.length, 1)}
                  color="#059669"
                />
                <Bar
                  label="Approved item records"
                  value={filteredItems.filter((item) => item.isApproved).length}
                  total={Math.max(filteredItems.length, 1)}
                  color="#2563eb"
                />
              </>
            )}
            {reportType === "CLAIMS" && (
              <p style={s.empty}>
                Item chart hidden by the selected report filter.
              </p>
            )}
          </div>

          <div style={s.panel}>
            <div style={s.panelHead}>
              <div>
                <h2 style={s.panelTitle}>Claim outcome summary</h2>
                <p style={s.subtitle}>
                  Claim status distribution in the selected period.
                </p>
              </div>
              <button
                style={s.primary}
                disabled={
                  reportType === "ITEMS" || claimExportRows.length === 0
                }
                onClick={() => exportCSV(claimExportRows)}
              >
                ↓ Export claims CSV
              </button>
            </div>

            {reportType !== "ITEMS" ? (
              <>
                <Bar
                  label="Pending"
                  value={pending}
                  total={Math.max(filteredClaims.length, 1)}
                  color="#d97706"
                />
                <Bar
                  label="Approved"
                  value={approved}
                  total={Math.max(filteredClaims.length, 1)}
                  color="#2563eb"
                />
                <Bar
                  label="Rejected"
                  value={rejected}
                  total={Math.max(filteredClaims.length, 1)}
                  color="#dc2626"
                />
                <Bar
                  label="Completed handovers"
                  value={completed}
                  total={Math.max(filteredClaims.length, 1)}
                  color="#059669"
                />
              </>
            ) : (
              <p style={s.empty}>
                Claim chart hidden by the selected report filter.
              </p>
            )}
          </div>

          <div style={s.note}>
            <strong>How recovery is counted:</strong> A recovered item is
            represented by a claim with status <code>COMPLETED</code>,
            indicating that the handover process was completed. An approved
            claim alone is not counted as recovered.
          </div>
        </>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={s.metric}>
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
    </div>
  );
}

function Bar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = Math.min(100, (value / total) * 100);
  return (
    <div style={{ margin: "18px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#475569",
          marginBottom: 7,
        }}
      >
        <span>{label}</span>
        <strong>
          {value} ({percentage.toFixed(1)}%)
        </strong>
      </div>
      <div
        style={{
          height: 10,
          background: "#f1f5f9",
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: color,
            borderRadius: 20,
          }}
        />
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  heading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },
  title: { margin: 0, color: "#0f172a", fontSize: 21 },
  subtitle: { color: "#64748b", fontSize: 12, lineHeight: 1.6 },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "end",
    padding: 16,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    marginBottom: 18,
  },
  label: {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    color: "#64748b",
    marginBottom: 6,
  },
  input: {
    padding: 10,
    border: "1px solid #cbd5e1",
    borderRadius: 7,
    background: "#fff",
    fontSize: 11,
  },
  reset: {
    padding: 10,
    border: "1px solid #cbd5e1",
    background: "#fff",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 11,
  },
  secondary: {
    padding: "9px 13px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    borderRadius: 8,
    cursor: "pointer",
  },
  error: {
    padding: 12,
    color: "#b91c1c",
    background: "#fef2f2",
    borderRadius: 8,
    fontSize: 12,
  },
  empty: { padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 12 },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
    gap: 12,
    marginBottom: 18,
  },
  metric: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 16,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 9,
    color: "#64748b",
    fontSize: 10,
  },
  panel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 11,
    padding: 20,
    marginBottom: 18,
  },
  panelHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },
  panelTitle: { margin: 0, color: "#0f172a", fontSize: 15 },
  primary: {
    padding: "9px 12px",
    background: "#2563eb",
    color: "#fff",
    border: 0,
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 11,
  },
  note: {
    padding: 15,
    background: "#eff6ff",
    borderRadius: 9,
    color: "#1e40af",
    fontSize: 11,
    lineHeight: 1.7,
  },
};

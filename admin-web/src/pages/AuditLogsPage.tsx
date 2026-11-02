import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface AuditLogsPageProps {
  token: string;
}

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
  ipAddress?: string;
  createdAt: string;
  actor?: {
    id?: string;
    fullName?: string;
    email?: string;
    role?: string;
  };
  metadata?: unknown;
}

export default function AuditLogsPage({ token }: AuditLogsPageProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("ALL");
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (action !== "ALL") params.set("action", action);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`${API_URL}/audit?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok)
        throw new Error(`Unable to load audit logs (${response.status}).`);

      const result = await response.json();
      const rows = result.data?.logs ?? result.logs ?? result.data ?? result;
      setLogs(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load audit logs.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [token, action, fromDate, toDate]);

  const visible = useMemo(() => {
    const term = search.toLowerCase().trim();

    return logs.filter((log) => {
      const text = [
        log.action,
        log.entity,
        log.description ?? "",
        log.actor?.fullName ?? "",
        log.actor?.email ?? "",
        log.entityId ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return !term || text.includes(term);
    });
  }, [logs, search]);

  const clearFilters = () => {
    setSearch("");
    setAction("ALL");
    setFromDate("");
    setToDate("");
  };

  return (
    <section>
      <div style={s.heading}>
        <div>
          <h1 style={s.title}>Audit Logs</h1>
          <p style={s.subtitle}>
            Review administrative and system activity records.
          </p>
        </div>
        <button style={s.button} onClick={() => void load()}>
          ↻ Refresh
        </button>
      </div>

      <div style={s.metrics}>
        <Metric label="Loaded records" value={logs.length} />
        <Metric
          label="Create actions"
          value={logs.filter((x) => x.action === "CREATE").length}
        />
        <Metric
          label="Update actions"
          value={logs.filter((x) => x.action === "UPDATE").length}
        />
        <Metric
          label="Delete actions"
          value={logs.filter((x) => x.action === "DELETE").length}
        />
      </div>

      <div style={s.filters}>
        <input
          style={s.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actor, action, entity, or ID..."
        />

        <select
          style={s.select}
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="ALL">All actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="APPROVE">Approve</option>
          <option value="REJECT">Reject</option>
          <option value="HANDOVER">Handover</option>
          <option value="ROLE_CHANGE">Role change</option>
        </select>

        <input
          style={s.date}
          type="date"
          value={fromDate}
          max={toDate || undefined}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <input
          style={s.date}
          type="date"
          value={toDate}
          min={fromDate || undefined}
          onChange={(e) => setToDate(e.target.value)}
        />
        <button style={s.clear} onClick={clearFilters}>
          Clear
        </button>
      </div>

      {error && (
        <div role="alert" style={s.error}>
          {error}
        </div>
      )}

      <div style={s.tableWrap}>
        {loading ? (
          <div style={s.empty}>Loading audit activity...</div>
        ) : visible.length === 0 ? (
          <div style={s.empty}>No audit records match your filters.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Action</th>
                <th style={s.th}>Description</th>
                <th style={s.th}>Actor</th>
                <th style={s.th}>Entity</th>
                <th style={s.th}>IP address</th>
                <th style={s.th}>Date and time</th>
                <th style={s.th}>Details</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((log) => (
                <tr key={log.id}>
                  <td style={s.td}>
                    <ActionBadge action={log.action} />
                  </td>
                  <td style={s.td}>{log.description || "No description"}</td>
                  <td style={s.td}>
                    <strong>{log.actor?.fullName ?? "System"}</strong>
                    <small>{log.actor?.email ?? "—"}</small>
                  </td>
                  <td style={s.td}>
                    {log.entity}
                    <small>{log.entityId ?? "—"}</small>
                  </td>
                  <td style={s.td}>{log.ipAddress || "—"}</td>
                  <td style={s.td}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={s.td}>
                    <button style={s.link} onClick={() => setSelected(log)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p style={s.footer}>
        Showing {visible.length} record(s) from the records returned by the
        server. Your backend may paginate or limit the results.
      </p>

      {selected && (
        <div
          style={s.overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div role="dialog" aria-modal="true" style={s.modal}>
            <div style={s.modalHead}>
              <h2 style={s.title}>Audit record details</h2>
              <button style={s.close} onClick={() => setSelected(null)}>
                ×
              </button>
            </div>

            <Detail label="Log ID" value={selected.id} />
            <Detail label="Action" value={selected.action} />
            <Detail label="Entity" value={selected.entity} />
            <Detail label="Entity ID" value={selected.entityId} />
            <Detail label="Actor" value={selected.actor?.fullName} />
            <Detail label="Actor email" value={selected.actor?.email} />
            <Detail label="Actor role" value={selected.actor?.role} />
            <Detail label="IP address" value={selected.ipAddress} />
            <Detail
              label="Created"
              value={new Date(selected.createdAt).toLocaleString()}
            />

            <h3 style={s.label}>Description</h3>
            <p style={s.description}>
              {selected.description || "No description available."}
            </p>

            <h3 style={s.label}>Metadata</h3>
            <pre style={s.metadata}>
              {selected.metadata === undefined || selected.metadata === null
                ? "No metadata"
                : JSON.stringify(selected.metadata, null, 2)}
            </pre>
          </div>
        </div>
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

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, [string, string]> = {
    CREATE: ["#ecfdf5", "#047857"],
    UPDATE: ["#eff6ff", "#1d4ed8"],
    DELETE: ["#fef2f2", "#b91c1c"],
    LOGIN: ["#f0fdf4", "#15803d"],
    LOGOUT: ["#f1f5f9", "#475569"],
    APPROVE: ["#ecfdf5", "#047857"],
    REJECT: ["#fef2f2", "#b91c1c"],
    HANDOVER: ["#faf5ff", "#7e22ce"],
    ROLE_CHANGE: ["#fff7ed", "#c2410c"],
  };
  const color = colors[action] ?? ["#f1f5f9", "#475569"];

  return (
    <span
      style={{
        background: color[0],
        color: color[1],
        padding: "5px 8px",
        borderRadius: 20,
        fontSize: 9,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {action}
    </span>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div style={s.detail}>
      <span>{label}</span>
      <strong>{value || "—"}</strong>
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
  subtitle: { color: "#64748b", fontSize: 12 },
  button: {
    padding: "9px 13px",
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    cursor: "pointer",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))",
    gap: 12,
    marginBottom: 18,
  },
  metric: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 15,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 9,
    color: "#64748b",
    fontSize: 10,
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 15,
    padding: 14,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
  },
  search: {
    flex: "1 1 230px",
    minWidth: 160,
    padding: 10,
    border: "1px solid #cbd5e1",
    borderRadius: 7,
  },
  select: {
    padding: 10,
    border: "1px solid #cbd5e1",
    borderRadius: 7,
    background: "#fff",
  },
  date: { padding: 9, border: "1px solid #cbd5e1", borderRadius: 7 },
  clear: {
    padding: "9px 12px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    borderRadius: 7,
    cursor: "pointer",
  },
  error: {
    padding: 12,
    background: "#fef2f2",
    color: "#b91c1c",
    borderRadius: 8,
    fontSize: 12,
  },
  tableWrap: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    overflowX: "auto",
  },
  table: {
    width: "100%",
    minWidth: 950,
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: 10,
  },
  th: {
    padding: 13,
    background: "#f8fafc",
    color: "#64748b",
    whiteSpace: "nowrap",
  },
  td: {
    padding: 13,
    borderTop: "1px solid #f1f5f9",
    color: "#475569",
    verticalAlign: "middle",
  },
  empty: { padding: 45, textAlign: "center", color: "#94a3b8" },
  link: {
    border: 0,
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 700,
  },
  footer: { color: "#94a3b8", fontSize: 10, marginTop: 12 },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 500,
    background: "#0f172a88",
    display: "grid",
    placeItems: "center",
    padding: 15,
  },
  modal: {
    width: "100%",
    maxWidth: 550,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    padding: 24,
    borderRadius: 13,
  },
  modalHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  close: {
    border: 0,
    background: "transparent",
    fontSize: 25,
    cursor: "pointer",
  },
  detail: {
    display: "flex",
    justifyContent: "space-between",
    gap: 15,
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 11,
    color: "#64748b",
  },
  label: { fontSize: 11, color: "#334155", marginTop: 18 },
  description: {
    fontSize: 12,
    color: "#475569",
    background: "#f8fafc",
    padding: 12,
    borderRadius: 8,
  },
  metadata: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    fontSize: 10,
    color: "#334155",
    background: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    maxHeight: 220,
    overflow: "auto",
  },
};

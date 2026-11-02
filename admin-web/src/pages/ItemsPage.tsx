import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface ItemsPageProps {
  token: string;
}

interface ItemRecord {
  id: string;
  title: string;
  description?: string;
  type: "LOST" | "FOUND";
  status: string;
  dateReported?: string;
  dateOccurred?: string;
  color?: string;
  brand?: string;
  isApproved?: boolean;
  reporter?: { fullName?: string; email?: string };
  category?: { name?: string };
  location?: { name?: string };
}

export default function ItemsPage({ token }: ItemsPageProps) {
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<ItemRecord | null>(null);
  const [busyId, setBusyId] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/admin/items`, { headers });
      if (!response.ok)
        throw new Error(`Unable to load items (${response.status}).`);
      const result = await response.json();
      const rows = result.data?.items ?? result.items ?? result.data ?? result;
      setItems(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, [token]);

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim();

    return items.filter((item) => {
      const matchesSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        (item.description ?? "").toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term);

      return (
        matchesSearch &&
        (type === "ALL" || item.type === type) &&
        (status === "ALL" || item.status === status)
      );
    });
  }, [items, search, type, status]);

  const updateItem = async (
    item: ItemRecord,
    action: "approve" | "archive",
  ) => {
    const message =
      action === "approve"
        ? `Approve "${item.title}"?`
        : `Archive "${item.title}"?`;

    if (!window.confirm(message)) return;

    try {
      setBusyId(item.id);
      const response = await fetch(
        `${API_URL}/admin/items/${item.id}/${action}`,
        {
          method: "PATCH",
          headers,
        },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(
          result.message ?? `Action failed (${response.status}).`,
        );
      }

      await loadItems();
      setSelected(null);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Unable to update item.",
      );
    } finally {
      setBusyId("");
    }
  };

  return (
    <section>
      <div style={styles.heading}>
        <div>
          <h1 style={styles.title}>Lost & Found Items</h1>
          <p style={styles.subtitle}>
            Review, search, and manage campus item reports.
          </p>
        </div>
        <button onClick={() => void loadItems()} style={styles.button}>
          ↻ Refresh
        </button>
      </div>

      <div style={styles.metrics}>
        <Metric label="All items" value={items.length} />
        <Metric
          label="Lost"
          value={items.filter((x) => x.type === "LOST").length}
        />
        <Metric
          label="Found"
          value={items.filter((x) => x.type === "FOUND").length}
        />
        <Metric
          label="Awaiting approval"
          value={items.filter((x) => !x.isApproved).length}
        />
      </div>

      <div style={styles.toolbar}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, description, or ID..."
          style={styles.search}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={styles.select}
        >
          <option value="ALL">All types</option>
          <option value="LOST">Lost</option>
          <option value="FOUND">Found</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={styles.select}
        >
          <option value="ALL">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="CLAIMED">Claimed</option>
          <option value="RESOLVED">Resolved</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {error && (
        <div role="alert" style={styles.error}>
          {error}
        </div>
      )}

      <div style={styles.tableWrap}>
        {loading ? (
          <div style={styles.empty}>Loading item reports...</div>
        ) : filteredItems.length === 0 ? (
          <div style={styles.empty}>No items match your filters.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Item</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Approval</th>
                <th style={styles.th}>Reported</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td style={styles.td}>
                    <strong>{item.title}</strong>
                    <small style={styles.small}>
                      {item.reporter?.fullName ?? "Unknown reporter"}
                    </small>
                  </td>
                  <td style={styles.td}>
                    <TypeBadge type={item.type} />
                  </td>
                  <td style={styles.td}>{item.category?.name ?? "—"}</td>
                  <td style={styles.td}>{item.location?.name ?? "—"}</td>
                  <td style={styles.td}>{item.status}</td>
                  <td style={styles.td}>
                    {item.isApproved ? "Approved" : "Pending"}
                  </td>
                  <td style={styles.td}>
                    {item.dateReported
                      ? new Date(item.dateReported).toLocaleDateString()
                      : "—"}
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.link}
                      onClick={() => setSelected(item)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div
          style={styles.overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div role="dialog" aria-modal="true" style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.title}>{selected.title}</h2>
              <button style={styles.close} onClick={() => setSelected(null)}>
                ×
              </button>
            </div>
            <p style={styles.subtitle}>
              {selected.description || "No description provided."}
            </p>
            <Detail label="Type" value={selected.type} />
            <Detail label="Status" value={selected.status} />
            <Detail label="Brand" value={selected.brand} />
            <Detail label="Color" value={selected.color} />
            <Detail label="Category" value={selected.category?.name} />
            <Detail label="Location" value={selected.location?.name} />
            <Detail label="Reporter" value={selected.reporter?.fullName} />
            <Detail
              label="Reported"
              value={
                selected.dateReported
                  ? new Date(selected.dateReported).toLocaleString()
                  : undefined
              }
            />

            <div style={styles.actions}>
              {!selected.isApproved && (
                <button
                  disabled={busyId === selected.id}
                  onClick={() => void updateItem(selected, "approve")}
                  style={styles.approve}
                >
                  {busyId === selected.id ? "Please wait..." : "Approve item"}
                </button>
              )}
              {selected.status !== "ARCHIVED" && (
                <button
                  disabled={busyId === selected.id}
                  onClick={() => void updateItem(selected, "archive")}
                  style={styles.archive}
                >
                  Archive
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.metric}>
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      style={{
        padding: "5px 8px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 800,
        background: type === "LOST" ? "#fff7ed" : "#ecfdf5",
        color: type === "LOST" ? "#c2410c" : "#047857",
      }}
    >
      {type}
    </span>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div style={styles.detail}>
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    gap: 12,
  },
  title: { margin: 0, color: "#0f172a", fontSize: 21 },
  subtitle: { color: "#64748b", fontSize: 12, lineHeight: 1.6 },
  button: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    borderRadius: 8,
    padding: "9px 13px",
    cursor: "pointer",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap: 12,
    marginBottom: 18,
  },
  metric: {
    padding: 16,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    color: "#64748b",
    fontSize: 11,
  },
  toolbar: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 15 },
  search: {
    flex: "1 1 240px",
    minWidth: 180,
    padding: 11,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
  },
  select: {
    padding: 11,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#fff",
  },
  error: {
    padding: 12,
    background: "#fef2f2",
    color: "#b91c1c",
    borderRadius: 8,
    marginBottom: 12,
  },
  tableWrap: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 850,
    fontSize: 11,
    textAlign: "left",
  },
  th: {
    padding: 13,
    background: "#f8fafc",
    color: "#64748b",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: 13,
    color: "#475569",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  },
  small: { display: "block", marginTop: 4, color: "#94a3b8", fontSize: 10 },
  empty: { padding: 45, textAlign: "center", color: "#94a3b8", fontSize: 12 },
  link: {
    border: 0,
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 700,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 500,
    background: "rgba(15,23,42,.55)",
    display: "grid",
    placeItems: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "90vh",
    overflowY: "auto",
    padding: 24,
    background: "#fff",
    borderRadius: 14,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
    padding: "11px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 12,
    color: "#64748b",
  },
  actions: { display: "flex", gap: 10, marginTop: 22 },
  approve: {
    border: 0,
    background: "#059669",
    color: "#fff",
    padding: "11px 15px",
    borderRadius: 7,
    cursor: "pointer",
  },
  archive: {
    border: 0,
    background: "#fff7ed",
    color: "#c2410c",
    padding: "11px 15px",
    borderRadius: 7,
    cursor: "pointer",
  },
};

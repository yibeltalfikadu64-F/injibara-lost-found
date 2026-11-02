import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface ClaimsPageProps {
  token: string;
}

interface Claim {
  id: string;
  description?: string;
  status: string;
  createdAt: string;
  reviewNote?: string;
  item?: { id: string; title: string; type?: string; status?: string };
  claimant?: { id: string; fullName: string; email: string };
  reviewedBy?: { fullName: string };
}

export default function ClaimsPage({ token }: ClaimsPageProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<Claim | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/admin/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error(`Could not load claims (${response.status}).`);
      const result = await response.json();
      const rows =
        result.data?.claims ?? result.claims ?? result.data ?? result;
      setClaims(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load claims.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const filtered = useMemo(
    () =>
      claims.filter((claim) => {
        const text = search.toLowerCase();
        const matches =
          !text ||
          claim.item?.title?.toLowerCase().includes(text) ||
          claim.claimant?.fullName?.toLowerCase().includes(text) ||
          claim.id.toLowerCase().includes(text);

        return matches && (filter === "ALL" || claim.status === filter);
      }),
    [claims, search, filter],
  );

  const review = async (decision: "APPROVE" | "REJECT") => {
    if (!selected) return;

    if (decision === "REJECT" && !reviewNote.trim()) {
      setError("A reason is required when rejecting a claim.");
      return;
    }

    if (
      !window.confirm(
        `${decision === "APPROVE" ? "Approve" : "Reject"} this claim?`,
      )
    ) {
      return;
    }

    try {
      setBusy(true);
      setError("");
      const response = await fetch(`${API_URL}/claims/${selected.id}/review`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ decision, reviewNote: reviewNote.trim() }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(
          result.message ?? `Review failed (${response.status}).`,
        );
      }

      setSelected(null);
      setReviewNote("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to review claim.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div style={s.heading}>
        <div>
          <h1 style={s.title}>Claim Management</h1>
          <p style={s.subtitle}>
            Review ownership requests and claim decisions.
          </p>
        </div>
        <button style={s.button} onClick={() => void load()}>
          ↻ Refresh
        </button>
      </div>

      <div style={s.stats}>
        {["PENDING", "APPROVED", "REJECTED", "COMPLETED"].map((status) => (
          <button key={status} onClick={() => setFilter(status)} style={s.stat}>
            <span>{status}</span>
            <strong>
              {claims.filter((claim) => claim.status === status).length}
            </strong>
          </button>
        ))}
      </div>

      <div style={s.toolbar}>
        <input
          style={s.search}
          placeholder="Search item, claimant, or claim ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={s.select}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {error && (
        <div role="alert" style={s.error}>
          {error}
        </div>
      )}

      <div style={s.tableWrap}>
        {loading ? (
          <p style={s.empty}>Loading claims...</p>
        ) : filtered.length === 0 ? (
          <p style={s.empty}>No claims found.</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Item</th>
                <th style={s.th}>Claimant</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((claim) => (
                <tr key={claim.id}>
                  <td style={s.td}>
                    <strong>{claim.item?.title ?? "Unknown item"}</strong>
                    <small style={s.small}>{claim.id}</small>
                  </td>
                  <td style={s.td}>
                    {claim.claimant?.fullName ?? "Unknown user"}
                    <small style={s.small}>{claim.claimant?.email}</small>
                  </td>
                  <td style={s.td}>
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </td>
                  <td style={s.td}>
                    <Status value={claim.status} />
                  </td>
                  <td style={s.td}>
                    <button
                      style={s.link}
                      onClick={() => {
                        setSelected(claim);
                        setReviewNote(claim.reviewNote ?? "");
                        setError("");
                      }}
                    >
                      Review
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
          style={s.overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div role="dialog" aria-modal="true" style={s.modal}>
            <div style={s.modalHead}>
              <h2 style={s.title}>Claim details</h2>
              <button style={s.close} onClick={() => setSelected(null)}>
                ×
              </button>
            </div>
            <Detail label="Item" value={selected.item?.title} />
            <Detail label="Claimant" value={selected.claimant?.fullName} />
            <Detail label="Email" value={selected.claimant?.email} />
            <Detail label="Status" value={selected.status} />
            <Detail
              label="Submitted"
              value={new Date(selected.createdAt).toLocaleString()}
            />
            <h3 style={s.label}>Claim description</h3>
            <p style={s.description}>
              {selected.description || "No description supplied."}
            </p>
            <label style={s.label} htmlFor="claim-review-note">
              Review note
            </label>
            <textarea
              id="claim-review-note"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={4}
              placeholder="Write the reason or review note..."
              style={s.textarea}
            />
            {selected.status === "PENDING" && (
              <div style={s.actions}>
                <button
                  disabled={busy}
                  style={s.approve}
                  onClick={() => void review("APPROVE")}
                >
                  {busy ? "Processing..." : "Approve claim"}
                </button>
                <button
                  disabled={busy}
                  style={s.reject}
                  onClick={() => void review("REJECT")}
                >
                  Reject claim
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Status({ value }: { value: string }) {
  const color =
    value === "APPROVED" || value === "COMPLETED"
      ? ["#ecfdf5", "#047857"]
      : value === "REJECTED" || value === "CANCELLED"
        ? ["#fef2f2", "#b91c1c"]
        : ["#fff7ed", "#c2410c"];

  return (
    <span
      style={{
        background: color[0],
        color: color[1],
        padding: "5px 8px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
      }}
    >
      {value}
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
    marginBottom: 22,
  },
  title: { margin: 0, fontSize: 21, color: "#0f172a" },
  subtitle: { color: "#64748b", fontSize: 12 },
  button: {
    padding: "9px 13px",
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    cursor: "pointer",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap: 12,
    marginBottom: 18,
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 15,
    textAlign: "left",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 9,
    cursor: "pointer",
    color: "#64748b",
    fontSize: 10,
  },
  toolbar: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 15 },
  search: {
    flex: "1 1 230px",
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
    minWidth: 700,
    borderCollapse: "collapse",
    fontSize: 11,
    textAlign: "left",
  },
  th: { padding: 13, background: "#f8fafc", color: "#64748b" },
  td: { padding: 13, borderTop: "1px solid #f1f5f9", color: "#475569" },
  small: { display: "block", color: "#94a3b8", fontSize: 10, marginTop: 4 },
  empty: { padding: 40, textAlign: "center", color: "#94a3b8" },
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
    background: "#0f172a88",
    display: "grid",
    placeItems: "center",
    padding: 15,
  },
  modal: {
    width: "100%",
    maxWidth: 530,
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
    marginBottom: 12,
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
    fontSize: 12,
    color: "#64748b",
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    margin: "17px 0 8px",
    color: "#334155",
  },
  description: {
    background: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    fontSize: 12,
    color: "#475569",
    lineHeight: 1.6,
  },
  textarea: {
    width: "100%",
    padding: 12,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    resize: "vertical",
  },
  actions: { display: "flex", gap: 10, marginTop: 20 },
  approve: {
    background: "#059669",
    color: "#fff",
    border: 0,
    padding: 11,
    borderRadius: 7,
    cursor: "pointer",
  },
  reject: {
    background: "#dc2626",
    color: "#fff",
    border: 0,
    padding: 11,
    borderRadius: 7,
    cursor: "pointer",
  },
};

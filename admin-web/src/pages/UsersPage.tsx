import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface UsersPageProps {
  token: string;
}

interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  role: string;
  studentId?: string;
  department?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage({ token }: UsersPageProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [selected, setSelected] = useState<UserRecord | null>(null);
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error(`Unable to load users (${response.status}).`);
      const result = await response.json();
      const rows = result.data?.users ?? result.users ?? result.data ?? result;
      setUsers(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const filtered = useMemo(
    () =>
      users.filter((user) => {
        const term = search.toLowerCase().trim();
        const matches =
          !term ||
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.studentId ?? "").toLowerCase().includes(term);
        return matches && (role === "ALL" || user.role === role);
      }),
    [users, search, role],
  );

  const toggleActive = async (user: UserRecord) => {
    const action = user.isActive ? "deactivate" : "activate";
    if (!window.confirm(`${action} account for ${user.fullName}?`)) return;

    try {
      setBusyId(user.id);
      const response = await fetch(
        `${API_URL}/admin/users/${user.id}/${action}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok)
        throw new Error(`Could not ${action} user (${response.status}).`);
      await load();
      setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "User update failed.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <section>
      <div style={s.heading}>
        <div>
          <h1 style={s.title}>User Management</h1>
          <p style={s.subtitle}>
            Manage students, staff, security, and administrators.
          </p>
        </div>
        <button style={s.button} onClick={() => void load()}>
          ↻ Refresh
        </button>
      </div>

      <div style={s.summary}>
        <Summary label="Total users" value={users.length} />
        <Summary
          label="Active accounts"
          value={users.filter((u) => u.isActive).length}
        />
        <Summary
          label="Inactive accounts"
          value={users.filter((u) => !u.isActive).length}
        />
        <Summary
          label="Administrators"
          value={users.filter((u) => u.role === "ADMIN").length}
        />
      </div>

      <div style={s.toolbar}>
        <input
          style={s.search}
          placeholder="Search name, email, student ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={s.select}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="ALL">All roles</option>
          <option value="STUDENT">Student</option>
          <option value="STAFF">Staff</option>
          <option value="SECURITY">Security</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {error && (
        <div role="alert" style={s.error}>
          {error}
        </div>
      )}

      <div style={s.tableWrap}>
        {loading ? (
          <div style={s.empty}>Loading users...</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>No users found.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>User</th>
                <th style={s.th}>Role</th>
                <th style={s.th}>Student ID</th>
                <th style={s.th}>Department</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Joined</th>
                <th style={s.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td style={s.td}>
                    <strong>{user.fullName}</strong>
                    <small>{user.email}</small>
                  </td>
                  <td style={s.td}>
                    <Role value={user.role} />
                  </td>
                  <td style={s.td}>{user.studentId || "—"}</td>
                  <td style={s.td}>{user.department || "—"}</td>
                  <td style={s.td}>{user.isActive ? "Active" : "Inactive"}</td>
                  <td style={s.td}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={s.td}>
                    <button style={s.link} onClick={() => setSelected(user)}>
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
          style={s.overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div role="dialog" aria-modal="true" style={s.modal}>
            <div style={s.modalHead}>
              <h2 style={s.title}>User profile</h2>
              <button style={s.close} onClick={() => setSelected(null)}>
                ×
              </button>
            </div>
            <div style={s.avatar}>
              {selected.fullName
                .split(/\s+/)
                .map((x) => x[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <h3 style={{ textAlign: "center", color: "#0f172a" }}>
              {selected.fullName}
            </h3>
            <Detail label="Email" value={selected.email} />
            <Detail label="Role" value={selected.role} />
            <Detail label="Student ID" value={selected.studentId} />
            <Detail label="Department" value={selected.department} />
            <Detail label="Phone" value={selected.phone} />
            <Detail
              label="Account"
              value={selected.isActive ? "Active" : "Inactive"}
            />
            <Detail
              label="Created"
              value={new Date(selected.createdAt).toLocaleString()}
            />
            <button
              disabled={busyId === selected.id || selected.role === "ADMIN"}
              style={selected.isActive ? s.deactivate : s.activate}
              onClick={() => void toggleActive(selected)}
            >
              {busyId === selected.id
                ? "Updating..."
                : selected.isActive
                  ? "Deactivate account"
                  : "Activate account"}
            </button>
            {selected.role === "ADMIN" && (
              <p style={s.note}>
                Administrator account changes are restricted here.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div style={s.summaryCard}>
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
    </div>
  );
}
function Role({ value }: { value: string }) {
  return (
    <span
      style={{
        background: "#eff6ff",
        color: "#1d4ed8",
        padding: "5px 8px",
        borderRadius: 20,
        fontSize: 10,
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
  title: { margin: 0, color: "#0f172a", fontSize: 21 },
  subtitle: { color: "#64748b", fontSize: 12 },
  button: {
    padding: "9px 13px",
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    cursor: "pointer",
  },
  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap: 12,
    marginBottom: 18,
  },
  summaryCard: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 15,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 9,
    color: "#64748b",
    fontSize: 11,
  },
  toolbar: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 15 },
  search: {
    flex: "1 1 240px",
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
    background: "#fef2f2",
    color: "#b91c1c",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 12,
  },
  tableWrap: {
    overflowX: "auto",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
  },
  table: {
    width: "100%",
    minWidth: 850,
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: 11,
  },
  th: { padding: 13, background: "#f8fafc", color: "#64748b" },
  td: { padding: 13, borderTop: "1px solid #f1f5f9", color: "#475569" },
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
    maxWidth: 480,
    background: "#fff",
    padding: 24,
    borderRadius: 13,
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHead: {
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
  avatar: {
    margin: "18px auto 0",
    width: 65,
    height: 65,
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "grid",
    placeItems: "center",
    fontSize: 20,
    fontWeight: 800,
  },
  detail: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 12,
    color: "#64748b",
  },
  deactivate: {
    width: "100%",
    marginTop: 20,
    padding: 12,
    border: 0,
    borderRadius: 8,
    background: "#fef2f2",
    color: "#b91c1c",
    cursor: "pointer",
  },
  activate: {
    width: "100%",
    marginTop: 20,
    padding: 12,
    border: 0,
    borderRadius: 8,
    background: "#ecfdf5",
    color: "#047857",
    cursor: "pointer",
  },
  note: { color: "#94a3b8", fontSize: 11, textAlign: "center" },
};

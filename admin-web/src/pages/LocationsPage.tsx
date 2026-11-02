import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface LocationsPageProps {
  token: string;
}

interface LocationRecord {
  id: string;
  name: string;
  description?: string;
  building?: string;
  isActive: boolean;
  _count?: { items?: number };
}

const initialForm = { name: "", description: "", building: "" };

export default function LocationsPage({ token }: LocationsPageProps) {
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState<LocationRecord | null>(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/locations`, { headers });
      if (!response.ok)
        throw new Error(`Unable to load locations (${response.status}).`);
      const result = await response.json();
      const rows =
        result.data?.locations ?? result.locations ?? result.data ?? result;
      setLocations(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load locations.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const openNew = () => {
    setEditing(null);
    setForm(initialForm);
    setError("");
    setModal(true);
  };

  const openExisting = (location: LocationRecord) => {
    setEditing(location);
    setForm({
      name: location.name,
      description: location.description ?? "",
      building: location.building ?? "",
    });
    setError("");
    setModal(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Location name is required.");
      return;
    }

    try {
      setSaving(true);
      const url = editing
        ? `${API_URL}/locations/${editing.id}`
        : `${API_URL}/locations`;
      const response = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers,
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          building: form.building.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message ?? `Save failed (${response.status}).`);
      }

      setModal(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save location.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (location: LocationRecord) => {
    const action = location.isActive ? "deactivate" : "activate";
    if (!window.confirm(`${action} ${location.name}?`)) return;

    try {
      const response = await fetch(
        `${API_URL}/locations/${location.id}/${action}`,
        {
          method: "PATCH",
          headers,
        },
      );
      if (!response.ok) throw new Error(`Could not ${action} location.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Location update failed.");
    }
  };

  const visible = locations.filter((location) =>
    `${location.name} ${location.building ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <section>
      <div style={s.heading}>
        <div>
          <h1 style={s.title}>Campus Locations</h1>
          <p style={s.subtitle}>
            Manage the places where students and staff report items.
          </p>
        </div>
        <button style={s.primary} onClick={openNew}>
          ＋ Add location
        </button>
      </div>

      <div style={s.toolbar}>
        <input
          style={s.search}
          placeholder="Search location or building..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button style={s.secondary} onClick={() => void load()}>
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div role="alert" style={s.error}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={s.empty}>Loading campus locations...</div>
      ) : visible.length === 0 ? (
        <div style={s.empty}>
          No locations found. Add a campus location to begin.
        </div>
      ) : (
        <div style={s.grid}>
          {visible.map((location) => (
            <article key={location.id} style={s.card}>
              <div style={s.cardTop}>
                <div style={s.icon}>⌖</div>
                <span
                  style={{
                    ...s.badge,
                    background: location.isActive ? "#ecfdf5" : "#f1f5f9",
                    color: location.isActive ? "#047857" : "#64748b",
                  }}
                >
                  {location.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <h2 style={s.cardTitle}>{location.name}</h2>
              <p style={s.building}>
                {location.building || "Building not specified"}
              </p>
              <p style={s.description}>
                {location.description || "No additional description."}
              </p>
              <div style={s.footer}>
                <span>{location._count?.items ?? 0} reported items</span>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={s.link} onClick={() => openExisting(location)}>
                    Edit
                  </button>
                  <button style={s.link} onClick={() => void toggle(location)}>
                    {location.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {modal && (
        <div
          style={s.overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(false);
          }}
        >
          <form style={s.modal} onSubmit={save}>
            <div style={s.modalHead}>
              <h2 style={s.title}>
                {editing ? "Edit location" : "New campus location"}
              </h2>
              <button
                type="button"
                style={s.close}
                onClick={() => setModal(false)}
              >
                ×
              </button>
            </div>
            <label style={s.label}>Location name *</label>
            <input
              style={s.field}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Main Library"
              required
            />
            <label style={s.label}>Building</label>
            <input
              style={s.field}
              value={form.building}
              onChange={(e) => setForm({ ...form, building: e.target.value })}
              placeholder="e.g. Academic Block A"
            />
            <label style={s.label}>Description</label>
            <textarea
              style={s.field}
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe this location..."
            />
            {error && <p style={s.error}>{error}</p>}
            <button disabled={saving} style={s.primary} type="submit">
              {saving ? "Saving..." : "Save location"}
            </button>
          </form>
        </div>
      )}
    </section>
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
  title: { margin: 0, fontSize: 21, color: "#0f172a" },
  subtitle: { color: "#64748b", fontSize: 12 },
  primary: {
    padding: "11px 15px",
    background: "#2563eb",
    color: "#fff",
    border: 0,
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },
  secondary: {
    padding: 11,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
  },
  toolbar: { display: "flex", gap: 10, marginBottom: 18 },
  search: {
    flex: 1,
    minWidth: 0,
    padding: 11,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
  },
  error: {
    padding: 12,
    background: "#fef2f2",
    color: "#b91c1c",
    borderRadius: 8,
    fontSize: 12,
  },
  empty: {
    padding: 45,
    textAlign: "center",
    color: "#94a3b8",
    background: "#fff",
    borderRadius: 10,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 15,
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 11,
    padding: 18,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    width: 43,
    height: 43,
    borderRadius: 11,
    background: "#eff6ff",
    color: "#2563eb",
    display: "grid",
    placeItems: "center",
    fontSize: 24,
  },
  badge: { padding: "5px 8px", borderRadius: 20, fontSize: 10 },
  cardTitle: { fontSize: 15, color: "#0f172a", margin: "15px 0 4px" },
  building: { color: "#2563eb", fontSize: 11, fontWeight: 700 },
  description: {
    color: "#64748b",
    fontSize: 11,
    lineHeight: 1.6,
    minHeight: 35,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    borderTop: "1px solid #f1f5f9",
    paddingTop: 13,
    color: "#94a3b8",
    fontSize: 10,
  },
  link: {
    border: 0,
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 11,
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
    maxWidth: 460,
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
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "#334155",
    margin: "13px 0 7px",
  },
  field: {
    width: "100%",
    padding: 11,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    fontSize: 12,
    resize: "vertical",
  },
};

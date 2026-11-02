import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface CategoriesPageProps {
  token: string;
}
interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  _count?: { items?: number };
}

const emptyForm = { name: "", description: "", icon: "" };

export default function CategoriesPage({ token }: CategoriesPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Category | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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
      const response = await fetch(`${API_URL}/categories`, { headers });
      if (!response.ok)
        throw new Error(`Unable to load categories (${response.status}).`);
      const result = await response.json();
      const rows =
        result.data?.categories ?? result.categories ?? result.data ?? result;
      setCategories(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load categories.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description ?? "",
      icon: category.icon ?? "",
    });
    setError("");
    setModalOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const url = editing
        ? `${API_URL}/categories/${editing.id}`
        : `${API_URL}/categories`;

      const response = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers,
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          icon: form.icon.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message ?? `Save failed (${response.status}).`);
      }

      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save category.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (category: Category) => {
    const action = category.isActive ? "deactivate" : "activate";
    if (!window.confirm(`${action} category "${category.name}"?`)) return;

    try {
      const response = await fetch(
        `${API_URL}/categories/${category.id}/${action}`,
        {
          method: "PATCH",
          headers,
        },
      );
      if (!response.ok)
        throw new Error(`Unable to ${action} category (${response.status}).`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Category update failed.");
    }
  };

  const visible = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section>
      <div style={s.heading}>
        <div>
          <h1 style={s.title}>Item Categories</h1>
          <p style={s.subtitle}>
            Organize the types of belongings reported on campus.
          </p>
        </div>
        <button style={s.primary} onClick={openCreate}>
          ＋ Add category
        </button>
      </div>

      <div style={s.toolbar}>
        <input
          style={s.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
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
        <div style={s.empty}>Loading categories...</div>
      ) : visible.length === 0 ? (
        <div style={s.empty}>No categories found. Add your first category.</div>
      ) : (
        <div style={s.grid}>
          {visible.map((category) => (
            <article key={category.id} style={s.card}>
              <div style={s.cardTop}>
                <div style={s.icon}>{category.icon || "▤"}</div>
                <span
                  style={{
                    ...s.badge,
                    background: category.isActive ? "#ecfdf5" : "#f1f5f9",
                    color: category.isActive ? "#047857" : "#64748b",
                  }}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <h2 style={s.cardTitle}>{category.name}</h2>
              <p style={s.description}>
                {category.description || "No description provided."}
              </p>
              <div style={s.cardFooter}>
                <span>{category._count?.items ?? 0} items</span>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={s.link} onClick={() => openEdit(category)}>
                    Edit
                  </button>
                  <button
                    style={s.link}
                    onClick={() => void toggleActive(category)}
                  >
                    {category.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          style={s.overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <form style={s.modal} onSubmit={save}>
            <div style={s.modalHead}>
              <h2 style={s.title}>
                {editing ? "Edit category" : "Create category"}
              </h2>
              <button
                type="button"
                style={s.close}
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>
            </div>

            <label style={s.label}>Category name *</label>
            <input
              style={s.field}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Electronics"
              required
            />

            <label style={s.label}>Description</label>
            <textarea
              style={s.field}
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe this category..."
            />

            <label style={s.label}>Icon (optional)</label>
            <input
              style={s.field}
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="e.g. 📱"
            />

            {error && <p style={s.error}>{error}</p>}

            <button disabled={saving} type="submit" style={s.primary}>
              {saving
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Create category"}
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
  title: { margin: 0, color: "#0f172a", fontSize: 21 },
  subtitle: { color: "#64748b", fontSize: 12 },
  primary: {
    border: 0,
    background: "#2563eb",
    color: "#fff",
    padding: "11px 15px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
  },
  secondary: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    padding: 11,
    borderRadius: 8,
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
    color: "#b91c1c",
    background: "#fef2f2",
    padding: 11,
    borderRadius: 8,
    fontSize: 12,
    marginBottom: 12,
  },
  empty: {
    background: "#fff",
    padding: 45,
    textAlign: "center",
    color: "#94a3b8",
    borderRadius: 10,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
    gap: 15,
  },
  card: {
    padding: 18,
    border: "1px solid #e2e8f0",
    borderRadius: 11,
    background: "#fff",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    width: 43,
    height: 43,
    borderRadius: 11,
    background: "#eff6ff",
    color: "#2563eb",
    display: "grid",
    placeItems: "center",
    fontSize: 21,
  },
  badge: { padding: "5px 8px", borderRadius: 20, fontSize: 10 },
  cardTitle: { color: "#0f172a", fontSize: 15, margin: "16px 0 7px" },
  description: {
    color: "#64748b",
    fontSize: 11,
    lineHeight: 1.6,
    minHeight: 36,
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTop: "1px solid #f1f5f9",
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
    padding: 24,
    background: "#fff",
    borderRadius: 13,
  },
  modalHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  close: {
    border: 0,
    background: "transparent",
    fontSize: 25,
    cursor: "pointer",
  },
  label: {
    display: "block",
    margin: "14px 0 7px",
    color: "#334155",
    fontSize: 11,
    fontWeight: 700,
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

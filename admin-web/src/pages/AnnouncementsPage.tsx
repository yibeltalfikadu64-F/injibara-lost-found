import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface AnnouncementsPageProps {
  token: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  author?: { fullName?: string };
}

const blankForm = { title: "", content: "", publishNow: false };

export default function AnnouncementsPage({ token }: AnnouncementsPageProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState(blankForm);
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_URL}/admin/announcements`, {
        headers,
      });
      if (!response.ok)
        throw new Error(`Unable to load announcements (${response.status}).`);
      const result = await response.json();
      const rows =
        result.data?.announcements ??
        result.announcements ??
        result.data ??
        result;
      setAnnouncements(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load announcements.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [token]);

  const filtered = useMemo(
    () =>
      announcements.filter((item) => {
        const matchesText = `${item.title} ${item.content}`
          .toLowerCase()
          .includes(search.toLowerCase());
        return (
          matchesText &&
          (filter === "ALL" ||
            (filter === "PUBLISHED" && item.isPublished) ||
            (filter === "DRAFT" && !item.isPublished))
        );
      }),
    [announcements, search, filter],
  );

  const create = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      setError("Enter both an announcement title and content.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const response = await fetch(`${API_URL}/admin/announcements`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content.trim(),
          isPublished: form.publishNow,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(
          result.message ??
            `Announcement creation failed (${response.status}).`,
        );
      }

      setModal(false);
      setForm(blankForm);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create announcement.",
      );
    } finally {
      setSaving(false);
    }
  };

  const changePublication = async (item: Announcement) => {
    const action = item.isPublished ? "unpublish" : "publish";
    if (!window.confirm(`${action} "${item.title}"?`)) return;

    try {
      const response = await fetch(
        `${API_URL}/admin/announcements/${item.id}/${action}`,
        {
          method: "PATCH",
          headers,
        },
      );
      if (!response.ok) throw new Error(`Could not ${action} announcement.`);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Publication update failed.",
      );
    }
  };

  return (
    <section>
      <div style={s.heading}>
        <div>
          <h1 style={s.title}>Campus Announcements</h1>
          <p style={s.subtitle}>
            Share important information with the campus community.
          </p>
        </div>
        <button
          style={s.primary}
          onClick={() => {
            setError("");
            setForm(blankForm);
            setModal(true);
          }}
        >
          ＋ New announcement
        </button>
      </div>

      <div style={s.toolbar}>
        <input
          style={s.search}
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={s.select}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All announcements</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Drafts</option>
        </select>
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
        <div style={s.empty}>Loading announcements...</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>No announcements found.</div>
      ) : (
        <div style={s.list}>
          {filtered.map((item) => (
            <article key={item.id} style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.cardIcon}>▧</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={s.cardTitle}>{item.title}</h2>
                  <p style={s.meta}>
                    By {item.author?.fullName ?? "Administrator"} ·{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  style={{
                    ...s.badge,
                    background: item.isPublished ? "#ecfdf5" : "#fff7ed",
                    color: item.isPublished ? "#047857" : "#c2410c",
                  }}
                >
                  {item.isPublished ? "Published" : "Draft"}
                </span>
              </div>

              <p style={s.content}>{item.content}</p>

              <div style={s.cardFooter}>
                <button style={s.link} onClick={() => setSelected(item)}>
                  Read full announcement
                </button>
                <button
                  style={s.secondary}
                  onClick={() => void changePublication(item)}
                >
                  {item.isPublished ? "Unpublish" : "Publish"}
                </button>
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
          <form style={s.modal} onSubmit={create}>
            <div style={s.modalHead}>
              <h2 style={s.title}>Create announcement</h2>
              <button
                type="button"
                style={s.close}
                onClick={() => setModal(false)}
              >
                ×
              </button>
            </div>

            <label style={s.label}>Announcement title *</label>
            <input
              style={s.field}
              value={form.title}
              maxLength={160}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter a clear title..."
              required
            />

            <label style={s.label}>Announcement content *</label>
            <textarea
              style={s.field}
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write the announcement..."
              required
            />

            <label style={s.checkbox}>
              <input
                type="checkbox"
                checked={form.publishNow}
                onChange={(e) =>
                  setForm({ ...form, publishNow: e.target.checked })
                }
              />
              Publish immediately
            </label>

            {error && <p style={s.error}>{error}</p>}
            <button disabled={saving} type="submit" style={s.primary}>
              {saving
                ? "Saving..."
                : form.publishNow
                  ? "Create and publish"
                  : "Save as draft"}
            </button>
          </form>
        </div>
      )}

      {selected && (
        <div
          style={s.overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <article role="dialog" aria-modal="true" style={s.modal}>
            <div style={s.modalHead}>
              <h2 style={s.title}>{selected.title}</h2>
              <button style={s.close} onClick={() => setSelected(null)}>
                ×
              </button>
            </div>
            <p style={s.meta}>
              Created {new Date(selected.createdAt).toLocaleString()}
            </p>
            <p style={{ ...s.content, whiteSpace: "pre-wrap" }}>
              {selected.content}
            </p>
          </article>
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
    background: "#2563eb",
    color: "#fff",
    border: 0,
    padding: "11px 15px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
  },
  secondary: {
    background: "#fff",
    border: "1px solid #cbd5e1",
    color: "#334155",
    padding: "9px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },
  toolbar: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  search: {
    flex: "1 1 220px",
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
    borderRadius: 8,
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: 12,
    marginBottom: 12,
  },
  empty: {
    padding: 45,
    background: "#fff",
    textAlign: "center",
    color: "#94a3b8",
    borderRadius: 10,
  },
  list: { display: "grid", gap: 14 },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 11,
    padding: 19,
  },
  cardHeader: { display: "flex", alignItems: "center", gap: 12 },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: "#eff6ff",
    color: "#2563eb",
    display: "grid",
    placeItems: "center",
    fontSize: 21,
  },
  cardTitle: { fontSize: 14, margin: 0, color: "#0f172a" },
  meta: { color: "#94a3b8", fontSize: 10, margin: "6px 0 0" },
  badge: {
    padding: "5px 8px",
    borderRadius: 20,
    fontSize: 10,
    whiteSpace: "nowrap",
  },
  content: {
    color: "#475569",
    fontSize: 12,
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
    margin: "18px 0",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f1f5f9",
    paddingTop: 13,
  },
  link: {
    border: 0,
    background: "transparent",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: 11,
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
    maxWidth: 570,
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
    marginBottom: 16,
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
    margin: "13px 0 7px",
    color: "#334155",
  },
  field: {
    width: "100%",
    padding: 11,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    fontSize: 12,
    resize: "vertical",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    margin: "15px 0",
    fontSize: 12,
    color: "#475569",
  },
};

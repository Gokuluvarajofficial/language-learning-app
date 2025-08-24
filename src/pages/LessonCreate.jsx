// src/pages/LessonCreate.jsx
import { useEffect, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

export default function LessonCreate() {
  const [title, setTitle] = useState("");
  const [lesson, setLesson] = useState("");
  const [translates, setTranslates] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // load all translate items to choose from
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/translate/");
        setTranslates(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Translate list load failed:", e);
        setTranslates([]);
      }
    })();
  }, []);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // ########################
  // ROBUST CREATE + REDIRECT
  // ########################
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const payload = { title, lesson, translate: selected };

      // 1) Create the lesson
      const res = await api.post("/api/lesson/", payload);
      const data = res?.data || {};

      // 2) Try multiple ways to get the new lesson id
      let newId =
        data.id ??
        data.lesson?.id ??
        data.pk ??
        null;

      // 3) Try the Location header (e.g. ".../lesson/7/")
      if (!newId && res?.headers?.location) {
        const m = String(res.headers.location).match(/\/lesson\/(\d+)\/?/i);
        if (m) newId = m[1];
      }

      // 4) If still unknown, fetch lesson list and pick highest id (newest)
      if (!newId) {
        try {
          const list = await api.get("/api/lesson/");
          const arr = Array.isArray(list.data) ? list.data : [list.data].filter(Boolean);
          if (arr.length) {
            newId = arr.reduce((max, x) => (x.id > max ? x.id : max), arr[0].id);
          }
        } catch {
          // ignore; we'll handle below
        }
      }

      // 5) Navigate to the created lesson (fallback to #1 if truly unknown)
      if (newId) {
        navigate(`/lesson/${newId}`);
      } else {
        setError("Lesson created, but could not detect its id. Please open it from the lessons list.");
      }
    } catch (err) {
      const d = err?.response?.data;
      let msg = "Create lesson failed";
      if (d) {
        msg =
          typeof d === "string"
            ? d
            : d.detail ||
              Object.entries(d)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                .join(" | ");
      } else if (err?.message) msg = `Network error: ${err.message}`;
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h2>Create Lesson</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label>
          Lesson
          <input value={lesson} onChange={(e) => setLesson(e.target.value)} />
        </label>

        <div className="selector">
          <h3>Select Translate Items</h3>
          <ul className="list">
            {translates.map((t) => (
              <li key={t.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.includes(t.id)}
                    onChange={() => toggle(t.id)}
                  />
                  #{t.id} — {t.english || t.known_word} ({t.tamil || t.target_word})
                </label>
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create Lesson"}
        </button>
      </form>
    </div>
  );
}
